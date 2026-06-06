"""methods.py — JSON-RPC method implementations for govlessctl.

Each WRITE method calls state_db.audit(...) BEFORE returning. Typed-confirm
tokens are stored in state.db pending_confirms (single-use, 5min TTL).
"""
from __future__ import annotations

import asyncio
import os
import re
import secrets
import shutil
import subprocess
import time
import uuid as uuid_mod
from typing import Any, Callable
from urllib.parse import urlsplit

from .auth import load_bot_env
from .state_db import StateDB
from .xui_client import (
    XuiClient,
    XuiError,
    build_vless_links,
    read_client_traffics_from_db,
    read_inbounds_from_db,
    read_xui_settings_from_db,
)

import logging
log = logging.getLogger("govlessctl.methods")


# ── Constraints / paths ───────────────────────────────────────────────────
TUNNEL_URL_FILE = "/run/govless/tunnel.url"
TUNNEL_URL_NAMED_FILE = "/run/govless/tunnel.url.named"
GOVLESS_CONFIG = "/opt/govless/config.json"  # mode + server_ip + domain
PANEL_ACCESS_FILE = "/etc/govless/panel.access"  # "public" or "ssh-only"
VERSION = "2.0.0"
WEBAPP_CACHE_BUST = "20260525-042"
GIB = 1024**3
TRAFFIC_BYTES_COMPAT_THRESHOLD = 1024 * 1024


# ── Validators ────────────────────────────────────────────────────────────
UUID_RE = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
NAME_RE = re.compile(r"^[A-Za-z0-9_.\-@+]{1,64}$")


