"""
Admin-related commands: /admin <token>, /invite <tg_id>, /audit [N].
"""

from __future__ import annotations

import logging
import html
import time
from datetime import datetime, timezone

from aiogram import Bot, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message

from common import CONFIG, admin_only, get_rpc, is_admin
from handlers import webapp as h_webapp
from rpc import RpcError, RpcTransportError

LOG = logging.getLogger(__name__)

router = Router(name="admin")


@router.message(Command("admin"))
async def cmd_admin_claim(message: Message, command: CommandObject, bot: Bot) -> None:
    user = message.from_user
    if user is None:
        return
    token = (command.args or "").strip()
    if not token:
        await message.answer("Usage: <code>/admin &lt;token&gt;</code>", parse_mode="HTML")
        return
    try:
        await get_rpc().call(
            "admin.claim",
            {"token": token, "tg_id": user.id},
        )
    except RpcError as exc:
        if exc.code == 409:
            await message.answer("Admin is already claimed.")
        elif exc.code in (401, 403):
            await message.answer("Invalid claim token.")
        else:
            await message.answer(f"Claim failed: {exc.message}")
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {exc}")
        return

    CONFIG.admin_ids.add(user.id)
    await h_webapp.apply_menu_buttons_once(bot)
    await message.answer(
        "You are now the primary admin. Send /start to open the menu."
    )


@router.message(Command("invite"))
@admin_only
async def cmd_invite(message: Message, command: CommandObject, bot: Bot) -> None:
    arg = (command.args or "").strip()
    if not arg:
        await message.answer(
            "Usage: <code>/invite &lt;tg_id&gt;</code>", parse_mode="HTML"
        )
        return
    try:
        new_id = int(arg.split()[0])
    except ValueError:
        await message.answer("tg_id must be an integer.")
        return
    try:
        await get_rpc().call("admin.invite", {"tg_id": new_id})
    except RpcError as exc:
        await message.answer(f"Invite failed: {exc.message}")
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {exc}")
        return

    CONFIG.admin_ids.add(new_id)
    await h_webapp.apply_menu_buttons_once(bot)
    await message.answer(f"Admin <code>{new_id}</code> added.", parse_mode="HTML")


@router.message(Command("audit"))
@admin_only
async def cmd_audit(message: Message, command: CommandObject) -> None:
    raw = (command.args or "").strip()
    limit = 20
    if raw:
        try:
            limit = max(1, min(200, int(raw.split()[0])))
        except ValueError:
            await message.answer("Usage: <code>/audit [N]</code>", parse_mode="HTML")
            return
    try:
        rows = await get_rpc().call("audit.tail", {"limit": limit})
    except RpcError as exc:
        await message.answer(f"Audit failed: {exc.message}")
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {exc}")
        return

    if not rows:
        await message.answer("No audit entries.")
        return

    lines = [f"<b>Last {len(rows)} audit entries</b>"]
    for row in rows:
        ts = row.get("ts")
        when = "?"
        if isinstance(ts, (int, float)):
            when = datetime.fromtimestamp(ts, tz=timezone.utc).strftime(
                "%Y-%m-%d %H:%M:%S UTC"
            )
        admin_tg = html.escape(str(row.get("admin_tg", "?")))
        action = html.escape(str(row.get("action", "?")))
        target = html.escape(str(row.get("target", "")))
        lines.append(f"<code>{when}</code> tg={admin_tg} {action} {target}")
    # Telegram limit 4096 chars; chunk if needed.
    body = "\n".join(lines)
    while body:
        await message.answer(body[:4000], parse_mode="HTML")
        body = body[4000:]


_ = time  # silence unused-import if optimizer ever drops it
