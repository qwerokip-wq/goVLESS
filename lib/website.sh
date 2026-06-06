#!/bin/bash
# goVLESS v3.0.0 — nginx + certbot + SSL + template deployment
# Pro mode: real domain, Let's Encrypt, website template
# Lite mode: stub site on nginx:80 for fallback (optional)

# ── Install nginx ───────────────────────────────────────────────────────
install_nginx() {
    if command -v nginx &>/dev/null; then
        log_dim "nginx already installed"
        return 0
    fi
    log_info "Installing nginx..."
    case "$(get_pkg_manager)" in
        apt) apt_update && apt_install nginx || return 1 ;;
        dnf) dnf install -y -q nginx || return 1 ;;
        yum) yum install -y -q nginx || return 1 ;;
    esac
    systemctl enable nginx 2>/dev/null
}

# ── Install certbot ─────────────────────────────────────────────────────
install_certbot() {
    if command -v certbot &>/dev/null; then
        log_dim "certbot already installed"
        return 0
    fi
    log_info "Installing certbot..."
    case "$(get_pkg_manager)" in
        apt) apt_install certbot python3-certbot-nginx || return 1 ;;
        dnf) dnf install -y -q certbot python3-certbot-nginx || return 1 ;;
        yum) yum install -y -q certbot python3-certbot-nginx || return 1 ;;
    esac
}

# ── Generate nginx config for Pro mode ──────────────────────────────────
# In Pro mode: xray listens on 443 (TLS), fallback → nginx:80 (site)
generate_nginx_pro_config() {
    local domain="$1"

    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

    cat > "$NGINX_SITE_CONF" << 'EONGINX'
# goVLESS Pro mode — nginx config
# Xray (3X-UI) on port 443 with TLS, fallback to nginx:80

server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;

    # Let's Encrypt ACME challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    # Serve the website (fallback from xray)
    root /var/www/html;
    index index.html;

    # Security headers — applied to all responses (VPS-B 13.1 finding)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "interest-cohort=()" always;

    location / {
        try_files $uri $uri/ =404;
        expires 30d;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Hide dotfiles
    location ~ /\. { deny all; }
    location = /robots.txt { allow all; log_not_found off; access_log off; }
    location = /favicon.ico { log_not_found off; access_log off; }
}
EONGINX

    local escaped_domain
    escaped_domain=$(printf '%s\n' "$domain" | sed 's/[|&/\]/\\&/g')
    sed -i "s|DOMAIN_PLACEHOLDER|${escaped_domain}|g" "$NGINX_SITE_CONF"

    rm -f /etc/nginx/sites-enabled/default 2>/dev/null
    ln -sf "$NGINX_SITE_CONF" "$NGINX_SITE_LINK"

    log_success "nginx config created for $domain"
}

# ── Generate nginx config for Lite mode (stub fallback) ─────────────────
# In Lite mode: xray/Reality on 443, nginx:80 shows a stub site
generate_nginx_lite_config() {
    mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

    cat > "$NGINX_SITE_CONF" << 'EONGINX'
# goVLESS Lite mode — stub site on port 80

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
    }

    location ~ /\. { deny all; }
}
EONGINX

    rm -f /etc/nginx/sites-enabled/default 2>/dev/null
    ln -sf "$NGINX_SITE_CONF" "$NGINX_SITE_LINK"

    log_success "nginx stub config created"
}

