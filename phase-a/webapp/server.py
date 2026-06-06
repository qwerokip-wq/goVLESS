#!/usr/bin/env python3
"""
goVLESS WebApp server (Lite mode).

Serves the static Mini-App bundle from ``DIST_DIR`` and proxies a small
allow-list of JSON-RPC endpoints into the govlessctl daemon's UNIX socket
(``/run/govlessctl.sock``).

This is the Lite-mode equivalent of the Pro nginx ``govless-webapp.conf``
snippet. In Pro nginx terminates TLS and proxies ``/api/rpc`` and
``/api/healthz`` into the same UNIX socket; this script does the same job
behind a Cloudflare Quick Tunnel so the Mini-App is fully functional in
Lite mode without nginx.

Design notes
------------
- **stdlib only.** No aiohttp, requests, or external deps — Lite must
  install with only a system ``python3``.
- **Single-threaded `ThreadingHTTPServer`** is fine here: traffic is one
  admin (operator) and the work is dispatched into the daemon synchronously
  anyway. Multiple parallel admins remain rare; aiohttp on the daemon
  side absorbs concurrency.
- **Loopback only** (``127.0.0.1``). The public surface is Cloudflare's
  trycloudflare.com edge or named tunnel; we never bind on a public iface.
- **Path allow-list.** Only ``POST /api/rpc`` and ``GET /api/healthz``
  are proxied. Everything else falls through to the static handler which
  is locked to ``DIST_DIR`` via ``directory=``.
- **Body cap (64 KiB).** Matches nginx ``client_max_body_size 64k`` from
  the Pro snippet — protects the daemon from oversized JSON.
- **No auth here.** The daemon validates Telegram ``initData`` HMAC against
  the bot token itself (see ``govlessctl/auth.py``). We are a dumb relay.
"""

from __future__ import annotations

import argparse
import http.client
import http.server
import logging
import os
import socket
import socketserver
import sys
from typing import Optional

log = logging.getLogger("govless-webapp")

DEFAULT_DIST = "/opt/govless/webapp/dist"
DEFAULT_SOCK = "/run/govlessctl.sock"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8443
MAX_BODY = 64 * 1024  # 64 KiB, mirrors nginx client_max_body_size
RPC_TIMEOUT = 30.0    # seconds, mirrors nginx proxy_read_timeout
HEALTH_TIMEOUT = 5.0  # seconds, mirrors nginx proxy_read_timeout for healthz
WEBAPP_CSP = (
    "default-src 'self' https://telegram.org https://*.telegram.org; "
    "img-src 'self' data:; "
    "script-src 'self' https://telegram.org https://cdnjs.cloudflare.com; "
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "connect-src 'self'; "
    "frame-ancestors https://web.telegram.org https://*.telegram.org;"
)
DESIGN_CSP = (
    "default-src 'self' https://telegram.org https://*.telegram.org; "
    "img-src 'self' data: blob:; "
    "script-src 'self' https://telegram.org https://unpkg.com https://cdnjs.cloudflare.com 'unsafe-inline' 'unsafe-eval'; "
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; "
    "frame-ancestors https://web.telegram.org https://*.telegram.org;"
)


# ── UNIX-socket HTTP client (stdlib only) ────────────────────────────────
class UnixHTTPConnection(http.client.HTTPConnection):
    """``http.client.HTTPConnection`` that connects to a UNIX socket path
    instead of an ``(host, port)`` TCP pair.

    The daemon speaks plain HTTP/1.1 over its UNIX socket (aiohttp's
    ``SockSite``), so we can reuse all of ``http.client``'s request/response
    machinery — we just replace ``connect()`` to dial ``AF_UNIX``.
    """

    def __init__(self, sock_path: str, timeout: float) -> None:
        # The host arg is only used by http.client for the Host: header and
        # debug logging; the actual connection is established in connect().
        super().__init__("localhost", timeout=timeout)
        self._sock_path = sock_path

    def connect(self) -> None:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(self.timeout)
        sock.connect(self._sock_path)
        self.sock = sock


def _proxy_to_daemon(
    method: str,
    upstream_path: str,
    body: bytes,
    sock_path: str,
    timeout: float,
    content_type: Optional[str],
) -> tuple[int, bytes, str]:
    """Forward a request to the daemon over its UNIX socket.

    Returns ``(status, body_bytes, content_type)``. Network/connection
    failures surface as a synthetic ``503`` with a short JSON-RPC error
    body — the Mini-App already treats 503 as "daemon temporarily down".
    """
    headers: dict[str, str] = {"Host": "localhost"}
    if content_type:
        headers["Content-Type"] = content_type
    if body:
        headers["Content-Length"] = str(len(body))

    conn = UnixHTTPConnection(sock_path, timeout=timeout)
    try:
        conn.request(method, upstream_path, body=body or None, headers=headers)
        resp = conn.getresponse()
        data = resp.read()
        ctype = resp.getheader("Content-Type", "application/octet-stream")
        return resp.status, data, ctype
    except (FileNotFoundError, ConnectionRefusedError, OSError) as exc:
        log.warning("daemon proxy %s %s failed: %s", method, upstream_path, exc)
        body_503 = (
            b'{"jsonrpc":"2.0","id":null,"error":'
            b'{"code":503,"message":"daemon unavailable"}}'
        )
        return 503, body_503, "application/json"
    finally:
        try:
            conn.close()
        except Exception:
            pass


