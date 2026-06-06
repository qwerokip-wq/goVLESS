#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# lib/mode_switch.sh — seamless Lite ↔ Pro switching
# ═══════════════════════════════════════════════════════════════════════
#
# Preserves: client UUIDs, emails, subIds, traffic stats (via email match
#            in x-ui.db client_traffics — stats are keyed by email).
# Replaces:  stream_settings (security/transport), remark, fallbacks.
#
# Subscription URLs stay the same (3X-UI generates them from client.subId).
# Bare vless:// links must be re-distributed (the URL format changes).
#
# Public API:
#   switch_mode <lite|pro> [domain] [email]   programmatic
#   switch_mode_interactive                   menu-driven
#
# Depends on: lib/common.sh, lib/xui.sh, lib/xui_api.sh, lib/website.sh
# ═══════════════════════════════════════════════════════════════════════

# ── Extract clients from current port-443 inbound ───────────────────────
mode_switch_extract_clients() {
    if [ ! -f /etc/x-ui/x-ui.db ]; then
        log_error "/etc/x-ui/x-ui.db not found — is 3X-UI installed?"
        return 1
    fi

    python3 <<'PYEOF' || return 1
import sqlite3, sys, json

try:
    conn = sqlite3.connect("/etc/x-ui/x-ui.db")
    conn.execute("PRAGMA busy_timeout = 5000")
    row = conn.execute(
        "SELECT id, settings, stream_settings FROM inbounds WHERE port=443 LIMIT 1"
    ).fetchone()
finally:
    try:
        conn.close()
    except Exception:
        pass

if not row:
    print("ERROR: No inbound on port 443 found in x-ui.db", file=sys.stderr)
    sys.exit(1)
inbound_id, settings_s, stream_s = row

settings = json.loads(settings_s)
stream = json.loads(stream_s)
clients = settings.get("clients", [])
if not clients:
    print("ERROR: no clients in inbound", file=sys.stderr)
    sys.exit(1)

with open('/tmp/govless_clients.json', 'w') as f:
    json.dump(clients, f)

mapping = {c.get("email", c["id"]): c["id"] for c in clients}
with open('/tmp/govless_users_map.json', 'w') as f:
    json.dump(mapping, f)

with open('/tmp/govless_mode_switch_meta.json', 'w') as f:
    json.dump({
        "inbound_id": int(inbound_id),
        "current_transport": stream.get("network", "tcp"),
        "current_security": stream.get("security", ""),
        "current_fp": ((stream.get("realitySettings") or stream.get("tlsSettings") or {}).get("settings") or {}).get("fingerprint", ""),
        "client_count": len(clients),
    }, f)

print(f"Extracted {len(clients)} clients from inbound id={inbound_id} "
      f"(transport={stream.get('network')}, security={stream.get('security')})",
      file=sys.stderr)
PYEOF
}

# ── Delete inbound via 3X-UI API (preserves traffic stats by email) ─────
api_delete_inbound() {
    local inbound_id="$1"
    local cookie_file="${2:-/tmp/govless_cookie.txt}"

    local csrf_args=(); _csrf_args csrf_args
    local http_code
    http_code=$(curl -sk -w '%{http_code}' -o /tmp/govless_api_resp.json \
        -b "$cookie_file" \
        "${csrf_args[@]}" \
        -X POST "${API_BASE}/panel/api/inbounds/del/${inbound_id}" \
        -H "Content-Type: application/json" 2>/dev/null)

    if [ "$http_code" != "200" ]; then
        log_error "Delete inbound: HTTP $http_code"
        return 1
    fi
    local success
    success=$(python3 -c "import json; d=json.load(open('/tmp/govless_api_resp.json')); print(d.get('success', False))" 2>/dev/null || echo "False")
    [ "$success" = "True" ] || { log_error "API returned success=false on delete"; return 1; }
    return 0
}

# ── Emergency rollback snapshot for mode switching ───────────────────────
mode_switch_snapshot_inbound() {
    local inbound_id="$1"
    python3 - "$inbound_id" <<'PYEOF' || return 1
import json
import sqlite3
import sys

inbound_id = int(sys.argv[1])
conn = sqlite3.connect("/etc/x-ui/x-ui.db")
conn.row_factory = sqlite3.Row
conn.execute("PRAGMA busy_timeout = 5000")
try:
    row = conn.execute("SELECT * FROM inbounds WHERE id = ?", (inbound_id,)).fetchone()
    if row is None:
        print(f"ERROR: inbound {inbound_id} not found for rollback snapshot", file=sys.stderr)
        sys.exit(1)
    with open("/tmp/govless_mode_switch_inbound_snapshot.json", "w", encoding="utf-8") as f:
        json.dump(dict(row), f)
finally:
    conn.close()
PYEOF
}

