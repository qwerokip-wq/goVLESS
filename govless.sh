#!/bin/bash
# ╔═══════════════════════════════════════════════════════════════╗
# ║  goVLESS v${GOVLESS_VERSION} — 3X-UI VPN installer with stealth masking  ║
# ║  Lite: VLESS + Reality (masquerade as popular site)          ║
# ║  Pro:  VLESS + TLS (your domain + real website)              ║
# ║                                                               ║
# ║  github.com/anten-ka • YouTube: anten-ka                     ║
# ╚═══════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Resolve script directory ────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"

# ── Source modules ──────────────────────────────────────────────────────
source "${SCRIPT_DIR}/lib/common.sh"
source "${SCRIPT_DIR}/lib/i18n.sh"
source "${SCRIPT_DIR}/lib/xui.sh"
source "${SCRIPT_DIR}/lib/xui_api.sh"
source "${SCRIPT_DIR}/lib/reality_domains.sh"
source "${SCRIPT_DIR}/lib/website.sh"
source "${SCRIPT_DIR}/lib/mode_switch.sh"

# ── Cleanup trap ────────────────────────────────────────────────────────
trap cleanup_temp_files EXIT

# ── Root check ──────────────────────────────────────────────────────────
if [ "$(id -u)" -ne 0 ]; then
    echo -e "  ${RED}✗${NC} This script must be run as root / Запустите от root"
    exit 1
fi

# ── Detect or pick language ─────────────────────────────────────────────
init_language() {
    local lang
    lang=$(detect_language)
    if [ "$lang" = "en" ] && [ ! -f "${GOVLESS_DIR}/.language" ]; then
        # First run — ask user
        lang=$(pick_language_interactive)
    fi
    load_language "$lang"
    save_language "$lang"
    # Initialize state.db (idempotent) — for Telegram bot bindings
    init_state_db 2>/dev/null || true
}

# ═══════════════════════════════════════════════════════════════════════
# INSTALL FLOW — LITE MODE (Reality)
# ═══════════════════════════════════════════════════════════════════════
install_lite() {
    log_step "$(t install_lite_step)"

    local server_ip
    server_ip=$(get_server_ip) || { log_error "Cannot detect IP"; return 1; }

    # 1. Select masquerade domain
    local mask_domain
    mask_domain=$(select_reality_domain "$server_ip") || return 1

    # Select 3X-UI version (Legacy 2.x or New 3.x) — but only if not
    # already installed. Otherwise install_3xui will short-circuit and the
    # user's choice would silently mismatch the actual binary (Codex 012 P2).
    if xui_already_installed; then
        load_xui_version_from_config
        log_dim "3X-UI already installed (${XUI_BRANCH:-?} ${XUI_INSTALL_VERSION:-?}) — keeping it"
    else
        select_xui_version
    fi

    # 3. Select transport protocol (TCP / XHTTP / gRPC)
    select_transport
    select_fingerprint

    # 4. Ask how many keys
    echo ""
    echo -ne "  $(t users_ask_count) $(t users_ask_count_hint): "
    local users_count_input
    read -r users_count_input
    local users_count="${users_count_input:-3}"
    # Validate: must be number 1-100
    if ! [[ "$users_count" =~ ^[0-9]+$ ]] || [ "$users_count" -lt 1 ] || [ "$users_count" -gt 100 ]; then
        users_count=3
    fi

    # 5. Show config summary (all choices visible before confirm)
    print_header "$(t config_title)"
    echo -e "  $(t config_ip)       ${CYAN}${server_ip}${NC}"
    echo -e "  $(t config_port)     ${CYAN}443${NC}"
    echo -e "  $(t config_mode)     ${CYAN}Lite (Reality)${NC}"
    echo -e "  $(t config_mask)     ${CYAN}${mask_domain}${NC}"
    echo -e "  $(t config_transport) ${CYAN}${XUI_TRANSPORT^^}${NC}"
    echo -e "  $(t config_users)    ${CYAN}${users_count}${NC}"
    echo ""

    confirm "$(t config_confirm)" || return 0

    # 7. Install dependencies
    install_dependencies || return 1

    # Re-init state.db now that sqlite3 is guaranteed (first call in
    # init_language ran before deps install, may have been a no-op)
    init_state_db 2>/dev/null || true

    # 8. Install 3X-UI (critical — must succeed)
    install_3xui || return 1

    # B1/B2/B3 fix: enable panel TLS + bind sub server + lang via sqlite
    configure_panel_tls "${LANG_CODE:-en}" || log_warning "Panel TLS partially failed"


    # 9. Extract credentials & setup API (critical for panel access)
    extract_credentials
    save_credentials
    setup_api_base

    # === Auto-configuration (best-effort) ===
    # Panel is already installed and accessible at this point.
    # The following steps configure VPN automatically but are NOT fatal.
    local auto_ok=true

    # 10. Wait for API & login
    if run_with_spinner "$(t api_waiting)" wait_for_api 90 && api_login_with_retry; then
        :  # API ready — language set earlier via configure_panel_tls (sqlite)
    else
        log_warning "$(t api_login_fail_manual)"
        auto_ok=false
    fi

    # 11. Generate Reality keypair + users + inbound
    if $auto_ok; then
        if generate_reality_keypair && \
           generate_clients "$users_count" "lite" && \
           api_create_reality_inbound "$mask_domain"; then
            log_info "$(tf users_creating "$users_count")"
            # Restart x-ui so xray picks up the new inbound
            systemctl restart x-ui 2>/dev/null || true
            sleep 2
        else
            log_warning "$(t auto_config_fail)"
            auto_ok=false
        fi
    fi

    # 12. Generate VLESS links
    if $auto_ok; then
        generate_all_vless_links "lite" "$server_ip" "$mask_domain" || auto_ok=false
    fi

    # 13. Setup stub nginx (optional, for port 80)
    setup_lite_nginx || log_warning "$(t lite_nginx_optional_fail)"

    # 14. Save config
    config_set "mode" "lite"
    config_set "mask_domain" "$mask_domain"
    config_set "server_ip" "$server_ip"
    config_set "transport" "$XUI_TRANSPORT"
    config_set "fingerprint" "$XUI_FP"
    config_set "xui_branch" "$XUI_BRANCH"
    [ -n "$XUI_INSTALL_VERSION" ] && config_set "xui_version" "$XUI_INSTALL_VERSION"
    config_set_int "port" 443
    config_set_int "users_count" "$users_count"
    config_set "version" "$GOVLESS_VERSION"
    config_set "installed_at" "$(date -Iseconds)"

    # Save Reality keys to config (if generated)
    [ -n "${REALITY_PRIVATE_KEY:-}" ] && config_set "reality_private_key" "$REALITY_PRIVATE_KEY"
    [ -n "${REALITY_PUBLIC_KEY:-}" ] && config_set "reality_public_key" "$REALITY_PUBLIC_KEY"

    # 15. Done!
    echo ""
    echo -e "  ${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}${BOLD}  $(tf install_done "$GOVLESS_VERSION" "Lite")${NC}"
    echo -e "  ${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
    echo ""

    show_credentials

    if ! $auto_ok; then
        log_warning "$(t auto_config_incomplete)"
    fi

    post_install_flow "lite" "$server_ip" "$mask_domain"
}

