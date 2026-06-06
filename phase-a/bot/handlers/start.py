"""
/start command and /help command.

If user is admin: render main menu.
If user is not admin and no admin claimed yet: instructions to use /admin <token>.
Otherwise: tell the user to ask an admin to /invite them.
"""

from __future__ import annotations

import logging

from aiogram import Bot, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import Message

from common import CONFIG, get_rpc, is_admin
from rpc import RpcError, RpcTransportError

from handlers import webapp as h_webapp
from handlers.menu import render_main_menu

LOG = logging.getLogger(__name__)

router = Router(name="start")


@router.message(CommandStart())
async def cmd_start(message: Message, bot: Bot) -> None:
    user = message.from_user
    if user is None:
        return
    uid = user.id

    if is_admin(uid):
        await h_webapp.apply_menu_buttons_once(bot)
        await render_main_menu(message)
        return

    # Not an admin. Check if any admin exists.
    admins: list = []
    try:
        admins = await get_rpc().call("admin.list", {})
        if not isinstance(admins, list):
            admins = []
    except (RpcError, RpcTransportError) as exc:
        LOG.warning("admin.list failed: %s", exc)

    if str(uid) in {str(admin_id) for admin_id in admins}:
        CONFIG.admin_ids.add(uid)
        await h_webapp.apply_menu_buttons_once(bot)
        await render_main_menu(message)
        return

    if not admins and not CONFIG.admin_ids:
        await message.answer(
            "Бот ещё не привязан к администратору.\n"
            "Используй одноразовую команду из установщика:\n"
            "<code>/admin &lt;ADMIN_CLAIM_TOKEN&gt;</code>\n\n"
            f"Твой Telegram ID: <code>{uid}</code>",
            parse_mode="HTML",
        )
    else:
        await message.answer(
            "You are not authorized to use this bot.\n"
            "Ask an existing admin to run <code>/invite</code> with your "
            f"Telegram ID: <code>{uid}</code>",
            parse_mode="HTML",
        )


@router.message(Command("help"))
async def cmd_help(message: Message) -> None:
    text = (
        "<b>goVLESS bot commands</b>\n"
        "/start — main menu (admins) or status (others)\n"
        "/admin &lt;token&gt; — claim the first admin slot\n"
        "/invite &lt;tg_id&gt; — add another admin (admins only)\n"
        "/audit [N] — last N audit entries (default 20)\n"
        "/addclient name [traffic_gb] [days] — add a VPN client\n"
        "/setlimit client traffic_gb — set traffic limit\n"
        "/setexpiry client days — set expiry from today\n"
        "/help — this message\n"
    )
    await message.answer(text, parse_mode="HTML")
