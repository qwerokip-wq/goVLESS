"""
Main Telegram menu.

The top level mirrors the SSH menu mental model:
  Proxy / VPN -> Users / Clients -> Manage -> About

The bot intentionally exposes only high-frequency, RPC-backed actions. Rare or
not-yet-safe operations are shown as SSH-only hints instead of fake buttons.
"""

from __future__ import annotations

import html
import logging
from typing import Any, List

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from common import admin_only, get_rpc
from handlers.confirm import start_confirm
from rpc import RpcError, RpcTransportError

LOG = logging.getLogger(__name__)

router = Router(name="menu")


def _esc(value: Any) -> str:
    return html.escape("" if value is None else str(value))


def _ok(value: Any) -> str:
    return "✅" if value else "❌"


def _code(value: Any) -> str:
    return f"<code>{_esc(value)}</code>"


def _main_menu_kb() -> InlineKeyboardMarkup:
    rows: List[List[InlineKeyboardButton]] = [
        [InlineKeyboardButton(text="🔌 Proxy / VPN", callback_data="m:vpn")],
        [InlineKeyboardButton(text="👥 Users / Clients", callback_data="m:cli")],
        [InlineKeyboardButton(text="🛠 Manage", callback_data="m:manage")],
        [InlineKeyboardButton(text="ℹ️ About", callback_data="m:about")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _main_nav_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🏠 Main menu", callback_data="m:main")]
        ]
    )


def _section_nav_rows() -> List[List[InlineKeyboardButton]]:
    return [[InlineKeyboardButton(text="🏠 Main menu", callback_data="m:main")]]


async def _status() -> dict[str, Any]:
    try:
        res = await get_rpc().call("system.status", {})
    except (RpcError, RpcTransportError) as exc:
        LOG.debug("system.status failed: %s", exc)
        return {"error": str(exc)}
    return res if isinstance(res, dict) else {}


async def _tunnel() -> dict[str, Any]:
    try:
        res = await get_rpc().call("tunnel.url_get", {})
    except (RpcError, RpcTransportError) as exc:
        LOG.debug("tunnel.url_get failed: %s", exc)
        return {"url": None, "source": "error"}
    return res if isinstance(res, dict) else {"url": None, "source": "none"}


def _main_text(status: dict[str, Any]) -> str:
    if status.get("error"):
        return (
            "<b>goVLESS</b>\n"
            "Control service is not reachable right now.\n\n"
            f"Error: {_code(status['error'])}"
        )

    return (
        "<b>goVLESS</b>\n"
        f"Mode: {_code(status.get('mode', '?'))} · "
        f"Transport: {_code(status.get('transport', '?'))}\n"
        f"3X-UI {_ok(status.get('xui_active'))}  "
        f"Xray {_ok(status.get('xray_active'))}  "
        f"Nginx {_ok(status.get('nginx_active'))}\n"
        f"Panel: {_code(status.get('panel_url', '?'))}\n\n"
        "Choose a section:"
    )


async def render_main_menu(target) -> None:
    """Render the main menu into a Message or edit a CallbackQuery message."""
    status = await _status()
    text = _main_text(status)
    kb = _main_menu_kb()
    if isinstance(target, CallbackQuery):
        msg = target.message
        if msg is not None:
            try:
                await msg.edit_text(text, parse_mode="HTML", reply_markup=kb)
                return
            except Exception as exc:  # noqa: BLE001
                LOG.debug("main menu edit failed; sending new message: %s", exc)
                await msg.answer(text, parse_mode="HTML", reply_markup=kb)
                return
    elif isinstance(target, Message):
        await target.answer(text, parse_mode="HTML", reply_markup=kb)


@router.message(Command("menu"))
@admin_only
async def cmd_menu(message: Message) -> None:
    await render_main_menu(message)


@router.callback_query(F.data.in_({"m:main", "m:back"}))
@admin_only
async def cb_main(call: CallbackQuery) -> None:
    await call.answer()
    await render_main_menu(call)


