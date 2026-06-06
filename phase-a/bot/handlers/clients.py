"""
Clients section: list view, card view, CRUD callbacks.

Callback-data scheme (compact, each ≤ 64 bytes):
  m:cli            → list (page 0)
  cl:l:<page>      → list page N
  cl:c:<uuid>      → open client card
  cl:en:<uuid>     → enable client
  cl:dis:<uuid>    → disable client (server may demand confirm)
  cl:sub:<uuid>    → show sub URL (Pro only)
  cl:qr:<uuid>     → show subscription QR (Pro only)
  cl:link:<uuid>   → send VLESS link as copyable text
  cl:qrv:<uuid>    → show direct VLESS QR
  cl:add           → show add-client command help
  cl:edit:<uuid>   → show edit commands for a client
  cl:rst:<uuid>    → reset traffic (destructive — typed confirm)
  cl:del:<uuid>    → delete client (destructive — typed confirm)
  cl:rot:<uuid>    → rotate subscription (destructive — typed confirm)

We resolve UUIDs against a freshly fetched client.list every time (stateless).
"""

from __future__ import annotations

import html
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from aiogram import F, Router
from aiogram.filters import Command, CommandObject
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from common import admin_only, get_rpc
from rpc import RpcError, RpcTransportError

from handlers.confirm import ACTIONS, start_confirm

LOG = logging.getLogger(__name__)

router = Router(name="clients")

PAGE_SIZE = 8


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _short(uuid: str) -> str:
    return uuid.replace("-", "")[:8]


def _uuid_key(uuid: str) -> str:
    return uuid.replace("-", "").lower()


def _esc(value: Any) -> str:
    return html.escape("" if value is None else str(value))


def _code(value: Any) -> str:
    return f"<code>{_esc(value)}</code>"


def _alert_text(prefix: str, exc: Exception) -> str:
    text = f"{prefix}: {exc}"
    return text if len(text) <= 190 else text[:187] + "..."


async def _fetch_clients() -> List[Dict[str, Any]]:
    res = await get_rpc().call("client.list", {})
    return res if isinstance(res, list) else []


async def _resolve(identifier: str) -> Optional[Dict[str, Any]]:
    ident = identifier.replace("-", "").lower()
    for c in await _fetch_clients():
        if _uuid_key(c.get("uuid", "")) == ident:
            return c
    return None


async def _resolve_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    ident = identifier.strip()
    if not ident:
        return None
    norm = ident.replace("-", "").lower()
    for c in await _fetch_clients():
        if _uuid_key(c.get("uuid", "")).startswith(norm) or str(c.get("name", "")) == ident:
            return c
    return None


async def _resolve_for_message(message: Message, identifier: str, usage: str) -> Optional[Dict[str, Any]]:
    try:
        client = await _resolve_identifier(identifier)
    except RpcError as exc:
        await message.answer(
            f"Could not fetch clients: {_esc(exc.message)}\n\n{usage}",
            parse_mode="HTML",
        )
        return None
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {_code(exc)}", parse_mode="HTML")
        return None
    if client is None:
        await message.answer(
            f"Client not found: {_code(identifier)}\n\n{usage}",
            parse_mode="HTML",
        )
    return client


async def _resolve_for_callback(call: CallbackQuery, identifier: str, *, prefix: str = "Client") -> Optional[Dict[str, Any]]:
    try:
        client = await _resolve(identifier)
    except (RpcError, RpcTransportError) as exc:
        await call.answer(_alert_text(f"{prefix} lookup failed", exc), show_alert=True)
        return None
    if client is None:
        await call.answer("Client not found.", show_alert=True)
    return client


def _back_to_list_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="« Clients", callback_data="cl:l:0"),
                InlineKeyboardButton(text="🏠 Main", callback_data="m:back"),
            ]
        ]
    )


