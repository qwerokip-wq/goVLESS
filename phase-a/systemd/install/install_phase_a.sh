#!/usr/bin/env bash
# install_phase_a.sh — master installer for goVLESS Phase A.
#   1. Creates govless user + dirs + bot.env (install_govless_user.sh).
#   2. Installs cloudflared if Lite mode (install_cloudflared.sh, non-fatal).
#   3. Installs systemd units + helper scripts to /etc/systemd/system/ and /usr/local/bin/.
#   4. Optionally wires the nginx snippet into the Pro site config.
#   5. daemon-reload + enables base units (govlessctl, govless-bot, audit-prune).
#   6. In Lite mode also enables cloudflared chain + webapp-frontend.
# Idempotent. Does NOT start govless-bot (needs human to set BOT_TOKEN first).

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
    echo "install_phase_a.sh: must run as root" >&2
    exit 1
fi

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_SRC="$(cd "${SELF_DIR}/.." && pwd)"
PHASE_A_SRC="$(cd "${SYSTEMD_SRC}/.." && pwd)"
BIN_SRC="${SYSTEMD_SRC}/bin"
NGINX_SRC="${SYSTEMD_SRC}/nginx"

CONFIG_FILE="${GOVLESS_CONFIG:-/opt/govless/config.json}"
MODE="lite"  # default; overridden from config.json if present.

# --- detect mode ---
if [ -r "$CONFIG_FILE" ]; then
    # Try python first (pretty-prints any JSON); fall back to grep.
    if command -v python3 >/dev/null 2>&1; then
        DETECTED_MODE="$(python3 -c "import json,sys; d=json.load(open('${CONFIG_FILE}')); print(d.get('mode','lite'))" 2>/dev/null || true)"
    fi
    if [ -z "${DETECTED_MODE:-}" ]; then
        DETECTED_MODE="$(grep -oE '"mode"[[:space:]]*:[[:space:]]*"[a-z]+"' "$CONFIG_FILE" 2>/dev/null | head -n1 | sed -E 's/.*"([a-z]+)"$/\1/' || true)"
    fi
    case "${DETECTED_MODE:-}" in
        pro|lite) MODE="$DETECTED_MODE" ;;
        *) echo "install_phase_a.sh: could not detect mode from ${CONFIG_FILE}, defaulting to lite" >&2 ;;
    esac
fi
echo "install_phase_a.sh: MODE=${MODE}"

# --- step 1: user/dirs/bot.env ---
bash "${SELF_DIR}/install_govless_user.sh"

# --- step 1b: deploy Python control-plane, bot, and WebApp assets ---
apt-get update -qq >/dev/null 2>&1 || true
apt-get install -y -qq python3-venv python3-pip >/dev/null 2>&1 || true

install -d -m 0755 /opt/govless
install -d -m 0755 /opt/govless/bin

rm -rf /opt/govless/govlessctl /opt/govless/bot /opt/govless/webapp
cp -R "${PHASE_A_SRC}/govlessctl" /opt/govless/govlessctl
cp -R "${PHASE_A_SRC}/bot" /opt/govless/bot
cp -R "${PHASE_A_SRC}/webapp" /opt/govless/webapp
find /opt/govless/govlessctl /opt/govless/bot -type d -name __pycache__ -prune -exec rm -rf {} + 2>/dev/null || true
find /opt/govless/govlessctl /opt/govless/bot /opt/govless/webapp -type d -exec chmod 0755 {} +
find /opt/govless/govlessctl /opt/govless/bot /opt/govless/webapp -type f -exec chmod 0644 {} +
chown -R root:govless /opt/govless/govlessctl /opt/govless/bot /opt/govless/webapp

if [ ! -x /opt/govless/venv/bin/python ]; then
    python3 -m venv /opt/govless/venv
fi
/opt/govless/venv/bin/python -m pip install -q --upgrade pip >/dev/null 2>&1 || true
/opt/govless/venv/bin/python -m pip install -q \
    -r "${PHASE_A_SRC}/govlessctl/requirements.txt" \
    -r "${PHASE_A_SRC}/bot/requirements.txt"