mode_switch_restore_inbound_snapshot() {
    python3 <<'PYEOF' || return 1
import json
import sqlite3

snapshot_path = "/tmp/govless_mode_switch_inbound_snapshot.json"
with open(snapshot_path, "r", encoding="utf-8") as f:
    row = json.load(f)

conn = sqlite3.connect("/etc/x-ui/x-ui.db")
conn.execute("PRAGMA busy_timeout = 5000")
try:
    columns = [r[1] for r in conn.execute("PRAGMA table_info(inbounds)").fetchall()]
    data = {k: row[k] for k in columns if k in row}
    inbound_id = data.get("id")
    port = data.get("port")
    if inbound_id is not None and port is not None:
        conn.execute("DELETE FROM inbounds WHERE port = ? AND id != ?", (port, inbound_id))
    col_sql = ", ".join(data.keys())
    placeholders = ", ".join(["?"] * len(data))
    conn.execute(
        f"INSERT OR REPLACE INTO inbounds ({col_sql}) VALUES ({placeholders})",
        list(data.values()),
    )
    conn.commit()
finally:
    conn.close()
PYEOF
    systemctl restart x-ui 2>/dev/null || true
}

# ── Restore subscription server settings (so sub URLs survive switch) ───
mode_switch_ensure_sub_server() {
    local mode="${1:-$(config_get mode "" 2>/dev/null || true)}"
    local domain="${2:-$(config_get domain "" 2>/dev/null || true)}"
    # Delegate to configure_sub_server (full setup: random port + random path).
    # Idempotent — preserves existing port/path if already set in config.
    configure_sub_server "$mode" "$domain" 2>/dev/null || {
        # Minimal fallback if helper unavailable
        sqlite3 /etc/x-ui/x-ui.db \
            "DELETE FROM settings WHERE key='subEnable'; INSERT INTO settings(key, value) VALUES ('subEnable', 'true');" \
            2>/dev/null || true
    }
}