# ═══════════════════════════════════════════════════════════════════════
# INSTALL FLOW — PRO MODE (TLS)
# ═══════════════════════════════════════════════════════════════════════
install_pro() {
    log_step "$(t install_pro_step)"
    if [ "${GOVLESS_LAZY:-0}" = "1" ]; then
        log_info "$(t lazy_active)"
    fi

    local server_ip
    server_ip=$(get_server_ip) || { log_error "Cannot detect IP"; return 1; }

    # 1. Ask for domain
    echo ""
    echo -ne "  $(t pro_enter_domain) "
    local domain
    read -e -r domain
    domain=$(normalize_domain "$domain")

    if ! valid_domain "$domain"; then
        log_error "$(tf pro_bad_domain "$domain")"
        return 1
    fi

    # 2. DNS check — interactive menu with wait+countdown option.
    # Lazy: do not block on a prompt; warn and continue (operator pointed the
    # A-record just before; cert step will report clearly if it isn't ready).
    if ! check_dns "$domain" "$server_ip"; then
        if [ "${GOVLESS_LAZY:-0}" = "1" ]; then
            log_warning "$(tf lazy_dns_warn "$domain" "$server_ip")"
        else
            dns_wait_or_choose "$domain" "$server_ip" || return 0
        fi
    fi

    # 3. Email for SSL (lazy: skip — Let's Encrypt registers without email)
    local email=""
    if [ "${GOVLESS_LAZY:-0}" != "1" ]; then
        echo -ne "  $(t pro_enter_email) "
        read -r email
        email=$(echo "$email" | tr -d '[:space:]')
    fi

    # 4. Template selection (from 1800+ catalog or stub)
    local template_dir=""
    # Copy catalog to GOVLESS_DIR if it exists in script dir but not in data dir
    if [ -f "${SCRIPT_DIR}/templates_catalog.json" ] && [ ! -f "$TEMPLATES_CATALOG" ]; then
        mkdir -p "$GOVLESS_DIR"
        cp "${SCRIPT_DIR}/templates_catalog.json" "$TEMPLATES_CATALOG" 2>/dev/null
    fi
    if command -v jq &>/dev/null; then
        source "${SCRIPT_DIR}/lib/templates_catalog.sh" 2>/dev/null
        if [ "${GOVLESS_LAZY:-0}" = "1" ] && type pick_random_template_id &>/dev/null; then
            # Lazy: auto-pick a random template, no catalog browsing.
            local _rtpl; _rtpl=$(pick_random_template_id)
            if [ -n "$_rtpl" ] && type download_template &>/dev/null; then
                template_dir=$(download_template "$_rtpl" 2>/dev/null) || template_dir=""
                [ -n "$template_dir" ] && log_dim "$(tf lazy_template "$_rtpl")"
            fi
        elif type interactive_template_selection &>/dev/null; then
            # Codex 029 P2: distinguish "user picked skip" from "selection
            # failed". On real failure we abort install rather than silently
            # deploying a stub. "__skip__" → deliberate stub.
            local _tpl_out
            if _tpl_out=$(interactive_template_selection); then
                if [ "$_tpl_out" = "__skip__" ]; then
                    template_dir=""
                else
                    template_dir="$_tpl_out"
                fi
            else
                log_error "$(t invalid_choice)"
                return 1
            fi
        fi
    fi

    # 5. Ask how many keys (lazy = 5, no prompt)
    local users_count=5
    if [ "${GOVLESS_LAZY:-0}" != "1" ]; then
        echo ""
        echo -ne "  $(t users_ask_count) $(t users_ask_count_hint): "
        local users_count_input
        read -r users_count_input
        users_count="${users_count_input:-3}"
        if ! [[ "$users_count" =~ ^[0-9]+$ ]] || [ "$users_count" -lt 1 ] || [ "$users_count" -gt 100 ]; then
            users_count=3
        fi
    fi

    # Select 3X-UI version (Legacy 2.x or New 3.x) — but only if not
    # already installed. Otherwise install_3xui will short-circuit and the
    # user's choice would silently mismatch the actual binary (Codex 012 P2).
    if xui_already_installed; then
        load_xui_version_from_config
        log_dim "3X-UI already installed (${XUI_BRANCH:-?} ${XUI_INSTALL_VERSION:-?}) — keeping it"
    elif [ "${GOVLESS_LAZY:-0}" = "1" ]; then
        XUI_BRANCH="new"   # newest 3.x
    else
        select_xui_version
    fi

    # 6b. Transport + fingerprint (lazy = TCP + randomized, no prompts)
    if [ "${GOVLESS_LAZY:-0}" = "1" ]; then
        XUI_TRANSPORT="tcp"
        XUI_FP="${GOVLESS_FP:-randomized}"
    else
        select_transport
        select_fingerprint
    fi

    # 7. Show config summary
    print_header "$(t config_title)"
    echo -e "  $(t config_ip)       ${CYAN}${server_ip}${NC}"
    echo -e "  $(t config_domain)   ${CYAN}${domain}${NC}"
    echo -e "  $(t config_port)     ${CYAN}443${NC}"
    echo -e "  $(t config_mode)     ${CYAN}Pro (TLS)${NC}"
    echo -e "  $(t config_transport) ${CYAN}${XUI_TRANSPORT^^}${NC}"
    echo -e "  $(t config_users)    ${CYAN}${users_count}${NC}"
    echo ""

    if [ "${GOVLESS_LAZY:-0}" = "1" ]; then
        log_info "$(t lazy_autoconfirm)"
    else
        confirm "$(t config_confirm)" || return 0
    fi

    # 7. Install dependencies
    install_dependencies || return 1

    # Re-init state.db now that sqlite3 is guaranteed (first call in
    # init_language ran before deps install, may have been a no-op)
    init_state_db 2>/dev/null || true

    # 8. Free port 443 if occupied (but not xray — it might be our running VPN)
    local port443_proc
    port443_proc=$(ss -tlnp 'sport = :443' 2>/dev/null | grep -o 'users:(("[^"]*' | sed 's/users:(("//' | head -1) || true
    if [ -n "$port443_proc" ]; then
        case "$port443_proc" in
            xray|xray-linux-*) ;;
            *) kill_port 443 ;;
        esac
    fi

    # 8. Setup website + SSL first (needs port 80 and 443 free)
    if [ -n "$template_dir" ]; then
        setup_pro_website "$domain" "$template_dir" "$email" || return 1
    else
        # No template — deploy stub and get SSL
        install_nginx || return 1
        install_certbot || return 1
        deploy_stub_site
        obtain_ssl_certificate "$domain" "$email" || return 1
        generate_nginx_pro_config "$domain"
        systemctl restart nginx 2>/dev/null
        setup_ssl_auto_renewal
    fi

    # 9. Stop nginx on 443 — xray will take over
    # nginx stays on :80, xray takes :443 with fallback to :80

    # 10. Install 3X-UI (critical — must succeed)
    install_3xui || return 1

    # B1/B2/B3 fix: enable panel TLS + bind sub server + lang via sqlite
    configure_panel_tls "${LANG_CODE:-en}" || log_warning "Panel TLS partially failed"


    # 11. Extract credentials & setup API (critical for panel access)
    extract_credentials
    # Set mode/domain in config BEFORE save_credentials so the saved
    # /root/.govless_credentials reflects MODE=pro (was P2: defaulted to lite).
    config_set "mode" "pro"
    config_set "domain" "$domain"
    # Re-point the panel at the domain LE cert now that the cert exists and the
    # domain is in config — so the panel is served at https://<domain>:<port>
    # with a browser-valid certificate (was: IP self-signed).
    configure_panel_tls "${LANG_CODE:-en}" "$server_ip" "$domain" \
        || log_warning "Panel TLS (domain) partially failed"
    configure_sub_server "pro" "$domain" 2>/dev/null || log_warning "sub-server HTTPS config skipped"
    save_credentials
    setup_api_base

    # === Auto-configuration (best-effort) ===
    # Panel is already installed and accessible at this point.
    local auto_ok=true

    # 12. Wait for API & login
    if run_with_spinner "$(t api_waiting)" wait_for_api 90 && api_login_with_retry; then
        :  # API ready — language set earlier via configure_panel_tls (sqlite)
    else
        log_warning "$(t api_login_fail_manual)"
        auto_ok=false
    fi

    # 13. Generate users + TLS inbound
    if $auto_ok; then
        local cert_file="/etc/letsencrypt/live/${domain}/fullchain.pem"
        local key_file="/etc/letsencrypt/live/${domain}/privkey.pem"
        if generate_clients "$users_count" "pro" && \
           api_create_tls_inbound "$domain" "$cert_file" "$key_file"; then
            log_info "$(tf users_creating "$users_count")"
            # Restart x-ui so xray picks up the new inbound
            systemctl restart x-ui 2>/dev/null || true
            sleep 2
        else
            log_warning "$(t auto_config_fail)"
            auto_ok=false
        fi
    fi

    # 14. Generate VLESS links
    if $auto_ok; then
        generate_all_vless_links "pro" "$domain" || auto_ok=false
    fi

    # 15. Save config
    config_set "mode" "pro"
    config_set "domain" "$domain"
    config_set "server_ip" "$server_ip"
    config_set "email" "$email"
    config_set "transport" "$XUI_TRANSPORT"
    config_set "fingerprint" "$XUI_FP"
    config_set_int "port" 443
    config_set_int "users_count" "$users_count"
    config_set "version" "$GOVLESS_VERSION"
    config_set "installed_at" "$(date -Iseconds)"
    config_set "xui_branch" "$XUI_BRANCH"
    [ -n "$XUI_INSTALL_VERSION" ] && config_set "xui_version" "$XUI_INSTALL_VERSION"

    # 16. Done!
    echo ""
    echo -e "  ${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
    echo -e "  ${GREEN}${BOLD}  $(tf install_done "$GOVLESS_VERSION" "Pro")${NC}"
    echo -e "  ${GREEN}${BOLD}════════════════════════════════════════════════════${NC}"
    echo ""

    show_credentials

    if ! $auto_ok; then
        log_warning "$(t auto_config_incomplete)"
    fi

    post_install_flow "pro" "$domain"
}

