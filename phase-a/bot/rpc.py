"""
Async JSON-RPC client for govlessctl UNIX socket.

Sends `{"jsonrpc":"2.0","method":...,"params":...,"id":N,"caller":"local"}` to
`/run/govlessctl.sock` via aiohttp's UnixConnector. Retries 3 times with 5s
backoff on 503 (3X-UI unavailable). Returns parsed result, or raises RpcError
on protocol-level failures.
"""

from __future__ import annotations

import asyncio
import contextvars
import itertools
import json
import logging
from typing import Any, Dict, Optional

import aiohttp

LOG = logging.getLogger(__name__)
CURRENT_TG_ID: contextvars.ContextVar[Optional[int]] = contextvars.ContextVar(
    "govless_bot_tg_id", default=None
)

SOCKET_PATH = "/run/govlessctl.sock"
RPC_URL = "http://localhost/rpc"  # host part ignored when using UnixConnector
RETRY_COUNT = 3
RETRY_BACKOFF_SECONDS = 5.0
DEFAULT_TIMEOUT_SECONDS = 30.0


class RpcError(Exception):
    """Raised when govlessctl returns an error envelope."""

    def __init__(self, code: int, message: str, data: Any = None):
        super().__init__(f"[{code}] {message}")
        self.code = code
        self.message = message
        self.data = data


class RpcTransportError(Exception):
    """Raised when we cannot reach govlessctl at all."""


class GovlessRpcClient:
    """Reusable RPC client. Hold one per bot process."""

    def __init__(
        self,
        socket_path: str = SOCKET_PATH,
        timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
    ) -> None:
        self._socket_path = socket_path
        self._timeout = aiohttp.ClientTimeout(total=timeout_seconds)
        self._id_counter = itertools.count(1)
        self._session: Optional[aiohttp.ClientSession] = None
        self._lock = asyncio.Lock()

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            async with self._lock:
                if self._session is None or self._session.closed:
                    connector = aiohttp.UnixConnector(path=self._socket_path)
                    self._session = aiohttp.ClientSession(
                        connector=connector, timeout=self._timeout
                    )
        return self._session

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()
        self._session = None

    async def call(
        self,
        method: str,
        params: Optional[Dict[str, Any]] = None,
        *,
        caller: str = "local",
    ) -> Any:
        """Invoke an RPC method. Returns the unwrapped `result`."""
        req_id = next(self._id_counter)
        body = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params or {},
            "id": req_id,
            "caller": caller,
        }
        actor_tg_id = CURRENT_TG_ID.get()
        if caller == "local" and actor_tg_id is not None:
            body["tg_id"] = str(actor_tg_id)

        last_err: Optional[Exception] = None
        for attempt in range(1, RETRY_COUNT + 1):
            try:
                session = await self._get_session()
                async with session.post(
                    RPC_URL,
                    data=json.dumps(body).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                ) as resp:
                    text = await resp.text()
                    try:
                        payload = json.loads(text)
                    except json.JSONDecodeError as exc:
                        raise RpcTransportError(
                            f"non-JSON response (HTTP {resp.status}): {text[:200]}"
                        ) from exc

                    if "error" in payload and payload["error"] is not None:
                        err = payload["error"]
                        code = int(err.get("code", -1))
                        msg = err.get("message", "unknown error")
                        if code == 503 and attempt < RETRY_COUNT:
                            LOG.warning(
                                "rpc %s -> 503 (3X-UI down); retry %d/%d in %.1fs",
                                method,
                                attempt,
                                RETRY_COUNT,
                                RETRY_BACKOFF_SECONDS,
                            )
                            await asyncio.sleep(RETRY_BACKOFF_SECONDS)
                            continue
                        raise RpcError(code, msg, err.get("data"))

                    return payload.get("result")
            except RpcError:
                raise
            except (aiohttp.ClientError, OSError, asyncio.TimeoutError) as exc:
                last_err = exc
                LOG.warning(
                    "rpc %s transport error (attempt %d/%d): %s",
                    method,
                    attempt,
                    RETRY_COUNT,
                    exc,
                )
                if attempt < RETRY_COUNT:
                    await asyncio.sleep(RETRY_BACKOFF_SECONDS)
                    continue
                raise RpcTransportError(str(exc)) from exc

        # Should be unreachable; safety net.
        if last_err:
            raise RpcTransportError(str(last_err))
        raise RpcTransportError("rpc call exhausted retries without result")


def set_current_tg_id(tg_id: Optional[int]) -> contextvars.Token:
    return CURRENT_TG_ID.set(tg_id)


def reset_current_tg_id(token: contextvars.Token) -> None:
    CURRENT_TG_ID.reset(token)
