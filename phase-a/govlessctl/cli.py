#!/usr/bin/env python3
"""govlessctl CLI — thin client that POSTs JSON-RPC over UNIX socket.

Usage:
    govlessctl <method> [--arg key=val ...] [--format json|text]

Examples:
    govlessctl system.status
    govlessctl client.add --arg name=alice --arg traffic_limit=50
    govlessctl client.delete --arg uuid=<u> --arg confirm="DELETE alice"
"""
from __future__ import annotations

import argparse
import json
import socket
import sys
from typing import Any


SOCKET_PATH = "/run/govlessctl.sock"


def _parse_arg(s: str) -> tuple[str, Any]:
    if "=" not in s:
        raise SystemExit(f"--arg requires key=value, got: {s!r}")
    k, _, v = s.partition("=")
    k = k.strip()
    if not k:
        raise SystemExit(f"--arg key empty in: {s!r}")
    # Try JSON parse for ints/bools/dicts; else keep string.
    try:
        return k, json.loads(v)
    except (ValueError, TypeError):
        return k, v


def post_rpc(method: str, params: dict, socket_path: str = SOCKET_PATH) -> dict:
    body = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": 1,
        "caller": "local",
    }
    payload = json.dumps(body).encode("utf-8")
    request = (
        b"POST /rpc HTTP/1.1\r\n"
        b"Host: localhost\r\n"
        b"Content-Type: application/json\r\n"
        b"Content-Length: " + str(len(payload)).encode("ascii") + b"\r\n"
        b"Connection: close\r\n"
        b"\r\n"
        + payload
    )

    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.settimeout(60)
    try:
        sock.connect(socket_path)
    except FileNotFoundError:
        raise SystemExit(f"govlessctl socket not found: {socket_path} (is the daemon running?)")
    except PermissionError:
        raise SystemExit(f"permission denied opening {socket_path} (need group govless or root)")

    try:
        sock.sendall(request)
        chunks: list[bytes] = []
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            chunks.append(chunk)
        raw = b"".join(chunks)
    finally:
        sock.close()

    # Split headers / body
    sep = b"\r\n\r\n"
    idx = raw.find(sep)
    if idx < 0:
        raise SystemExit(f"malformed HTTP response: {raw[:200]!r}")
    headers = raw[:idx].decode("iso-8859-1", errors="replace")
    body_raw = raw[idx + len(sep) :]

    # Transfer-Encoding: chunked? aiohttp tends to use Content-Length, but be defensive.
    if "transfer-encoding: chunked" in headers.lower():
        body_raw = _dechunk(body_raw)

    try:
        return json.loads(body_raw.decode("utf-8", errors="replace"))
    except ValueError as e:
        raise SystemExit(f"non-JSON response: {e}\n{body_raw[:500]!r}")


def _dechunk(data: bytes) -> bytes:
    out = bytearray()
    i = 0
    while i < len(data):
        nl = data.find(b"\r\n", i)
        if nl < 0:
            break
        size_str = data[i:nl].split(b";", 1)[0].strip()
        try:
            size = int(size_str, 16)
        except ValueError:
            break
        if size == 0:
            break
        start = nl + 2
        out.extend(data[start : start + size])
        i = start + size + 2  # skip trailing CRLF
    return bytes(out)


def format_text(value: Any) -> str:
    if isinstance(value, list):
        if not value:
            return "(empty list)"
        if all(isinstance(v, dict) for v in value):
            # column-aligned table from first record's keys
            keys = list(value[0].keys())
            rows = [keys] + [
                [str(r.get(k, "")) for k in keys] for r in value
            ]
            widths = [max(len(row[i]) for row in rows) for i in range(len(keys))]
            return "\n".join(
                "  ".join(cell.ljust(widths[i]) for i, cell in enumerate(row)) for row in rows
            )
        return "\n".join(str(v) for v in value)
    if isinstance(value, dict):
        return "\n".join(f"{k}: {v}" for k, v in value.items())
    return str(value)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(
        prog="govlessctl",
        description="Thin client for govlessctl JSON-RPC daemon",
    )
    p.add_argument("method", help="RPC method (e.g. system.status, client.list)")
    p.add_argument("--arg", action="append", default=[], metavar="KEY=VAL",
                   help="parameter, repeatable. Values JSON-parsed if possible.")
    p.add_argument("--format", choices=("json", "text"), default="text",
                   help="output format (default: text)")
    p.add_argument("--socket", default=SOCKET_PATH, help="UNIX socket path")
    args = p.parse_args(argv)

    params: dict = {}
    for a in args.arg:
        k, v = _parse_arg(a)
        params[k] = v

    response = post_rpc(args.method, params, socket_path=args.socket)

    if "error" in response:
        err = response["error"]
        if args.format == "json":
            print(json.dumps(response, ensure_ascii=False, indent=2))
        else:
            print(f"ERROR {err.get('code')}: {err.get('message')}", file=sys.stderr)
        return 1

    result = response.get("result")
    if args.format == "json":
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(format_text(result))
    return 0


if __name__ == "__main__":
    sys.exit(main())