chmod -R a+rX /opt/govless/venv

cat >/opt/govless/bin/govlessctl-daemon <<'EOF_DAEMON'
#!/usr/bin/env bash
set -euo pipefail
cd /opt/govless
PY=/opt/govless/venv/bin/python
[ -x "$PY" ] || PY=/usr/bin/python3
exec "$PY" -m govlessctl.daemon "$@"
EOF_DAEMON
cat >/usr/local/bin/govlessctl <<'EOF_CLI'
#!/usr/bin/env bash
set -euo pipefail
cd /opt/govless
PY=/opt/govless/venv/bin/python
[ -x "$PY" ] || PY=/usr/bin/python3
exec "$PY" -m govlessctl.cli "$@"
EOF_CLI
chmod 0755 /opt/govless/bin/govlessctl-daemon /usr/local/bin/govlessctl
chown root:root /opt/govless/bin/govlessctl-daemon /usr/local/bin/govlessctl

# --- step 2: cloudflared (Lite only) ---
if [ "$MODE" = "lite" ]; then
    bash "${SELF_DIR}/install_cloudflared.sh" || true
fi

# --- step 3: copy scripts to /usr/local/bin ---
install -d -m 0755 /usr/local/bin
for s in govless-bot govless-tunnel-url-extract govless-tunnel-health-check \
         govless-tunnel-escalation-check govless-audit-prune; do
    if [ -f "${BIN_SRC}/${s}" ]; then
        install -m 0755 "${BIN_SRC}/${s}" "/usr/local/bin/${s}"
    else
        echo "install_phase_a.sh: WARN: ${BIN_SRC}/${s} missing" >&2
    fi
done

# --- step 4: copy systemd units ---
UNIT_DST=/etc/systemd/system
install -d -m 0755 "$UNIT_DST"

BASE_UNITS=(
    govlessctl.service
    govless-bot.service
    govless-audit-prune.service
    govless-audit-prune.timer
)
LITE_UNITS=(
    cloudflared-quick.service
    cloudflared-url.path
    cloudflared-url.service
    tunnel-health.service
    tunnel-health.timer
    webapp-frontend.service
)

for u in "${BASE_UNITS[@]}" "${LITE_UNITS[@]}"; do
    if [ -f "${SYSTEMD_SRC}/${u}" ]; then
        install -m 0644 "${SYSTEMD_SRC}/${u}" "${UNIT_DST}/${u}"
    else
        echo "install_phase_a.sh: WARN: unit ${u} missing in ${SYSTEMD_SRC}" >&2
    fi
done

# --- step 5: nginx snippet (Pro only) ---
if [ "$MODE" = "pro" ] && command -v nginx >/dev/null 2>&1; then
    SNIP_DST=/etc/nginx/snippets
    install -d -m 0755 "$SNIP_DST"
    install -m 0644 "${NGINX_SRC}/govless-webapp.conf" "${SNIP_DST}/govless-webapp.conf"

    # Try to wire the include into the existing Pro site, if not present already.
    if [ -n "${GOVLESS_NGINX_SITE:-}" ]; then
        SITE="$GOVLESS_NGINX_SITE"
    else
        SITE=""
        for candidate in \
            /etc/nginx/sites-enabled/govless \
            /etc/nginx/sites-available/govless \
            /etc/nginx/sites-enabled/govless-pro.conf \
            /etc/nginx/sites-available/govless-pro.conf; do
            if [ -f "$candidate" ]; then
                SITE="$candidate"
                break
            fi
        done
    fi

    if [ -n "${SITE:-}" ] && [ -f "$SITE" ] && ! grep -q 'govless-webapp.conf' "$SITE"; then
        # Pro usually has Xray on :443 with fallback to nginx :80. If a classic
        # TLS server exists, prefer it; otherwise insert into the first server.
        webapp_insert_mode="first-server"
        if grep -qE 'listen[[:space:]]+(\[::\]:)?443[[:space:]]+ssl' "$SITE"; then
            webapp_insert_mode="tls-server"
        fi
        if awk -v mode="$webapp_insert_mode" '
            BEGIN { inserted=0; in_target=0 }
            /^[[:space:]]*server[[:space:]]*\{/ {
                if (mode == "first-server" && !inserted) in_target=1
            }
            mode == "tls-server" && /listen[[:space:]]+(\[::\]:)?443[[:space:]]+ssl/ {
                in_target=1
            }
            in_target && /^}/ && !inserted {
                print "    include /etc/nginx/snippets/govless-webapp.conf;"
                inserted=1
                in_target=0
            }
            { print }
            END { if (!inserted) exit 9 }
        ' "$SITE" >"${SITE}.govless.tmp"; then
            mv "${SITE}.govless.tmp" "$SITE"
            echo "install_phase_a.sh: wired govless-webapp.conf into ${SITE}"
        else
            rm -f "${SITE}.govless.tmp"
            echo "install_phase_a.sh: WARN: could not wire govless-webapp.conf into ${SITE}" >&2
        fi
    elif [ -z "${SITE:-}" ]; then
        echo "install_phase_a.sh: WARN: goVLESS nginx site not found; WebApp not wired" >&2
    fi

    if nginx -t >/dev/null 2>&1; then
        systemctl restart nginx >/dev/null 2>&1 || systemctl reload nginx >/dev/null 2>&1 || true
    else
        echo "install_phase_a.sh: WARN: nginx -t failed; review ${SITE}" >&2
    fi