def _client_row_text(c: Dict[str, Any]) -> str:
    if not c.get("enabled"):
        state = "⏸"
    elif c.get("online"):
        state = "🟢"
    else:
        state = "✅"
    name = str(c.get("name") or "?")
    used = _fmt_bytes(c.get("traffic_used"))
    limit_raw = c.get("traffic_limit")
    limit = "∞" if not limit_raw else _fmt_bytes(limit_raw)
    return f"{state} {name[:24]} · {used} / {limit}"


def _list_kb(clients: List[Dict[str, Any]], page: int) -> InlineKeyboardMarkup:
    rows: List[List[InlineKeyboardButton]] = [
        [InlineKeyboardButton(text="➕ Add client", callback_data="cl:add")]
    ]
    start = page * PAGE_SIZE
    end = start + PAGE_SIZE
    chunk = clients[start:end]
    for c in chunk:
        key = _uuid_key(c.get("uuid", ""))
        rows.append(
            [
                InlineKeyboardButton(
                    text=_client_row_text(c),
                    callback_data=f"cl:c:{key}",
                )
            ]
        )
    nav: List[InlineKeyboardButton] = []
    if page > 0:
        nav.append(
            InlineKeyboardButton(text="« Prev", callback_data=f"cl:l:{page - 1}")
        )
    if end < len(clients):
        nav.append(
            InlineKeyboardButton(text="Next »", callback_data=f"cl:l:{page + 1}")
        )
    if nav:
        rows.append(nav)
    rows.append([InlineKeyboardButton(text="🏠 Main", callback_data="m:back")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _card_kb(client: Dict[str, Any]) -> InlineKeyboardMarkup:
    key = _uuid_key(client.get("uuid", ""))
    is_enabled = bool(client.get("enabled"))
    sub_url = client.get("sub_url")
    rows: List[List[InlineKeyboardButton]] = []
    if sub_url:
        rows.append(
            [
                InlineKeyboardButton(
                    text="🔗 Subscription URL",
                    callback_data=f"cl:sub:{key}",
                )
            ]
        )
        rows.append(
            [
                InlineKeyboardButton(
                    text="🔳 Subscription QR",
                    callback_data=f"cl:qr:{key}",
                )
            ]
        )
        rows.append(
            [
                InlineKeyboardButton(
                    text="♻️ Rotate sub",
                    callback_data=f"cl:rot:{key}",
                )
            ]
        )
    if client.get("link"):
        rows.append(
            [
                InlineKeyboardButton(
                    text="🔗 Send VLESS link",
                    callback_data=f"cl:link:{key}",
                )
            ]
        )
        rows.append(
            [
                InlineKeyboardButton(
                    text="🔳 VLESS QR",
                    callback_data=f"cl:qrv:{key}",
                )
            ]
        )
    toggle_text = "⏸ Disable" if is_enabled else "▶️ Enable"
    toggle_cb = f"cl:dis:{key}" if is_enabled else f"cl:en:{key}"
    rows.append(
        [InlineKeyboardButton(text=toggle_text, callback_data=toggle_cb)]
    )
    rows.append(
        [InlineKeyboardButton(text="✏️ Limit / expiry", callback_data=f"cl:edit:{key}")]
    )
    rows.append(
        [
            InlineKeyboardButton(
                text="🧹 Reset traffic", callback_data=f"cl:rst:{key}"
            )
        ]
    )
    rows.append(
        [
            InlineKeyboardButton(
                text="🗑 Delete", callback_data=f"cl:del:{key}"
            )
        ]
    )
    rows.append(
        [
            InlineKeyboardButton(text="« Clients", callback_data="cl:l:0"),
            InlineKeyboardButton(text="🏠 Main", callback_data="m:back"),
        ]
    )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _fmt_bytes(n: Optional[int]) -> str:
    if n is None:
        return "?"
    try:
        n = int(n)
    except (TypeError, ValueError):
        return str(n)
    if n <= 0:
        return "0 B"
    units = ["B", "KiB", "MiB", "GiB", "TiB"]
    i = 0
    f = float(n)
    while f >= 1024 and i < len(units) - 1:
        f /= 1024
        i += 1
    return f"{f:.2f} {units[i]}"


def _fmt_expiry(ts: Any) -> str:
    try:
        value = int(ts or 0)
    except (TypeError, ValueError):
        return str(ts)
    if value <= 0:
        return "—"
    return datetime.fromtimestamp(value, timezone.utc).strftime("%Y-%m-%d %H:%M UTC")


def _card_text(c: Dict[str, Any]) -> str:
    on = "enabled" if c.get("enabled") else "disabled"
    live = "online" if c.get("online") else "offline"
    used = _fmt_bytes(c.get("traffic_used"))
    limit_raw = c.get("traffic_limit")
    limit = "∞" if not limit_raw else _fmt_bytes(limit_raw)
    expiry = _fmt_expiry(c.get("expiry_ts"))
    flow = c.get("flow") or "—"
    sub = "available" if c.get("sub_url") else "not available"
    return (
        f"<b>{_esc(c.get('name', '?'))}</b>\n"
        f"State: {_code(on)} · {_code(live)}\n"
        f"Traffic: {_code(used)} / {_code(limit)}\n"
        f"Expiry: {_code(expiry)}\n"
        f"Subscription: {_code(sub)}\n"
        f"Flow: {_code(flow)}\n"
        f"UUID: {_code(c.get('uuid', '?'))}"
    )


def _add_help_text() -> str:
    return (
        "<b>Add client</b>\n"
        "Send a command in this format:\n"
        "<code>/addclient name [traffic_gb] [days]</code>\n\n"
        "Examples:\n"
        "<code>/addclient alice</code>\n"
        "<code>/addclient alice 50</code>\n"
        "<code>/addclient alice 50 30</code>\n\n"
        "Name may contain letters, numbers, dot, dash, underscore, @, +."
    )


def _edit_help_text(client: Dict[str, Any]) -> str:
    short = _short(client.get("uuid", ""))
    name = client.get("name", "?")
    return (
        f"<b>Edit {_esc(name)}</b>\n"
        "Send one of these commands:\n"
        f"<code>/setlimit {short} 50</code>\n"
        f"<code>/setexpiry {short} 30</code>\n\n"
        "Use <code>0</code> for unlimited traffic or no expiry."
    )


def _command_usage(command: str) -> str:
    if command == "addclient":
        return _add_help_text()
    if command == "setlimit":
        return (
            "<b>Set traffic limit</b>\n"
            "Format:\n"
            "<code>/setlimit client_name_or_short_uuid traffic_gb</code>\n\n"
            "Example:\n<code>/setlimit alice 50</code>"
        )
    if command == "setexpiry":
        return (
            "<b>Set expiry</b>\n"
            "Format:\n"
            "<code>/setexpiry client_name_or_short_uuid days_from_now</code>\n\n"
            "Example:\n<code>/setexpiry alice 30</code>\n"
            "Use <code>0</code> for no expiry."
        )
    return "Unknown command."


def _parse_nonnegative_int(raw: str, field: str) -> int:
    try:
        value = int(raw)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be a number")
    if value < 0:
        raise ValueError(f"{field} must be 0 or greater")
    return value


async def _send_client_created(message: Message, result: Dict[str, Any], name: str) -> None:
    uuid = result.get("uuid", "")
    link = result.get("link", "")
    body = f"✅ Client {_code(name)} created.\nUUID: {_code(uuid)}"
    if link:
        body += f"\n\n🔗 VLESS link:\n{_code(link)}"
    await message.answer(body, parse_mode="HTML")


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------


@router.callback_query(F.data == "m:cli")
@admin_only
async def cb_clients_root(call: CallbackQuery) -> None:
    await _render_list(call, page=0)


@router.message(Command("addclient"))
@admin_only
async def cmd_add_client(message: Message, command: CommandObject) -> None:
    args = (command.args or "").split()
    if not args or len(args) > 3:
        await message.answer(_command_usage("addclient"), parse_mode="HTML")
        return
    name = args[0]
    payload: Dict[str, Any] = {"name": name}
    try:
        if len(args) >= 2:
            payload["traffic_limit"] = _parse_nonnegative_int(args[1], "traffic_gb")
        if len(args) >= 3:
            days = _parse_nonnegative_int(args[2], "days")
            payload["expiry_ts"] = 0 if days == 0 else int(time.time()) + days * 86400
        result = await get_rpc().call("client.add", payload)
    except ValueError as exc:
        await message.answer(
            f"{_esc(exc)}\n\n{_command_usage('addclient')}",
            parse_mode="HTML",
        )
        return
    except RpcError as exc:
        await message.answer(
            f"Add client failed: {_esc(exc.message)}\n\n{_command_usage('addclient')}",
            parse_mode="HTML",
        )
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {_code(exc)}", parse_mode="HTML")
        return
    await _send_client_created(message, result if isinstance(result, dict) else {}, name)


@router.message(Command("setlimit"))
@admin_only
async def cmd_set_limit(message: Message, command: CommandObject) -> None:
    args = (command.args or "").split()
    if len(args) != 2:
        await message.answer(_command_usage("setlimit"), parse_mode="HTML")
        return
    client = await _resolve_for_message(message, args[0], _command_usage("setlimit"))
    if client is None:
        return
    try:
        limit = _parse_nonnegative_int(args[1], "traffic_gb")
        result = await get_rpc().call(
            "client.update",
            {"uuid": client["uuid"], "fields": {"traffic_limit": limit}},
        )
        if isinstance(result, dict) and result.get("needs_confirm"):
            await start_confirm(
                message,
                action_key="update_traffic",
                context={
                    "uuid": client["uuid"],
                    "name": client.get("name", "?"),
                    "fields": {"traffic_limit": limit},
                    "confirm_token": result.get("confirm_token"),
                },
            )
            return
    except ValueError as exc:
        await message.answer(
            f"{_esc(exc)}\n\n{_command_usage('setlimit')}",
            parse_mode="HTML",
        )
        return
    except RpcError as exc:
        if exc.code == 412 and isinstance(exc.data, dict) and exc.data.get("needs_confirm"):
            await start_confirm(
                message,
                action_key="update_traffic",
                context={
                    "uuid": client["uuid"],
                    "name": client.get("name", "?"),
                    "fields": {"traffic_limit": limit},
                    "confirm_token": exc.data.get("confirm_token"),
                },
            )
            return
        await message.answer(f"Set limit failed: {_esc(exc.message)}", parse_mode="HTML")
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {_code(exc)}", parse_mode="HTML")
        return
    await message.answer(
        f"✅ Traffic limit updated for {_code(client.get('name', '?'))}.",
        parse_mode="HTML",
    )


@router.message(Command("setexpiry"))
@admin_only
async def cmd_set_expiry(message: Message, command: CommandObject) -> None:
    args = (command.args or "").split()
    if len(args) != 2:
        await message.answer(_command_usage("setexpiry"), parse_mode="HTML")
        return
    client = await _resolve_for_message(message, args[0], _command_usage("setexpiry"))
    if client is None:
        return
    try:
        days = _parse_nonnegative_int(args[1], "days")
        expiry_ts = 0 if days == 0 else int(time.time()) + days * 86400
        result = await get_rpc().call(
            "client.update",
            {"uuid": client["uuid"], "fields": {"expiry_ts": expiry_ts}},
        )
        if isinstance(result, dict) and result.get("needs_confirm"):
            await start_confirm(
                message,
                action_key="update_expiry",
                context={
                    "uuid": client["uuid"],
                    "name": client.get("name", "?"),
                    "fields": {"expiry_ts": expiry_ts},
                    "confirm_token": result.get("confirm_token"),
                },
            )
            return
    except ValueError as exc:
        await message.answer(
            f"{_esc(exc)}\n\n{_command_usage('setexpiry')}",
            parse_mode="HTML",
        )
        return
    except RpcError as exc:
        if exc.code == 412 and isinstance(exc.data, dict) and exc.data.get("needs_confirm"):
            await start_confirm(
                message,
                action_key="update_expiry",
                context={
                    "uuid": client["uuid"],
                    "name": client.get("name", "?"),
                    "fields": {"expiry_ts": expiry_ts},
                    "confirm_token": exc.data.get("confirm_token"),
                },
            )
            return
        await message.answer(f"Set expiry failed: {_esc(exc.message)}", parse_mode="HTML")
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {_code(exc)}", parse_mode="HTML")
        return
    await message.answer(
        f"✅ Expiry updated for {_code(client.get('name', '?'))}.",
        parse_mode="HTML",
    )


@router.callback_query(F.data.startswith("cl:l:"))
@admin_only
async def cb_clients_page(call: CallbackQuery) -> None:
    try:
        page = int(call.data.split(":")[2])  # type: ignore[union-attr]
    except (ValueError, IndexError):
        page = 0
    await _render_list(call, page=page)


async def _render_list(call: CallbackQuery, *, page: int) -> None:
    await call.answer()
    try:
        clients = await _fetch_clients()
    except (RpcError, RpcTransportError) as exc:
        await call.message.edit_text(  # type: ignore[union-attr]
            f"Could not fetch clients: {_code(exc)}",
            parse_mode="HTML",
            reply_markup=_back_to_list_kb(),
        )
        return
    if not clients:
        await call.message.edit_text(  # type: ignore[union-attr]
            "<b>Clients</b>\nNo clients yet.",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="➕ Add client", callback_data="cl:add")],
                    [InlineKeyboardButton(text="🏠 Main", callback_data="m:back")],
                ]
            ),
        )
        return
    total = len(clients)
    has_subscription = any(c.get("sub_url") for c in clients)
    hint = (
        "Tap a client to open subscriptions, VLESS links, QR, traffic and status."
        if has_subscription
        else "Tap a client to open VLESS links, QR, traffic and status."
    )
    text = (
        f"<b>Users / Clients</b> ({total})\n"
        f"{hint}"
    )
    await call.message.edit_text(  # type: ignore[union-attr]
        text, parse_mode="HTML", reply_markup=_list_kb(clients, page)
    )