# ═══════════════════════════════════════════════════════════════════════
# POST-INSTALL FLOW
# ═══════════════════════════════════════════════════════════════════════
post_install_flow() {
    local mode="$1"
    local server="$2"              # IP (lite) or domain (pro)
    local mask_domain="${3:-}"      # only for lite
    # Interactive post-install phase (prompts, QR, bot setup): a fallible display
    # step must not abort the script under errexit.
    set +e

    echo ""
    echo -ne "  $(t press_enter) "
    read -r

    # App download step
    show_app_download

    # Show first user's QR — regen from DB first, prefer subscription URL
    regenerate_links_from_db 2>/dev/null
    if [ -s /tmp/govless_links.json ]; then
        local first_name first_link first_sub
        first_name=$(python3 -c "import json; d=json.load(open('/tmp/govless_links.json')); print(list(d.keys())[0])" 2>/dev/null)
        first_link=$(python3 -c "import json; d=json.load(open('/tmp/govless_links.json')); print(list(d.values())[0])" 2>/dev/null)
        first_sub=""
        if [ "$mode" = "pro" ] && [ -s /tmp/govless_subs.json ]; then
            first_sub=$(python3 -c "import json, sys; d=json.load(open('/tmp/govless_subs.json')); print(d.get(sys.argv[1],''))" "$first_name" 2>/dev/null)
        fi

        if [ -n "$first_name" ] && [ -n "$first_link" ]; then
            show_user_link_choice "$first_name" "$first_link" "$first_sub"
        fi
    fi

    # Connection test
    echo ""
    echo -e "  ${BOLD}$(t test_title)${NC}"
    echo -e "  ${DIM}$(t test_skip)${NC}"
    echo ""

    # 30s default (was 120s) — Layer 3 traffic-stats fallback in
    # check_client_online catches connects within seconds now, so longer
    # wait is unnecessary noise. Override via GOVLESS_CONNTEST_TIMEOUT.
    local test_timeout="${GOVLESS_CONNTEST_TIMEOUT:-30}"
    local poll_interval="${GOVLESS_CONNTEST_INTERVAL:-3}"
    local elapsed=0
    local first_email
    [ -s /tmp/govless_users_map.json ] || regenerate_links_from_db 2>/dev/null
    first_email=$(python3 -c "import json; d=json.load(open('/tmp/govless_users_map.json')); print(list(d.keys())[0])" 2>/dev/null)

    if [ -n "$first_email" ]; then
        while [ "$elapsed" -lt "$test_timeout" ]; do
            if check_client_online "$first_email"; then
                printf "\r%80s\r" " "
                echo -e "  $(tf test_online "$first_email")"
                break
            fi
            local _msg
            _msg=$(tf test_offline "$first_email")
            # Show skip-hint INLINE on the wait line so user sees it
            printf "\r  %s (%ds)  ${DIM}[%s]${NC}    " "$_msg" "$elapsed" "$(t test_skip)" >&2
            read -t "$poll_interval" -r </dev/tty 2>/dev/null && { echo ""; break; } || true
            elapsed=$((elapsed + poll_interval))
        done
        echo ""
    fi

    # Ask to show all users
    echo ""
    if confirm "$(t users_show_all)"; then
        show_all_users_formatted
    fi

    # Offer the step-by-step Telegram bot setup (token -> auto-detect admin -> web menu)
    offer_bot_setup

    echo ""
    echo -e "  $(t enjoy)"
    echo -e "  ${DIM}$(t install_done_hint)${NC}"
    echo ""
}

