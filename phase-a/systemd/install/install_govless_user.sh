#!/usr/bin/env bash
# install_govless_user.sh — create govless system user, dirs, bot.env template.
# Idempotent: safe to re-run.

set -euo pipefail

USER_NAME="${GOVLESS_USER:-govless}"
GROUP_NAME="${GOVLESS_GROUP:-govless}"
HOME_DIR="${GOVLESS_HOME:-/var/lib/govless}"
ETC_DIR="${GOVLESS_ETC:-/etc/govless}"
RUN_DIR="${GOVLESS_RUN:-/run/govless}"
BOT_ENV="${ETC_DIR}/bot.env"

if [ "$(id -u)" -ne 0 ]; then
    echo "install_govless_user.sh: must run as root" >&2
    exit 1
fi

# 1. Group + user (system, no shell).
if ! getent group "$GROUP_NAME" >/dev/null; then
    groupadd --system "$GROUP_NAME"
fi
if ! id -u "$USER_NAME" >/dev/null 2>&1; then
    useradd --system \
        --gid "$GROUP_NAME" \
        --home-dir "$HOME_DIR" \
        --no-create-home \
        --shell /usr/sbin/nologin \
        "$USER_NAME"
fi

# nginx proxies Telegram WebApp RPC to /run/govlessctl.sock. Keep the socket
# group-private, but let common nginx worker users join the govless group.
for web_user in www-data nginx; do
    if id -u "$web_user" >/dev/null 2>&1; then
        usermod -a -G "$GROUP_NAME" "$web_user" 2>/dev/null || true
    fi
done

# 2. Directories.
install -d -o "$USER_NAME" -g "$GROUP_NAME" -m 0750 "$HOME_DIR"
install -d -o root         -g "$GROUP_NAME" -m 0755 "$ETC_DIR"
install -d -o "$USER_NAME" -g "$GROUP_NAME" -m 0750 "$RUN_DIR"

# 3. bot.env template (write only if missing — never overwrite human edits).
if [ ! -f "$BOT_ENV" ]; then
    if ! command -v openssl >/dev/null 2>&1; then
        echo "install_govless_user.sh: openssl required to generate ADMIN_CLAIM_TOKEN" >&2
        exit 1
    fi
    CLAIM_TOKEN="$(openssl rand -hex 16)"
    umask 027
    cat >"$BOT_ENV" <<EOF
# goVLESS bot environment — keep BOT_TOKEN secret.
# Fill BOT_TOKEN with the value from @BotFather, then:
#   systemctl restart govless-bot.service
BOT_TOKEN=
ADMIN_CLAIM_TOKEN=${CLAIM_TOKEN}
ADMIN_IDS=
WEBAPP_AUTH_TTL=86400
EOF
    chown root:"$GROUP_NAME" "$BOT_ENV"
    chmod 0640 "$BOT_ENV"
    echo "install_govless_user.sh: wrote ${BOT_ENV} (ADMIN_CLAIM_TOKEN is stored in the file)"
else
    echo "install_govless_user.sh: ${BOT_ENV} already exists — leaving untouched"
fi

# 4. tmpfiles.d so /run/govless survives reboot without unit running yet.
TMPFILES=/etc/tmpfiles.d/govless.conf
if [ ! -f "$TMPFILES" ]; then
    cat >"$TMPFILES" <<EOF
d ${RUN_DIR} 0750 ${USER_NAME} ${GROUP_NAME} -
EOF
fi
if command -v systemd-tmpfiles >/dev/null 2>&1; then
    systemd-tmpfiles --create "$TMPFILES" >/dev/null 2>&1 || true
fi

exit 0
