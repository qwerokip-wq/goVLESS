"""
Shared bot state: config, RPC client singleton, admin allowlist, rate limiter,
pending-confirm registry, and the @admin_only decorator.

Imported by handlers/* and bot.py. No aiogram-side-effects at import time
(safe to `import bot` without BOT_TOKEN set).
"""

from __future__ import annotations

import asyncio
import functools
import html
import logging
import os
import time
from collections import defaultdict, deque
from typing import Any, Awaitable, Callable, Deque, Dict, Optional, Set, Tuple

from rpc import GovlessRpcClient, reset_current_tg_id, set_current_tg_id

LOG = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------


class Config:
    """Loaded from environment (systemd EnvironmentFile=/etc/govless/bot.env)."""

    def __init__(self) -> None:
        self.bot_token: str = os.environ.get("BOT_TOKEN", "").strip()
        self.admin_claim_token: str = os.environ.get("ADMIN_CLAIM_TOKEN", "").strip()
        self.webapp_auth_ttl: int = int(os.environ.get("WEBAPP_AUTH_TTL", "86400"))
        raw_admins = os.environ.get("ADMIN_IDS", "").strip()
        self.admin_ids: Set[int] = set()
        if raw_admins:
            for tok in raw_admins.replace(",", " ").split():
                tok = tok.strip().strip('"').strip("'")
                if not tok:
                    continue
                try:
                    self.admin_ids.add(int(tok))
                except ValueError:
                    LOG.warning("ignoring non-int ADMIN_IDS entry: %r", tok)

    def reload_admins(self, new_ids: Set[int]) -> None:
        self.admin_ids = set(new_ids)


CONFIG = Config()


# ---------------------------------------------------------------------------
# RPC client singleton
# ---------------------------------------------------------------------------


_RPC: Optional[GovlessRpcClient] = None


def get_rpc() -> GovlessRpcClient:
    global _RPC
    if _RPC is None:
        _RPC = GovlessRpcClient()
    return _RPC


async def close_rpc() -> None:
    global _RPC
    if _RPC is not None:
        await _RPC.close()
        _RPC = None


# ---------------------------------------------------------------------------
# Admin check
# ---------------------------------------------------------------------------


def is_admin(user_id: Optional[int]) -> bool:
    return user_id is not None and user_id in CONFIG.admin_ids


def admin_only(handler: Callable[..., Awaitable[Any]]) -> Callable[..., Awaitable[Any]]:
    """
    Decorator that rejects non-admin users for callback_query / message handlers.

    Works with either aiogram CallbackQuery or Message as the first arg.
    """

    @functools.wraps(handler)
    async def wrapper(event, *args, **kwargs):
        user = getattr(event, "from_user", None)
        uid = getattr(user, "id", None) if user else None
        if not is_admin(uid):
            # Best-effort polite rejection; works for both types.
            try:
                if hasattr(event, "answer") and hasattr(event, "data"):
                    # CallbackQuery
                    await event.answer("Not authorized.", show_alert=True)
                elif hasattr(event, "answer"):
                    # Message
                    await event.answer("Not authorized.")
            except Exception as exc:  # noqa: BLE001
                LOG.debug("admin_only reject failed: %s", exc)
            return None
        token = set_current_tg_id(uid)
        try:
            return await handler(event, *args, **kwargs)
        finally:
            reset_current_tg_id(token)

    return wrapper


# ---------------------------------------------------------------------------
# Rate limit: in-process per user_id. Message commands stay conservative;
# inline callback navigation gets a larger bucket so normal menu use does not
# lock an admin out during a quick walkthrough.
# ---------------------------------------------------------------------------