# ── Show app download ───────────────────────────────────────────────────
show_app_download() {
    print_header "$(t app_title)"
    echo -e "  ${CYAN}1)${NC} $(t app_ios)"
    echo -e "  ${CYAN}2)${NC} $(t app_android)"
    echo ""
    echo -ne "  $(t app_platform) "
    local platform
    read -r platform

    case "$platform" in
        1) echo -e "  ${GREEN}$(t app_ios_hint)${NC}"
           echo ""
           if command -v qrencode &>/dev/null; then
               echo -e "  ${DIM}App Store: Happ${NC}"
               qrencode -t UTF8 -m 2 "https://apps.apple.com/app/happ-proxy-utility/id6504287215" 2>/dev/null
           fi
           ;;
        2) echo -e "  ${GREEN}$(t app_android_hint)${NC}"
           echo ""
           if command -v qrencode &>/dev/null; then
               echo -e "  ${DIM}Google Play: Happ${NC}"
               qrencode -t UTF8 -m 2 "https://play.google.com/store/apps/details?id=com.happproxy" 2>/dev/null
           fi
           ;;
    esac

    echo ""
    echo -ne "  $(t app_installed) [Y/n] "
    read -r
}

# ── Show all users formatted ────────────────────────────────────────────
show_all_users_formatted() {
    regenerate_links_from_db 2>/dev/null
    if [ ! -s /tmp/govless_links.json ]; then
        return 1
    fi

    print_header "$(t users_title)"

    while IFS=$'\t' read -r num name_b64 link_b64; do
        local name link
        name=$(python3 -c 'import base64,sys; print(base64.b64decode(sys.argv[1]).decode())' "$name_b64" 2>/dev/null)
        link=$(python3 -c 'import base64,sys; print(base64.b64decode(sys.argv[1]).decode())' "$link_b64" 2>/dev/null)
        echo -e "  ${CYAN}${num})${NC} ${BOLD}${name}${NC}"
        echo -e "     ${GREEN}${link}${NC}"
        echo ""
    done < <(show_all_users)
}

# ═══════════════════════════════════════════════════════════════════════
# MAIN MENU (interactive, after installation)
# ═══════════════════════════════════════════════════════════════════════
show_dashboard() {
    clear 2>/dev/null || true
    print_banner

    local mode xui_st nginx_st
    mode=$(config_get mode "N/A")
    xui_st=$(xui_status)
    nginx_st=$(nginx_status)

    # Status indicators
    local xui_icon nginx_icon
    case "$xui_st" in
        running) xui_icon="${GREEN}●${NC}" ;;
        stopped) xui_icon="${YELLOW}○${NC}" ;;
        *)       xui_icon="${RED}✗${NC}" ;;
    esac
    case "$nginx_st" in
        running) nginx_icon="${GREEN}●${NC}" ;;
        stopped) nginx_icon="${YELLOW}○${NC}" ;;
        *)       nginx_icon="${RED}✗${NC}" ;;
    esac

    echo -e "  ${BOLD}$(t dashboard_title)${NC}"
    echo -e "  ${DIM}$(printf '─%.0s' {1..50})${NC}"
    echo -e "  $(t svc_xui):  ${xui_icon} $(t "$xui_st")    $(t svc_nginx): ${nginx_icon} $(t "$nginx_st")"

    local ip domain mask
    ip=$(config_get server_ip "")
    domain=$(config_get domain "")
    mask=$(config_get mask_domain "")

    local xui_ver transport_cfg
    xui_ver=$(config_get xui_version "")
    transport_cfg=$(config_get transport "")

    echo -e "  $(t net_mode)    ${CYAN}${mode}${NC}"
    [ -n "$xui_ver" ] && echo -e "  $(t dashboard_xui_ver)  ${CYAN}${xui_ver}${NC}"
    [ -n "$transport_cfg" ] && echo -e "  $(t config_transport) ${CYAN}${transport_cfg^^}${NC}"
    [ -n "$ip" ] && echo -e "  $(t net_ip)      ${CYAN}${ip}${NC}"
    [ -n "$domain" ] && echo -e "  $(t net_domain)  ${CYAN}${domain}${NC}"
    [ -n "$mask" ] && echo -e "  $(t config_mask) ${CYAN}${mask}${NC}"
    echo -e "  ${DIM}$(printf '─%.0s' {1..50})${NC}"
}

# ── Telegram bot: settings & administration ─────────────────────────────
BOT_ENV_FILE="/etc/govless/bot.env"

_bot_installed() { [ -f "$BOT_ENV_FILE" ]; }

_bot_env_get() {  # $1=key -> value on stdout
    [ -f "$BOT_ENV_FILE" ] || return 1
    sed -nE "s/^$1=(.*)$/\1/p" "$BOT_ENV_FILE" | head -n1
}