# ── Main switch function ────────────────────────────────────────────────
# Usage: switch_mode <lite|pro> [target_domain] [target_email]
switch_mode() {
    local target_mode="$1"
    local target_domain="${2:-}"
    local target_email="${3:-}"

    if [ "$target_mode" != "lite" ] && [ "$target_mode" != "pro" ]; then
        log_error "switch_mode: invalid target '$target_mode' (want lite|pro)"
        return 1
    fi

    local current_mode
    current_mode=$(config_get "mode" 2>/dev/null || echo "")

    log_step "Switching mode: ${current_mode:-unknown} → ${target_mode}"

    # ── 1. Load creds + API login ───────────────────────────────────────
    load_credentials || { log_error "Cannot load 3X-UI credentials"; return 1; }
    setup_api_base
    wait_for_api 30 2>/dev/null || setup_api_base
    api_login_with_retry || { log_error "API login failed"; return 1; }

    # ── 2. Snapshot current clients ─────────────────────────────────────
    mode_switch_extract_clients || return 1
    local inbound_id current_transport count
    inbound_id=$(python3 -c "import json; print(json.load(open('/tmp/govless_mode_switch_meta.json'))['inbound_id'])")
    current_transport=$(python3 -c "import json; print(json.load(open('/tmp/govless_mode_switch_meta.json'))['current_transport'])")
    count=$(python3 -c "import json; print(json.load(open('/tmp/govless_mode_switch_meta.json'))['client_count'])")
    log_info "Preserving ${count} clients · transport=${current_transport}"
    mode_switch_snapshot_inbound "$inbound_id" || {
        log_error "Could not snapshot current inbound for rollback"
        return 1
    }

    # Preserve the active transport by default. lib/xui.sh initializes
    # XUI_TRANSPORT=tcp, so ${XUI_TRANSPORT:-...} would silently downgrade
    # existing XHTTP/gRPC installs during a mode switch.
    local target_transport="${GOVLESS_SWITCH_TRANSPORT:-$current_transport}"
    [ -z "$target_transport" ] && target_transport="tcp"
    export XUI_TRANSPORT="$target_transport"

    # Preserve the TLS fingerprint across the switch too — same reason as
    # transport: XUI_FP defaults to chrome in a fresh process, which would
    # silently downgrade a firefox/randomized install and desync SSH vs bot keys.
    local current_fp
    current_fp=$(python3 -c "import json; print(json.load(open('/tmp/govless_mode_switch_meta.json')).get('current_fp',''))" 2>/dev/null)
    [ -z "$current_fp" ] && current_fp=$(config_get fingerprint chrome 2>/dev/null)
    [ -z "$current_fp" ] && current_fp="chrome"
    export XUI_FP="$current_fp"

    local server_ip
    server_ip=$(get_server_ip) || { log_error "Cannot detect IP"; return 1; }

    # ── 3. Target-specific infrastructure prep ──────────────────────────
    local cert_file=""
    local key_file=""

    if [ "$target_mode" = "pro" ]; then
        target_domain="${target_domain:-$(config_get domain 2>/dev/null || true)}"
        target_email="${target_email:-$(config_get email 2>/dev/null || true)}"

        if [ -z "$target_domain" ]; then
            echo -ne "  $(tf ms_enter_domain "${server_ip}") "
            read -r target_domain
            target_domain=$(echo "$target_domain" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
        fi
        if [ -z "$target_email" ]; then
            echo -ne "  $(t ms_enter_email) "
            read -r target_email
            target_email=$(echo "$target_email" | tr -d '[:space:]')
        fi
        if [ -z "$target_domain" ] || ! valid_domain "$target_domain"; then
            log_error "Invalid domain: '$target_domain'"
            return 1
        fi

        # DNS sanity — interactive menu with wait+countdown option
        check_dns "$target_domain" "$server_ip" || {
            dns_wait_or_choose "$target_domain" "$server_ip" || {
                log_info "$(t ms_cancelled)"
                return 0
            }
        }

        cert_file="/etc/letsencrypt/live/${target_domain}/fullchain.pem"
        key_file="/etc/letsencrypt/live/${target_domain}/privkey.pem"

        if [ ! -f "$cert_file" ]; then
            log_info "$(t ms_cert_obtaining)"
            install_nginx          || return 1
            install_certbot        || return 1
            deploy_stub_site
            obtain_ssl_certificate "$target_domain" "$target_email" || return 1
            generate_nginx_pro_config "$target_domain"
            setup_ssl_auto_renewal
        else
            log_info "$(tf ms_cert_reused "${target_domain}")"
            generate_nginx_pro_config "$target_domain"
        fi
        # nginx нужен на :80 чтобы отдавать сайт-фронтенд и ACME;
        # xray займёт :443
        systemctl reload nginx 2>/dev/null || systemctl restart nginx || true

    elif [ "$target_mode" = "lite" ]; then
        # Reality keys: восстановить из config.json или сгенерировать
        REALITY_PRIVATE_KEY="${REALITY_PRIVATE_KEY:-$(config_get reality_private_key 2>/dev/null || true)}"
        REALITY_PUBLIC_KEY="${REALITY_PUBLIC_KEY:-$(config_get reality_public_key 2>/dev/null || true)}"
        export REALITY_PRIVATE_KEY REALITY_PUBLIC_KEY
        if [ -z "$REALITY_PRIVATE_KEY" ] || [ -z "$REALITY_PUBLIC_KEY" ]; then
            log_info "$(t ms_reality_keys_gen)"
            generate_reality_keypair || return 1
            config_set "reality_private_key" "$REALITY_PRIVATE_KEY"
            config_set "reality_public_key"  "$REALITY_PUBLIC_KEY"
        fi
        # nginx можно оставить как есть — не помешает; будет жить на :80 со
        # статикой и ACME, xray всё равно на :443
    fi

    # ── 4. Tear down old inbound ────────────────────────────────────────
    log_info "$(tf ms_delete_inbound "${inbound_id}")"
    api_delete_inbound "$inbound_id" || return 1

    # ── 5. Create new inbound with the SAME clients ─────────────────────
    log_info "$(tf ms_create_inbound "${target_mode}" "${XUI_TRANSPORT}")"
    local create_ok=false
    if [ "$target_mode" = "pro" ]; then
        api_create_tls_inbound "$target_domain" "$cert_file" "$key_file" && create_ok=true
    else
        local mask_domain
        mask_domain=$(config_get mask_domain 2>/dev/null || echo "google.com")
        api_create_reality_inbound "$mask_domain" && create_ok=true
    fi
    if [ "$create_ok" != "true" ]; then
        log_error "New inbound creation failed — restoring previous inbound"
        if mode_switch_restore_inbound_snapshot; then
            # Agent smoke 2026-05-25: rollback restores DB but xray runtime
            # config can briefly drift until next x-ui restart. Belt-and-
            # braces — explicit restart so the served config matches DB.
            systemctl restart x-ui 2>/dev/null || log_warning "x-ui restart after rollback failed"
            sleep 2
            log_warning "Previous inbound restored + x-ui restarted. Mode switch was not applied."
        else
            log_error "Rollback failed. Run Repair from SSH and inspect x-ui logs."
        fi
        return 1
    fi

    # ── 6. Enable subscription server (idempotent) ──────────────────────
    mode_switch_ensure_sub_server "$target_mode" "$target_domain"

    # ── 7. Restart x-ui to load fresh inbound ───────────────────────────
    systemctl restart x-ui
    sleep 3

    # ── 8. Persist new state ────────────────────────────────────────────
    config_set "mode" "$target_mode"
    config_set "transport" "$XUI_TRANSPORT"
    config_set "fingerprint" "$XUI_FP"
    if [ "$target_mode" = "pro" ]; then
        config_set "domain" "$target_domain"
        [ -n "$target_email" ] && config_set "email" "$target_email"
        # Re-point the panel at the domain LE cert so it is reachable at
        # https://<domain>:<port> with a valid certificate (was: IP self-signed).
        configure_panel_tls "${LANG_CODE:-en}" "$server_ip" "$target_domain" \
            || log_warning "Panel TLS (domain) partially failed"
    else
        # pro -> lite: reset the panel back to the IP self-signed cert so the
        # shown https://<IP>:<port> URL matches the cert (empty domain arg forces
        # the IP branch); otherwise the panel keeps the domain cert and a browser
        # shows a name-mismatch on the IP URL.
        configure_panel_tls "${LANG_CODE:-en}" "$server_ip" "" \
            || log_warning "Panel TLS (IP) partially failed"
    fi
    # Rebuild /root/.govless_credentials so MODE= and the panel URL host
    # (domain for pro, IP for lite) match the new mode.
    if declare -F save_credentials >/dev/null 2>&1; then
        save_credentials 2>/dev/null || true
    elif [ -f /root/.govless_credentials ]; then
        if grep -q '^MODE=' /root/.govless_credentials; then
            sed -i "s/^MODE=.*/MODE=${target_mode}/" /root/.govless_credentials
        else
            echo "MODE=${target_mode}" >> /root/.govless_credentials
        fi
    fi

    # ── 9. Regenerate VLESS links file (for showing to the user) ────────
    if [ "$target_mode" = "pro" ]; then
        generate_all_vless_links "pro" "$target_domain" 2>/dev/null || true
    else
        generate_all_vless_links "lite" "$server_ip" "$(config_get mask_domain)" 2>/dev/null || true
    fi

    # ── 10. Summary ─────────────────────────────────────────────────────
    print_header "$(t ms_done_header)"
    log_success "$(tf ms_mode_now "${target_mode}")"
    log_info "$(tf ms_clients_preserved "${count}")"
    log_info "$(t ms_sub_unchanged)"
    log_info "$(t ms_sub_auto_refresh)"
    log_info "$(t ms_bare_links_redistribute)"
    log_info "$(t ms_view_links)"
    return 0
}

# ── Interactive entry point ─────────────────────────────────────────────
switch_mode_interactive() {
    local current_mode
    current_mode=$(config_get "mode" 2>/dev/null || echo "")

    if [ -z "$current_mode" ] || [ "$current_mode" = "null" ]; then
        log_error "$(t ms_unknown_mode)"
        return 1
    fi

    print_header "$(t ms_switch_title)"

    local target
    if [ "$current_mode" = "lite" ]; then
        echo -e "  $(tf ms_now_lite "${CYAN}" "${NC}")"
        echo -e "  $(tf ms_target_pro "${BOLD}" "${NC}")"
        target="pro"
    elif [ "$current_mode" = "pro" ]; then
        echo -e "  $(tf ms_now_pro "${CYAN}" "$(config_get domain)" "${NC}")"
        echo -e "  $(tf ms_target_lite "${BOLD}" "${NC}")"
        target="lite"
    else
        log_error "$(tf ms_unknown_mode_err "${current_mode}")"
        return 1
    fi

    echo ""
    echo -e "  ${DIM}$(t ms_what_happens)${NC}"
    echo -e "  ${DIM}  $(t ms_w_uuid_preserved)${NC}"
    echo -e "  ${DIM}  $(t ms_w_traffic_preserved)${NC}"
    echo -e "  ${DIM}  $(t ms_w_sub_stable)${NC}"
    echo -e "  ${DIM}  $(t ms_w_bare_redistribute)${NC}"
    echo ""

    confirm "$(tf ms_confirm_switch "${target}")" || { log_info "$(t ms_decline)"; return 0; }

    switch_mode "$target" || {
        log_error "$(t ms_switch_failed)"
        log_error "$(t ms_switch_check)"
        return 1
    }
}
