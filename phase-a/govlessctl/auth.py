"""auth.py — Telegram WebApp initData HMAC verification + SO_PEERCRED check.

Spec: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    secret_key = HMAC_SHA256(key=b"WebAppData", msg=BOT_TOKEN)
    data_check_string = "\n".join(f"{k}={v}" for k,v in sorted(pairs) if k != "hash")
    expected_hash = HMAC_SHA256(key=secret_key, msg=data_check_string).hexdigest()
    compare_constant_time(expected_hash, received_hash)
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import pwd
import socket
import struct
import time
from typing import Any
from urllib.parse import parse_qsl


class AuthError(Exception):
    def __init__(self, code: int, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


# ── Telegram WebApp initData ──────────────────────────────────────────────
def verify_webapp_init_data(
    init_data: str, bot_token: str, max_age: int = 86400
) -> dict[str, Any]:
    """Verify Telegram WebApp initData. Returns parsed payload dict on success.

    Raises AuthError on any failure.
    """
    if not init_data or not isinstance(init_data, str):
        raise AuthError(401, "initData missing")
    if not bot_token:
        raise AuthError(500, "BOT_TOKEN not configured")

    # parse_qsl preserves order; we need the original key/value strings
    pairs = parse_qsl(init_data, keep_blank_values=True, strict_parsing=False)
    data = dict(pairs)
    received_hash = data.pop("hash", None)
    if not received_hash:
        raise AuthError(401, "initData hash missing")

    # auth_date freshness check
    auth_date_raw = data.get("auth_date")
    if not auth_date_raw or not auth_date_raw.isdigit():
        raise AuthError(401, "auth_date missing or malformed")
    auth_date = int(auth_date_raw)
    if max_age > 0 and (int(time.time()) - auth_date) > int(max_age):
        raise AuthError(401, "initData expired (auth_date too old)")

    # Build data-check-string per Telegram spec
    data_check_string = "\n".join(
        f"{k}={data[k]}" for k in sorted(data.keys())
    )

    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    expected_hash = hmac.new(
        secret_key, data_check_string.encode("utf-8"), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        raise AuthError(401, "initData hash mismatch")

    # Decode `user` JSON if present
    user = data.get("user")
    if user:
        try:
            data["user"] = json.loads(user)
        except (ValueError, TypeError):
            raise AuthError(401, "initData user payload malformed")

    return data


# ── SO_PEERCRED for local UNIX-socket caller ──────────────────────────────
def get_peercred(sock: socket.socket) -> tuple[int, int, int]:
    """Return (pid, uid, gid) of the peer connected via UNIX socket. Linux only."""
    # struct ucred: pid_t pid; uid_t uid; gid_t gid; — typically 3 * int32 = 12 bytes
    SO_PEERCRED = 17  # Linux
    fmt = "iII"  # pid, uid, gid
    size = struct.calcsize(fmt)
    raw = sock.getsockopt(socket.SOL_SOCKET, SO_PEERCRED, size)
    pid, uid, gid = struct.unpack(fmt, raw)
    return pid, uid, gid


def verify_local_peer(sock: socket.socket, allowed_users: tuple[str, ...] = ("root",)) -> dict:
    """Verify the local socket peer is one of the allowed system users.

    Returns {"pid": pid, "uid": uid, "gid": gid, "user": username}. Raises AuthError.
    """
    try:
        pid, uid, gid = get_peercred(sock)
    except OSError as e:
        raise AuthError(403, f"SO_PEERCRED unavailable: {e}")

    try:
        pw = pwd.getpwuid(uid)
        username = pw.pw_name
    except KeyError:
        raise AuthError(403, f"unknown uid {uid}")

    if username not in allowed_users:
        raise AuthError(403, f"caller uid={uid} ({username}) not authorized")

    return {"pid": pid, "uid": uid, "gid": gid, "user": username}


# ── Bot env loader ────────────────────────────────────────────────────────
def load_bot_env(path: str = "/etc/govless/bot.env") -> dict[str, str]:
    """Parse simple KEY=VALUE shell file. Strips surrounding single/double quotes."""
    env: dict[str, str] = {}
    if not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip()
            if len(val) >= 2 and val[0] == val[-1] and val[0] in ("'", '"'):
                val = val[1:-1]
            env[key] = val
    return env


class BotEnvCache:
    """Small mtime cache for /etc/govless/bot.env.

    Phase-A starts govlessctl before the operator fills BOT_TOKEN. Keep RPC auth
    responsive to later edits without making operators know to restart govlessctl.
    """

    def __init__(self, path: str = "/etc/govless/bot.env"):
        self.path = path
        self._signature: tuple[int, int, int] | None = None
        self._env: dict[str, str] = {}
        self._loaded = False

    def _current_signature(self) -> tuple[int, int, int] | None:
        try:
            st = os.stat(self.path)
        except FileNotFoundError:
            return None
        return (st.st_mtime_ns, st.st_size, st.st_ino)

    def get(self) -> dict[str, str]:
        signature = self._current_signature()
        if not self._loaded or signature != self._signature:
            self._env = load_bot_env(self.path)
            self._signature = signature
            self._loaded = True
        return dict(self._env)


def parse_admin_ids(env: dict[str, str]) -> set[str]:
    raw = env.get("ADMIN_IDS", "")
    out: set[str] = set()
    for chunk in raw.replace(";", ",").split(","):
        chunk = chunk.strip().strip('"').strip("'")
        if chunk.isdigit():
            out.add(chunk)
    return out


# ── Top-level request authenticator ───────────────────────────────────────
def authenticate_request(
    body: dict,
    peer_sock: socket.socket | None,
    bot_env: dict[str, str],
    state_admin_ids: set[str] | None = None,
) -> dict:
    """Authenticate a JSON-RPC request body.

    Returns context: {"caller": "local"|"webapp", "tg_id": str|None, "user": dict|None}.
    Raises AuthError on failure.
    """
    caller = body.get("caller")
    if caller not in ("local", "webapp"):
        raise AuthError(401, "caller field missing or invalid")

    # SO_PEERCRED is always checked for socket connections (defense in depth).
    peer_info = None
    if peer_sock is not None:
        allowed_users = (
            ("govless", "root", "www-data", "nginx")
            if caller == "webapp"
            else ("root", "govless")  # caller=local: root (CLI/admin) + govless (bot service acct). Root-only (W-REG-4) locked out the bot which runs as User=govless -> 403 on every RPC. Username allow-list (not gid/group), so arbitrary govless-GROUP peers still rejected.
        )
        try:
            peer_info = verify_local_peer(peer_sock, allowed_users=allowed_users)
        except AuthError:
            raise

    if caller == "local":
        tg_id = body.get("tg_id")
        if tg_id is not None:
            tg_id = str(tg_id).strip()
            if not tg_id.isdigit() or len(tg_id) > 32:
                raise AuthError(401, "local tg_id malformed")
        return {"caller": "local", "tg_id": tg_id, "user": None, "peer": peer_info}

    # caller == "webapp"
    init_data = body.get("initData")
    if not init_data:
        raise AuthError(401, "initData required for webapp caller")
    bot_token = bot_env.get("BOT_TOKEN", "")
    ttl = int(bot_env.get("WEBAPP_AUTH_TTL", "86400") or 86400)
    payload = verify_webapp_init_data(init_data, bot_token, max_age=ttl)

    user = payload.get("user") or {}
    tg_id = str(user.get("id")) if user.get("id") is not None else None
    if not tg_id:
        raise AuthError(401, "initData user.id missing")

    # admin check: env ADMIN_IDS ∪ state.db govless_admins
    env_admins = parse_admin_ids(bot_env)
    state_admins = state_admin_ids or set()
    if tg_id not in env_admins and tg_id not in state_admins:
        raise AuthError(403, "user is not an admin")

    return {"caller": "webapp", "tg_id": tg_id, "user": user, "peer": peer_info}