_bot_env_set() {  # $1=key $2=value — replace-or-append, preserve perms/owner
    local key="$1" val="$2" tmp
    mkdir -p /etc/govless 2>/dev/null
    [ -f "$BOT_ENV_FILE" ] || : > "$BOT_ENV_FILE"
    tmp="$(mktemp)"
    awk -v k="$key" -v v="$val" '
        $0 ~ "^"k"=" { if (!seen) { print k"="v; seen=1 } ; next }
        { print }
        END { if (!seen) print k"="v }
    ' "$BOT_ENV_FILE" > "$tmp"
    cat "$tmp" > "$BOT_ENV_FILE"
    rm -f "$tmp"
    chmod 0640 "$BOT_ENV_FILE" 2>/dev/null
    chown root:govless "$BOT_ENV_FILE" 2>/dev/null || true
}

_bot_getme() {  # $1=token -> echoes username if ok, else returns 1
    local resp
    resp="$(curl -fsS --max-time 10 "https://api.telegram.org/bot$1/getMe" 2>/dev/null)" || return 1
    printf '%s' "$resp" | grep -q '"ok":true' || return 1
    printf '%s' "$resp" | grep -oE '"username":"[^"]*"' | head -n1 | sed -E 's/.*:"([^"]*)"/\1/'
}

bot_set_token() {
    local cur tok uname yn
    cur="$(_bot_env_get BOT_TOKEN)"
    if [ -n "$cur" ]; then echo -e "  $(t bot_token_current_set) ${DIM}${cur:0:6}…${NC}"
    else log_warning "$(t bot_token_current_empty)"; fi
    echo -ne "  $(t bot_token_prompt) "
    read -r tok
    tok="$(printf '%s' "$tok" | tr -d '[:space:]')"
    if ! printf '%s' "$tok" | grep -qE '^[0-9]{6,12}:[A-Za-z0-9_-]{30,}$'; then
        log_warning "$(t bot_token_invalid)"; return
    fi
    log_info "$(t bot_token_verifying)"
    if uname="$(_bot_getme "$tok")" && [ -n "$uname" ]; then
        log_success "$(tf bot_token_ok "$uname")"
    else
        log_warning "$(t bot_token_verify_fail)"
        echo -ne "  $(t bot_save_anyway) "; read -r yn
        case "$yn" in y|Y|yes|YES|д|Д|да|ДА) ;; *) return ;; esac
    fi
    _bot_env_set BOT_TOKEN "$tok"
    log_success "$(t bot_token_saved)"
    if systemctl restart govless-bot 2>/dev/null; then log_success "$(t bot_restarted)"
    else log_info "$(t bot_reload_note)"; fi
}

bot_manage_admins() {
    local cur ids
    cur="$(_bot_env_get ADMIN_IDS)"
    if [ -n "$cur" ]; then echo -e "  $(tf bot_admins_current "$cur")"; else log_warning "$(t bot_admins_none)"; fi
    echo -e "  ${DIM}$(t bot_admins_hint)${NC}"
    echo -ne "  $(t bot_admins_prompt) "
    read -r ids
    ids="$(printf '%s' "$ids" | tr -d '[:space:]')"
    [ -z "$ids" ] && { log_warning "$(t bot_admins_unchanged)"; return; }
    if ! printf '%s' "$ids" | grep -qE '^[0-9]+(,[0-9]+)*$'; then
        log_warning "$(t bot_admins_invalid)"; return
    fi
    _bot_env_set ADMIN_IDS "$ids"
    log_success "$(t bot_admins_saved)"
    systemctl restart govless-bot 2>/dev/null || true
}

bot_show_status() {
    local tok ids uname svc
    tok="$(_bot_env_get BOT_TOKEN)"; ids="$(_bot_env_get ADMIN_IDS)"
    if [ -n "$tok" ]; then echo -e "  ${GREEN}✓${NC} $(t bot_token_current_set)"; else echo -e "  ${YELLOW}—${NC} $(t bot_token_current_empty)"; fi
    if [ -n "$ids" ]; then echo -e "  $(tf bot_admins_current "$ids")"; else echo -e "  ${DIM}$(t bot_admins_none)${NC}"; fi
    for svc in govlessctl govless-bot webapp-frontend; do
        systemctl list-unit-files "${svc}.service" >/dev/null 2>&1 || continue
        if systemctl is-active --quiet "$svc" 2>/dev/null; then echo -e "  ${GREEN}✓${NC} ${svc}: $(t bot_status_running)"
        else echo -e "  ${RED}✗${NC} ${svc}: $(t bot_status_stopped)"; fi
    done
    if [ -n "$tok" ] && uname="$(_bot_getme "$tok")" && [ -n "$uname" ]; then
        echo -e "  $(t bot_link): ${CYAN}https://t.me/${uname}${NC}"
    fi
}

bot_restart() {
    log_info "$(t bot_restarting)"
    local ok=1 svc
    for svc in govlessctl govless-bot; do systemctl restart "$svc" 2>/dev/null || ok=0; done
    [ "$ok" = 1 ] && log_success "$(t bot_restarted)" || log_warning "$(t bot_restart_fail)"
}

bot_install_phasea() {
    local installer="${SCRIPT_DIR}/phase-a/systemd/install/install_phase_a.sh"
    [ -f "$installer" ] || { log_error "$(t bot_phasea_missing)"; return 1; }
    log_info "$(t bot_installing_phasea)"
    if bash "$installer"; then log_success "$(t bot_phasea_installed)"; else log_error "$(t bot_phasea_fail)"; fi
}

submenu_bot() {
    while true; do
        print_header "$(t submenu_bot_title)"
        if ! _bot_installed; then
            log_warning "$(t bot_not_installed)"
            echo -e "  ${CYAN}1)${NC} $(t bot_opt_install)"
            echo -e "  ${CYAN}0)${NC} $(t back)"
            echo ""
            local c; read -rp "  ▸ " c
            case "$c" in
                1) bot_install_phasea ;;
                0) return ;;
                *) log_warning "$(t invalid_choice)"; sleep 1; continue ;;
            esac
            echo -ne "  $(t press_enter_return) "; read -r; continue
        fi
        echo -e "  ${CYAN}1)${NC} $(t bot_opt_token)"
        echo -e "  ${CYAN}2)${NC} $(t bot_opt_admins)"
        echo -e "  ${CYAN}3)${NC} $(t bot_opt_status)"
        echo -e "  ${CYAN}4)${NC} $(t bot_opt_restart)"
        echo -e "  ${CYAN}5)${NC} $(t bot_opt_wizard)"
        echo -e "  ${CYAN}0)${NC} $(t back)"
        echo ""
        local choice; read -rp "  ▸ " choice
        case "$choice" in
            1) bot_set_token ;;
            2) bot_manage_admins ;;
            3) bot_show_status ;;
            4) bot_restart ;;
            5) bot_setup_wizard ;;
            0) return ;;
            *) log_warning "$(t invalid_choice)"; sleep 1; continue ;;
        esac
        echo -ne "  $(t press_enter_return) "; read -r
    done
}