# ── Temporary config for ACME challenge ─────────────────────────────────
generate_nginx_temp_config() {
    local domain="$1"

    cat > "$NGINX_SITE_CONF" << 'EONGINX_TEMP'
# goVLESS — temporary config for SSL certificate
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN_PLACEHOLDER;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
EONGINX_TEMP

    local escaped_domain
    escaped_domain=$(printf '%s\n' "$domain" | sed 's/[|&/\]/\\&/g')
    sed -i "s|DOMAIN_PLACEHOLDER|${escaped_domain}|g" "$NGINX_SITE_CONF"

    rm -f /etc/nginx/sites-enabled/default 2>/dev/null
    ln -sf "$NGINX_SITE_CONF" "$NGINX_SITE_LINK"

    # /var/www/certbot must be readable by nginx (www-data). Root's umask
    # may default to 077 → drwx------ which blocks LE HTTP-01 challenge.
    mkdir -p /var/www/certbot/.well-known/acme-challenge
    chmod 755 /var/www /var/www/certbot /var/www/certbot/.well-known /var/www/certbot/.well-known/acme-challenge
    chown -R www-data:www-data /var/www/certbot 2>/dev/null || true
}

# ── Obtain SSL certificate ──────────────────────────────────────────────
obtain_ssl_certificate() {
    local domain="$1"
    local email="${2:-}"

    # Tech-debt: clean up legacy XUIFAST nginx symlinks before our temp
    # config + nginx -t in Pro path too.
    cleanup_legacy_xuifast_nginx

    if [ -d "/etc/letsencrypt/live/$domain" ]; then
        log_dim "SSL certificate already exists for $domain"
        return 0
    fi

    log_info "Obtaining SSL certificate for $domain..."

    # Temp config for ACME
    generate_nginx_temp_config "$domain"
    if ! systemctl restart nginx 2>/dev/null; then
        log_error "Failed to restart nginx for ACME challenge"
        return 1
    fi

    local certbot_args=(
        certonly --webroot
        -w /var/www/certbot
        -d "$domain"
        --non-interactive --agree-tos
    )

    if [ -n "$email" ]; then
        certbot_args+=(--email "$email")
    else
        certbot_args+=(--register-unsafely-without-email)
    fi

    # Wait for nginx to be fully ready
    sleep 2

    # Try certbot with one retry (handles transient nginx timing issues)
    local attempt
    for attempt in 1 2; do
        if certbot "${certbot_args[@]}" 2>/dev/null; then
            log_success "SSL certificate obtained for $domain"
            return 0
        fi
        if [ "$attempt" -eq 1 ]; then
            log_warning "Certbot attempt 1 failed, retrying in 5s..."
            sleep 5
            systemctl restart nginx 2>/dev/null || true
            sleep 2
        fi
    done

    log_error "Failed to obtain SSL certificate"
    log_dim "Make sure $domain points to this server's IP"
    log_dim "and port 80 is open in the firewall."
    return 1
}

_install_certbot_deploy_hook() {
    # Codex 029 + agent finding: deploy_hook restarts x-ui + reloads nginx
    # after auto-renewal. Without this, xray keeps stale FD pointing at the
    # about-to-expire cert until next x-ui restart.
    local hook_path="/etc/letsencrypt/renewal-hooks/deploy/govless-restart.sh"
    mkdir -p "$(dirname "$hook_path")" 2>/dev/null
    cat > "$hook_path" <<'HOOK'
#!/bin/bash
# Auto-installed by goVLESS — reloads services after LE cert renewal.
systemctl reload nginx 2>/dev/null || systemctl restart nginx 2>/dev/null
systemctl restart x-ui 2>/dev/null
exit 0
HOOK
    chmod +x "$hook_path"
    log_info "Certbot deploy_hook installed: $hook_path"
}

# ── Auto-renewal setup ──────────────────────────────────────────────────
setup_ssl_auto_renewal() {
    _install_certbot_deploy_hook

    if [ -f /etc/systemd/system/certbot.timer ] || [ -f /lib/systemd/system/certbot.timer ]; then
        systemctl enable certbot.timer 2>/dev/null
        systemctl start certbot.timer 2>/dev/null
        log_success "SSL auto-renewal via systemd timer"
        return 0
    fi

    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
        log_success "SSL auto-renewal via cron (daily 3:00)"
    fi
}