# ---------------------------------------------------------------------------
# Card
# ---------------------------------------------------------------------------


async def _open_card(call: CallbackQuery, short: str) -> Optional[Dict[str, Any]]:
    try:
        client = await _resolve(short)
    except (RpcError, RpcTransportError) as exc:
        await call.answer(_alert_text("Client lookup failed", exc), show_alert=True)
        return None
    if client is None:
        await call.answer("Client not found (refresh).", show_alert=True)
        return None
    if call.message is not None:
        await call.message.edit_text(
            _card_text(client), parse_mode="HTML", reply_markup=_card_kb(client)
        )
    return client


@router.callback_query(F.data.startswith("cl:c:"))
@admin_only
async def cb_card(call: CallbackQuery) -> None:
    short = (call.data or "").split(":", 2)[-1]
    await call.answer()
    await _open_card(call, short)


@router.callback_query(F.data == "cl:add")
@admin_only
async def cb_add_help(call: CallbackQuery) -> None:
    await call.answer()
    if call.message is not None:
        await call.message.edit_text(
            _add_help_text(),
            parse_mode="HTML",
            reply_markup=_back_to_list_kb(),
        )


@router.callback_query(F.data.startswith("cl:edit:"))
@admin_only
async def cb_edit_help(call: CallbackQuery) -> None:
    ident = (call.data or "").split(":", 2)[-1]
    client = await _resolve_for_callback(call, ident, prefix="Client")
    if client is None:
        return
    await call.answer()
    if call.message is not None:
        await call.message.edit_text(
            _edit_help_text(client),
            parse_mode="HTML",
            reply_markup=_back_to_list_kb(),
        )