# ── Telegram bot: auto-detect admin + step-by-step setup wizard ──────────
_bot_detect_admin() {  # $1=token -> prints "id|first_name|username"; rc 0 ok / 1 timeout
    # The bot polls getUpdates (single consumer) — stop it so we can read updates.
    systemctl stop govless-bot 2>/dev/null || true
    python3 - "$1" <<'PYEOF'
import sys, json, time, urllib.request
tok = sys.argv[1]
base = "https://api.telegram.org/bot%s/getUpdates" % tok
def call(q, to=30):
    with urllib.request.urlopen(base + "?" + q, timeout=to) as r:
        return json.load(r)
offset = 0
# drain anything already pending so we only react to a fresh message
try:
    d = call("offset=-1&timeout=0", 15)
    res = d.get("result", [])
    if res:
        offset = res[-1]["update_id"] + 1
except Exception:
    pass
deadline = time.time() + 90
while time.time() < deadline:
    try:
        d = call("offset=%d&timeout=20" % offset, 30)
    except Exception:
        time.sleep(2); continue
    for u in d.get("result", []):
        offset = max(offset, u["update_id"] + 1)
        m = u.get("message") or u.get("edited_message")
        frm = (m or {}).get("from") or {}
        if frm.get("id") and not frm.get("is_bot"):
            print("%s|%s|%s" % (frm["id"], frm.get("first_name", ""), frm.get("username", "")))
            sys.exit(0)
sys.exit(1)
PYEOF
}

bot_setup_wizard() {
    local tok cur uname det aid aname auser admins="" yn m
    print_header "$(t bot_wiz_title)"

    # Step 1/3 — token (with @BotFather hint + getMe verification)
    echo -e "  ${BOLD}$(t bot_wiz_step1)${NC}"
    echo -e "  ${DIM}$(t bot_wiz_token_help)${NC}"
    cur="$(_bot_env_get BOT_TOKEN)"
    [ -n "$cur" ] && echo -e "  ${DIM}$(t bot_token_current_set) ${cur:0:6}…${NC}"
    while true; do
        echo -ne "  $(t bot_token_prompt) "
        read -r tok
        tok="$(printf '%s' "$tok" | tr -d '[:space:]')"
        if [ -z "$tok" ]; then log_warning "$(t bot_wiz_cancelled)"; return 1; fi
        if ! printf '%s' "$tok" | grep -qE '^[0-9]{6,12}:[A-Za-z0-9_-]{30,}$'; then
            log_warning "$(t bot_token_invalid)"; continue
        fi
        log_info "$(t bot_token_verifying)"
        if uname="$(_bot_getme "$tok")" && [ -n "$uname" ]; then
            log_success "$(tf bot_token_ok "$uname")"; break
        fi
        log_warning "$(t bot_token_verify_fail)"
    done
    _bot_env_set BOT_TOKEN "$tok"

    # Step 2/3 — auto-detect first admin by messaging the bot
    echo ""
    echo -e "  ${BOLD}$(t bot_wiz_step2)${NC}"
    echo -e "  $(tf bot_wiz_open_bot "$uname")"
    log_info "$(t bot_wiz_waiting)"
    if det="$(_bot_detect_admin "$tok")"; then
        IFS='|' read -r aid aname auser <<<"$det"
        admins="$aid"
        log_success "$(tf bot_wiz_detected "${aname:-${auser:-id}}" "$aid")"
    else
        log_warning "$(t bot_wiz_detect_timeout)"
        echo -ne "  $(t bot_admins_prompt) "; read -r m
        m="$(printf '%s' "$m" | tr -d '[:space:]')"
        printf '%s' "$m" | grep -qE '^[0-9]+(,[0-9]+)*$' && admins="$m"
    fi

    # Step 3/3 — offer to add more admins
    while [ -n "$admins" ]; do
        echo ""
        echo -ne "  $(t bot_wiz_add_more) "; read -r yn
        case "$yn" in y|Y|yes|YES|д|Д|да|ДА) ;; *) break ;; esac
        echo -e "  $(t bot_wiz_open_bot_more)"
        log_info "$(t bot_wiz_waiting)"
        if det="$(_bot_detect_admin "$tok")"; then
            IFS='|' read -r aid aname auser <<<"$det"
            case ",$admins," in
                *",$aid,"*) log_warning "$(t bot_wiz_already)" ;;
                *) admins="${admins},${aid}"; log_success "$(tf bot_wiz_detected "${aname:-${auser:-id}}" "$aid")" ;;
            esac
        else
            log_warning "$(t bot_wiz_detect_timeout)"
        fi
    done
    [ -n "$admins" ] && _bot_env_set ADMIN_IDS "$admins"

    # Step 4 — start the bot + final instructions (incl. web menu / Mini App)
    systemctl enable govless-bot >/dev/null 2>&1
    systemctl restart govless-bot 2>/dev/null
    echo ""
    echo -e "  ${GREEN}${BOLD}$(t bot_wiz_done_title)${NC}"
    log_success "$(tf bot_wiz_done_bot "$uname")"
    [ -n "$admins" ] && echo -e "  $(tf bot_admins_current "$admins")"
    echo -e "  $(t bot_wiz_webmenu)"
    echo -e "  ${CYAN}https://t.me/${uname}${NC}"
    echo ""
}

offer_bot_setup() {
    echo ""
    echo -e "  ${BOLD}$(t bot_offer_title)${NC}"
    echo -ne "  $(t bot_offer_setup) "
    local yn; read -r yn
    case "$yn" in n|N|no|NO|н|Н|нет|НЕТ) log_info "$(t bot_offer_later)"; return 0 ;; esac
    if ! _bot_installed; then
        log_info "$(t bot_installing_phasea)"
        bot_install_phasea || { log_warning "$(t bot_phasea_fail)"; return 1; }
    fi
    bot_setup_wizard
}