class RateLimiter:
    MESSAGE_PER_MINUTE = 10
    MESSAGE_PER_HOUR = 100
    MESSAGE_COOLDOWN_SECONDS = 5 * 60

    CALLBACK_PER_MINUTE = 30
    CALLBACK_PER_HOUR = 300
    CALLBACK_COOLDOWN_SECONDS = 45

    # Backward-compatible aliases for callers/tests that use the old names.
    PER_MINUTE = MESSAGE_PER_MINUTE
    PER_HOUR = MESSAGE_PER_HOUR
    COOLDOWN_SECONDS = MESSAGE_COOLDOWN_SECONDS

    def __init__(self) -> None:
        self._events: Dict[Tuple[int, str], Deque[float]] = defaultdict(deque)
        self._cooldown_until: Dict[Tuple[int, str], float] = {}

    def check(
        self, user_id: int, *, scope: str = "message"
    ) -> Tuple[bool, Optional[int]]:
        """
        Returns (allowed, retry_after_seconds).
        Records the event on allowed=True.
        """
        bucket = "callback" if scope == "callback" else "message"
        per_minute = (
            self.CALLBACK_PER_MINUTE
            if bucket == "callback"
            else self.MESSAGE_PER_MINUTE
        )
        per_hour = (
            self.CALLBACK_PER_HOUR
            if bucket == "callback"
            else self.MESSAGE_PER_HOUR
        )
        cooldown = (
            self.CALLBACK_COOLDOWN_SECONDS
            if bucket == "callback"
            else self.MESSAGE_COOLDOWN_SECONDS
        )
        key = (user_id, bucket)
        now = time.time()
        cd = self._cooldown_until.get(key, 0.0)
        if cd > now:
            return False, int(cd - now)

        dq = self._events[key]
        # Drop events older than 1 hour.
        while dq and now - dq[0] > 3600:
            dq.popleft()
        last_min = sum(1 for ts in dq if now - ts <= 60)
        if last_min >= per_minute or len(dq) >= per_hour:
            self._cooldown_until[key] = now + cooldown
            return False, cooldown
        dq.append(now)
        return True, None


RATE_LIMITER = RateLimiter()


def format_retry_after(seconds: int) -> str:
    if seconds <= 0:
        return "a moment"
    if seconds < 60:
        return f"{seconds}s"
    minutes = (seconds + 59) // 60
    return f"~{minutes} min"


def _fmt_result_value(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    return "" if value is None else str(value)


def format_rpc_result_for_chat(result: Any) -> str:
    """Return optional HTML details for a successful typed-confirm result."""
    if not result:
        return ""
    if isinstance(result, dict):
        public = {
            str(k): v
            for k, v in result.items()
            if k not in {"confirm_token", "token"}
        }
        if not public or public == {"ok": True}:
            return ""
        if public.get("new_sub_url"):
            return (
                "\nNew subscription URL:\n"
                f"<code>{html.escape(_fmt_result_value(public['new_sub_url']))}</code>"
            )
        lines = ["\nResult:"]
        for key, value in public.items():
            if key == "ok" and value is True:
                continue
            lines.append(
                f"{html.escape(key)}: "
                f"<code>{html.escape(_fmt_result_value(value))}</code>"
            )
        return "\n".join(lines) if len(lines) > 1 else ""
    return f"\nResult:\n<code>{html.escape(_fmt_result_value(result))}</code>"


# ---------------------------------------------------------------------------
# Pending typed-confirm registry. 60s TTL.
# ---------------------------------------------------------------------------


class PendingConfirm:
    """
    user_id -> (action_name, expected_string, expiry_ts, params_for_rpc)

    Pruned by per-entry asyncio task scheduled on register.
    """

    TTL_SECONDS = 60

    def __init__(self) -> None:
        self._store: Dict[int, Tuple[str, str, float, Dict[str, Any]]] = {}
        self._tasks: Dict[int, asyncio.Task] = {}

    def register(
        self,
        user_id: int,
        action: str,
        expected: str,
        params: Dict[str, Any],
    ) -> float:
        expiry = time.time() + self.TTL_SECONDS
        self._store[user_id] = (action, expected, expiry, params)
        # Cancel any prior expiry task; schedule a fresh one.
        old = self._tasks.pop(user_id, None)
        if old and not old.done():
            old.cancel()
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
        if loop is not None:
            self._tasks[user_id] = loop.create_task(self._expire(user_id))
        return expiry

    async def _expire(self, user_id: int) -> None:
        try:
            await asyncio.sleep(self.TTL_SECONDS)
        except asyncio.CancelledError:
            return
        cur = self._store.get(user_id)
        if cur and cur[2] <= time.time() + 0.1:
            self._store.pop(user_id, None)
            self._tasks.pop(user_id, None)

    def get(self, user_id: int) -> Optional[Tuple[str, str, float, Dict[str, Any]]]:
        cur = self._store.get(user_id)
        if not cur:
            return None
        if cur[2] < time.time():
            self._store.pop(user_id, None)
            return None
        return cur

    def clear(self, user_id: int) -> None:
        self._store.pop(user_id, None)
        t = self._tasks.pop(user_id, None)
        if t and not t.done():
            t.cancel()


PENDING = PendingConfirm()
