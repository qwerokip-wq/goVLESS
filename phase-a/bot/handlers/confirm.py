"""
Typed-confirm flow.

Per CONTRACT.md section 2:

  ⚠️ Destructive action: <description>
  To confirm, reply with: <CONFIRM STRING>
  (60s TTL; expired requires restart)

Pending records live in common.PENDING (60s TTL, per-user). On next message,
we match the exact body (case-sensitive). Match → call govlessctl with the
prepared params. Mismatch → reject and clear pending.

Action registry maps a short action key to:
  - human description
  - confirm string template (filled from params)
  - rpc method
  - params builder (uuid+name -> rpc params dict; confirm field added by us)
"""

from __future__ import annotations

import html
import logging
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional

from aiogram import F, Router
from aiogram.types import CallbackQuery, Message

from common import PENDING, admin_only, format_rpc_result_for_chat, get_rpc
from rpc import RpcError, RpcTransportError

LOG = logging.getLogger(__name__)

router = Router(name="confirm")


def _esc(value: Any) -> str:
    return html.escape("" if value is None else str(value))


def _code(value: Any) -> str:
    return f"<code>{_esc(value)}</code>"


@dataclass
class ConfirmSpec:
    action_key: str
    description: str
    expected_template: str  # uses .format(name=..., id=..., target=...)
    rpc_method: str
    # builds the params dict given context; confirm field will be set by us.
    build_params: Callable[[Dict[str, Any]], Dict[str, Any]]


def _client_confirm_action(uuid: str, name: str, *, confirm: str, confirm_token: Optional[str] = None) -> Dict[str, Any]:
    params = {"uuid": uuid, "confirm": confirm}
    if confirm_token:
        params["confirm_token"] = confirm_token
    return params


def _client_update_confirm(ctx: Dict[str, Any]) -> Dict[str, Any]:
    params = {
        "uuid": ctx["uuid"],
        "fields": ctx["fields"],
        "confirm": ctx["confirm"],
    }
    if ctx.get("confirm_token"):
        params["confirm_token"] = ctx["confirm_token"]
    return params


def _inbound_disable(inbound_id: int, *, confirm: str, confirm_token: str | None = None) -> Dict[str, Any]:
    params: Dict[str, Any] = {"inbound_id": inbound_id, "enable": False, "confirm": confirm}
    if confirm_token:
        params["confirm_token"] = confirm_token
    return params


def _panel_lockout(*, confirm: str, confirm_token: str | None = None) -> Dict[str, Any]:
    params = {"mode": "ssh-only", "confirm": confirm}
    if confirm_token:
        params["confirm_token"] = confirm_token
    return params


def _cert_renew(target: str, *, confirm: str) -> Dict[str, Any]:
    return {"domain_or_ip": target, "confirm": confirm}


# Registered destructive actions per CONTRACT.md table.
ACTIONS: Dict[str, ConfirmSpec] = {
    "reset_traffic": ConfirmSpec(
        action_key="reset_traffic",
        description="Reset traffic counter for client '{name}'.",
        expected_template="RESET {name}",
        rpc_method="client.reset_traffic",
        build_params=lambda ctx: _client_confirm_action(
            ctx["uuid"], ctx["name"], confirm=ctx["confirm"],
            confirm_token=ctx.get("confirm_token"),
        ),
    ),
    "delete_client": ConfirmSpec(
        action_key="delete_client",
        description="DELETE client '{name}'. This is irreversible.",
        expected_template="DELETE {name}",
        rpc_method="client.delete",
        build_params=lambda ctx: _client_confirm_action(
            ctx["uuid"], ctx["name"], confirm=ctx["confirm"],
            confirm_token=ctx.get("confirm_token"),
        ),
    ),
    "disable_last_admin": ConfirmSpec(
        action_key="disable_last_admin",
        description=(
            "Disable client '{name}' — this is the LAST admin's client. "
            "You may lock yourself out."
        ),
        expected_template="DISABLE LAST",
        rpc_method="client.disable",
        build_params=lambda ctx: _client_confirm_action(
            ctx["uuid"], ctx["name"], confirm=ctx["confirm"],
            confirm_token=ctx.get("confirm_token"),
        ),
    ),
    "rotate_sub": ConfirmSpec(
        action_key="rotate_sub",
        description="Rotate subscription URL for '{name}'. Old URL will stop working.",
        expected_template="ROTATE SUB {name}",
        rpc_method="subscription.rotate",
        build_params=lambda ctx: _client_confirm_action(
            ctx["uuid"], ctx["name"], confirm=ctx["confirm"],
            confirm_token=ctx.get("confirm_token"),
        ),
    ),
    "update_traffic": ConfirmSpec(
        action_key="update_traffic",
        description="Update traffic limit for client '{name}'.",
        expected_template="UPDATE-TRAFFIC {name}",
        rpc_method="client.update",
        build_params=_client_update_confirm,
    ),
    "update_expiry": ConfirmSpec(
        action_key="update_expiry",
        description="Update expiry for client '{name}'.",
        expected_template="UPDATE-EXPIRY {name}",
        rpc_method="client.update",
        build_params=_client_update_confirm,
    ),
    "disable_inbound": ConfirmSpec(
        action_key="disable_inbound",
        description="Disable inbound #{id}. All clients on it will disconnect.",
        expected_template="DISABLE INBOUND {id}",
        rpc_method="inbound.toggle",
        build_params=lambda ctx: _inbound_disable(
            int(ctx["id"]), confirm=ctx["confirm"], confirm_token=ctx.get("confirm_token")
        ),
    ),
    "panel_lockout": ConfirmSpec(
        action_key="panel_lockout",
        description=(
            "Switch panel access to SSH-only. You may lock yourself out of the "
            "web panel."
        ),
        expected_template="LOCKOUT-RISK PROCEED",
        rpc_method="panel.access_set",
        build_params=lambda ctx: _panel_lockout(
            confirm=ctx["confirm"],
            confirm_token=ctx.get("confirm_token"),
        ),
    ),
    "cert_renew": ConfirmSpec(
        action_key="cert_renew",
        description="Force-renew certificate for '{target}'.",
        expected_template="RENEW {target}",
        rpc_method="cert.force_renew",
        build_params=lambda ctx: _cert_renew(
            ctx["target"], confirm=ctx["confirm"]
        ),
    ),
}


