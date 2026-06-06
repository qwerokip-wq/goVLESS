// confirm.jsx — destructive-action primitives.
// TypedConfirmModal + GenericModal + ActionSheet.
// All parameterized by `theme: "L5"|"D2"` and `lang: "ru"|"en"`.

const CONFIRM_T = {
  ru: {
    typedTitle: "Подтвердите действие",
    typedHint: "Введите подсвеченный текст ниже",
    typedTtl: (s) => `действительно ещё ${s}с`,
    cancel: "Отмена",
    confirm: "Подтвердить",
    mismatch: "Текст не совпадает",
    sheetClose: "Закрыть",
  },
  en: {
    typedTitle: "Confirm action",
    typedHint: "Type the highlighted text below",
    typedTtl: (s) => `valid for ${s}s`,
    cancel: "Cancel",
    confirm: "Confirm",
    mismatch: "Text does not match",
    sheetClose: "Close",
  },
};

// ── Typed-confirm modal (destructive RPC pattern) ───────────────────
function TypedConfirmModal({ theme = "D2", lang = "ru",
  title, description, echo, ttl = 47, typedValue, error, danger = true,
}) {
  const T = getTokens(theme);
  const L = CONFIRM_T[lang];
  const ready = typedValue === echo;

  return (
    <div className="tc-root" style={{
      width:"100%", height:"100%", position:"relative", overflow:"hidden",
      background: T.bg, fontFamily: T.font,
    }}>
      <style>{`
        .tc-root .tc-back {
          position:absolute; inset:0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .tc-root .tc-sheet {
          position:absolute; left:0; right:0; bottom:0;
          background: ${T.card};
          border-top-left-radius: 18px; border-top-right-radius: 18px;
          border-top: 1px solid ${T.border};
          padding: 8px 18px 18px;
          animation: tcUp var(--m-slow, 460ms) var(--m-soft, cubic-bezier(0.32,0.72,0,1)) both;
          color: ${T.ink};
        }
        @keyframes tcUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .tc-grab {
          width: 36px; height: 4px; border-radius: 2px;
          background: ${T.ink3}; opacity: 0.35;
          margin: 0 auto 14px;
        }
        .tc-title { font-size: 16px; font-weight: 700; letter-spacing: -0.2px; margin: 0 0 4px; color: ${T.ink}; }
        .tc-desc { font-size: 12.5px; line-height: 1.5; color: ${T.ink3}; margin: 0 0 12px; }
        .tc-echo {
          font-family: ${T.mono};
          font-size: 13px; font-weight: 700;
          padding: 8px 12px; border-radius: 6px;
          background: ${danger ? T.dangerSoft : T.warnSoft};
          color: ${danger ? T.danger : T.warn};
          letter-spacing: 0.02em; margin: 0 0 10px;
          display: inline-block;
        }
        .tc-input {
          width: 100%; height: 44px; padding: 0 14px;
          border-radius: 10px; border: 1.5px solid ${error ? T.danger : T.border};
          background: ${T.card2};
          color: ${T.ink}; font-family: ${T.mono};
          font-size: 13px; letter-spacing: 0.02em;
          outline: none;
          transition: border-color var(--m-fast, 140ms) var(--m-tight, cubic-bezier(0.4,0,0.2,1));
        }
        .tc-input:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.focusRing}; }
        .tc-meta { display:flex; align-items:center; justify-content:space-between; margin: 8px 4px 16px; font-size: 11px; color: ${T.ink3}; }
        .tc-ttl { font-family: ${T.mono}; }
        .tc-err { color: ${T.danger}; }
        .tc-actions { display:flex; gap:10px; }
      `}</style>

      {/* Backdrop simulation — shows blurred content behind */}
      <div className="tc-back"/>

      {/* The sheet */}
      <div className="tc-sheet">
        <div className="tc-grab"/>
        <h3 className="tc-title">{title || L.typedTitle}</h3>
        <p className="tc-desc">{description}</p>
        <div className="tc-echo">{echo}</div>
        <input
          className="tc-input"
          type="text"
          defaultValue={typedValue}
          placeholder={echo.slice(0, 1) + "…"}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="tc-meta">
          <span className={error ? "tc-err" : ""}>{error ? L.mismatch : L.typedHint}</span>
          <span className="tc-ttl">{L.typedTtl(ttl)}</span>
        </div>
        <div className="tc-actions">
          <button style={btnGhost(T)}>{L.cancel}</button>
          <button
            className="m-press"
            style={ready
              ? (danger ? btnDanger(T) : btnPrimary(T))
              : btnPrimary(T, { disabled: true })
            }>
            {L.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generic modal: title + body + 2-button row ──────────────────────
function GenericModalDemo({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const isRu = lang === "ru";
  return (
    <div style={{
      width:"100%", height:"100%", position:"relative", overflow:"hidden",
      background: T.bg, fontFamily: T.font, color: T.ink,
    }}>
      <style>{`
        .gm-back { position:absolute; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .gm-sheet {
          position:absolute; left:0; right:0; bottom:0;
          background: ${T.card};
          border-top-left-radius: 18px; border-top-right-radius: 18px;
          border-top: 1px solid ${T.border};
          padding: 8px 0 16px;
          animation: tcUp 460ms cubic-bezier(0.32,0.72,0,1) both;
        }
        .gm-grab { width: 36px; height: 4px; border-radius: 2px; background: ${T.ink3}; opacity: 0.35; margin: 0 auto 14px; }
        .gm-h { display:flex; align-items:center; padding: 0 18px 12px; border-bottom: 1px solid ${T.hair}; gap: 10px; }
        .gm-h h3 { flex:1; margin:0; font-size: 15px; font-weight: 700; letter-spacing: -0.2px; }
        .gm-h .x { width: 30px; height: 30px; border-radius: 8px; background: transparent; color: ${T.ink3}; display:flex; align-items:center; justify-content:center; font-size: 18px; cursor:pointer; }
        .gm-body { padding: 16px 18px 4px; font-size: 13.5px; line-height: 1.55; color: ${T.ink2}; }
        .gm-foot { padding: 12px 18px 0; display:flex; gap: 10px; }
      `}</style>
      <div className="gm-back"/>
      <div className="gm-sheet">
        <div className="gm-grab"/>
        <div className="gm-h">
          <h3>{isRu ? "Сбросить трафик" : "Reset traffic"}</h3>
          <button className="x">✕</button>
        </div>
        <div className="gm-body">
          {isRu
            ? "Это обнулит счётчики трафика для клиента «iPhone Anna». История сохранится в audit-log."
            : "This resets traffic counters for client \"iPhone Anna\". The audit log keeps a record."}
        </div>
        <div className="gm-foot">
          <button style={btnGhost(T)}>{isRu ? "Отмена" : "Cancel"}</button>
          <button className="m-press" style={btnPrimary(T)}>{isRu ? "Сбросить" : "Reset"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Action sheet: list of actions (one destructive last) ────────────
function ActionSheetDemo({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const isRu = lang === "ru";
  const actions = isRu ? [
    { label: "Включить", icon: "power", kind: "default" },
    { label: "Изменить лимит", icon: "edit", kind: "default" },
    { label: "Изменить срок", icon: "clock", kind: "default" },
    { label: "Сбросить трафик", icon: "refresh", kind: "warn" },
    { label: "Переименовать", icon: "edit", kind: "default" },
    { label: "Удалить клиента", icon: "trash", kind: "danger" },
  ] : [
    { label: "Enable", icon: "power", kind: "default" },
    { label: "Change limit", icon: "edit", kind: "default" },
    { label: "Change expiry", icon: "clock", kind: "default" },
    { label: "Reset traffic", icon: "refresh", kind: "warn" },
    { label: "Rename", icon: "edit", kind: "default" },
    { label: "Delete client", icon: "trash", kind: "danger" },
  ];

  function ic(name) {
    const props = { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
    switch (name) {
      case "power": return <svg {...props}><path d="M9 3v6"/><path d="M5.5 5.5a5 5 0 1 0 7 0"/></svg>;
      case "edit": return <svg {...props}><path d="M3 14.5V13L12 4l1.5 1.5L4.5 14.5z"/><path d="M11.5 4.5L13 3l1.5 1.5L13 6"/></svg>;
      case "clock": return <svg {...props}><circle cx="9" cy="9" r="6.5"/><path d="M9 5.5V9l2.5 1.5"/></svg>;
      case "refresh": return <svg {...props}><path d="M3 9a6 6 0 0 1 10.5-4M15 9a6 6 0 0 1-10.5 4"/><path d="M13 2.5V5h-2.5M5 15.5V13h2.5"/></svg>;
      case "trash": return <svg {...props}><path d="M3.5 5h11"/><path d="M7 5V3.5h4V5"/><path d="M5 5l.7 10.5h6.6L13 5"/></svg>;
    }
  }

  return (
    <div style={{
      width:"100%", height:"100%", position:"relative", overflow:"hidden",
      background: T.bg, fontFamily: T.font, color: T.ink,
    }}>
      <style>{`
        .as-back { position:absolute; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .as-sheet {
          position:absolute; left:0; right:0; bottom:0;
          background: ${T.card};
          border-top-left-radius: 18px; border-top-right-radius: 18px;
          border-top: 1px solid ${T.border};
          padding: 8px 0 16px;
          animation: tcUp 460ms cubic-bezier(0.32,0.72,0,1) both;
        }
        .as-grab { width: 36px; height: 4px; border-radius: 2px; background: ${T.ink3}; opacity: 0.35; margin: 0 auto 14px; }
        .as-title { padding: 0 18px 10px; font-size: 11px; font-weight: 700; color: ${T.ink3}; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 1px solid ${T.hair}; }
        .as-row {
          display:flex; align-items:center; gap: 12px;
          padding: 14px 18px;
          font-size: 14.5px; cursor: pointer;
          transition: background var(--m-fast, 140ms) var(--m-tight, cubic-bezier(0.4,0,0.2,1));
        }
        .as-row + .as-row { border-top: 1px solid ${T.hair}; }
        .as-row:hover { background: ${T.card2}; }
        .as-row.warn { color: ${T.warn}; }
        .as-row.danger { color: ${T.danger}; }
        .as-row .ic { width: 32px; height: 32px; border-radius: 8px; background: ${T.card2}; display:flex; align-items:center; justify-content:center; flex-shrink: 0; color: inherit; }
        .as-cancel-wrap { padding: 12px 18px 0; }
        .as-cancel {
          width: 100%; height: 46px; border-radius: 10px;
          background: ${T.card2}; color: ${T.ink};
          font-family: inherit; font-size: 14.5px; font-weight: 600;
          border: 1px solid ${T.border}; cursor: pointer;
        }
      `}</style>
      <div className="as-back"/>
      <div className="as-sheet">
        <div className="as-grab"/>
        <div className="as-title">{isRu ? "iPhone Anna · действия" : "iPhone Anna · actions"}</div>
        {actions.map((a, i) => (
          <div key={i} className={`as-row ${a.kind !== "default" ? a.kind : ""}`}>
            <div className="ic">{ic(a.icon)}</div>
            <div style={{ flex:1 }}>{a.label}</div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4"/></svg>
          </div>
        ))}
        <div className="as-cancel-wrap">
          <button className="as-cancel">{isRu ? "Отмена" : "Cancel"}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TypedConfirmModal, GenericModalDemo, ActionSheetDemo });