# ---------------------------------------------------------------------------
# Overview / status
# ---------------------------------------------------------------------------


@router.callback_query(F.data == "m:over")
@admin_only
async def cb_overview(call: CallbackQuery) -> None:
    await call.answer()
    status = await _status()
    if status.get("error"):
        await call.message.edit_text(  # type: ignore[union-attr]
            f"Could not fetch status: {_code(status['error'])}",
            parse_mode="HTML",
            reply_markup=_main_nav_kb(),
        )
        return

    text = (
        "<b>System status</b>\n"
        f"3X-UI: {_ok(status.get('xui_active'))}\n"
        f"Xray:  {_ok(status.get('xray_active'))}\n"
        f"Nginx: {_ok(status.get('nginx_active'))}\n"
        f"Mode:      {_code(status.get('mode', '?'))}\n"
        f"Transport: {_code(status.get('transport', '?'))}\n"
        f"Version:   {_code(status.get('version', '?'))}\n"
        f"Panel:     {_code(status.get('panel_url', '?'))}"
    )
    await call.message.edit_text(  # type: ignore[union-attr]
        text, parse_mode="HTML", reply_markup=_main_nav_kb()
    )


# ---------------------------------------------------------------------------
# Proxy / VPN
# ---------------------------------------------------------------------------


@router.callback_query(F.data == "m:vpn")
@admin_only
async def cb_vpn(call: CallbackQuery) -> None:
    await call.answer()
    status = await _status()
    try:
        inbounds = await get_rpc().call("inbound.list", {})
    except (RpcError, RpcTransportError) as exc:
        await call.message.edit_text(  # type: ignore[union-attr]
            f"<b>Proxy / VPN</b>\nCould not fetch inbounds: {_code(exc)}",
            parse_mode="HTML",
            reply_markup=_main_nav_kb(),
        )
        return

    lines = ["<b>Proxy / VPN</b>"]
    if not status.get("error"):
        lines.append(
            f"Mode: {_code(status.get('mode', '?'))} · "
            f"Transport: {_code(status.get('transport', '?'))}"
        )
        lines.append(
            f"3X-UI {_ok(status.get('xui_active'))}  "
            f"Xray {_ok(status.get('xray_active'))}"
        )

    if inbounds:
        lines.append("\n<b>Inbounds</b>")
        for ib in inbounds:
            on = "✅" if ib.get("enable") else "⏸"
            lines.append(
                f"{on} #{_esc(ib.get('id'))} :{_esc(ib.get('port'))} "
                f"{_esc(ib.get('protocol'))}/{_esc(ib.get('network'))} "
                f"{_esc(ib.get('security'))} · "
                f"{_esc(ib.get('client_count', 0))} clients"
            )
    else:
        lines.append("\nNo inbounds configured.")

    rows = [
        [InlineKeyboardButton(text="👥 Users, links and QR", callback_data="m:cli")],
        [InlineKeyboardButton(text="📊 Full status", callback_data="m:over")],
        [InlineKeyboardButton(text="🔁 Mode / template switch (SSH)", callback_data="m:ssh:mode")],
    ]
    rows.extend(_section_nav_rows())
    await call.message.edit_text(  # type: ignore[union-attr]
        "\n".join(lines),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
    )


# ---------------------------------------------------------------------------
# Manage
# ---------------------------------------------------------------------------


@router.callback_query(F.data == "m:manage")
@admin_only
async def cb_manage(call: CallbackQuery) -> None:
    await call.answer()
    rows = [
        [InlineKeyboardButton(text="🔐 Panel access", callback_data="m:panel")],
        [InlineKeyboardButton(text="🤖 Bot admins", callback_data="m:adm")],
        [InlineKeyboardButton(text="📜 Audit log", callback_data="sys:audit")],
        [InlineKeyboardButton(text="🧰 Repair (SSH)", callback_data="m:ssh:repair")],
        [InlineKeyboardButton(text="💾 Backup (SSH)", callback_data="m:ssh:backup")],
        [InlineKeyboardButton(text="⬆️ Update 3X-UI (SSH)", callback_data="m:ssh:update")],
        [InlineKeyboardButton(text="🗑 Remove (SSH)", callback_data="m:ssh:remove")],
    ]
    rows.extend(_section_nav_rows())
    await call.message.edit_text(  # type: ignore[union-attr]
        "<b>Manage</b>\n"
        "Daily actions are available here. Destructive or repair operations "
        "stay in SSH until their RPC path is fully safe.",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
    )