# ── HTTP handler ──────────────────────────────────────────────────────────
class WebAppHandler(http.server.SimpleHTTPRequestHandler):
    """Static handler for ``DIST_DIR`` with two proxied API endpoints.

    Class-level configuration is injected by :func:`make_handler_class`
    so we can keep ``ThreadingHTTPServer``'s "handler is a class" contract
    while still passing per-instance config (socket path, dist dir).
    """

    daemon_sock_path: str = DEFAULT_SOCK
    # SimpleHTTPRequestHandler reads ``self.directory`` in __init__ (3.7+);
    # we set it via the dist_dir kwarg below.

    # ── routing ──
    def do_POST(self) -> None:  # noqa: N802 (BaseHTTPRequestHandler API)
        if self.path == "/api/rpc":
            self._proxy_rpc()
            return
        # No other POST endpoint exists; behave like nginx (405).
        self.send_error(405, "method not allowed")

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/healthz":
            self._proxy_health()
            return
        # Anything else → static file from DIST_DIR.
        super().do_GET()

    def do_HEAD(self) -> None:  # noqa: N802
        if self.path in ("/api/rpc", "/api/healthz"):
            self.send_error(405, "method not allowed")
            return
        super().do_HEAD()

    # ── proxies ──
    def _proxy_rpc(self) -> None:
        length_hdr = self.headers.get("Content-Length")
        try:
            length = int(length_hdr) if length_hdr is not None else 0
        except ValueError:
            self.send_error(400, "bad content-length")
            return
        if length < 0 or length > MAX_BODY:
            self.send_error(413, "payload too large")
            return
        body = self.rfile.read(length) if length else b""
        ctype = self.headers.get("Content-Type", "application/json")

        status, resp_body, resp_ctype = _proxy_to_daemon(
            method="POST",
            upstream_path="/rpc",
            body=body,
            sock_path=self.daemon_sock_path,
            timeout=RPC_TIMEOUT,
            content_type=ctype,
        )
        self._write_response(status, resp_body, resp_ctype)

    def _proxy_health(self) -> None:
        status, resp_body, resp_ctype = _proxy_to_daemon(
            method="GET",
            upstream_path="/healthz",
            body=b"",
            sock_path=self.daemon_sock_path,
            timeout=HEALTH_TIMEOUT,
            content_type=None,
        )
        self._write_response(status, resp_body, resp_ctype)

    def _write_response(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        # Match the security headers nginx emits in govless-webapp.conf.
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        self.end_headers()
        if body:
            self.wfile.write(body)

    # ── static-file overrides ──
    def end_headers(self) -> None:
        """Mirror the CSP and nosniff headers nginx emits for ``/app/``.

        Only emitted for static responses (proxied API responses set their
        own headers via ``_write_response``).
        """
        # SimpleHTTPRequestHandler calls end_headers() once per static reply.
        # We add the headers here so both index.html and assets pick them up.
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        # Post-052: mirror Pro nginx (govless-webapp.conf) Cache-Control.
        # The Mini App is updated frequently during RC; clients must not
        # serve a stale shell that points at an old /api/rpc shape.
        self.send_header("Cache-Control", "no-store")
        # CSP mirrors govless-webapp.conf (Pro mode). The design canvas is a
        # preview-only React+Babel page, so it gets a slightly wider CSP scoped
        # to /design/ while the production Mini App stays locked down.
        csp = DESIGN_CSP if self.path.startswith("/design/") else WEBAPP_CSP
        self.send_header("Content-Security-Policy", csp)
        super().end_headers()

    # ── access log ──
    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        # Route into our logger so journald sees structured output.
        log.info("%s - %s", self.address_string(), fmt % args)


def make_handler_class(dist_dir: str, sock_path: str) -> type:
    """Build a per-server handler class bound to a dist dir + socket."""

    class _Bound(WebAppHandler):
        def __init__(self, *a, **kw) -> None:
            # SimpleHTTPRequestHandler accepts directory= in 3.7+.
            super().__init__(*a, directory=dist_dir, **kw)

    _Bound.daemon_sock_path = sock_path
    _Bound.__name__ = "GoVLESSWebAppHandler"
    return _Bound


# ── server bootstrap ──────────────────────────────────────────────────────
class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def serve(host: str, port: int, dist_dir: str, sock_path: str) -> int:
    if not os.path.isdir(dist_dir):
        log.error("dist dir does not exist: %s", dist_dir)
        return 2
    handler_cls = make_handler_class(dist_dir, sock_path)
    server = ThreadingHTTPServer((host, port), handler_cls)
    log.info(
        "goVLESS webapp listening on http://%s:%d (dist=%s, rpc-sock=%s)",
        host, port, dist_dir, sock_path,
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("interrupted")
        return 130
    finally:
        server.server_close()
    return 0


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="goVLESS WebApp server (Lite)")
    parser.add_argument("--host", default=DEFAULT_HOST)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--dist", default=DEFAULT_DIST,
                        help="directory containing index.html, app.js, style.css")
    parser.add_argument("--sock", default=DEFAULT_SOCK,
                        help="path to govlessctl UNIX socket")
    parser.add_argument("--log-level", default="INFO")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    return serve(args.host, args.port, args.dist, args.sock)


if __name__ == "__main__":
    sys.exit(main())