# ---------------------------------------------------------------------------
# Non-destructive actions
# ---------------------------------------------------------------------------


def _parse_short(data: Optional[str]) -> Optional[str]:
    if not data:
        return None
    parts = data.split(":")
    if len(parts) < 3:
        return None
    return parts[2]


@router.callback_query(F.data.startswith("cl:en:"))
@admin_only
async def cb_enable(call: CallbackQuery) -> None:
    short = _parse_short(call.data)
    if short is None:
        await call.answer("bad callback", show_alert=True)
        return
    client = await _resolve_for_callback(call, short, prefix="Client")
    if client is None:
        return
    try:
        await get_rpc().call("client.enable", {"uuid": client["uuid"]})
    except (RpcError, RpcTransportError) as exc:
        await call.answer(_alert_text("Enable failed", exc), show_alert=True)
        return
    await call.answer("Enabled.")
    await _open_card(call, short)


@router.callback_query(F.data.startswith("cl:dis:"))
@admin_only
async def cb_disable(call: CallbackQuery) -> None:
    short = _parse_short(call.data)
    if short is None:
        await call.answer("bad callback", show_alert=True)
        return
    client = await _resolve_for_callback(call, short, prefix="Client")
    if client is None:
        return
    uuid = client["uuid"]
    name = client.get("name", "?")
    try:
        result = await get_rpc().call("client.disable", {"uuid": uuid})
        if isinstance(result, dict) and result.get("needs_confirm"):
            await start_confirm(
                call,
                action_key="disable_last_admin",
                context={
                    "uuid": uuid,
                    "name": name,
                    "confirm_token": result.get("confirm_token"),
                },
            )
            return
    except RpcError as exc:
        # Server may require typed confirm if last admin's client.
        if exc.code == 412 and isinstance(exc.data, dict) and exc.data.get("confirm") == "DISABLE LAST":
            await start_confirm(
                call,
                action_key="disable_last_admin",
                context={
                    "uuid": uuid,
                    "name": name,
                    "confirm_token": exc.data.get("confirm_token"),
                },
            )
            return
        await call.answer(_alert_text("Disable failed", exc), show_alert=True)
        return
    except RpcTransportError as exc:
        await call.answer(_alert_text("govlessctl unreachable", exc), show_alert=True)
        return
    await call.answer("Disabled.")
    await _open_card(call, short)


