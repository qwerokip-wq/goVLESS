#!/bin/bash
# goVLESS Installer Bootstrap
# Usage: curl -sL https://is.gd/govless | sudo bash
set -e

# Codex 019: never let git prompt interactively (private repo + no creds
# would otherwise block on "Username for 'https://github.com:'").
export GIT_TERMINAL_PROMPT=0
export GIT_ASKPASS=/bin/false

# Ensure root
if [ "$EUID" -ne 0 ]; then
    echo "Error: Run as root (sudo)!"
    exit 1
fi

# Install minimal deps for bootstrap
apt-get update -qq && apt-get install -y -qq git curl >/dev/null 2>&1

# Clone or update repo
REPO_DIR="${HOME}/goVLESS"  # local checkout; URL controlled by GOVLESS_REPO/GH_TOKEN
# Build auth args once (used for both clone and fetch)
REPO_URL="${GOVLESS_REPO:-https://github.com/anten-ka/goVLESS.git}"
BRANCH="${GOVLESS_BRANCH:-main}"
GIT_AUTH_ARGS=()
if [ -n "${GH_TOKEN:-}" ] && [[ "$REPO_URL" == https://github.com/* ]] && [[ "$REPO_URL" != *"@"* ]]; then
    AUTH_B64=$(printf "x-access-token:%s" "$GH_TOKEN" | base64 -w0)
    GIT_AUTH_ARGS=(-c "http.${REPO_URL}.extraHeader=Authorization: Basic $AUTH_B64")
fi

if [ -d "$REPO_DIR" ]; then
    cd "$REPO_DIR"
    # Codex 019 fail-soft: if private-repo update can't auth, continue
    # with local copy rather than crashing. Avoid `git pull` (combines
    # fetch+merge, less predictable); use explicit fetch + reset.
    if git "${GIT_AUTH_ARGS[@]}" fetch origin "$BRANCH" --quiet 2>/dev/null; then
        git checkout "$BRANCH" --quiet 2>/dev/null
        git reset --hard "origin/$BRANCH" --quiet 2>/dev/null
    else
        echo "ℹ  Could not update from $REPO_URL — using local copy."
        echo "ℹ  Set GH_TOKEN or use GOVLESS_REPO=<public mirror> to update."
    fi
else
    if ! git "${GIT_AUTH_ARGS[@]}" clone -q --branch "$BRANCH" "$REPO_URL" "$REPO_DIR" 2>/dev/null; then
        echo "Error: failed to clone $REPO_URL"
        echo "goVLESS is private. Set GH_TOKEN env var or run 'gh auth login' first."
        echo "Or set GOVLESS_REPO to a public mirror URL."
        exit 1
    fi
fi

cd "$REPO_DIR"
chmod +x govless.sh
./govless.sh
