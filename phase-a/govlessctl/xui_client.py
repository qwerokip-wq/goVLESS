"""xui_client.py — async wrapper around the 3X-UI HTTP API.

Reads panel URL + credentials from /root/.govless_credentials (KEY=VALUE shell).
Login obtains a session cookie + CSRF token; subsequent writes go through the
HTTP API (we never UPDATE x-ui.db directly for clients/inbounds).

Retry policy (CONTRACT/014 Rule 6): 3× with 5s backoff for transient 5xx /
ECONNREFUSED that look like a 3X-UI restart.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
import sqlite3
import time
import urllib.parse
from typing import Any

import aiohttp


XUI_DB_PATH = "/etc/x-ui/x-ui.db"
CREDS_PATH = "/root/.govless_credentials"
RETRY_COUNT = 3
RETRY_BACKOFF = 5.0  # seconds


class XuiError(Exception):
    def __init__(self, code: int, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def _extract_csrf_token(html: str) -> str | None:
    match = re.search(r'csrf-token"\s+content="([^"]+)"', html or "")
    return match.group(1) if match else None


def _quote_path(value: str) -> str:
    return urllib.parse.quote(str(value), safe="")


def _int_or_zero(value: Any) -> int:
    if value in ("", None):
        return 0
    try:
        return int(value)
    except (TypeError, ValueError):
        return 0


def _normalize_client_payload(client_obj: dict) -> dict:
    """Normalize loose DB JSON into the stricter 3X-UI v3 Client JSON model."""
    normalized = dict(client_obj)
    for key in ("limitIp", "totalGB", "expiryTime", "tgId", "reset"):
        if key in normalized:
            normalized[key] = _int_or_zero(normalized.get(key))
    if "tgId" not in normalized:
        normalized["tgId"] = 0
    if "enable" in normalized:
        normalized["enable"] = bool(normalized.get("enable"))
    return normalized


def load_credentials(path: str = CREDS_PATH) -> dict[str, str]:
    """Load panel creds from the shell-style goVLESS credentials file."""
    creds: dict[str, str] = {}
    if not os.path.exists(path):
        return creds
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k, v = k.strip(), v.strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
                v = v[1:-1]
            creds[k] = v
    return creds


def _local_panel_url_from_db(db_path: str = XUI_DB_PATH) -> str | None:
    """Build a loopback 3X-UI URL from sqlite settings, if available."""
    settings = read_xui_settings_from_db(db_path)
    port = (settings.get("webPort") or "").strip()
    if not port:
        return None
    base_path = (settings.get("webBasePath") or "/").strip() or "/"
    if not base_path.startswith("/"):
        base_path = "/" + base_path
    scheme = "https" if settings.get("webCertFile") else "http"
    return f"{scheme}://127.0.0.1:{port}{base_path.rstrip('/')}".rstrip("/")


class XuiClient:
    """Minimal async client. Single instance reused across requests."""

    def __init__(self, creds: dict[str, str] | None = None):
        self.creds = creds or load_credentials()
        # Accept several key names for forward compat.
        self.url = (
            self.creds.get("PANEL_URL")
            or self.creds.get("XUI_URL")
            or self.creds.get("URL")
            or _local_panel_url_from_db()
            or "http://127.0.0.1:2053"
        ).rstrip("/")
        self.username = (
            self.creds.get("PANEL_USER")
            or self.creds.get("PANEL_USERNAME")
            or self.creds.get("XUI_USER")
            or self.creds.get("USERNAME")
            or self.creds.get("USER")
            or ""
        )
        self.password = (
            self.creds.get("PANEL_PASS")
            or self.creds.get("PANEL_PASSWORD")
            or self.creds.get("XUI_PASS")
            or self.creds.get("PASSWORD")
            or self.creds.get("PASS")
            or ""
        )
        self._session: aiohttp.ClientSession | None = None
        self._csrf: str | None = None
        self._cookie_jar: aiohttp.CookieJar | None = None
        self._login_lock = asyncio.Lock()
        self._logged_in_at: float = 0.0

    async def _ensure_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._cookie_jar = aiohttp.CookieJar(unsafe=True)
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(
                cookie_jar=self._cookie_jar, timeout=timeout
            )
        return self._session

    async def close(self) -> None:
        if self._session is not None and not self._session.closed:
            await self._session.close()
        self._session = None

    async def _login(self) -> None:
        async with self._login_lock:
            # If we logged in <2 min ago, assume cookie is still valid.
            if self._logged_in_at and (time.time() - self._logged_in_at) < 120:
                return
            session = await self._ensure_session()
            data = {"username": self.username, "password": self.password}
            headers: dict[str, str] = {}

            # 3X-UI v3 requires a session cookie + CSRF token from the panel
            # HTML before POST /login. v2 accepts the extra GET harmlessly.
            async with session.get(f"{self.url}/") as resp:
                html = await resp.text()
                if resp.status >= 500:
                    raise XuiError(503, f"panel HTTP {resp.status}: {html[:200]}")
                self._csrf = _extract_csrf_token(html)
            login_csrf = self._csrf
            if self._csrf:
                headers["X-CSRF-Token"] = self._csrf

            async with session.post(f"{self.url}/login", data=data, headers=headers) as resp:
                text = await resp.text()
                if resp.status != 200:
                    raise XuiError(503, f"login HTTP {resp.status}: {text[:200]}")
                try:
                    payload = json.loads(text)
                except ValueError:
                    raise XuiError(503, f"login non-JSON response: {text[:200]}")
                if not payload.get("success"):
                    raise XuiError(401, f"login failed: {payload.get('msg', 'no msg')}")
            # CSRF token: header X-Csrf-Token or cookie name csrf_token (3X-UI varies).
            self._csrf = None
            if self._cookie_jar is not None:
                for cookie in self._cookie_jar:
                    if cookie.key.lower() in ("csrf_token", "csrf", "x-csrf-token"):
                        self._csrf = cookie.value
                        break
            if self._csrf is None:
                self._csrf = login_csrf
            self._logged_in_at = time.time()

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: Any = None,
        data: Any = None,
        retries: int = RETRY_COUNT,
    ) -> Any:
        """Issue HTTP request with auto-login + retry on 5xx/connection errors."""
        last_err: Exception | None = None
        for attempt in range(retries):
            try:
                await self._login()  # idempotent if recent
                session = await self._ensure_session()
                headers = {}
                if self._csrf:
                    headers["X-CSRF-Token"] = self._csrf
                url = f"{self.url}{path}"
                async with session.request(
                    method, url, json=json_body, data=data, headers=headers
                ) as resp:
                    text = await resp.text()
                    if resp.status >= 500:
                        raise XuiError(503, f"3X-UI {resp.status}: {text[:200]}")
                    if resp.status == 401 or resp.status == 403:
                        # Cookie probably expired — force re-login on next attempt.
                        self._logged_in_at = 0.0
                        raise XuiError(401, f"3X-UI auth: {resp.status} {text[:200]}")
                    if resp.status >= 400:
                        raise XuiError(resp.status, f"3X-UI HTTP {resp.status}: {text[:200]}")
                    if not text:
                        return None
                    try:
                        payload = json.loads(text)
                    except ValueError:
                        return {"raw": text}
                    if isinstance(payload, dict) and payload.get("success") is False:
                        msg = payload.get("msg") or "no msg"
                        raise XuiError(400, f"3X-UI API failed: {msg}")
                    return payload
            except (aiohttp.ClientConnectionError, asyncio.TimeoutError, XuiError) as e:
                last_err = e
                # Retry transient / 5xx and one expired-cookie auth failure.
                if isinstance(e, XuiError) and e.code in (401, 403):
                    if "3X-UI auth:" in e.message and attempt < retries - 1:
                        await asyncio.sleep(RETRY_BACKOFF)
                        continue
                    raise
                if isinstance(e, XuiError) and e.code not in (503, 502, 504):
                    raise
                if attempt < retries - 1:
                    await asyncio.sleep(RETRY_BACKOFF)
                    continue
                if isinstance(e, XuiError):
                    raise
                raise XuiError(503, f"3X-UI unavailable: {e}")
        if last_err:
            raise XuiError(503, f"3X-UI unavailable after retries: {last_err}")
        raise XuiError(503, "3X-UI unavailable")

    # ── 3X-UI endpoints ────────────────────────────────────────────────
    async def list_inbounds(self) -> list[dict]:
        resp = await self._request("GET", "/panel/api/inbounds/list")
        if isinstance(resp, dict) and "obj" in resp:
            return resp.get("obj") or []
        if isinstance(resp, list):
            return resp
        return []

    async def get_inbound(self, inbound_id: int) -> dict | None:
        resp = await self._request("GET", f"/panel/api/inbounds/get/{int(inbound_id)}")
        if isinstance(resp, dict):
            return resp.get("obj") or resp
        return None

    async def add_client(self, inbound_id: int, client_obj: dict) -> dict:
        """Add a client to an existing inbound.

        3X-UI v3 uses /panel/api/clients/add. Older v2 panels use the
        inbound-scoped addClient endpoint, so keep a 404 fallback.
        """
        client_obj = _normalize_client_payload(client_obj)
        try:
            return await self._request(
                "POST",
                "/panel/api/clients/add",
                json_body={"client": client_obj, "inboundIds": [int(inbound_id)]},
            )
        except XuiError as exc:
            if exc.code != 404:
                raise

        body = {
            "id": str(int(inbound_id)),
            "settings": json.dumps({"clients": [client_obj]}),
        }
        return await self._request("POST", "/panel/api/inbounds/addClient", data=body)

    async def update_client(self, inbound_id: int, uuid: str, client_obj: dict) -> dict:
        client_obj = _normalize_client_payload(client_obj)
        email = str(client_obj.get("email") or "")
        if email:
            try:
                return await self._request(
                    "POST",
                    f"/panel/api/clients/update/{_quote_path(email)}",
                    json_body=client_obj,
                )
            except XuiError as exc:
                if exc.code != 404:
                    raise

        body = {
            "id": str(int(inbound_id)),
            "settings": json.dumps({"clients": [client_obj]}),
        }
        return await self._request(
            "POST", f"/panel/api/inbounds/updateClient/{uuid}", data=body
        )

    async def delete_client(
        self, inbound_id: int, uuid: str, email: str | None = None
    ) -> dict:
        if email:
            try:
                return await self._request(
                    "POST", f"/panel/api/clients/del/{_quote_path(email)}"
                )
            except XuiError as exc:
                if exc.code != 404:
                    raise
        return await self._request(
            "POST", f"/panel/api/inbounds/{int(inbound_id)}/delClient/{uuid}"
        )

    async def reset_client_traffic(self, inbound_id: int, email: str) -> dict:
        # 3X-UI uses email/name to identify when resetting traffic on a client row.
        try:
            return await self._request(
                "POST", f"/panel/api/clients/resetTraffic/{_quote_path(email)}"
            )
        except XuiError as exc:
            if exc.code != 404:
                raise
        return await self._request(
            "POST",
            f"/panel/api/inbounds/{int(inbound_id)}/resetClientTraffic/{urllib.parse.quote(email)}",
        )

    async def toggle_inbound(self, inbound_id: int, enable: bool) -> dict:
        """Enable/disable an inbound WITHOUT clobbering it.

        3X-UI's POST /panel/api/inbounds/update/<id> is a *full-object replace*,
        not a patch. Sending only {"enable": ...} blanks port/settings(all
        clients)/streamSettings — i.e. silent data loss. So read the current
        inbound, flip `enable`, and POST the complete object back. Refuse to
        write if the GET came back empty (defensive: never propagate a wipe).
        """
        cur = await self.get_inbound(int(inbound_id))
        if not isinstance(cur, dict) or not cur.get("port") or not cur.get("settings"):
            raise XuiError(404, f"inbound {inbound_id} not found or empty; refusing to toggle")
        body = dict(cur)
        body["enable"] = bool(enable)
        # settings/streamSettings/sniffing/allocate come back from GET as JSON
        # strings; the update endpoint expects that same string form, so the
        # round-trip is byte-faithful.
        return await self._request(
            "POST", f"/panel/api/inbounds/update/{int(inbound_id)}", json_body=body
        )

    async def get_onlines(self) -> list[str]:
        try:
            resp = await self._request("POST", "/panel/api/clients/onlines")
        except XuiError as exc:
            if exc.code != 404:
                raise
            resp = await self._request("POST", "/panel/api/inbounds/onlines")
        if isinstance(resp, dict) and "obj" in resp:
            return resp.get("obj") or []
        if isinstance(resp, list):
            return resp
        return []


# ── Direct sqlite read helpers (read-only — writes go through HTTP API) ──
def read_inbounds_from_db(db_path: str = XUI_DB_PATH) -> list[dict]:
    """Read all inbound rows from /etc/x-ui/x-ui.db (READ ONLY).

    Returns list of dicts with parsed settings/stream_settings.
    """
    if not os.path.exists(db_path):
        return []
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, timeout=5.0)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute(
            "SELECT id, port, protocol, remark, enable, settings, stream_settings, sniffing, listen "
            "FROM inbounds ORDER BY id"
        ).fetchall()
    finally:
        conn.close()
    out: list[dict] = []
    for r in rows:
        d = dict(r)
        try:
            d["settings_obj"] = json.loads(d.get("settings") or "{}")
        except ValueError:
            d["settings_obj"] = {}
        try:
            d["stream_obj"] = json.loads(d.get("stream_settings") or "{}")
        except ValueError:
            d["stream_obj"] = {}
        out.append(d)
    return out


def read_client_traffics_from_db(db_path: str = XUI_DB_PATH) -> dict[str, dict]:
    """Return dict keyed by client email of {up, down, total, enable, expiry_time}."""
    if not os.path.exists(db_path):
        return {}
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, timeout=5.0)
    conn.row_factory = sqlite3.Row
    try:
        # Schema name varies across 3X-UI versions: client_traffics is canonical.
        try:
            rows = conn.execute(
                "SELECT email, up, down, total, enable, expiry_time FROM client_traffics"
            ).fetchall()
        except sqlite3.OperationalError:
            return {}
    finally:
        conn.close()
    return {r["email"]: dict(r) for r in rows}


def read_xui_settings_from_db(db_path: str = XUI_DB_PATH) -> dict[str, str]:
    """Return 3X-UI settings key/value pairs from sqlite."""
    if not os.path.exists(db_path):
        return {}
    conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True, timeout=5.0)
    try:
        try:
            rows = conn.execute("SELECT key, value FROM settings").fetchall()
        except sqlite3.OperationalError:
            return {}
    finally:
        conn.close()
    return {str(k): "" if v is None else str(v) for k, v in rows}


# ── VLESS link reconstruction (port of regenerate_links_from_db) ─────────
def build_vless_links(
    server: str,
    inbounds: list[dict],
    *,
    only_enabled: bool = True,
) -> list[dict]:
    """Port of lib/xui_api.sh:regenerate_links_from_db.

    Builds VLESS URIs per (client × transport × security). Returns list of
    {name, uuid, inbound_id, port, link, network, security}.
    """
    out: list[dict] = []
    quote = lambda x: urllib.parse.quote(str(x), safe="")

    for ib in inbounds:
        if only_enabled and not ib.get("enable"):
            continue
        protocol = ib.get("protocol", "vless")
        if protocol != "vless":
            continue
        port = ib.get("port") or 443
        settings = ib.get("settings_obj") or {}
        stream = ib.get("stream_obj") or {}
        clients = settings.get("clients") or []
        if not clients:
            continue

        network = stream.get("network", "tcp")
        security = stream.get("security", "tls")

        if security == "reality":
            rs = stream.get("realitySettings", {}) or {}
            pbk = (rs.get("settings") or {}).get("publicKey") or rs.get("publicKey", "")
            sni_list = rs.get("serverNames") or [""]
            sni = sni_list[0] if sni_list else ""
            sid_list = rs.get("shortIds") or [""]
            sid = sid_list[0] if sid_list else ""
            fp = (rs.get("settings") or {}).get("fingerprint") or "chrome"
            common = f"security=reality&pbk={pbk}&fp={fp}&sni={sni}&sid={sid}&spx=%2F"
        elif security == "tls":
            ts = stream.get("tlsSettings", {}) or {}
            sni = ts.get("serverName") or server
            fp = (ts.get("settings") or {}).get("fingerprint") or "chrome"
            common = f"security=tls&sni={sni}&fp={fp}"
            alpn_list = ts.get("alpn") or []
            if alpn_list:
                common += f"&alpn={quote(','.join(alpn_list))}"
        else:
            common = f"security={security}"

        for cli in clients:
            uuid = cli.get("id")
            if not uuid:
                continue
            name = cli.get("email") or f"user-{uuid[:8]}"
            enc_name = quote(name)
            params = f"encryption=none&type={network}&{common}"
            flow = cli.get("flow", "")

            if network == "tcp":
                if flow:
                    params += f"&flow={quote(flow)}"
            elif network == "xhttp":
                xs = stream.get("xhttpSettings", {}) or {}
                path_q = quote(xs.get("path", "/") or "/")
                mode_ = xs.get("mode", "auto") or "auto"
                params += f"&path={path_q}&mode={mode_}"
            elif network == "grpc":
                gs = stream.get("grpcSettings", {}) or {}
                sn = gs.get("serviceName", "") or ""
                mode_ = "multi" if gs.get("multiMode") else "single"
                params += f"&serviceName={quote(sn)}&mode={mode_}"
            elif network == "ws":
                ws = stream.get("wsSettings", {}) or {}
                path_q = quote(ws.get("path", "/") or "/")
                host_h = (ws.get("headers", {}) or {}).get("Host", "")
                params += f"&path={path_q}"
                if host_h:
                    params += f"&host={quote(host_h)}"

            link = f"vless://{uuid}@{server}:{port}?{params}#{enc_name}"
            out.append(
                {
                    "name": name,
                    "uuid": uuid,
                    "inbound_id": ib.get("id"),
                    "port": port,
                    "link": link,
                    "network": network,
                    "security": security,
                    "flow": cli.get("flow", ""),
                }
            )
    return out