main_menu() {
    while true; do
        show_dashboard

        echo ""
        echo -e "  ${CYAN}1)${NC} $(t menu_proxy)"
        echo -e "  ${CYAN}2)${NC} $(t menu_users)"
        echo -e "  ${CYAN}3)${NC} $(t menu_manage)"
        echo -e "  ${CYAN}4)${NC} $(t menu_bot)"
        echo -e "  ${CYAN}5)${NC} $(t menu_about)"
        echo -e "  ${CYAN}0)${NC} $(t exit)"
        echo ""
        echo -e "  ${DIM}$(t auto_refresh_30s)${NC}"

        local choice
        read -t 30 -rp "  ▸ " choice || { echo ""; continue; }

        case "$choice" in
            1) submenu_proxy ;;
            2) submenu_users ;;
            3) submenu_manage ;;
            4) submenu_bot ;;
            5) submenu_about ;;
            0) echo -e "  $(t bye)"; exit 0 ;;
            *)
                # Stay in main menu — re-render dashboard + options
                log_warning "$(t invalid_choice)"
                sleep 1
                ;;
        esac
    done
}

# ── Submenu: Proxy ──────────────────────────────────────────────────────
# Looping submenu — invalid input stays here (does NOT pop to main menu).
# Only `0` returns to the caller (main menu).
submenu_proxy() {
    while true; do
        print_header "$(t submenu_proxy_title)"
        echo -e "  ${CYAN}1)${NC} $(t proxy_install_update)"
        echo -e "  ${CYAN}2)${NC} $(t proxy_restart)"
        echo -e "  ${CYAN}3)${NC} $(t proxy_logs)"
        echo -e "  ${CYAN}4)${NC} $(t proxy_change_mode)"
        echo -e "  ${CYAN}0)${NC} $(t back)"
        echo ""

        local choice
        read -rp "  ▸ " choice
        case "$choice" in
            1) select_and_install ;;
            2) restart_xui ;;
            3) xui_logs 50 ;;
            4) switch_mode_interactive ;;
            0) return ;;
            *)
                log_warning "$(t invalid_choice)"
                sleep 1
                continue
                ;;
        esac
        echo -ne "  $(t press_enter_return) "
        read -r
    done
}

# ── Submenu: Users (NEW — owns links/QR, was scattered in Proxy) ────────
submenu_users() {
    while true; do
        print_header "$(t submenu_users_title)"
        echo -e "  ${CYAN}1)${NC} $(t users_show_list)"
        echo -e "  ${CYAN}2)${NC} $(t users_show_links_action)"
        echo -e "  ${CYAN}3)${NC} $(t users_show_qr_action)"
        echo -e "  ${CYAN}4)${NC} $(t users_regen_links)"
        echo -e "  ${CYAN}0)${NC} $(t back)"
        echo ""

        local choice
        read -rp "  ▸ " choice
        case "$choice" in
            1) show_all_users_formatted ;;
            2)
                # All VLESS links as plain text (good for SSH copy-paste)
                regenerate_links_from_db 2>/dev/null
                if [ -s /tmp/govless_links.json ]; then
                    python3 -c "
import json
d = json.load(open('/tmp/govless_links.json'))
for name, link in d.items():
    print(f'{name}:')
    print(f'  {link}')
    print()
"
                else
                    log_warning "$(t users_no_links)"
                fi
                ;;
            3)
                # Per-user QR: list users and let the operator PICK which one (loop to pick more).
                regenerate_links_from_db 2>/dev/null
                if [ ! -s /tmp/govless_links.json ]; then
                    log_warning "$(t users_no_links)"
                else
                    local -a _qnames=()
                    while IFS= read -r _qn; do [ -n "$_qn" ] && _qnames+=("$_qn"); done < <(python3 -c "import json;[print(k) for k in json.load(open('/tmp/govless_links.json')).keys()]" 2>/dev/null)
                    if [ ${#_qnames[@]} -eq 0 ]; then
                        log_warning "$(t users_no_links)"
                    else
                        while true; do
                            echo ""
                            echo -e "  ${BOLD}$(t users_pick_qr)${NC}"
                            local _qi=1 _qn
                            for _qn in "${_qnames[@]}"; do echo -e "    ${CYAN}${_qi})${NC} ${_qn}"; _qi=$((_qi+1)); done
                            echo -e "    ${CYAN}0)${NC} $(t back)"
                            local _qp; read -rp "  ▸ " _qp </dev/tty
                            [ "$_qp" = "0" ] && break
                            if [[ "$_qp" =~ ^[0-9]+$ ]] && [ "$_qp" -ge 1 ] && [ "$_qp" -le "${#_qnames[@]}" ]; then
                                local _qsel="${_qnames[$((_qp-1))]}" _qlink _qsub=""
                                _qlink=$(python3 -c "import json,sys; print(json.load(open('/tmp/govless_links.json')).get(sys.argv[1],''))" "$_qsel" 2>/dev/null)
                                [ -s /tmp/govless_subs.json ] && _qsub=$(python3 -c "import json,sys; print(json.load(open('/tmp/govless_subs.json')).get(sys.argv[1],''))" "$_qsel" 2>/dev/null)
                                show_user_link_choice "$_qsel" "$_qlink" "$_qsub"
                            else
                                log_warning "$(t invalid_choice)"
                            fi
                        done
                    fi
                fi
                ;;
            4)
                regenerate_links_from_db && log_success "$(t users_links_regen_ok)"
                ;;
            0) return ;;
            *)
                log_warning "$(t invalid_choice)"
                sleep 1
                continue
                ;;
        esac
        echo -ne "  $(t press_enter_return) "
        read -r
    done
}