@router.callback_query(F.data.startswith("m:ssh:"))
@admin_only
async def cb_ssh_only(call: CallbackQuery) -> None:
    action = (call.data or "").split(":", 2)[-1]
    labels = {
        "mode": "mode / template switching",
        "repair": "repair",
        "backup": "backup",
        "update": "3X-UI update",
        "remove": "remove",
    }
    label = labels.get(action, action)
    await call.answer()
    await call.message.edit_text(  # type: ignore[union-attr]
        f"<b>{_esc(label).title()}</b>\n"
        "This operation is available in the SSH menu now.\n\n"
        "Telegram will expose it after the backend has a safe RPC flow, "
        "status reporting, and typed confirmation where needed.",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🛠 Back to Manage", callback_data="m:manage")],
                [InlineKeyboardButton(text="🏠 Main menu", callback_data="m:main")],
            ]
        ),
    )


# ---------------------------------------------------------------------------
# Panel access
# ---------------------------------------------------------------------------


@router.callback_query(F.data == "m:panel")
@admin_only
async def cb_panel(call: CallbackQuery) -> None:
    await call.answer()
    await _render_panel(call)


async def _render_panel(call: CallbackQuery) -> None:
    try:
        info = await get_rpc().call("panel.access_get", {})
    except (RpcError, RpcTransportError) as exc:
        await call.message.edit_text(  # type: ignore[union-attr]
            f"Could not fetch panel access: {_code(exc)}",
            parse_mode="HTML",
            reply_markup=_main_nav_kb(),
        )
        return
    listen = str(info.get("listen") or "")
    is_ssh_only = listen == "127.0.0.1"
    rows = [
        [
            InlineKeyboardButton(
                text="🌐 Public access" if is_ssh_only else "🔒 SSH-only",
                callback_data="m:panel:public" if is_ssh_only else "m:panel:ssh",
            )
        ],
        [InlineKeyboardButton(text="👥 Users / Clients", callback_data="m:cli")],
        [InlineKeyboardButton(text="🛠 Back to Manage", callback_data="m:manage")],
        [InlineKeyboardButton(text="🏠 Main menu", callback_data="m:main")],
    ]
    text = (
        "<b>Panel access</b>\n"
        f"Listen: {_code(info.get('listen', '?'))}\n"
        f"Port:   {_code(info.get('port', '?'))}\n"
        f"URL:    {_code(info.get('url', '?'))}\n\n"
        "SSH-only binds the 3X-UI panel to localhost and restarts x-ui."
    )
    await call.message.edit_text(  # type: ignore[union-attr]
        text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
    )


@router.callback_query(F.data == "m:panel:public")
@admin_only
async def cb_panel_public(call: CallbackQuery) -> None:
    try:
        await get_rpc().call("panel.access_set", {"mode": "public"})
    except (RpcError, RpcTransportError) as exc:
        await call.answer(f"Panel access failed: {exc}", show_alert=True)
        return
    await call.answer("Panel access is public.")
    await _render_panel(call)