@router.callback_query(F.data.startswith("cl:qr:"))
@admin_only
async def cb_qr(call: CallbackQuery) -> None:
    await _send_qr(call, prefer_subscription=True)


@router.callback_query(F.data.startswith("cl:qrv:"))
@admin_only
async def cb_qr_vless(call: CallbackQuery) -> None:
    await _send_qr(call, prefer_subscription=False)


async def _send_qr(call: CallbackQuery, *, prefer_subscription: bool) -> None:
    short = _parse_short(call.data)
    if short is None:
        await call.answer("bad callback", show_alert=True)
        return
    client = await _resolve_for_callback(call, short, prefix="QR")
    if client is None:
        return
    try:
        res = await get_rpc().call(
            "client.qr",
            {"uuid": client["uuid"], "prefer_subscription": prefer_subscription},
        )
    except (RpcError, RpcTransportError) as exc:
        await call.answer(_alert_text("QR failed", exc), show_alert=True)
        return
    qr = (res or {}).get("qr_text", "")
    link = (res or {}).get("link", client.get("link", ""))
    kind = (res or {}).get("kind", "vless")
    await call.answer()
    if call.message is not None:
        title = "Subscription QR" if kind == "subscription" else "VLESS QR"
        body = (
            f"<b>{title}</b>\n<pre>{_esc(qr)}</pre>\n{_code(link)}"
            if qr
            else f"<b>{title}</b>\n{_code(link)}"
        )
        await call.message.answer(body, parse_mode="HTML")