fi

# --- step 6: daemon-reload + enable ---
systemctl daemon-reload

# Base units: enable (do NOT start govless-bot — needs BOT_TOKEN).
systemctl enable govlessctl.service >/dev/null 2>&1 || true
systemctl enable govless-bot.service >/dev/null 2>&1 || true
systemctl enable govless-audit-prune.timer >/dev/null 2>&1 || true

# Start what we can start safely now.
systemctl start govlessctl.service >/dev/null 2>&1 || \
    echo "install_phase_a.sh: WARN: govlessctl.service did not start (check /opt/govless/bin/govlessctl-daemon)" >&2
systemctl start govless-audit-prune.timer >/dev/null 2>&1 || true

if [ "$MODE" = "lite" ]; then
    systemctl enable webapp-frontend.service >/dev/null 2>&1 || true
    systemctl enable cloudflared-quick.service >/dev/null 2>&1 || true
    systemctl enable cloudflared-url.path >/dev/null 2>&1 || true
    systemctl enable tunnel-health.timer >/dev/null 2>&1 || true

    systemctl start webapp-frontend.service >/dev/null 2>&1 || true
    if [ -x /usr/local/bin/cloudflared ] || [ -x /usr/bin/cloudflared ]; then
        systemctl start cloudflared-url.path >/dev/null 2>&1 || true
        systemctl restart cloudflared-quick.service >/dev/null 2>&1 || \
            systemctl start cloudflared-quick.service >/dev/null 2>&1 || true
        # cloudflared can print the quick-tunnel URL before the .path unit is
        # active; run the extractor once so a fresh install/deploy does not wait
        # for another log append before Telegram receives a WebApp URL.
        systemctl start cloudflared-url.service >/dev/null 2>&1 || true
        systemctl start tunnel-health.timer >/dev/null 2>&1 || true
    else
        echo "install_phase_a.sh: NOTE: cloudflared not present; tunnel stack enabled but not started." >&2
    fi
fi

# Friendly reminder about BOT_TOKEN.
if grep -qE '^BOT_TOKEN=[[:space:]]*$' /etc/govless/bot.env 2>/dev/null; then
    cat <<EOF

────────────────────────────────────────────────────────────────────
goVLESS Phase A installed (mode=${MODE}).

NEXT STEP: edit /etc/govless/bot.env, set BOT_TOKEN=<value from @BotFather>,
then start the bot:

    systemctl restart govlessctl.service
    systemctl start govless-bot.service
    systemctl status govless-bot.service

Use /admin <ADMIN_CLAIM_TOKEN> in the bot chat to claim the first admin seat.
────────────────────────────────────────────────────────────────────
EOF
fi

exit 0