class MethodError(Exception):
    def __init__(self, code: int, message: str, data: Any = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.data = data


def _require_uuid(u: Any) -> str:
    if not isinstance(u, str) or not UUID_RE.match(u):
        raise MethodError(400, "invalid uuid format")
    return u.lower()


def _require_name(n: Any) -> str:
    if not isinstance(n, str) or not n.strip():
        raise MethodError(400, "name required")
    n = n.strip()
    if len(n) > 32:
        raise MethodError(400, "name too long (max 32 chars)")
    if not NAME_RE.match(n):
        raise MethodError(400, "name contains illegal characters (allowed: A-Z a-z 0-9 _ . - @ +)")
    return n


def _require_int(v: Any, field: str, *, min_v: int | None = None) -> int:
    if isinstance(v, bool) or not isinstance(v, int):
        try:
            v = int(v)
        except (TypeError, ValueError):
            raise MethodError(400, f"{field} must be an integer")
    if min_v is not None and v < min_v:
        raise MethodError(400, f"{field} must be >= {min_v}")
    return int(v)


def _traffic_limit_to_bytes(v: Any, field: str = "traffic_limit") -> int:
    """Accept bot GB values while preserving byte values from API callers."""
    value = _require_int(v, field, min_v=0)
    if value == 0:
        return 0
    if value < TRAFFIC_BYTES_COMPAT_THRESHOLD:
        return value * GIB
    return value


# ── Helpers ───────────────────────────────────────────────────────────────
def _systemctl_active(unit: str) -> bool:
    try:
        out = subprocess.run(
            ["systemctl", "is-active", unit],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return out.stdout.strip() == "active"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _read_config_json() -> dict:
    if not os.path.exists(GOVLESS_CONFIG):
        return {}
    try:
        import json
        with open(GOVLESS_CONFIG, "r", encoding="utf-8") as f:
            return json.load(f) or {}
    except (OSError, ValueError):
        return {}


def _valid_public_ip(ip: Any) -> bool:
    if not isinstance(ip, str):
        return False
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    try:
        octets = [int(p) for p in parts]
    except ValueError:
        return False
    if any(o < 0 or o > 255 for o in octets):
        return False
    if octets[0] in (0, 10, 127):
        return False
    if octets[0] == 172 and 16 <= octets[1] <= 31:
        return False
    if octets[0] == 192 and octets[1] == 168:
        return False
    if octets[0] == 169 and octets[1] == 254:
        return False
    if octets[0] >= 224:
        return False
    return True


def _qr_text(payload: str) -> str:
    """Render UTF-8 QR via /usr/bin/qrencode -t UTF8. Returns text or fallback."""
    qrencode = shutil.which("qrencode")
    if not qrencode:
        return f"[qrencode not installed]\n{payload}"
    try:
        out = subprocess.run(
            [qrencode, "-t", "UTF8", "-m", "1", payload],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if out.returncode == 0:
            return out.stdout
        return f"[qrencode failed: {out.stderr.strip()}]\n{payload}"
    except subprocess.TimeoutExpired:
        return f"[qrencode timeout]\n{payload}"


def _qr_svg(payload: str) -> str:
    """Render QR as inline SVG via /usr/bin/qrencode -t SVG. Returns SVG markup
    (no <?xml?> prolog) for direct embedding into a HTML page, or "" on failure.
    SVG scales perfectly at any size and renders crisp at any DPI — fixes the
    half-block UTF-8 QR distortion bug (aspect ratio of block glyphs in mono fonts
    is not 1:1, so UTF8 QRs look stretched)."""
    qrencode = shutil.which("qrencode")
    if not qrencode:
        return ""
    try:
        out = subprocess.run(
            [qrencode, "-t", "SVG", "-m", "1", "--inline", "--svg-path", payload],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if out.returncode == 0:
            return out.stdout
        # Fallback to non-inline if --inline/--svg-path unsupported (qrencode < 4)
        out = subprocess.run(
            [qrencode, "-t", "SVG", "-m", "1", payload],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if out.returncode == 0:
            # Strip <?xml ...?> prolog so it embeds inline cleanly
            svg = out.stdout
            if svg.startswith("<?xml"):
                svg = svg[svg.index("?>") + 2 :].lstrip()
            return svg
        return ""
    except subprocess.TimeoutExpired:
        return ""


def _server_host(cfg: dict | None = None) -> str:
    cfg = cfg or _read_config_json()
    mode = cfg.get("mode", "lite")
    if mode == "pro" and cfg.get("domain"):
        return cfg["domain"]
    for key in ("server_ip", "server"):
        host = cfg.get(key)
        if _valid_public_ip(host):
            return host
    raise MethodError(503, "no valid public server address in config")


def _subscription_url_for_client(cli: dict, *, cfg: dict | None = None, settings: dict | None = None) -> str | None:
    # T2875/T2879: don't expose subscription for disabled clients
    if cli.get("enable") is False or cli.get("enabled") is False:
        return None
    cfg = cfg or _read_config_json()
    settings = settings or read_xui_settings_from_db()
    if cfg.get("mode") != "pro" or not cfg.get("domain"):
        return None
    sub_port = str(cfg.get("sub_port") or settings.get("subPort") or "")
    sub_path = str(cfg.get("sub_path") or settings.get("subPath") or "").strip("/")
    if not sub_port or not sub_path:
        return None
    sub_id = cli.get("subId") or cli.get("id")
    if not sub_id:
        return None
    return f"https://{_server_host(cfg)}:{sub_port}/{sub_path}/{sub_id}"


def _govless_version(cfg: dict) -> str:
    version = cfg.get("version") or VERSION
    return str(version)


def _pro_webapp_url(cfg: dict) -> str | None:
    if cfg.get("mode") != "pro":
        return None
    raw_domain = str(cfg.get("domain") or "").strip()
    if not raw_domain:
        return None
    if "://" in raw_domain:
        host = urlsplit(raw_domain).netloc
    else:
        host = raw_domain.split("/", 1)[0]
    host = host.strip().strip("/")
    if not host:
        return None
    return f"https://{host}/app/?v={WEBAPP_CACHE_BUST}"


def _find_active_inbound(inbounds: list[dict]) -> dict:
    for ib in inbounds:
        if ib.get("enable") and (ib.get("protocol") == "vless"):
            return ib
    raise MethodError(404, "no enabled VLESS inbound found")


def _client_by_uuid(inbounds: list[dict], uuid_str: str) -> tuple[dict, dict]:
    """Locate (inbound, client_obj) for a given UUID across all inbounds."""
    uuid_lc = uuid_str.lower()
    for ib in inbounds:
        for cli in (ib.get("settings_obj") or {}).get("clients", []) or []:
            if str(cli.get("id", "")).lower() == uuid_lc:
                return ib, cli
    raise MethodError(404, f"client {uuid_str} not found")


def _new_typed_token() -> str:
    return secrets.token_urlsafe(16)


# ── Methods class ─────────────────────────────────────────────────────────

def _proc_running(name):
    import subprocess
    try:
        return subprocess.run(["pgrep","-af",name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0
    except Exception:
        return False

def _xray_version() -> str | None:
    """Best-effort: read xray binary -version, return short version string."""
    import subprocess, re as _re
    for path in ("/usr/local/x-ui/bin/xray-linux-amd64",
                 "/usr/local/x-ui/bin/xray-linux-arm64-v8a",
                 "/usr/local/x-ui/bin/xray"):
        try:
            r = subprocess.run([path, "-version"], capture_output=True, timeout=3, text=True)
            if r.returncode == 0:
                m = _re.match(r"Xray\s+(\S+)", r.stdout)
                if m:
                    return m.group(1)
        except (FileNotFoundError, subprocess.TimeoutExpired, PermissionError):
            continue
    return None


def _xui_panel_version() -> str | None:
    """Best-effort: parse 3X-UI panel version from binary strings."""
    import subprocess, re as _re
    for path in ("/usr/local/x-ui/x-ui",):
        try:
            r = subprocess.run(["strings", path], capture_output=True, timeout=5, text=True)
            if r.returncode == 0:
                for line in r.stdout.split("\n"):
                    line = line.strip()
                    m = _re.match(r"^v(\d+\.\d+(?:\.\d+)?)$", line)
                    if m:
                        return line
        except (FileNotFoundError, subprocess.TimeoutExpired, PermissionError):
            continue
    return None



class Methods:
    """Dispatch table holder. Methods are async; daemon awaits them."""

    def __init__(self, *, state: StateDB | None = None, xui: XuiClient | None = None,
                 bot_env: dict[str, str] | None = None,
                 bot_env_loader: Callable[[], dict[str, str]] | None = None):
        self.state = state or StateDB()
        self.xui = xui or XuiClient()
        if bot_env_loader is not None:
            self._bot_env_loader = bot_env_loader
        elif bot_env is not None:
            self._bot_env_loader = lambda: dict(bot_env)
        else:
            self._bot_env_loader = load_bot_env

    @property
    def bot_env(self) -> dict[str, str]:
        return self._bot_env_loader()

    # ── system / read ────────────────────────────────────────────────
    def _read_panel_url_from_creds(self):
        try:
            with open("/root/.govless_credentials") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("URL="):
                        return line[len("URL="):]
        except OSError:
            pass
        return None

    async def system_status(self, params: dict, ctx: dict) -> dict:
        cfg = _read_config_json()
        # B-A3/B-A4 fix: panel_url from creds (preferred) or x-ui sqlite;
        # xray_active via process check (xray runs as x-ui child, not own systemd)
        panel_url = self._read_panel_url_from_creds() or cfg.get("panel_url") or self.xui.url
        # T3344: status probes shell out (systemctl/pgrep/xray -version/strings).
        # Run them in a worker thread so concurrent status polls don't serialize
        # on the event loop (was p95~10s, 78/100 timeouts at 100 concurrent).
        def _probe() -> dict:
            return {
                "xui_active": _systemctl_active("x-ui"),
                "xray_active": _proc_running("xray-linux-amd64") or _proc_running("xray"),
                "nginx_active": _systemctl_active("nginx"),
                "xray_version": _xray_version(),
                "xui_version": _xui_panel_version(),
            }
        probed = await asyncio.to_thread(_probe)
        return {
            **probed,
            "panel_url": panel_url,
            "mode": cfg.get("mode", "lite"),
            "transport": cfg.get("transport", "reality"),
            "version": _govless_version(cfg),
        }

    async def client_list(self, params: dict, ctx: dict) -> list[dict]:
        inbound_id = params.get("inbound_id") if isinstance(params, dict) else None
        inbounds = read_inbounds_from_db()
        if inbound_id is not None:
            inbounds = [ib for ib in inbounds if ib.get("id") == int(inbound_id)]
        server = _server_host()
        traffics = read_client_traffics_from_db()
        cfg = _read_config_json()
        xui_settings = read_xui_settings_from_db()
        onlines: set[str] = set()
        try:
            onlines = set(await self.xui.get_onlines())
        except XuiError:
            pass  # offline: leave online flag as False

        links = build_vless_links(server, inbounds, only_enabled=True)
        index = {l["uuid"]: l for l in links}

        out: list[dict] = []
        for ib in inbounds:
            for cli in (ib.get("settings_obj") or {}).get("clients", []) or []:
                uid = cli.get("id")
                if not uid:
                    continue
                name = cli.get("email") or f"user-{str(uid).lower()[:8]}"
                tf = traffics.get(name) or {}
                link_info = index.get(uid, {})
                sub_url = _subscription_url_for_client(cli, cfg=cfg, settings=xui_settings)
                out.append(
                    {
                        "name": name,
                        "uuid": uid,
                        "inbound_id": ib.get("id"),
                        "enabled": bool(cli.get("enable", True)),
                        "online": name in onlines,
                        "traffic_used": int(tf.get("up", 0)) + int(tf.get("down", 0)),
                        "traffic_limit": int(cli.get("totalGB", 0)),
                        "expiry_ts": int(cli.get("expiryTime", 0)) // 1000 if cli.get("expiryTime") else 0,
                        "flow": cli.get("flow", ""),
                        "link": link_info.get("link", ""),
                        "sub_url": sub_url,
                    }
                )
        return out

    async def inbound_list(self, params: dict, ctx: dict) -> list[dict]:
        inbounds = read_inbounds_from_db()
        out = []
        for ib in inbounds:
            stream = ib.get("stream_obj") or {}
            client_count = len((ib.get("settings_obj") or {}).get("clients", []) or [])
            out.append(
                {
                    "id": ib.get("id"),
                    "port": ib.get("port"),
                    "protocol": ib.get("protocol"),
                    "network": stream.get("network"),
                    "security": stream.get("security"),
                    "enable": bool(ib.get("enable")),
                    "remark": ib.get("remark"),
                    "client_count": client_count,
                }
            )
        return out

    async def panel_access_get(self, params: dict, ctx: dict) -> dict:
        cfg = _read_config_json()
        listen = "127.0.0.1"
        if os.path.exists(PANEL_ACCESS_FILE):
            try:
                listen = open(PANEL_ACCESS_FILE).read().strip() or listen
            except OSError:
                pass
        port = cfg.get("panel_port", 2053)
        mode = "ssh-only" if listen == "127.0.0.1" else "public"
        # Agent-01 T2884: also surface username/password from 3X-UI settings
        # (best-effort: caller may or may not be admin context)
        username = None; password = None
        # Agent-22 T2922: 3X-UI v1.2 stores creds in users(username,password), not settings
        try:
            import sqlite3 as _sqlite3
            with _sqlite3.connect("/etc/x-ui/x-ui.db", timeout=3) as _conn:
                _row = _conn.execute("SELECT username, password FROM users LIMIT 1").fetchone()
                if _row:
                    username = _row[0]
                    password = _row[1]
        except Exception:
            pass
        return {
            "listen": listen,
            "port": port,
            "url": cfg.get("panel_url") or self.xui.url,
            "mode": mode,
            "username": username,
            "password": password,
        }

    async def audit_tail(self, params: dict, ctx: dict) -> list[dict]:
        limit = int(params.get("limit", 50)) if isinstance(params, dict) else 50
        return self.state.audit_tail(limit)

    async def admin_list(self, params: dict, ctx: dict) -> list[str]:
        # state ∪ env
        env_admins = set()
        for chunk in (self.bot_env.get("ADMIN_IDS", "") or "").replace(";", ",").split(","):
            chunk = chunk.strip()
            if chunk.isdigit():
                env_admins.add(chunk)
        all_ids = list(env_admins.union(set(self.state.get_admin_ids())))
        all_ids.sort()
        return all_ids

    async def tunnel_url_get(self, params: dict, ctx: dict) -> dict:
        pro_url = _pro_webapp_url(_read_config_json())
        if pro_url:
            return {"url": pro_url, "source": "pro"}
        for path, source in ((TUNNEL_URL_NAMED_FILE, "named"), (TUNNEL_URL_FILE, "quick")):
            if os.path.exists(path):
                try:
                    url = open(path).read().strip()
                    if url:
                        return {"url": url, "source": source}
                except OSError:
                    continue
        return {"url": None, "source": "none"}

    # ── client writes ────────────────────────────────────────────────
    async def client_add(self, params: dict, ctx: dict) -> dict:
        name = _require_name(params.get("name"))
        traffic_limit = params.get("traffic_limit")
        expiry_ts = params.get("expiry_ts")
        label = params.get("label")

        traffic_bytes = 0
        if traffic_limit is not None:
            traffic_bytes = _traffic_limit_to_bytes(traffic_limit)
        expiry_ms = 0
        if expiry_ts:
            expiry_ms = _require_int(expiry_ts, "expiry_ts", min_v=0) * 1000

        inbounds = read_inbounds_from_db()
        active = _find_active_inbound(inbounds)
        # T3848: reject duplicate client name (3X-UI keys on email; silent dupes otherwise)
        _existing = {str(c.get("email", "")).strip().lower()
                     for c in (active.get("settings_obj") or {}).get("clients", []) or []}
        if name.strip().lower() in _existing:
            raise MethodError(409, f"client name already exists: {name}")
        active_stream = active.get("stream_obj") or {}
        active_security = active_stream.get("security")
        active_network = active_stream.get("network", "tcp")
        new_uuid = str(uuid_mod.uuid4())
        sub_id = secrets.token_urlsafe(12)
        client_obj = {
            "id": new_uuid,
            "email": name,
            "flow": "xtls-rprx-vision"
            if active_network == "tcp" and active_security in ("tls", "reality")
            else "",
            "limitIp": 0,
            "totalGB": traffic_bytes,
            "expiryTime": expiry_ms,
            "enable": True,
            "tgId": 0,
            "subId": sub_id,
            "comment": label or "",
        }
        await self.xui.add_client(active["id"], client_obj)

        # rebuild link
        refreshed = read_inbounds_from_db()
        server = _server_host()
        links = build_vless_links(server, refreshed)
        link = next((l["link"] for l in links if l["uuid"] == new_uuid), "")

        self.state.audit(
            ctx.get("tg_id"),
            "client.add",
            new_uuid,
            None,
            {
                "name": name,
                "inbound_id": active["id"],
                "traffic_bytes": traffic_bytes,
                "expiry_ms": expiry_ms,
            },
        )
        return {"uuid": new_uuid, "link": link, "qr_text": _qr_text(link) if link else ""}

    async def client_update(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        fields = params.get("fields") or {}
        if not isinstance(fields, dict) or not fields:
            raise MethodError(400, "fields required")
        inbounds = read_inbounds_from_db()
        ib, cli = _client_by_uuid(inbounds, uid)
        before = dict(cli)
        updated = dict(cli)

        # typed-confirm gate per CONTRACT
        if "traffic_limit" in fields:
            new_tl = _traffic_limit_to_bytes(fields["traffic_limit"])
            old_tl = int(cli.get("totalGB", 0))
            if old_tl > 0 and abs(new_tl - old_tl) / max(old_tl, 1) > 0.5:
                if not self._check_confirm(params, "UPDATE-TRAFFIC", uid):
                    return self._issue_confirm("UPDATE-TRAFFIC", uid, f"UPDATE-TRAFFIC {(cli.get('email') or f'user-{uid[:8]}')}")
            updated["totalGB"] = new_tl
        if "expiry_ts" in fields:
            new_ts = _require_int(fields["expiry_ts"], "expiry_ts", min_v=0)
            old_ts = int(cli.get("expiryTime", 0)) // 1000
            if new_ts and old_ts and (new_ts - old_ts) > 30 * 86400:
                if not self._check_confirm(params, "UPDATE-EXPIRY", uid):
                    return self._issue_confirm("UPDATE-EXPIRY", uid, f"UPDATE-EXPIRY {(cli.get('email') or f'user-{uid[:8]}')}")
            updated["expiryTime"] = new_ts * 1000 if new_ts else 0
        if "name" in fields:
            updated["email"] = _require_name(fields["name"])
        if "label" in fields:
            label = fields["label"]
            if not isinstance(label, str) or len(label) > 256:
                raise MethodError(400, "label must be string ≤256 chars")
            updated["comment"] = label

        await self.xui.update_client(ib["id"], uid, updated)
        self.state.audit(ctx.get("tg_id"), "client.update", uid, before, updated)
        return {"ok": True}

    async def client_enable(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        inbounds = read_inbounds_from_db()
        ib, cli = _client_by_uuid(inbounds, uid)
        before = {"enable": cli.get("enable", True)}
        updated = dict(cli, enable=True)
        await self.xui.update_client(ib["id"], uid, updated)
        self.state.audit(ctx.get("tg_id"), "client.enable", uid, before, {"enable": True})
        return {"ok": True}

    async def client_disable(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        inbounds = read_inbounds_from_db()
        ib, cli = _client_by_uuid(inbounds, uid)
        # check if this is the last admin's client → typed-confirm
        admin_ids = set(self.state.get_admin_ids())
        if cli.get("tgId") and str(cli["tgId"]) in admin_ids:
            # count enabled clients owned by admins
            owned_enabled = 0
            for ib2 in inbounds:
                for c in (ib2.get("settings_obj") or {}).get("clients", []) or []:
                    if str(c.get("tgId", "")) in admin_ids and c.get("enable") and c.get("id") != uid:
                        owned_enabled += 1
            if owned_enabled == 0:
                if not self._check_confirm(params, "DISABLE-LAST", uid):
                    return self._issue_confirm("DISABLE-LAST", uid, "DISABLE LAST")

        before = {"enable": cli.get("enable", True)}
        updated = dict(cli, enable=False)
        await self.xui.update_client(ib["id"], uid, updated)
        self.state.audit(ctx.get("tg_id"), "client.disable", uid, before, {"enable": False})
        return {"ok": True}

    async def client_reset_traffic(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        inbounds = read_inbounds_from_db()
        ib, cli = _client_by_uuid(inbounds, uid)
        expected = f"RESET {(cli.get('email') or f'user-{uid[:8]}')}"
        if not self._check_confirm(params, "RESET-TRAFFIC", uid):
            return self._issue_confirm("RESET-TRAFFIC", uid, expected)
        await self.xui.reset_client_traffic(ib["id"], cli.get("email", ""))
        self.state.audit(ctx.get("tg_id"), "client.reset_traffic", uid, None, {"email": cli.get("email")})
        return {"ok": True}

    async def client_delete(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        inbounds = read_inbounds_from_db()
        ib, cli = _client_by_uuid(inbounds, uid)
        expected = f"DELETE {(cli.get('email') or f'user-{uid[:8]}')}"
        if not self._check_confirm(params, "DELETE-CLIENT", uid):
            return self._issue_confirm("DELETE-CLIENT", uid, expected)
        await self.xui.delete_client(ib["id"], uid, cli.get("email", ""))
        self.state.audit(ctx.get("tg_id"), "client.delete", uid, dict(cli), None)
        return {"ok": True}

    async def client_qr(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        prefer_subscription = bool(params.get("prefer_subscription", True))
        inbounds = read_inbounds_from_db()
        _, cli = _client_by_uuid(inbounds, uid)
        sub_url = _subscription_url_for_client(cli)
        if prefer_subscription and sub_url:
            return {
                "qr_text": _qr_text(sub_url),
                "qr_svg": _qr_svg(sub_url),
                "link": sub_url,
                "kind": "subscription",
                "sub_url": sub_url,
            }
        server = _server_host()
        links = build_vless_links(server, inbounds)
        link = next((l["link"] for l in links if l["uuid"] == uid), None)
        if not link:
            raise MethodError(404, f"no link for client {uid}")
        return {"qr_text": _qr_text(link), "qr_svg": _qr_svg(link), "link": link, "kind": "vless", "sub_url": sub_url}

    async def client_sub_url(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        inbounds = read_inbounds_from_db()
        _, cli = _client_by_uuid(inbounds, uid)
        return {"sub_url": _subscription_url_for_client(cli)}

    async def subscription_rotate(self, params: dict, ctx: dict) -> dict:
        uid = _require_uuid(params.get("uuid"))
        inbounds = read_inbounds_from_db()
        ib, cli = _client_by_uuid(inbounds, uid)
        expected = f"ROTATE SUB {(cli.get('email') or f'user-{uid[:8]}')}"
        if not self._check_confirm(params, "ROTATE-SUB", uid):
            return self._issue_confirm("ROTATE-SUB", uid, expected)
        new_sub = secrets.token_urlsafe(12)
        updated = dict(cli, subId=new_sub)
        await self.xui.update_client(ib["id"], uid, updated)
        self.state.audit(ctx.get("tg_id"), "subscription.rotate", uid,
                         {"subId": cli.get("subId")}, {"subId": new_sub})
        return {"new_sub_url": _subscription_url_for_client(updated)}

    # ── inbound write ────────────────────────────────────────────────
    async def inbound_toggle(self, params: dict, ctx: dict) -> dict:
        ib_id = _require_int(params.get("inbound_id"), "inbound_id", min_v=1)
        enable = bool(params.get("enable"))
        if not enable:
            if not self._check_confirm(params, "DISABLE-INBOUND", str(ib_id)):
                return self._issue_confirm("DISABLE-INBOUND", str(ib_id), f"DISABLE INBOUND {ib_id}")
        await self.xui.toggle_inbound(ib_id, enable)
        self.state.audit(ctx.get("tg_id"), "inbound.toggle", str(ib_id),
                         None, {"enable": enable})
        return {"ok": True}

    # ── panel access ─────────────────────────────────────────────────
    async def panel_access_set(self, params: dict, ctx: dict) -> dict:
        mode = params.get("mode")
        if mode not in ("public", "ssh-only"):
            raise MethodError(400, "mode must be 'public' or 'ssh-only'")
        if mode == "ssh-only":
            if not self._check_confirm(params, "PANEL-ACCESS", mode):
                return self._issue_confirm("PANEL-ACCESS", mode, "LOCKOUT-RISK PROCEED")

        os.makedirs(os.path.dirname(PANEL_ACCESS_FILE), exist_ok=True)
        listen = "127.0.0.1" if mode == "ssh-only" else "0.0.0.0"
        with open(PANEL_ACCESS_FILE, "w", encoding="utf-8") as f:
            f.write(listen)
        # Agent-03: actually push to 3X-UI sqlite (webListen) + restart x-ui.
        try:
            import sqlite3 as _sqlite3
            current = None
            with _sqlite3.connect("/etc/x-ui/x-ui.db", timeout=5) as conn:
                _row = conn.execute(
                    "SELECT value FROM settings WHERE key='webListen' LIMIT 1"
                ).fetchone()
                if _row is not None:
                    current = _row[0]
                conn.execute("UPDATE settings SET value=? WHERE key='webListen'", (listen,))
                conn.commit()
            # No-op debounce: if webListen already matches the requested value,
            # skip the restart entirely. Repeated restarts trip systemd's
            # start-limit and leave x-ui in `failed` (caused a real outage).
            if current != listen:
                import subprocess as _sp
                # Clear any prior start-limit/failed state so the restart isn't
                # rejected by systemd ("start request repeated too quickly").
                _sp.run(["systemctl", "reset-failed", "x-ui"], check=False, timeout=10)
                _sp.run(["systemctl", "restart", "x-ui"], check=False, timeout=10)
        except Exception as _e:
            # don't fail the RPC — marker file is still authoritative
            log.warning("panel.access_set: sqlite/x-ui update failed: %s", _e)
        self.state.audit(ctx.get("tg_id"), "panel.access_set", mode, None, {"listen": listen})
        return {"ok": True}

    # ── cert ─────────────────────────────────────────────────────────
    async def cert_force_renew(self, params: dict, ctx: dict) -> dict:
        target = params.get("domain_or_ip")
        if not isinstance(target, str) or not target.strip():
            raise MethodError(400, "domain_or_ip required")
        target = target.strip()
        # very tight allow-list: letters/digits/dot/dash/colon (for IPv6)
        if not re.match(r"^[A-Za-z0-9_.:\-]{1,253}$", target):
            raise MethodError(400, "domain_or_ip contains illegal characters")
        if params.get("confirm") != f"RENEW {target}":
            raise MethodError(412, f"typed-confirm required: RENEW {target}")

        # Try acme.sh first, fall back to certbot.
        acme = shutil.which("acme.sh")
        cmd = None
        if acme:
            cmd = [acme, "--renew", "-d", target, "--force"]
        else:
            certbot = shutil.which("certbot")
            if certbot:
                cmd = [certbot, "renew", "--cert-name", target, "--force-renewal", "--non-interactive"]
        if not cmd:
            raise MethodError(500, "no ACME client available (acme.sh or certbot)")

        proc = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        ok = proc.returncode == 0
        new_expiry = None
        try:
            from datetime import datetime, timezone
            # best-effort: read /etc/letsencrypt/live/<target>/cert.pem
            cert_path = f"/etc/letsencrypt/live/{target}/cert.pem"
            if os.path.exists(cert_path):
                import ssl
                der_data = ssl._ssl._test_decode_cert(cert_path)  # type: ignore[attr-defined]
                exp = der_data.get("notAfter")
                if exp:
                    new_expiry = exp
        except Exception:
            new_expiry = None

        self.state.audit(ctx.get("tg_id"), "cert.force_renew", target,
                         None, {"ok": ok, "stderr": stderr.decode(errors="replace")[:500]})
        if not ok:
            raise MethodError(500, f"renew failed: {stderr.decode(errors='replace')[:300]}")
        return {"ok": True, "new_expiry": new_expiry}

    # ── admin ────────────────────────────────────────────────────────
    async def admin_claim(self, params: dict, ctx: dict) -> dict:
        token = params.get("token")
        if not isinstance(token, str) or not token:
            raise MethodError(400, "token required")
        expected = self.bot_env.get("ADMIN_CLAIM_TOKEN", "")
        if not expected:
            raise MethodError(500, "ADMIN_CLAIM_TOKEN not configured")
        # For local caller without tg_id, allow param tg_id; otherwise use ctx.
        tg_id = ctx.get("tg_id") or str(params.get("tg_id") or "")
        if not tg_id:
            raise MethodError(400, "tg_id missing")
        ok = self.state.admin_claim_atomic(token, expected, tg_id)
        if not ok:
            raise MethodError(409, "admin already claimed or token mismatch")
        self.state.audit(tg_id, "admin.claim", tg_id, None, {"tg_id": tg_id})
        return {"ok": True}


    async def admin_claim_first(self, params, ctx):
        """First /start claims admin without token (UX simplification).
        Atomic at SQLite level — concurrent /start are race-safe."""
        tg_id = ctx.get("tg_id") or str(params.get("tg_id") or "")
        if not tg_id:
            raise MethodError(400, "tg_id required")
        ok = self.state.admin_claim_first_atomic(tg_id)
        if not ok:
            raise MethodError(409, "admin already claimed")
        self.state.audit(tg_id, "admin.claim_first", tg_id, None, {"tg_id": tg_id, "via": "first-start"})
        return {"ok": True}

    async def admin_invite(self, params: dict, ctx: dict) -> dict:
        tg_id = params.get("tg_id")
        if not (isinstance(tg_id, (str, int)) and str(tg_id).isdigit()):
            raise MethodError(400, "tg_id must be a positive integer")
        added = self.state.invite_admin(str(tg_id), invited_by=ctx.get("tg_id"))
        # idempotent: success either way
        if added:
            self.state.audit(ctx.get("tg_id"), "admin.invite", str(tg_id), None, {"tg_id": str(tg_id)})
        return {"ok": True, "added": added}

    # ── notify-admins ────────────────────────────────────────────────
    async def notify_admins(self, params: dict, ctx: dict) -> dict:
        message = params.get("message")
        severity = params.get("severity", "info")
        if not isinstance(message, str) or not message.strip():
            raise MethodError(400, "message required")
        # Daemon writes the request to a queue file; bot's local-socket
        # handler reads & forwards. We do NOT call Telegram directly from
        # the daemon (separation of concerns per CONTRACT).
        os.makedirs("/run/govless", exist_ok=True)
        queue = "/run/govless/notify.queue"
        import json
        with open(queue, "a", encoding="utf-8") as f:
            f.write(json.dumps({"ts": int(time.time()), "severity": severity, "message": message}) + "\n")
        self.state.audit(ctx.get("tg_id"), "notify-admins", severity, None, {"message": message[:200]})
        return {"sent": True}

    # ── BACKUP / REPAIR / RESTART / NOTIFICATIONS (Etap 2+3) ──────────
    async def backup_create(self, params, ctx):
        import subprocess, glob
        try:
            res = subprocess.run(["bash","-c",
                "set -e; cd /root/goVLESS 2>/dev/null || cd /opt/govless 2>/dev/null || true; "
                "source lib/common.sh 2>/dev/null || true; source lib/xui_api.sh 2>/dev/null || true; source lib/xui.sh 2>/dev/null && backup_govless"],
                capture_output=True, text=True, timeout=120)
            if res.returncode != 0:
                raise MethodError(500, "backup failed: " + (res.stderr[-200:] or res.stdout[-200:] or "rc!=0"))
            files = sorted(glob.glob("/root/govless-backups/*.tgz"), key=lambda f: os.path.getmtime(f), reverse=True)
            if not files:
                raise MethodError(500, "backup ran but no .tgz produced")
            self.state.audit(ctx.get("tg_id"), "backup.create", files[0], None, {"path": files[0]})
            return {"path": files[0], "name": os.path.basename(files[0]),
                    "size": os.path.getsize(files[0]), "ts": int(os.path.getmtime(files[0]))}
        except subprocess.TimeoutExpired:
            raise MethodError(504, "backup timed out after 120s")

    async def backup_list(self, params, ctx):
        import glob
        files = sorted(glob.glob("/root/govless-backups/*.tgz"), key=lambda f: os.path.getmtime(f), reverse=True)
        out = []
        for f in files:
            try:
                st = os.stat(f)
                out.append({"path": f, "name": os.path.basename(f), "size": st.st_size, "ts": int(st.st_mtime)})
            except OSError:
                pass
        return {"backups": out}

    async def backup_restore(self, params, ctx):
        import subprocess
        path = params.get("path")
        if not isinstance(path, str) or not path.startswith("/root/govless-backups/") or ".." in path:
            raise MethodError(400, "invalid backup path")
        if not os.path.isfile(path):
            raise MethodError(404, "backup file not found")
        name = os.path.basename(path)
        if not self._check_confirm(params, "RESTORE", path):
            return self._issue_confirm("RESTORE", path, "RESTORE " + name,
                description="Восстановить из «" + name + "»? Текущее состояние будет перезаписано.")
        try:
            res = subprocess.run(["bash","-c",
                "set -e; cd /root/goVLESS 2>/dev/null || cd /opt/govless 2>/dev/null || true; "
                "source lib/common.sh 2>/dev/null || true; source lib/xui_api.sh 2>/dev/null || true; source lib/xui.sh 2>/dev/null && restore_govless " + repr(path)],
                capture_output=True, text=True, timeout=180)
            if res.returncode != 0:
                raise MethodError(500, "restore failed: " + (res.stderr[-200:] or res.stdout[-200:] or "rc!=0"))
            self.state.audit(ctx.get("tg_id"), "backup.restore", path, None, {"path": path})
            return {"ok": True, "stdout": res.stdout[-500:]}
        except subprocess.TimeoutExpired:
            raise MethodError(504, "restore timed out after 180s")

    async def repair_run(self, params, ctx):
        import subprocess
        try:
            res = subprocess.run(["bash","-c",
                "set -e; cd /root/goVLESS 2>/dev/null || cd /opt/govless 2>/dev/null || true; "
                "source lib/common.sh 2>/dev/null || true; source lib/xui_api.sh 2>/dev/null || true; source lib/xui.sh 2>/dev/null && repair_user_facing"],
                capture_output=True, text=True, timeout=60)
            self.state.audit(ctx.get("tg_id"), "repair.run", None, None, {"rc": res.returncode})
            return {"ok": res.returncode == 0, "stdout": res.stdout[-800:], "stderr": res.stderr[-400:]}
        except subprocess.TimeoutExpired:
            raise MethodError(504, "repair timed out after 60s")

    async def system_restart(self, params, ctx):
        import subprocess
        if not self._check_confirm(params, "RESTART", "system"):
            return self._issue_confirm("RESTART", "system", "RESTART",
                description="Перезапустить x-ui, govlessctl и govless-bot? Mini App станет недоступен ~10 секунд.")
        subprocess.Popen(["bash","-c", "sleep 2 && systemctl restart x-ui govlessctl govless-bot"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        self.state.audit(ctx.get("tg_id"), "system.restart", None, None, {"scheduled": True})
        return {"ok": True, "delay_s": 2}

    async def notifications_get(self, params, ctx):
        tg = str(ctx.get("tg_id") or "")
        if not tg:
            return {"prefs": {}}
        path = "/etc/govless/notify." + tg + ".json"
        try:
            import json
            with open(path) as f:
                return {"prefs": json.load(f)}
        except (FileNotFoundError, ValueError):
            return {"prefs": {"tunnel_url_changed": True, "client_added": True,
                              "traffic_limit_reached": True, "mode_switched": True,
                              "daemon_restart": False}}

    async def notifications_set(self, params, ctx):
        tg = str(ctx.get("tg_id") or "")
        if not tg:
            raise MethodError(401, "auth required")
        prefs = params.get("prefs")
        if not isinstance(prefs, dict):
            raise MethodError(400, "prefs object required")
        allowed = {"tunnel_url_changed", "client_added", "traffic_limit_reached", "mode_switched", "daemon_restart"}
        clean = {k: bool(v) for k, v in prefs.items() if k in allowed}
        os.makedirs("/etc/govless", exist_ok=True)
        path = "/etc/govless/notify." + tg + ".json"
        import json
        with open(path, "w") as f:
            json.dump(clean, f)
        os.chmod(path, 0o640)
        self.state.audit(ctx.get("tg_id"), "notifications.set", tg, None, clean)
        return {"ok": True, "prefs": clean}

    # ── typed-confirm helpers ────────────────────────────────────────
    def _check_confirm(self, params: dict, action: str, target: str) -> bool:
        """Look for params['confirm_token']+params['confirm'] in pending_confirms."""
        token = params.get("confirm_token")
        submitted = params.get("confirm")
        if not token or not submitted:
            return False
        row = self.state.consume_pending_confirm(str(token), str(submitted))
        if not row:
            return False
        return row["action"] == action and (row["target"] or "") == (target or "")

    def _issue_confirm(self, action: str, target: str, expected_string: str, description: str = "") -> None:
        token = _new_typed_token()
        self.state.store_pending_confirm(token, action, target, expected_string, ttl=300)
        raise MethodError(412, "typed-confirm required", {
            "needs_confirm": True,
            "confirm_token": token,
            "confirm": expected_string,
            "description": description or f"{action} requires typed confirmation",
            "ttl": 300,
            "action": action,
            "target": target,
        })

    # ── dispatch table ───────────────────────────────────────────────
    def dispatch_table(self) -> dict[str, Any]:
        return {
            "system.status": self.system_status,
            "client.list": self.client_list,
            "client.add": self.client_add,
            "client.update": self.client_update,
            "client.enable": self.client_enable,
            "client.disable": self.client_disable,
            "client.reset_traffic": self.client_reset_traffic,
            "client.delete": self.client_delete,
            "client.qr": self.client_qr,
            "client.sub_url": self.client_sub_url,
            "subscription.rotate": self.subscription_rotate,
            "inbound.list": self.inbound_list,
            "inbound.toggle": self.inbound_toggle,
            "panel.access_get": self.panel_access_get,
            "panel.access_set": self.panel_access_set,
            "audit.tail": self.audit_tail,
            "cert.force_renew": self.cert_force_renew,
            "admin.claim": self.admin_claim,
            "admin.claim_first": self.admin_claim_first,
            "admin.list": self.admin_list,
            "admin.invite": self.admin_invite,
            "tunnel.url_get": self.tunnel_url_get,
            "backup.create": self.backup_create,
            "backup.list": self.backup_list,
            "backup.restore": self.backup_restore,
            "repair.run": self.repair_run,
            "system.restart": self.system_restart,
            "notifications.get": self.notifications_get,
            "notifications.set": self.notifications_set,
            "notify-admins": self.notify_admins,
        }
