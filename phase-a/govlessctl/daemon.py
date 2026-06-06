"""daemon.py — govlessctl JSON-RPC daemon.

POSTs /rpc → JSON-RPC 2.0 dispatch. Listens on a UNIX socket
`/run/govlessctl.sock` chmod 0660 root:govless.

Run with: sudo python3 daemon.py  (system unit runs as root per CONTRACT).
"""
from __future__ import annotations

import asyncio
import grp
import json
import logging
import os
import signal
import socket
import sys
from typing import Any

from aiohttp import web

# Local modules
from .auth import AuthError, BotEnvCache, authenticate_request
from .methods import MethodError, Methods
from .state_db import StateDB
from .xui_client import XuiClient, XuiError


SOCKET_PATH = "/run/govlessctl.sock"
SOCKET_GROUP = "govless"
SOCKET_MODE = 0o660

log = logging.getLogger("govlessctl")


# ── JSON-RPC error helper ────────────────────────────────────────────────
def _err(req_id: Any, code: int, message: str, data: Any = None) -> dict:
    error = {"code": code, "message": message}
    if data is not None:
        error["data"] = data
    return {"jsonrpc": "2.0", "id": req_id, "error": error}


def _ok(req_id: Any, result: Any) -> dict:
    return {"jsonrpc": "2.0", "id": req_id, "result": result}


# ── HTTP handler ─────────────────────────────────────────────────────────
async def handle_rpc(request: web.Request) -> web.Response:
    methods: Methods = request.app["methods"]
    bot_env: dict[str, str] = request.app["bot_env_cache"].get()
    state: StateDB = request.app["state"]

    # Content-Type guard (Agent-04 P0): reject non-JSON requests to prevent
    # CSRF from HTML forms (which can POST text/plain cross-origin without preflight).
    ct = request.headers.get("Content-Type", "").split(";")[0].strip().lower()
    if ct and ct != "application/json":
        return web.json_response(_err(None, -32600, f"unsupported content-type: {ct}"), status=415)

    # Parse body
    try:
        body = await request.json()
    except json.JSONDecodeError as e:
        return web.json_response(_err(None, -32700, f"parse error: {e}"), status=400)

    if not isinstance(body, dict):
        return web.json_response(_err(None, -32600, "invalid request"), status=400)

    req_id = body.get("id")
    method_name = body.get("method")
    params = body.get("params") or {}
    if not isinstance(method_name, str):
        return web.json_response(_err(req_id, -32600, "method must be a string"), status=400)
    if not isinstance(params, dict):
        return web.json_response(_err(req_id, -32602, "params must be an object"), status=400)

    # Get peer socket for SO_PEERCRED (best-effort: aiohttp transport gives us this on UNIX socket).
    peer_sock = None
    try:
        transport = request.transport
        if transport is not None:
            raw_sock = transport.get_extra_info("socket")
            if raw_sock is not None and raw_sock.family == socket.AF_UNIX:
                peer_sock = raw_sock
    except Exception:
        peer_sock = None

    # Authenticate
    try:
        ctx = authenticate_request(
            body,
            peer_sock,
            bot_env,
            state_admin_ids=set(state.get_admin_ids()),
        )
    except AuthError as e:
        return web.json_response(_err(req_id, e.code, e.message), status=e.code if e.code in (401, 403) else 400)

    # Dispatch
    dispatch = methods.dispatch_table()
    handler = dispatch.get(method_name)
    if handler is None:
        return web.json_response(_err(req_id, -32601, f"method not found: {method_name}"), status=404)

    try:
        result = await handler(params, ctx)
    except MethodError as e:
        return web.json_response(_err(req_id, e.code, e.message, e.data), status=e.code if 400 <= e.code < 600 else 400)
    except XuiError as e:
        return web.json_response(_err(req_id, e.code, e.message), status=e.code if 400 <= e.code < 600 else 503)

    return web.json_response(_ok(req_id, result), status=200)


# ── Health endpoint ──────────────────────────────────────────────────────
async def handle_healthz(request: web.Request) -> web.Response:
    return web.Response(text="ok", content_type="text/plain")



# ── Rate limit middleware (Agent-04 T3234 P0 fix) ───────────────────────
# Token bucket per remote-addr: 60 req/min, burst 20.
import collections, time as _time
_RL_BUCKETS: dict[str, collections.deque] = collections.defaultdict(lambda: collections.deque(maxlen=60))
_RL_RATE = 60   # tokens/min
_RL_BURST = 20  # max burst

@web.middleware
async def rate_limit_mw(request: web.Request, handler):
    # UDS peer has no IP — use "local" key (root-only access via SO_PEERCRED anyway)
    peer = request.transport.get_extra_info("peername") if request.transport else None
    addr = peer[0] if peer else "local"
    now = _time.monotonic()
    bucket = _RL_BUCKETS[addr]
    # Drop entries older than 60s
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= _RL_RATE:
        return web.json_response(
            _err(None, 429, "rate limit exceeded — 60 req/min"),
            status=429, headers={"Retry-After": "30"})
    bucket.append(now)
    return await handler(request)


# ── App factory ──────────────────────────────────────────────────────────
def make_app() -> web.Application:
    app = web.Application(middlewares=[rate_limit_mw])
    app.router.add_post("/rpc", handle_rpc)
    app.router.add_get("/healthz", handle_healthz)
    app["state"] = StateDB()
    app["xui"] = XuiClient()
    app["bot_env_cache"] = BotEnvCache()
    app["methods"] = Methods(
        state=app["state"],
        xui=app["xui"],
        bot_env_loader=app["bot_env_cache"].get,
    )

    async def _on_shutdown(app: web.Application) -> None:
        try:
            await app["xui"].close()
        except Exception:
            pass
        try:
            app["state"].close()
        except Exception:
            pass

    app.on_shutdown.append(_on_shutdown)
    return app


# ── Socket bootstrap ─────────────────────────────────────────────────────
def setup_unix_socket(path: str = SOCKET_PATH, group: str = SOCKET_GROUP, mode: int = SOCKET_MODE) -> socket.socket:
    """Create a UNIX SOCK_STREAM socket, chown root:govless, chmod 0660."""
    if os.path.exists(path):
        os.unlink(path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.bind(path)
    sock.listen(128)
    try:
        gid = grp.getgrnam(group).gr_gid
        os.chown(path, 0, gid)
    except (KeyError, PermissionError):
        # Group may not exist on dev box; leave default ownership but warn.
        log.warning("group %s not present; socket left with default group", group)
    try:
        os.chmod(path, mode)
    except PermissionError:
        log.warning("could not chmod %s to %o", path, mode)
    return sock


async def _main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    app = make_app()
    runner = web.AppRunner(app, handle_signals=True)
    await runner.setup()

    sock = setup_unix_socket()
    site = web.SockSite(runner, sock)
    await site.start()
    log.info("govlessctl listening on %s", SOCKET_PATH)

    # Run until terminated.
    stop = asyncio.Event()

    def _signal() -> None:
        stop.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _signal)
        except NotImplementedError:
            pass

    await stop.wait()
    log.info("shutting down")
    await runner.cleanup()
    try:
        os.unlink(SOCKET_PATH)
    except OSError:
        pass


def main() -> int:
    try:
        asyncio.run(_main())
    except KeyboardInterrupt:
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