# ── Submenu: Manage ─────────────────────────────────────────────────────
submenu_manage() {
    while true; do
        print_header "$(t submenu_manage_title)"
        echo -e "  ${CYAN}1)${NC} $(t manage_language)"
        echo -e "  ${CYAN}2)${NC} $(t proxy_restart)"
        echo -e "  ${CYAN}3)${NC} $(t manage_repair)"
        echo -e "  ${CYAN}4)${NC} $(t manage_backup)"
        echo -e "  ${CYAN}5)${NC} $(t manage_restore)"
        echo -e "  ${CYAN}6)${NC} $(t manage_remove)"
        echo -e "  ${CYAN}0)${NC} $(t back)"
        echo ""

        local choice
        read -rp "  ▸ " choice
        case "$choice" in
            1)
                local new_lang
                new_lang=$(pick_language_interactive)
                load_language "$new_lang"
                save_language "$new_lang"
                ;;
            2) restart_xui ;;
            3) repair_user_facing ;;
            4) backup_govless ;;
            5)
                # Pick the most recent backup interactively
                local pick
                local -a backups
                if [ -d /root/govless-backups ]; then
                    while IFS= read -r f; do backups+=("$f"); done < <(ls -t /root/govless-backups/govless-*.tgz 2>/dev/null)
                fi
                if [ ${#backups[@]} -eq 0 ]; then
                    log_warning "$(t backup_no_files)"
                else
                    echo "  $(t restore_pick):"
                    local i=1
                    for b in "${backups[@]}"; do
                        echo "    ${CYAN}${i})${NC} $(basename "$b")"
                        i=$((i+1))
                    done
                    read -rp "  ▸ " pick
                    if [[ "$pick" =~ ^[0-9]+$ ]] && [ "$pick" -ge 1 ] && [ "$pick" -le "${#backups[@]}" ]; then
                        restore_govless "${backups[$((pick-1))]}"
                    else
                        log_warning "$(t invalid_choice)"
                    fi
                fi
                ;;
            6) submenu_remove ;;
            0) return ;;
            *)
                log_warning "$(t invalid_choice)"
                sleep 1
                continue
                ;;
        esac
        echo -ne "  $(t press_enter_return) "
        read -r
    done
}

# ── Submenu: Remove (NEW — granular: site / panel / everything) ─────────
submenu_remove() {
    while true; do
        print_header "$(t submenu_remove_title)"
        echo -e "  ${CYAN}1)${NC} $(t remove_only_site)"
        echo -e "  ${CYAN}2)${NC} $(t remove_only_panel)"
        echo -e "  ${CYAN}3)${NC} ${RED}${BOLD}$(t remove_everything)${NC}"
        echo -e "  ${CYAN}0)${NC} $(t back)"
        echo ""

        local choice
        read -rp "  ▸ " choice
        case "$choice" in
            1)
                if typed_confirm "DELETE SITE" "$(t remove_confirm_site)"; then
                    remove_site_only
                fi
                ;;
            2)
                if typed_confirm "DELETE PANEL" "$(t remove_confirm_panel)"; then
                    remove_panel_only
                fi
                ;;
            3)
                if typed_confirm "DELETE EVERYTHING" "$(t remove_confirm_all)"; then
                    remove_everything
                    # After full nuke, exiting is the only sane next step
                    echo ""
                    echo -e "  $(t bye)"
                    exit 0
                fi
                ;;
            0) return ;;
            *)
                log_warning "$(t invalid_choice)"
                sleep 1
                continue
                ;;
        esac
        echo -ne "  $(t press_enter_return) "
        read -r
    done
}

# ── Submenu: About ──────────────────────────────────────────────────────
submenu_about() {
    print_header "$(t submenu_about_title)"
    echo -e "  goVLESS:    v${GOVLESS_VERSION}"
    echo -e "  Engine:     3X-UI + Xray-core"
    echo -e "  Protocol:   VLESS + XTLS-Vision"
    echo -e "  Security:   Reality / TLS"
    echo -e "  Author:     anten-ka"
    echo -e "  GitHub:     github.com/anten-ka"
    echo -e "  YouTube:    youtube.com/@anten-ka"
    show_credits
    # Disclaimer (info-only, no gate — operator can re-read anytime)
    show_disclaimer
    echo -ne "  $(t press_enter_return) "
    read -r
}

# ═══════════════════════════════════════════════════════════════════════
# MODE SELECTION
# ═══════════════════════════════════════════════════════════════════════
select_and_install() {
    # Disclaimer gate — shown on first install; cached in $GOVLESS_DIR/.disclaimer-accepted
    show_disclaimer --gate || return 1

    print_header "$(t install_select_mode)"
    echo ""
    echo -e "  ${CYAN}1)${NC} ${BOLD}$(t install_lazy_title)${NC}"
    echo -e "     ${DIM}$(t install_lazy_desc1)${NC}"
    echo -e "     ${DIM}$(t install_lazy_desc2)${NC}"
    echo ""
    echo -e "  ${CYAN}2)${NC} ${BOLD}$(t install_pro_title)${NC}"
    echo -e "     ${DIM}$(t install_pro_desc1)${NC}"
    echo -e "     ${DIM}$(t install_pro_desc2)${NC}"
    echo -e "     ${DIM}$(t install_pro_desc3)${NC}"
    echo ""
    echo -e "  ${CYAN}3)${NC} ${BOLD}$(t install_lite_title)${NC}"
    echo -e "     ${DIM}$(t install_lite_desc1)${NC}"
    echo -e "     ${DIM}$(t install_lite_desc2)${NC}"
    echo -e "     ${DIM}$(t install_lite_desc3)${NC}"
    echo ""

    local mode_choice
    echo -ne "  $(t install_mode_choice) "
    read -r mode_choice

    case "$mode_choice" in
        ""|1) GOVLESS_LAZY=1 install_pro ;;
        2) install_pro ;;
        3) install_lite ;;
        *) log_error "$(t invalid_choice)"; return 1 ;;
    esac
}

# ═══════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════
main() {
    # `curl ... | bash` puts the SCRIPT on stdin, so interactive `read` prompts
    # hit EOF and every gate "declines" no matter what the user types. If stdin
    # isn't a TTY but a controlling terminal exists, reconnect stdin to it.
    # Detached/non-interactive runs (no /dev/tty) keep their piped stdin so
    # answer-ribbon automation still works.
    if [ ! -t 0 ] && [ -r /dev/tty ]; then exec < /dev/tty; fi
    init_language
    print_banner

    # Check disk space
    if ! check_disk_space 500; then
        local avail
        avail=$(df -m / 2>/dev/null | awk 'NR==2 {print $4}')
        log_error "$(tf err_low_disk "${avail:-?}" "500")"
        exit 1
    fi

    # Preflight: verify + install all required packages once, up front, so a
    # missing tool can't surface as a confusing mid-install failure.
    if ! preflight_deps; then
        log_error "$(t preflight_abort)"
        exit 1
    fi

    # If already installed — show menu
    if is_xui_installed && [ -f "$GOVLESS_CONFIG" ]; then
        load_credentials
        setup_api_base
        # Interactive menu: handlers (restart/logs/backup/repair, empty user list, mode
        # switch) legitimately return non-zero; under `set -e` that would eject the
        # user from the menu to the shell. The install flow guards its own steps.
        set +e
        main_menu
    else
        # First run — install
        select_and_install
    fi
}

main "$@"