async def start_confirm(
    target: CallbackQuery | Message,
    *,
    action_key: str,
    context: Dict[str, Any],
) -> None:
    """
    Send the typed-confirm prompt and register pending state for the user.
    `context` must include the keys referenced by the action's template.
    """
    spec = ACTIONS.get(action_key)
    if spec is None:
        if isinstance(target, CallbackQuery):
            await target.answer("Unknown destructive action.", show_alert=True)
        else:
            await target.answer("Unknown destructive action.")
        return
    user = target.from_user
    if user is None:
        return

    try:
        expected = spec.expected_template.format(**context)
        description = spec.description.format(**context)
    except KeyError as exc:
        LOG.error("confirm template missing key %s for %s", exc, action_key)
        if isinstance(target, CallbackQuery):
            await target.answer("Internal error preparing confirm.", show_alert=True)
        else:
            await target.answer("Internal error preparing confirm.")
        return

    PENDING.register(
        user_id=user.id,
        action=action_key,
        expected=expected,
        params={"context": context, "rpc_method": spec.rpc_method},
    )
    text = (
        f"⚠️ <b>Destructive action</b>: {_esc(description)}\n\n"
        f"To confirm, reply with exactly:\n{_code(expected)}\n\n"
        "(60s TTL; expired requires restart)"
    )
    if isinstance(target, CallbackQuery):
        if target.message is not None:
            await target.message.answer(text, parse_mode="HTML")
        await target.answer()
    else:
        await target.answer(text, parse_mode="HTML")


@router.message(F.text & ~F.text.startswith("/"))
@admin_only
async def maybe_confirm(message: Message) -> None:
    """
    Catch-all for plain text from admins. If user has a pending confirm and the
    text matches exactly, execute the RPC. Otherwise we either reject the
    confirm (mismatch) or silently ignore (no pending).
    """
    user = message.from_user
    if user is None or message.text is None:
        return
    pending = PENDING.get(user.id)
    if pending is None:
        # No pending confirm; silently ignore — other handlers may have claimed it.
        return

    action_key, expected, _expiry, stored = pending
    spec = ACTIONS.get(action_key)
    if spec is None:
        PENDING.clear(user.id)
        return

    if message.text != expected:
        remaining = max(0, int(_expiry - time.time()))
        await message.answer(
            "❌ Confirm string did not match. Action is still waiting.\n\n"
            f"Reply exactly:\n{_code(expected)}\n\n"
            f"Expires in ~{remaining}s.",
            parse_mode="HTML",
        )
        return

    PENDING.clear(user.id)
    ctx = dict(stored.get("context", {}))
    ctx["confirm"] = expected
    rpc_method = stored.get("rpc_method", spec.rpc_method)
    try:
        params = spec.build_params(ctx)
    except Exception as exc:  # noqa: BLE001
        LOG.exception("confirm build_params failed: %s", exc)
        await message.answer(f"Internal error: {exc}")
        return

    try:
        result = await get_rpc().call(rpc_method, params)
    except RpcError as exc:
        await message.answer(f"Action failed: {_esc(exc.message)}", parse_mode="HTML")
        return
    except RpcTransportError as exc:
        await message.answer(f"govlessctl unreachable: {_code(exc)}", parse_mode="HTML")
        return

    await message.answer(
        f"✅ Done.{format_rpc_result_for_chat(result)}", parse_mode="HTML"
    )


# Helper used elsewhere if a handler wants to register a confirm of its own.
def has_pending(user_id: int) -> Optional[str]:
    cur = PENDING.get(user_id)
    return cur[0] if cur else None
