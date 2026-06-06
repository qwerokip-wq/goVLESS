"""state_db.py — sqlite3 wrapper for /var/lib/govless/state.db.

Schema:
    govless_audit(id, ts, admin_tg, action, target, before_json, after_json)
    govless_capabilities(key, status, details, updated_at)
    govless_admins(tg_id, invited_by, invited_at)
    admin_claimed(id=1, claimed_by, claimed_at)         -- single-row table
    pending_confirms(token, action, target, expected_string, expires_at)

WAL mode + busy_timeout=5000 for concurrency with the bot reader.
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
from typing import Any, Iterable

DB_PATH = "/var/lib/govless/state.db"
LEGACY_PATH = "/opt/govless/state.db"  # pre Rule 3a migration source


SCHEMA = [
    """CREATE TABLE IF NOT EXISTS govless_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts INTEGER NOT NULL,
        admin_tg TEXT,
        action TEXT NOT NULL,
        target TEXT,
        before_json TEXT,
        after_json TEXT
    )""",
    "CREATE INDEX IF NOT EXISTS idx_audit_ts ON govless_audit(ts DESC)",
    """CREATE TABLE IF NOT EXISTS govless_capabilities (
        key TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        details TEXT,
        updated_at INTEGER
    )""",
    """CREATE TABLE IF NOT EXISTS govless_admins (
        tg_id TEXT PRIMARY KEY,
        invited_by TEXT,
        invited_at INTEGER
    )""",
    """CREATE TABLE IF NOT EXISTS admin_claimed (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        claimed_by TEXT,
        claimed_at INTEGER
    )""",
    """CREATE TABLE IF NOT EXISTS pending_confirms (
        token TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        target TEXT,
        expected_string TEXT NOT NULL,
        expires_at INTEGER NOT NULL
    )""",
]


def _maybe_migrate_legacy() -> None:
    """Move /opt/govless/state.db -> /var/lib/govless/state.db if needed (Rule 3a)."""
    if os.path.exists(DB_PATH):
        return
    if not os.path.exists(LEGACY_PATH):
        return
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    try:
        os.rename(LEGACY_PATH, DB_PATH)
    except OSError:
        # cross-device: copy + remove
        import shutil
        shutil.copy2(LEGACY_PATH, DB_PATH)
        os.remove(LEGACY_PATH)


def _connect(path: str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(path, timeout=5.0, isolation_level=None)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    return conn


class StateDB:
    def __init__(self, path: str = DB_PATH):
        _maybe_migrate_legacy()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.path = path
        # Agent-04 P0 fix: ensure govless group can read state.db so
        # govless-audit-prune.service (running as user=govless) can VACUUM.
        try:
            import grp
            gid = grp.getgrnam("govless").gr_gid
            for f in (path, path + "-wal", path + "-shm"):
                if os.path.exists(f):
                    try: os.chown(f, -1, gid)
                    except (PermissionError, OSError): pass
                    try: os.chmod(f, 0o660)
                    except (PermissionError, OSError): pass
        except (KeyError, ImportError):
            pass  # no govless group — single-user dev environment
        self.conn = _connect(path)
        self._init_schema()

    def _init_schema(self) -> None:
        cur = self.conn.cursor()
        for stmt in SCHEMA:
            cur.execute(stmt)
        self._migrate_schema()

    def _table_columns(self, table: str) -> dict[str, sqlite3.Row]:
        rows = self.conn.execute(f"PRAGMA table_info({table})").fetchall()
        return {str(r["name"]): r for r in rows}

    def _add_column_if_missing(self, table: str, name: str, definition: str) -> None:
        if name not in self._table_columns(table):
            self.conn.execute(f"ALTER TABLE {table} ADD COLUMN {name} {definition}")

    def _migrate_schema(self) -> None:
        # Older Phase-A snapshots created govless_audit with before/after
        # columns. CREATE TABLE IF NOT EXISTS does not add the newer JSON
        # columns, so first write after upgrade could 500 from govlessctl.
        self._add_column_if_missing("govless_audit", "before_json", "TEXT")
        self._add_column_if_missing("govless_audit", "after_json", "TEXT")

    # ── Audit ──────────────────────────────────────────────────────────
    def audit(
        self,
        admin_tg: str | int | None,
        action: str,
        target: str | None,
        before: Any = None,
        after: Any = None,
    ) -> int:
        admin_tg_db = str(admin_tg) if admin_tg is not None else None
        admin_col = self._table_columns("govless_audit").get("admin_tg")
        if admin_tg_db is None and admin_col is not None and bool(admin_col["notnull"]):
            admin_tg_db = "local"
        cur = self.conn.execute(
            "INSERT INTO govless_audit(ts, admin_tg, action, target, before_json, after_json) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                int(time.time()),
                admin_tg_db,
                action,
                target,
                json.dumps(before, ensure_ascii=False) if before is not None else None,
                json.dumps(after, ensure_ascii=False) if after is not None else None,
            ),
        )
        return int(cur.lastrowid or 0)

    def audit_tail(self, limit: int = 50) -> list[dict]:
        limit = max(1, min(int(limit), 200))
        rows = self.conn.execute(
            "SELECT ts, admin_tg, action, target FROM govless_audit "
            "ORDER BY ts DESC, rowid DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]

    # ── Capabilities ───────────────────────────────────────────────────
    def get_capabilities(self) -> dict[str, dict]:
        rows = self.conn.execute(
            "SELECT key, status, details, updated_at FROM govless_capabilities"
        ).fetchall()
        return {r["key"]: dict(r) for r in rows}

    def set_capability(self, key: str, status: str, details: str | None = None) -> None:
        self.conn.execute(
            "INSERT INTO govless_capabilities(key, status, details, updated_at) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(key) DO UPDATE SET status=excluded.status, details=excluded.details, "
            "updated_at=excluded.updated_at",
            (key, status, details, int(time.time())),
        )

    # ── Admin claim / list / invite ────────────────────────────────────
    def admin_claim_atomic(self, submitted_token: str, expected_token: str, tg_id: str | int) -> bool:
        """Atomically claim the first-admin slot. Returns True on success.

        Uses BEGIN IMMEDIATE so concurrent claimers serialize on the write lock.
        Token comparison is constant-time.
        """
        import hmac
        if not hmac.compare_digest(str(submitted_token), str(expected_token)):
            return False

        cur = self.conn.cursor()
        cur.execute("BEGIN IMMEDIATE")
        try:
            row = cur.execute(
                "SELECT claimed_by FROM admin_claimed WHERE id = 1"
            ).fetchone()
            if row is not None and row["claimed_by"]:
                cur.execute("COMMIT")
                return False
            cur.execute(
                "INSERT INTO admin_claimed(id, claimed_by, claimed_at) VALUES (1, ?, ?) "
                "ON CONFLICT(id) DO UPDATE SET claimed_by=excluded.claimed_by, "
                "claimed_at=excluded.claimed_at",
                (str(tg_id), int(time.time())),
            )
            cur.execute(
                "INSERT OR IGNORE INTO govless_admins(tg_id, invited_by, invited_at) VALUES (?, ?, ?)",
                (str(tg_id), "self-claim", int(time.time())),
            )
            cur.execute("COMMIT")
            return True
        except Exception:
            cur.execute("ROLLBACK")
            raise


    def admin_claim_first_atomic(self, tg_id):
        """Claim first-admin slot WITHOUT a token (UX simplification).
        Atomic via BEGIN IMMEDIATE — concurrent /start race-safe."""
        cur = self.conn.cursor()
        cur.execute("BEGIN IMMEDIATE")
        try:
            row = cur.execute(
                "SELECT claimed_by FROM admin_claimed WHERE id = 1"
            ).fetchone()
            already = row is not None and row["claimed_by"] is not None
            if already:
                cur.execute("ROLLBACK")
                return False
            cur.execute(
                "INSERT OR REPLACE INTO admin_claimed(id, claimed_by, claimed_at) VALUES (1, ?, ?)",
                (str(tg_id), int(time.time()))
            )
            cur.execute(
                "INSERT OR IGNORE INTO govless_admins(tg_id, invited_by, invited_at) VALUES (?, NULL, ?)",
                (str(tg_id), int(time.time()))
            )
            cur.execute("COMMIT")
            return True
        except Exception:
            try: cur.execute("ROLLBACK")
            except Exception: pass
            raise

    def get_admin_ids(self) -> list[str]:
        rows = self.conn.execute(
            "SELECT tg_id FROM govless_admins ORDER BY invited_at ASC"
        ).fetchall()
        return [r["tg_id"] for r in rows]

    def invite_admin(self, tg_id: str | int, invited_by: str | int | None = None) -> bool:
        """Idempotent admin invite. Returns True if newly added, False if already present."""
        cur = self.conn.execute(
            "INSERT OR IGNORE INTO govless_admins(tg_id, invited_by, invited_at) VALUES (?, ?, ?)",
            (str(tg_id), str(invited_by) if invited_by is not None else None, int(time.time())),
        )
        return cur.rowcount > 0

    # ── Pending confirms (typed-confirm tokens) ────────────────────────
    def store_pending_confirm(
        self, token: str, action: str, target: str | None, expected_string: str, ttl: int = 300
    ) -> None:
        self.conn.execute(
            "INSERT OR REPLACE INTO pending_confirms(token, action, target, expected_string, expires_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (token, action, target, expected_string, int(time.time()) + int(ttl)),
        )

    def consume_pending_confirm(self, token: str, submitted: str) -> dict | None:
        """Single-use consumption with TTL check. Returns row dict on match, else None."""
        import hmac
        now = int(time.time())
        # GC expired first
        self.conn.execute("DELETE FROM pending_confirms WHERE expires_at < ?", (now,))
        row = self.conn.execute(
            "SELECT action, target, expected_string, expires_at FROM pending_confirms WHERE token = ?",
            (token,),
        ).fetchone()
        if row is None:
            return None
        if row["expires_at"] < now:
            self.conn.execute("DELETE FROM pending_confirms WHERE token = ?", (token,))
            return None
        if not hmac.compare_digest(str(submitted), str(row["expected_string"])):
            return None
        # consume
        self.conn.execute("DELETE FROM pending_confirms WHERE token = ?", (token,))
        return dict(row)

    def close(self) -> None:
        try:
            self.conn.close()
        except Exception:
            pass