@router.callback_query(F.data == "m:panel:ssh")
@admin_only
async def cb_panel_ssh(call: CallbackQuery) -> None:
    try:
        result = await get_rpc().call("panel.access_set", {"mode": "ssh-only"})
    except RpcError as exc:
        if exc.code == 412 and isinstance(exc.data, dict) and exc.data.get("needs_confirm"):
            await start_confirm(
                call,
                action_key="panel_lockout",
                context={"confirm_token": exc.data.get("confirm_token")},
            )
            return
        await call.answer(f"Panel access failed: {exc.message}", show_alert=True)
        return
    except RpcTransportError as exc:
        await call.answer(f"govlessctl unreachable: {exc}", show_alert=True)
        return
    if isinstance(result, dict) and result.get("needs_confirm"):
        await start_confirm(
            call,
            action_key="panel_lockout",
            context={"confirm_token": result.get("confirm_token")},
        )
        return
    await call.answer("Panel access is SSH-only.")
    await _render_panel(call)


# ---------------------------------------------------------------------------
# Bot admins
# ---------------------------------------------------------------------------


@router.callback_query(F.data == "m:adm")
@admin_only
async def cb_admins(call: CallbackQuery) -> None:
    await call.answer()
    try:
        admins = await get_rpc().call("admin.list", {})
    except (RpcError, RpcTransportError) as exc:
        await call.message.edit_text(  # type: ignore[union-attr]
            f"Could not fetch admins: {_code(exc)}",
            parse_mode="HTML",
            reply_markup=_main_nav_kb(),
        )
        return
    if not admins:
        body = "<b>Bot admins</b>\nNo admins claimed yet."
    else:
        body = "<b>Bot admins</b>\n" + "\n".join(
            f"• {_code(tg)}" for tg in admins
        )
    body += "\n\nAdd admin:\n<code>/invite &lt;telegram_id&gt;</code>"
    await call.message.edit_text(  # type: ignore[union-attr]
        body,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🛠 Back to Manage", callback_data="m:manage")],
                [InlineKeyboardButton(text="🏠 Main menu", callback_data="m:main")],
            ]
        ),
    )


# ---------------------------------------------------------------------------
# About / System
# ---------------------------------------------------------------------------


@router.callback_query(F.data.in_({"m:about", "m:sys"}))
@admin_only
async def cb_about(call: CallbackQuery) -> None:
    await call.answer()
    status = await _status()
    tunnel = await _tunnel()
    tunnel_url = tunnel.get("url")
    text = (
        "<b>About goVLESS</b>\n"
        f"Version: {_code(status.get('version', '?'))}\n"
        f"Mode: {_code(status.get('mode', '?'))}\n"
        f"Transport: {_code(status.get('transport', '?'))}\n"
        f"Web menu: {_code(tunnel_url or 'not active')}\n\n"
        "The Telegram bot mirrors the main SSH menu and exposes the common "
        "3X-UI client actions: links, QR, subscriptions, traffic, enable/disable."
    )
    rows = [
        [InlineKeyboardButton(text="📊 Full status", callback_data="m:over")],
        [InlineKeyboardButton(text="📜 Audit log", callback_data="sys:audit")],
    ]
    rows.extend(_section_nav_rows())
    await call.message.edit_text(  # type: ignore[union-attr]
        text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
    )


@router.callback_query(F.data == "sys:audit")
@admin_only
async def cb_sys_audit(call: CallbackQuery) -> None:
    await call.answer()
    try:
        rows = await get_rpc().call("audit.tail", {"limit": 20})
    except (RpcError, RpcTransportError) as exc:
        await call.message.edit_text(  # type: ignore[union-attr]
            f"Audit fetch failed: {_code(exc)}",
            parse_mode="HTML",
            reply_markup=_main_nav_kb(),
        )
        return
    if not rows:
        body = "No audit entries yet."
    else:
        body = "<b>Last audit entries</b>\n" + "\n".join(
            f"{_code(r.get('ts', '?'))} tg={_esc(r.get('admin_tg'))} "
            f"{_esc(r.get('action'))} {_esc(r.get('target', ''))}"
            for r in rows
        )
    await call.message.edit_text(  # type: ignore[union-attr]
        body[:4000],
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="🛠 Back to Manage", callback_data="m:manage")],
                [InlineKeyboardButton(text="🏠 Main menu", callback_data="m:main")],
            ]
        ),
    )