@router.callback_query(F.data.startswith("cl:link:"))
@admin_only
async def cb_link(call: CallbackQuery) -> None:
    ident = _parse_short(call.data)
    if ident is None:
        await call.answer("bad callback", show_alert=True)
        return
    client = await _resolve_for_callback(call, ident, prefix="Link")
    if client is None:
        return
    link = client.get("link") or ""
    if not link:
        try:
            res = await get_rpc().call("client.qr", {"uuid": client["uuid"]})
            link = (res or {}).get("link", "")
        except (RpcError, RpcTransportError) as exc:
            await call.answer(_alert_text("Link failed", exc), show_alert=True)
            return
    await call.answer("Link sent.")
    if call.message is not None:
        await call.message.answer(
            f"🔗 <b>{_esc(client.get('name', '?'))}</b>\n{_code(link)}",
            parse_mode="HTML",
        )


@router.callback_query(F.data.startswith("cl:sub:"))
@admin_only
async def cb_sub_url(call: CallbackQuery) -> None:
    short = _parse_short(call.data)
    if short is None:
        await call.answer("bad callback", show_alert=True)
        return
    client = await _resolve_for_callback(call, short, prefix="Subscription")
    if client is None:
        return
    try:
        res = await get_rpc().call("client.sub_url", {"uuid": client["uuid"]})
    except (RpcError, RpcTransportError) as exc:
        await call.answer(_alert_text("Subscription failed", exc), show_alert=True)
        return
    sub = (res or {}).get("sub_url")
    await call.answer()
    if call.message is not None:
        if sub:
            await call.message.answer(
                f"Subscription URL:\n{_code(sub)}", parse_mode="HTML"
            )
        else:
            await call.message.answer(
                "Subscription URL is not available for this client or server yet."
            )


