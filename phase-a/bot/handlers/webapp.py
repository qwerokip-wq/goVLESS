"""
WebApp menu-button watcher.

Background task: every 30s, check mtime of the quick and named tunnel URL
files; on change, fetch the current URL via `tunnel.url_get` RPC, then call
`bot.set_chat_menu_button(chat_id=admin, menu_button=MenuButtonWebApp(...))`
for every admin and send them a short notification.

Also exposes `apply_menu_buttons_once(bot)` which is called on bot startup so
the menu button reflects the current tunnel URL right away.

inotify is preferred when available but pyinotify isn't a hard dep — we fall
back to polling mtime.

Note (Codex 049 → 050 architect revert): the gate that limited
MenuButtonWebApp to Pro only is gone. In Lite the Mini App is now served
by /opt/govless/webapp/server.py (stdlib HTTP + UNIX-socket RPC proxy),
so /api/rpc actually works through the Cloudflare tunnel. We still keep
the `source` field so logging shows where the URL came from.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import os
from typing import Optional

from aiogram import Bot
from aiogram.types import MenuButtonCommands, MenuButtonWebApp, WebAppInfo

from common import CONFIG, get_rpc
from rpc import RpcError, RpcTransportError

LOG = logging.getLogger(__name__)

TUNNEL_URL_PATHS = ("/run/govless/tunnel.url", "/run/govless/tunnel.url.named")
POLL_INTERVAL_SECONDS = 30.0


def _mtimes() -> tuple[Optional[float], ...]:
    out: list[Optional[float]] = []
    for path in TUNNEL_URL_PATHS:
        try:
            out.append(os.path.getmtime(path))
        except FileNotFoundError:
            out.append(None)
        except OSError as exc:
            LOG.debug("%s stat error: %s", path, exc)
            out.append(None)
    return tuple(out)


async def _fetch_current_url() -> Optional[tuple[str, str]]:
    """Return (url, source) or None. source ∈ {pro, quick, named, none}.

    `source` is informational only (used for log lines / future telemetry).
    Both Pro (nginx) and Lite (server.py RPC proxy) can serve the Mini App
    end-to-end, so we no longer gate the Telegram menu button on it.
    """
    try:
        res = await get_rpc().call("tunnel.url_get", {})
    except (RpcError, RpcTransportError) as exc:
        LOG.debug("tunnel.url_get failed: %s", exc)
        return None
    if not isinstance(res, dict):
        return None
    url = res.get("url")
    source = res.get("source") or "none"
    if not isinstance(url, str) or not url:
        return None
    return (url, source)


async def _apply_for_url(bot: Bot, url_info: Optional[tuple[str, str]]) -> None:
    """Set the Telegram menu button.

    Any non-empty tunnel URL gets MenuButtonWebApp — Lite and Pro both serve
    /api/rpc now (Lite via the webapp-frontend.service proxy in server.py,
    Pro via nginx). No tunnel URL → MenuButtonCommands as a fallback so the
    user still has a way into the bot via slash commands.
    """
    if not CONFIG.admin_ids:
        return
    if url_info is not None:
        url, source = url_info
        # Security (post-052): do NOT log the full tunnel URL — journal is
        # often readable by groups outside govless. Log a short sha256
        # fingerprint so we can still correlate URL changes across the
        # bot + govless-tunnel-url-extract logs without leaking the URL.
        url_fp = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
        LOG.info("setting WebApp menu button: source=%s url_fp=%s", source, url_fp)
        button = MenuButtonWebApp(text="Open app", web_app=WebAppInfo(url=url))
    else:
        # No active tunnel → bot inline buttons only.
        button = MenuButtonCommands()
    for tg_id in list(CONFIG.admin_ids):
        try:
            await bot.set_chat_menu_button(chat_id=tg_id, menu_button=button)
        except Exception as exc:  # noqa: BLE001
            LOG.warning("set_chat_menu_button for %s failed: %s", tg_id, exc)


async def apply_menu_buttons_once(bot: Bot) -> None:
    """Called on startup. Best-effort, never raises."""
    try:
        url_info = await _fetch_current_url()
        await _apply_for_url(bot, url_info)
    except Exception as exc:  # noqa: BLE001
        LOG.warning("initial menu button apply failed: %s", exc)


async def tunnel_watcher(bot: Bot) -> None:
    """
    Long-running background task. Polls mtime; on change, applies new URL to
    every admin and notifies them.
    """
    last_mtimes = _mtimes()
    LOG.info("tunnel_watcher started; initial mtimes=%s", last_mtimes)
    while True:
        try:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
        except asyncio.CancelledError:
            LOG.info("tunnel_watcher cancelled")
            return

        cur = _mtimes()
        if cur == last_mtimes:
            continue
        last_mtimes = cur

        url_info = await _fetch_current_url()
        await _apply_for_url(bot, url_info)

        # url_info is (url, source) or None. Show source so admins can tell
        # quick-tunnel vs named-tunnel vs pro nginx apart at a glance.
        if url_info is not None:
            url, source = url_info
            url_fp = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
            msg = (
                f"🔄 Tunnel URL updated ({source}).\n"
                f"Menu button refreshed. URL fp: <code>sha256:{url_fp}</code>"
            )
        else:
            msg = "🔌 Tunnel URL cleared (no active tunnel)."
        for tg_id in list(CONFIG.admin_ids):
            try:
                await bot.send_message(tg_id, msg, parse_mode="HTML")
            except Exception as exc:  # noqa: BLE001
                LOG.debug("notify %s failed: %s", tg_id, exc)
