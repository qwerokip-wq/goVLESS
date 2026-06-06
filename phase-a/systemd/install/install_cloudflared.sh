#!/usr/bin/env bash
# install_cloudflared.sh — per Resolved Q5.
# Prefer apt repo (Debian/Ubuntu); else GitHub release tarball.
# Non-fatal: prints WARNING to stderr and exits 0 on failure.

set -uo pipefail

TARGET="${CLOUDFLARED_BIN:-/usr/local/bin/cloudflared}"

warn() { printf 'install_cloudflared.sh: WARN: %s\n' "$*" >&2; }
info() { printf 'install_cloudflared.sh: %s\n' "$*"; }

if [ -x "$TARGET" ]; then
    info "cloudflared already present at ${TARGET} ($("$TARGET" --version 2>&1 | head -n1)) — skip"
    exit 0
fi

if [ "$(id -u)" -ne 0 ]; then
    warn "must run as root — skipping cloudflared install (non-fatal)"
    exit 0
fi

ARCH="$(uname -m)"
case "$ARCH" in
    x86_64|amd64) PKG_ARCH=amd64 ;;
    aarch64|arm64) PKG_ARCH=arm64 ;;
    armv7l) PKG_ARCH=arm ;;
    *) warn "unsupported arch ${ARCH} — skip cloudflared (non-fatal)"; exit 0 ;;
esac

apt_install() {
    command -v apt-get >/dev/null 2>&1 || return 1
    info "trying apt repo install"
    mkdir -p --mode=0755 /usr/share/keyrings
    if ! curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
            | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null; then
        return 1
    fi
    local codename
    codename="$( . /etc/os-release 2>/dev/null; echo "${VERSION_CODENAME:-}" )"
    if [ -z "$codename" ]; then
        codename=bookworm  # safe default for cloudflared apt repo
    fi
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared ${codename} main" \
        >/etc/apt/sources.list.d/cloudflared.list
    apt-get update -y >/dev/null 2>&1 || true
    if apt-get install -y cloudflared; then
        # apt installs to /usr/bin/cloudflared; symlink expected location.
        if [ -x /usr/bin/cloudflared ] && [ ! -e "$TARGET" ]; then
            ln -sf /usr/bin/cloudflared "$TARGET"
        fi
        return 0
    fi
    return 1
}

github_install() {
    info "falling back to GitHub release binary (${PKG_ARCH})"
    local url="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${PKG_ARCH}"
    local tmp
    tmp="$(mktemp)"
    if ! curl -fsSL "$url" -o "$tmp"; then
        rm -f "$tmp"
        return 1
    fi
    install -m 0755 "$tmp" "$TARGET"
    rm -f "$tmp"
    return 0
}

if apt_install; then
    info "cloudflared installed via apt: $("$TARGET" --version 2>&1 | head -n1)"
    exit 0
fi

if github_install; then
    info "cloudflared installed via GitHub release: $("$TARGET" --version 2>&1 | head -n1)"
    exit 0
fi

warn "cloudflared install FAILED via both apt and GitHub. Lite mode tunnel will be unavailable until you install cloudflared manually. This is non-fatal — Phase A install continues."
exit 0
