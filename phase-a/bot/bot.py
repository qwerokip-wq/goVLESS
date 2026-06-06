"""
goVLESS Telegram bot — aiogram v3, polling mode (v1).

Env (loaded from /etc/govless/bot.env via systemd EnvironmentFile):
  BOT_TOKEN           — required, refuse to start if empty
  ADMIN_IDS           — comma/space separated tg user ids
  ADMIN_CLAIM_TOKEN   — first-admin claim secret (forwarded to govlessctl)
  WEBAPP_AUTH_TTL     — seconds, default 86400

Module import has NO side effects beyond logging config; only `main()`
validates BOT_TOKEN, so `import bot` works for tests without a token.
"""

from __future__ import annotations

import asyncio
import logging
import sys
from typing import Any, Awaitable, Callable, Dict

# stdlib + third-party imports must succeed even when offline; aiogram is
# mandatory but only at runtime — guarded so unit tests can mock it.
try:
    from aiogram import Bot, Dispatcher, BaseMiddleware
    from aiogram.client.default import DefaultBotProperties
    from aiogram.enums import ParseMode
    from aiogram.types import BotCommand, TelegramObject, Update
except Exception:  # noqa: BLE001
    Bot = None  # type: ignore[assignment]
    Dispatcher = None  # type: ignore[assignment]
    BaseMiddleware = object  # type: ignore[assignment]
    DefaultBotProperties = None  # type: ignore[assignment]
    ParseMode = None  # type: ignore[assignment]
    BotCommand = None  # type: ignore[assignment]
    TelegramObject = object  # type: ignore[assignment]
    Update = object  # type: ignore[assignment]

from common import CONFIG, RATE_LIMITER, close_rpc, format_retry_after, get_rpc
from handlers import admin as h_admin
from handlers import clients as h_clients
from handlers import confirm as h_confirm
from handlers import menu as h_menu
from handlers import start as h_start
from handlers import webapp as h_webapp

LOG = logging.getLogger("govless.bot")


# ---------------------------------------------------------------------------
# Rate-limit middleware
# ---------------------------------------------------------------------------


class RateLimitMiddleware(BaseMiddleware):  # type: ignore[misc]
    """Apply per-user rate limits to messages and callback queries."""

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        user = getattr(event, "from_user", None)
        uid = getattr(user, "id", None) if user else None
        if uid is None:
            return await handler(event, data)

        is_callback = hasattr(event, "data")
        allowed, retry_after = RATE_LIMITER.check(
            uid, scope="callback" if is_callback else "message"
        )
        if allowed:
            return await handler(event, data)

        wait = format_retry_after(retry_after or 0)
        try:
            if is_callback:
                await event.answer(  # type: ignore[attr-defined]
                    f"Too many taps. Try again in {wait}.",
                    show_alert=True,
                )
            elif hasattr(event, "answer"):
                await event.answer(  # type: ignore[attr-defined]
                    f"⏱ Rate limit hit. Try again in {wait}."
                )
        except Exception as exc:  # noqa: BLE001
            LOG.debug("rate-limit reply failed: %s", exc)
        return None


# ---------------------------------------------------------------------------
# Wiring
# ---------------------------------------------------------------------------


def build_dispatcher() -> "Dispatcher":
    """Construct the Dispatcher with all routers + middleware."""
    if Dispatcher is None:
        raise RuntimeError("aiogram not installed")
    dp = Dispatcher()
    dp.message.middleware(RateLimitMiddleware())
    dp.callback_query.middleware(RateLimitMiddleware())

    # Order matters: confirm must be registered AFTER specific command/callback
    # handlers, because its catch-all message filter would otherwise eat them.
    dp.include_router(h_start.router)
    dp.include_router(h_admin.router)
    dp.include_router(h_menu.router)
    dp.include_router(h_clients.router)
    dp.include_router(h_confirm.router)

    # Any handler error (esp. a stale >48h callback where call.message is None
    # -> AttributeError) must give the user feedback, not a silent spinner.
    async def _on_handler_error(event: Any) -> bool:
        exc = getattr(event, "exception", None)
        upd = getattr(event, "update", None)
        cq = getattr(upd, "callback_query", None) if upd is not None else None
        if cq is not None:
            try:
                await cq.answer("Меню устарело — отправьте /start. / Menu expired — send /start.", show_alert=True)
            except Exception:
                pass
        LOG.warning("bot handler error: %r", exc)
        return True
    dp.errors.register(_on_handler_error)

    return dp


async def _set_default_commands(bot: "Bot") -> None:
    commands = [
        BotCommand(command="start", description="Main menu / status"),
        BotCommand(command="admin", description="Claim first admin"),
        BotCommand(command="invite", description="Invite an admin by tg_id"),
        BotCommand(command="audit", description="Show last audit entries"),
        BotCommand(command="menu", description="Open inline menu"),
        BotCommand(command="addclient", description="Add a client"),
        BotCommand(command="setlimit", description="Set client traffic limit"),
        BotCommand(command="setexpiry", description="Set client expiry"),
        BotCommand(command="help", description="Help"),
    ]
    try:
        await bot.set_my_commands(commands)
    except Exception as exc:  # noqa: BLE001
        LOG.warning("set_my_commands failed: %s", exc)


async def _load_persisted_admins() -> None:
    try:
        admins = await get_rpc().call("admin.list", {})
    except Exception as exc:  # noqa: BLE001
        LOG.warning("admin.list preload failed: %s", exc)
        return
    loaded: set[int] = set(CONFIG.admin_ids)
    if isinstance(admins, list):
        for admin_id in admins:
            try:
                loaded.add(int(admin_id))
            except (TypeError, ValueError):
                LOG.warning("ignoring non-int persisted admin id: %r", admin_id)
    CONFIG.reload_admins(loaded)


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


async def _async_main() -> int:
    if not CONFIG.bot_token:
        sys.stderr.write(
            "BOT_TOKEN not set in /etc/govless/bot.env — create a bot via "
            "@BotFather and paste the token, then "
            "`systemctl restart govless-bot`.\n"
        )
        return 2

    if Bot is None or Dispatcher is None:
        sys.stderr.write("aiogram is not installed. `pip install aiogram>=3`\n")
        return 3

    default_props = (
        DefaultBotProperties(parse_mode=ParseMode.HTML)
        if DefaultBotProperties is not None
        else None
    )
    bot = Bot(token=CONFIG.bot_token, default=default_props)
    dp = build_dispatcher()

    await _load_persisted_admins()
    await _set_default_commands(bot)
    await h_webapp.apply_menu_buttons_once(bot)

    watcher_task = asyncio.create_task(h_webapp.tunnel_watcher(bot))

    LOG.info("goVLESS bot starting polling. admins=%s", sorted(CONFIG.admin_ids))
    try:
        await dp.start_polling(bot)
    finally:
        watcher_task.cancel()
        try:
            await watcher_task
        except (asyncio.CancelledError, Exception):  # noqa: BLE001
            pass
        try:
            await bot.session.close()
        except Exception:  # noqa: BLE001
            pass
        await close_rpc()

    return 0


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    try:
        return asyncio.run(_async_main())
    except KeyboardInterrupt:
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