# ── Get SSL expiry date ─────────────────────────────────────────────────
get_ssl_expiry() {
    local domain="$1"
    local cert="/etc/letsencrypt/live/$domain/fullchain.pem"
    if [ -f "$cert" ]; then
        openssl x509 -enddate -noout -in "$cert" 2>/dev/null | sed 's/notAfter=//'
    else
        echo "N/A"
    fi
}

# ── Deploy stub site (Lite mode) ───────────────────────────────────────
deploy_stub_site() {
    mkdir -p "$WEBSITE_ROOT"
    # Ownership marker — used by remove_site_only to know it's safe to rm -rf
    touch "${WEBSITE_ROOT}/.govless-owned" 2>/dev/null

    cat > "$WEBSITE_ROOT/index.html" << 'STUBHTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               background: #f5f5f5; color: #333; display: flex; justify-content: center;
               align-items: center; min-height: 100vh; }
        .card { background: #fff; border-radius: 12px; box-shadow: 0 2px 20px rgba(0,0,0,0.08);
                padding: 3rem; max-width: 480px; text-align: center; }
        h1 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #1a1a1a; }
        p { color: #666; line-height: 1.6; margin-top: 1rem; }
        .status { display: inline-block; background: #e8f5e9; color: #2e7d32;
                  padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.85rem; margin-top: 1.5rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Server is running</h1>
        <p>This server is configured and operating normally.</p>
        <span class="status">● Online</span>
    </div>
</body>
</html>
STUBHTML

    chown -R www-data:www-data "$WEBSITE_ROOT" 2>/dev/null || chown -R nginx:nginx "$WEBSITE_ROOT" 2>/dev/null
    chmod -R 755 "$WEBSITE_ROOT"
    log_success "Stub site deployed"
}

# ── Deploy template site ───────────────────────────────────────────────
deploy_template_to_nginx() {
    local template_dir="$1"
    local template_id="${2:-}"

    if [ ! -d "$template_dir" ] || [ ! -f "$template_dir/index.html" ]; then
        log_error "Template missing index.html: $template_dir"
        return 1
    fi

    [ -z "$template_id" ] && template_id=$(basename "$template_dir")

    # Backup old site (atomic .tgz: write to .tmp, then mv into place so a
    # crash mid-tar never leaves a half-written archive). Skip if the backup
    # filesystem has < 100MB free.
    if [ -d "$WEBSITE_ROOT" ] && [ "$(ls -A "$WEBSITE_ROOT" 2>/dev/null)" ]; then
        local backup_dir="/tmp"
        local backup_name="site_backup_$(date +%Y%m%d_%H%M%S).tgz"
        local backup_final="${backup_dir}/${backup_name}"
        local backup_tmp="${backup_final}.tmp"
        # Free space on the backup filesystem, in KB (100MB = 102400 KB).
        local free_kb
        free_kb=$(df -Pk "$backup_dir" 2>/dev/null | awk 'NR==2 {print $4}')
        if [ -n "$free_kb" ] && [ "$free_kb" -lt 102400 ]; then
            log_warning "Skipping site backup: < 100MB free on $backup_dir (${free_kb}KB)"
            rm -rf "$WEBSITE_ROOT"
        elif tar -czf "$backup_tmp" -C "$WEBSITE_ROOT" . 2>/dev/null; then
            mv "$backup_tmp" "$backup_final"
            rm -rf "$WEBSITE_ROOT"
            log_dim "Old site archived to $backup_final"
        else
            rm -f "$backup_tmp" 2>/dev/null
            log_warning "Site backup failed; proceeding without backup"
            rm -rf "$WEBSITE_ROOT"
        fi
    fi

    mkdir -p "$WEBSITE_ROOT"
    cp -a "$template_dir/." "$WEBSITE_ROOT/"
    echo "$template_id" > "$WEBSITE_ROOT/.govless_template_id" 2>/dev/null || true
    chown -R www-data:www-data "$WEBSITE_ROOT" 2>/dev/null || chown -R nginx:nginx "$WEBSITE_ROOT" 2>/dev/null
    chmod -R 755 "$WEBSITE_ROOT"

    log_success "$(t website_deployed)"
}

# ── Full Pro mode setup ─────────────────────────────────────────────────
setup_pro_website() {
    local domain="$1"
    local template_dir="$2"
    local email="${3:-}"

    log_step "Setting up Pro mode website"
    # Mark webroot as ours so remove_site_only knows it can rm it
    mkdir -p "$WEBSITE_ROOT" && touch "${WEBSITE_ROOT}/.govless-owned" 2>/dev/null

    # 1. Install nginx
    run_with_spinner "Installing nginx" install_nginx || return 1

    # 2. Install certbot
    run_with_spinner "Installing certbot" install_certbot || return 1

    # 3. Deploy template
    deploy_template_to_nginx "$template_dir" || return 1

    # 4. Get SSL certificate
    obtain_ssl_certificate "$domain" "$email" || return 1

    # 5. Generate nginx config
    generate_nginx_pro_config "$domain" || return 1

    # 6. Test and restart nginx
    if nginx -t 2>/dev/null; then
        systemctl restart nginx
        log_success "nginx running with site"
    else
        log_error "nginx config error"
        nginx -t
        return 1
    fi

    # 7. Auto-renewal
    setup_ssl_auto_renewal

    log_success "Pro website ready: http://${domain}"
    return 0
}

# ── Full Lite mode nginx setup ──────────────────────────────────────────
# ── Tech-debt cleanup: remove legacy XUIFAST nginx symlinks ────────────
# Codex audit 002 P1 #2 + Codex 012 P1 #3. Pre-launch (zero users) we
# don't do data migration, but stale nginx symlinks would still break
# nginx -t on upgrade hosts. Idempotent: no-op if absent.
cleanup_legacy_xuifast_nginx() {
    # P3 #1 Codex 016: previous version checked only -L (symlink). Some
    # legacy installs may have written a regular file in sites-enabled
    # instead of a symlink — those went uncleaned. Use -e (exists) for
    # both paths, idempotent and safe (no-op if absent).
    if [ -e /etc/nginx/sites-enabled/xuifast ]; then
        log_dim "Removing legacy nginx entry: /etc/nginx/sites-enabled/xuifast"
        rm -f /etc/nginx/sites-enabled/xuifast
    fi
    if [ -e /etc/nginx/sites-available/xuifast ]; then
        log_dim "Removing legacy nginx config: /etc/nginx/sites-available/xuifast"
        rm -f /etc/nginx/sites-available/xuifast
    fi
}

setup_lite_nginx() {
    log_step "Setting up stub website"

    run_with_spinner "Installing nginx" install_nginx || return 1

    # Tech-debt: clean up legacy XUIFAST nginx symlinks before our nginx -t
    cleanup_legacy_xuifast_nginx

    deploy_stub_site
    generate_nginx_lite_config

    if nginx -t 2>/dev/null; then
        systemctl restart nginx
        log_success "nginx stub site running on port 80"
    else
        log_error "nginx config error"
        return 1
    fi
    return 0
}

# ── nginx management ───────────────────────────────────────────────────
nginx_status() {
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo "running"
    else
        echo "stopped"
    fi
}

restart_nginx() {
    if nginx -t 2>/dev/null; then
        systemctl restart nginx 2>/dev/null
        log_success "nginx restarted"
    else
        log_error "nginx config error"
        nginx -t
        return 1
    fi
}

# ── Remove Pro mode ────────────────────────────────────────────────────
remove_pro_mode() {
    log_info "Removing Pro mode..."
    rm -f "$NGINX_SITE_CONF" "$NGINX_SITE_LINK"
    rm -rf "$WEBSITE_ROOT"
    systemctl restart nginx 2>/dev/null
    log_success "Pro mode removed (nginx kept)"
}