# ---------------------------------------------------------------------------
# Destructive actions: dispatch to typed-confirm
# ---------------------------------------------------------------------------


async def _kick_confirm(
    call: CallbackQuery, action_key: str, *, prefix: str
) -> None:
    short = _parse_short(call.data)
    if short is None:
        await call.answer("bad callback", show_alert=True)
        return
    client = await _resolve_for_callback(call, short, prefix="Client")
    if client is None:
        return
    LOG.debug("kick_confirm prefix=%s action=%s short=%s", prefix, action_key, short)
    spec = ACTIONS[action_key]
    context = {"uuid": client["uuid"], "name": client.get("name", "?")}
    try:
        await get_rpc().call(spec.rpc_method, {"uuid": client["uuid"]})
    except RpcError as exc:
        if exc.code == 412 and isinstance(exc.data, dict) and exc.data.get("needs_confirm"):
            context["confirm_token"] = exc.data.get("confirm_token")
        else:
            await call.answer(_alert_text("Confirm failed", exc), show_alert=True)
            return
    except RpcTransportError as exc:
        await call.answer(_alert_text("govlessctl unreachable", exc), show_alert=True)
        return
    await start_confirm(
        call,
        action_key=action_key,
        context=context,
    )


@router.callback_query(F.data.startswith("cl:rst:"))
@admin_only
async def cb_reset(call: CallbackQuery) -> None:
    await _kick_confirm(call, "reset_traffic", prefix="cl:rst")


@router.callback_query(F.data.startswith("cl:del:"))
@admin_only
async def cb_delete(call: CallbackQuery) -> None:
    await _kick_confirm(call, "delete_client", prefix="cl:del")


@router.callback_query(F.data.startswith("cl:rot:"))
@admin_only
async def cb_rotate(call: CallbackQuery) -> None:
    await _kick_confirm(call, "rotate_sub", prefix="cl:rot")


# Public helpers re-exported for use in other handlers if needed.
__all__ = ["router", "_short", "_fetch_clients"]


# Pacify lints
_ = Tuple
