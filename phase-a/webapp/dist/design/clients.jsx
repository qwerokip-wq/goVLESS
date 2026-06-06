// clients.jsx — Clients flow (C1 list, C2 card, C3 add, C4 QR share, C5 edit).
// Parameterized by theme + lang.

const CLIENTS_T = {
  ru: {
    title: "Клиенты", sub: (n) => `${n} активных`,
    search: "Поиск", filter: "Фильтры",
    fAll: "Все", fOn: "Только онлайн", fOff: "Выключенные", fExpired: "Истекли",
    add: "Добавить",
    cardTitleStatus: "Статус",
    cardTitleLink: "VLESS-ссылка",
    cardTitleSub: "Подписка",
    cardTitleActions: "Действия",
    kvStatus: "Статус", kvOnline: "Онлайн", kvTraffic: "Трафик",
    kvExpires: "Истекает", kvUUID: "UUID",
    online: "сейчас", offline: "был 14м назад",
    copy: "Копировать", copied: "Скопировано", qr: "QR",
    rotate: "Ротировать",
    pillProtected: "Защищён",
    pillDisabled: "Выключен",
    pillExpired: "Истёк",
    actEnable: "Включён", actDisable: "Выключить",
    actLimit: "Лимит трафика",
    actExpiry: "Срок",
    actReset: "Сбросить трафик",
    actRename: "Переименовать",
    actDelete: "Удалить",
    addTitle: "Новый клиент",
    addName: "Имя",
    addNamePh: "iPad Анны",
    addLimit: "Лимит трафика",
    addLimitHint: "0 — без лимита",
    addExpiry: "Срок действия",
    addColor: "Цвет аватара",
    addCreate: "Создать",
    cancel: "Отмена", save: "Сохранить", close: "Закрыть",
    share: "Поделиться",
    saveImg: "Сохранить картинку",
    encVless: "VLESS",
    encSub: "Подписка",
    deepV2: "v2rayNG", deepStreis: "Streisand", deepFox: "Foxray", deepClip: "В буфер",
    editLimitTitle: "Лимит трафика",
    editLimitHint: "Текущий: 62.1 GB / 100 GB",
    editLimitPh: "0 = без лимита",
  },
  en: {
    title: "Clients", sub: (n) => `${n} active`,
    search: "Search", filter: "Filters",
    fAll: "All", fOn: "Online", fOff: "Disabled", fExpired: "Expired",
    add: "Add",
    cardTitleStatus: "Status",
    cardTitleLink: "VLESS link",
    cardTitleSub: "Subscription",
    cardTitleActions: "Actions",
    kvStatus: "Status", kvOnline: "Online", kvTraffic: "Traffic",
    kvExpires: "Expires", kvUUID: "UUID",
    online: "now", offline: "14m ago",
    copy: "Copy", copied: "Copied", qr: "QR",
    rotate: "Rotate",
    pillProtected: "Active",
    pillDisabled: "Disabled",
    pillExpired: "Expired",
    actEnable: "Enabled", actDisable: "Disable",
    actLimit: "Traffic cap",
    actExpiry: "Expiry",
    actReset: "Reset traffic",
    actRename: "Rename",
    actDelete: "Delete",
    addTitle: "New client",
    addName: "Name",
    addNamePh: "Anna's iPad",
    addLimit: "Traffic cap",
    addLimitHint: "0 — unlimited",
    addExpiry: "Expires",
    addColor: "Avatar color",
    addCreate: "Create",
    cancel: "Cancel", save: "Save", close: "Close",
    share: "Share",
    saveImg: "Save image",
    encVless: "VLESS",
    encSub: "Sub",
    deepV2: "v2rayNG", deepStreis: "Streisand", deepFox: "Foxray", deepClip: "Clipboard",
    editLimitTitle: "Traffic cap",
    editLimitHint: "Current: 62.1 GB / 100 GB",
    editLimitPh: "0 = unlimited",
  },
};

// Demo clients (richer than CONTENT for the list)
const DEMO_CLIENTS = [
  { name: "iPhone Anna",     used: "62.1 GB", cap: "100 GB", days: "21д", on: true,  online: true,  hue: 145, pct: 62 },
  { name: "MBP Sergey",      used: "44.7 GB", cap: "200 GB", days: "21д", on: true,  online: true,  hue: 200, pct: 22 },
  { name: "iPad Kids",       used: "12.0 GB", cap: "50 GB",  days: "5д",  on: false, online: false, hue: 30,  pct: 24 },
  { name: "Work Laptop",     used: "118.2 GB", cap: "200 GB", days: "11д", on: true,  online: false, hue: 260, pct: 59 },
  { name: "Guest · Olga",    used: "0.3 GB",  cap: "20 GB",  days: "Истёк", on: false, online: false, hue: 340, pct: 1, expired: true },
];

// ─── Avatar helper ──────────────────────────────────────────────────
function CAvatar({ T, name, hue, size = 36 }) {
  const initials = (name || "?").split(/\s+/).map(w => w[0]).filter(Boolean).slice(0,2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: T.avatarRadius,
      background: `oklch(0.58 0.10 ${hue})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      color: "#fff", fontSize: size >= 48 ? 16 : 12, fontWeight: 600,
      flexShrink: 0, letterSpacing: "0.02em",
    }}>{initials}</div>
  );
}

// ─── C1 · Clients list ──────────────────────────────────────────────
function ClientsList({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = CLIENTS_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
        .cl-search {
          background: ${T.bg}; padding: 8px 14px 6px;
          display:flex; gap: 8px; flex: 0 0 auto;
        }
        .cl-search input {
          flex: 1; height: 36px; padding: 0 14px 0 36px;
          background: ${T.card}; border: 1px solid ${T.border}; border-radius: 10px;
          color: ${T.ink}; font: inherit; font-size: 13.5px;
          outline: none;
          background-image: url("data:image/svg+xml,%3Csvg width='14' height='14' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14' fill='none' stroke='${encodeURIComponent(T.ink3)}' stroke-width='1.6' stroke-linecap='round'%3E%3Ccircle cx='6' cy='6' r='4'/%3E%3Cpath d='M9 9l3.5 3.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: 12px 50%;
          transition: border-color var(--m-fast) var(--m-tight);
        }
        .cl-search input:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.focusRing}; }
        .cl-search .filt {
          width: 36px; height: 36px;
          background: ${T.card}; border: 1px solid ${T.border}; border-radius: 10px;
          display:flex; align-items:center; justify-content:center;
          color: ${T.ink2}; cursor: pointer;
        }
        .cl-chips {
          display:flex; gap: 6px; padding: 4px 14px 8px;
          flex: 0 0 auto; overflow-x: auto;
        }
        .cl-chip {
          flex: 0 0 auto;
          padding: 5px 11px; border-radius: 999px;
          background: ${T.card}; border: 1px solid ${T.border};
          color: ${T.ink2}; font-size: 11.5px; font-weight: 600;
          cursor: pointer;
        }
        .cl-chip.on {
          background: ${T.accent}; color: ${T.primaryInk}; border-color: ${T.accent};
        }
        .cl-list {
          background: ${T.card}; border: 1px solid ${T.hair}; border-radius: 16px;
          overflow: hidden; margin: 0 14px;
        }
        .cl-row { display:flex; align-items:center; gap: 12px; padding: 12px 14px; cursor: pointer; }
        .cl-row + .cl-row { border-top: 1px solid ${T.hair}; }
        .cl-row:hover { background: ${T.card2}; }
        .cl-row .nm { font-size: 14px; font-weight: 600; color: ${T.ink}; line-height: 1.2; }
        .cl-row .sub { font-family: ${T.mono}; font-size: 11px; color: ${T.ink3}; margin-top: 2px; font-variant-numeric: tabular-nums; }
        .cl-row .sub.expired { color: ${T.danger}; }
        .cl-mini-bar { height: 2px; background: ${T.bgSoft}; border-radius: 1px; margin-top: 5px; max-width: 100px; }
        .cl-mini-bar > span { display:block; height:100%; background: ${T.accent}; border-radius: 1px; }
        .cl-mini-bar.warn > span { background: ${T.warn}; }
        .cl-mini-bar.danger > span { background: ${T.danger}; }
        .cl-fab {
          position: absolute; right: 18px; bottom: 22px;
          height: 44px; padding: 0 18px; border-radius: 22px;
          background: ${T.accent}; color: ${T.primaryInk}; border: none;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer; display:flex; align-items:center; gap: 8px;
          box-shadow: ${T.isDark ? "0 8px 24px rgba(110,224,166,0.30)" : "0 8px 24px rgba(62,140,94,0.25)"};
        }
        .cl-body { flex:1; min-height:0; overflow:auto; padding-bottom: 80px; position: relative; }
      `}</style>

      <TgHeader T={T} title={L.title} sub={L.sub(4)} />

      <div className="cl-search">
        <input placeholder={L.search}/>
        <div className="filt">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h12M4 8h8M6 12h4"/></svg>
        </div>
      </div>
      <div className="cl-chips">
        <span className="cl-chip on">{L.fAll}</span>
        <span className="cl-chip">{L.fOn}</span>
        <span className="cl-chip">{L.fOff}</span>
        <span className="cl-chip">{L.fExpired}</span>
      </div>

      <div className="cl-body">
        <div className="cl-list">
          {DEMO_CLIENTS.map((c, i) => (
            <div className="cl-row" key={i}>
              <CAvatar T={T} name={c.name} hue={c.hue}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="nm">{c.name}</div>
                <div className={"sub" + (c.expired ? " expired" : "")}>
                  {c.used} / {c.cap} · {c.expired ? (lang==="ru"?"Истёк":"Expired") : `${lang==="ru"?"до":"till"} ${c.days}`}
                </div>
                <div className={`cl-mini-bar ${c.pct > 90 ? "danger" : c.pct > 75 ? "warn" : ""}`}>
                  <span style={{ width: `${Math.min(c.pct, 100)}%` }}/>
                </div>
              </div>
              {/* Right side: status dot or pill */}
              {c.expired ? (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                  background: T.dangerSoft, color: T.danger,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>{lang==="ru" ? "истёк" : "exp"}</span>
              ) : !c.on ? (
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: T.switchOff,
                }}/>
              ) : c.online ? (
                <span className="m-halo" style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: T.accent, color: T.accent,
                  boxShadow: T.isDark ? `0 0 6px ${T.accent}` : "none",
                }}/>
              ) : (
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, opacity: 0.5 }}/>
              )}
            </div>
          ))}
        </div>

        <button className="cl-fab m-press">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
          {L.add}
        </button>
      </div>
    </div>
  );
}

// ─── C2 · Client card ───────────────────────────────────────────────
function ClientCard({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = CLIENTS_T[lang];
  const c = DEMO_CLIENTS[0];

  // Mock truncated VLESS URL
  const vlessUrl = "vless://7e2f9c5e-1b1a-4c-8a-3f1e9b2c8d4a@198.51.100.42:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=google.com&fp=chrome&pbk=mZ_Yx9D4kF…&sid=a1b2c3#iPhone%20Anna";
  const subUrl = "https://sub.govless.dev/abc123def4567890";

  const Card = ({ title, children, right }) => (
    <div className="cc-card m-enter" style={{
      background: T.card, border: `1px solid ${T.hair}`, borderRadius: 16,
      padding: 14, marginBottom: 12,
    }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${T.hair}`,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: T.ink3,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );

  const KvRow = ({ k, v, mono, vColor }) => (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding: "6px 0", fontSize: 13,
    }}>
      <span style={{ color: T.ink3 }}>{k}</span>
      <span style={{
        color: vColor || T.ink, fontWeight: 500,
        fontFamily: mono ? T.mono : "inherit",
        fontVariantNumeric: "tabular-nums",
      }}>{v}</span>
    </div>
  );

  const CopyBtn = ({ label = L.copy }) => (
    <button className="m-press" style={{
      height: 36, padding: "0 12px", borderRadius: 8,
      background: T.card2, border: `1px solid ${T.border}`,
      color: T.ink, fontFamily:"inherit", fontSize: 12.5, fontWeight: 600,
      cursor:"pointer", display:"flex", alignItems:"center", gap: 6,
    }}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="7" height="7" rx="1"/>
        <path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/>
      </svg>
      {label}
    </button>
  );

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={c.name} sub={lang==="ru" ? "клиент · " + c.days : "client · expires " + c.days} />

      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 32px" }}>

        {/* Hero status row with avatar */}
        <div className="m-rise" style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 18,
          padding: 16, marginBottom: 12, display: "flex", gap: 14, alignItems:"center",
        }}>
          <CAvatar T={T} name={c.name} hue={c.hue} size={56}/>
          <div style={{ flex:1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.2px" }}>{c.name}</div>
            <div style={{ display:"flex", gap:6, marginTop: 6, alignItems:"center" }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap: 6,
                padding: "3px 9px 4px", borderRadius: 11,
                background: T.accentSoft, color: T.isDark ? T.accent2 : T.accent2,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
              }}>
                <span className="m-halo" style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: T.accent, color: T.accent,
                  boxShadow: T.isDark ? `0 0 4px ${T.accent}` : "none",
                }}/>
                {L.pillProtected}
              </span>
              <span style={{ fontSize: 11, color: T.ink3 }}>· {L.online}</span>
            </div>
          </div>
          {/* edit pencil */}
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: T.card2, color: T.ink2,
            display:"flex", alignItems:"center", justifyContent:"center",
            border: `1px solid ${T.border}`, cursor: "pointer",
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12.5V11L10 4l1.5 1.5L4.5 12.5z"/><path d="M9.5 4.5L11 3l1.5 1.5L11 5"/></svg>
          </div>
        </div>

        {/* 1. Status / kv */}
        <Card title={L.cardTitleStatus}>
          <KvRow k={L.kvTraffic} v={`${c.used} / ${c.cap}`} mono/>
          <div style={{ height: 2, background: T.bgSoft, borderRadius: 1, marginTop: 4, marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${c.pct}%`, background: T.accent, borderRadius: 1 }}/>
          </div>
          <KvRow k={L.kvExpires} v={c.days}/>
          <KvRow k={L.kvUUID} v="7e2f9c5e-1b1a-4c…" mono vColor={T.ink}/>
        </Card>

        {/* 2. VLESS link */}
        <Card title={L.cardTitleLink}>
          <div style={{
            fontFamily: T.mono, fontSize: 10, lineHeight: 1.4,
            color: T.ink2, background: T.card2,
            padding: "8px 10px", borderRadius: 8,
            wordBreak: "break-all", maxHeight: 64, overflow: "hidden",
            border: `1px solid ${T.border}`, position: "relative",
          }}>
            {vlessUrl.slice(0, 220)}…
            {/* fade */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, height: 24,
              background: `linear-gradient(to bottom, transparent, ${T.card2})`,
              pointerEvents: "none",
            }}/>
          </div>
          <div style={{ display:"flex", gap: 6, marginTop: 8 }}>
            <CopyBtn/>
            <button className="m-press" style={{
              flex: 1, height: 36, borderRadius: 8,
              background: T.accent, color: T.primaryInk, border:"none",
              fontFamily:"inherit", fontSize: 12.5, fontWeight: 600,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="1.5" width="4" height="4" rx="0.5"/><rect x="7.5" y="1.5" width="4" height="4" rx="0.5"/><rect x="1.5" y="7.5" width="4" height="4" rx="0.5"/><path d="M7.5 7.5h2v2M10.5 9.5v2M7.5 11.5h2"/></svg>
              {L.qr}
            </button>
          </div>
        </Card>

        {/* 3. Subscription */}
        <Card title={L.cardTitleSub}>
          <div style={{
            fontFamily: T.mono, fontSize: 11, color: T.ink,
            background: T.card2, border: `1px solid ${T.border}`,
            padding: "8px 10px", borderRadius: 8, wordBreak: "break-all",
          }}>{subUrl}</div>
          <div style={{ display:"flex", gap: 6, marginTop: 8 }}>
            <CopyBtn/>
            <button className="m-press" style={{
              height: 36, padding: "0 12px", borderRadius: 8,
              background: T.warnSoft, color: T.warn, border: `1px solid ${T.warn}33`,
              fontFamily:"inherit", fontSize: 12.5, fontWeight: 600, cursor:"pointer",
            }}>{L.rotate}</button>
          </div>
        </Card>

        {/* 4. Actions grid */}
        <Card title={L.cardTitleActions}>
          <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { l: L.actEnable,   kind: "ok",    on: true,  ic: "power" },
              { l: L.actLimit,    kind: "neut",  ic: "edit" },
              { l: L.actExpiry,   kind: "neut",  ic: "clock" },
              { l: L.actReset,    kind: "warn",  ic: "refresh" },
              { l: L.actRename,   kind: "neut",  ic: "edit" },
              { l: L.actDelete,   kind: "danger", ic: "trash" },
            ].map((a, i) => {
              const palette = a.kind === "ok" ? { bg: T.accentSoft, ink: T.isDark ? T.accent2 : T.accent2, bd: `${T.accent}40` }
                            : a.kind === "warn" ? { bg: T.warnSoft, ink: T.warn, bd: `${T.warn}40` }
                            : a.kind === "danger" ? { bg: T.dangerSoft, ink: T.danger, bd: `${T.danger}40` }
                            : { bg: T.card2, ink: T.ink, bd: T.border };
              return (
                <button key={i} className="m-press" style={{
                  height: 44, padding: "0 12px", borderRadius: 10,
                  background: palette.bg, color: palette.ink, border: `1px solid ${palette.bd}`,
                  fontFamily:"inherit", fontSize: 13, fontWeight: 600, cursor:"pointer",
                  display:"flex", alignItems:"center", gap: 8,
                }}>{a.l}</button>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}

// ─── C3 · Add client (modal sheet) ──────────────────────────────────
function AddClient({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = CLIENTS_T[lang];
  const hues = [145, 200, 30, 260, 340, 90, 230, 5];

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, position:"relative", overflow:"hidden",
    }}>
      <style>{`
        .ac-back { position:absolute; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .ac-sheet {
          position:absolute; left:0; right:0; bottom:0;
          background: ${T.card};
          border-top-left-radius: 18px; border-top-right-radius: 18px;
          border-top: 1px solid ${T.border};
          padding: 8px 18px 16px; display:flex; flex-direction:column; max-height: 90%;
          animation: tcUp var(--m-slow) var(--m-soft) both;
        }
        .ac-grab { width: 36px; height: 4px; border-radius: 2px; background: ${T.ink3}; opacity: 0.35; margin: 0 auto 14px; }
        .ac-title { font-size: 16px; font-weight: 700; letter-spacing: -0.2px; margin: 0 0 14px; }
        .ac-field { margin-bottom: 12px; }
        .ac-label { font-size: 12px; color: ${T.ink3}; font-weight: 600; margin-bottom: 6px; display:block; }
        .ac-input {
          width: 100%; height: 44px; padding: 0 14px;
          background: ${T.card2}; border: 1.5px solid ${T.border}; border-radius: 10px;
          color: ${T.ink}; font: inherit; font-size: 14px;
          outline: none;
          transition: border-color var(--m-fast) var(--m-tight);
        }
        .ac-input:focus { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.focusRing}; }
        .ac-hint { font-size: 11px; color: ${T.ink3}; margin-top: 4px; }
        .ac-hues { display:flex; gap: 8px; flex-wrap: wrap; }
        .ac-hue { width: 32px; height: 32px; border-radius: ${T.avatarRadius}; cursor: pointer; transition: transform 140ms cubic-bezier(0.4,0,0.2,1); position: relative; }
        .ac-hue.on { transform: scale(1.1); }
        .ac-hue.on::after { content: ""; position: absolute; inset: -3px; border-radius: ${T.avatarRadius}; border: 1.5px solid ${T.accent}; }
        .ac-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ac-foot { display:flex; gap: 10px; margin-top: 4px; }
      `}</style>
      <div className="ac-back"/>
      <div className="ac-sheet">
        <div className="ac-grab"/>
        <h3 className="ac-title">{L.addTitle}</h3>

        <div className="ac-field">
          <label style={{ fontSize: 12, color: T.ink3, fontWeight: 600, marginBottom: 6, display:"block" }}>{L.addName}</label>
          <input className="ac-input" placeholder={L.addNamePh}/>
        </div>

        <div className="ac-row2 ac-field">
          <div>
            <label style={{ fontSize: 12, color: T.ink3, fontWeight: 600, marginBottom: 6, display:"block" }}>{L.addLimit}</label>
            <input className="ac-input" placeholder="100" inputMode="numeric"/>
            <div className="ac-hint">{L.addLimitHint}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: T.ink3, fontWeight: 600, marginBottom: 6, display:"block" }}>{L.addExpiry}</label>
            <input className="ac-input" type="date" defaultValue="2026-06-25"/>
          </div>
        </div>

        <div className="ac-field">
          <label style={{ fontSize: 12, color: T.ink3, fontWeight: 600, marginBottom: 8, display:"block" }}>{L.addColor}</label>
          <div className="ac-hues">
            {hues.map((h, i) => (
              <div key={h} className={"ac-hue" + (i === 1 ? " on" : "")} style={{
                background: `oklch(0.58 0.10 ${h})`,
              }}/>
            ))}
          </div>
        </div>

        <div className="ac-foot">
          <button style={btnGhost(T)}>{L.cancel}</button>
          <button className="m-press" style={btnPrimary(T)}>{L.addCreate}</button>
        </div>
      </div>
    </div>
  );
}

// ─── C4 · QR share sheet ────────────────────────────────────────────
function QRShare({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = CLIENTS_T[lang];

  // Fake QR — pseudorandom blocks for visual.
  function fakeQRCells() {
    let s = 0x9e3779b9; const rnd = () => { s = (s * 16807) >>> 0; return (s >>> 24) / 256; };
    const N = 33;
    return Array.from({ length: N * N }, (_, i) => {
      const x = i % N, y = Math.floor(i / N);
      // finder patterns (corners)
      const isFinder = (cx, cy) => (Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 3 && (Math.abs(x - cx) === 3 || Math.abs(y - cy) === 3 || (Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1)));
      if (isFinder(3,3) || isFinder(N-4,3) || isFinder(3,N-4)) return true;
      return rnd() > 0.55;
    });
  }
  const cells = React.useMemo(fakeQRCells, []);
  const N = 33;
  const QRBG = T.isDark ? "#fff" : "#fff";
  const QRINK = T.isDark ? "#0c1322" : "#1c2820";

  const DeepBtn = ({ label, icon }) => (
    <button className="m-press" style={{
      flex: 1, height: 56, borderRadius: 12,
      background: T.card2, border: `1px solid ${T.border}`,
      color: T.ink, fontFamily:"inherit", fontSize: 11.5, fontWeight: 600,
      cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", gap: 4,
    }}>
      {icon}
      {label}
    </button>
  );

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, position:"relative", overflow:"hidden",
    }}>
      <style>{`
        .qr-back { position:absolute; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .qr-sheet {
          position:absolute; left:0; right:0; bottom:0;
          background: ${T.card};
          border-top-left-radius: 18px; border-top-right-radius: 18px;
          border-top: 1px solid ${T.border};
          padding: 8px 18px 16px; max-height: 95%; overflow:auto;
          animation: tcUp var(--m-slow) var(--m-soft) both;
        }
        .qr-grab { width: 36px; height: 4px; border-radius: 2px; background: ${T.ink3}; opacity: 0.35; margin: 0 auto 14px; }
        .qr-toggle {
          display:flex; padding: 3px; background: ${T.card2}; border: 1px solid ${T.border};
          border-radius: 10px; margin: 12px 0 14px;
        }
        .qr-toggle div {
          flex: 1; padding: 7px 0; text-align:center;
          font-size: 12.5px; font-weight: 600; border-radius: 7px; cursor: pointer;
          color: ${T.ink3};
          transition: background var(--m-base) var(--m-soft), color var(--m-base) var(--m-soft);
        }
        .qr-toggle .on { background: ${T.bg}; color: ${T.ink}; }
      `}</style>
      <div className="qr-back"/>
      <div className="qr-sheet">
        <div className="qr-grab"/>

        {/* Client name */}
        <div style={{ display:"flex", alignItems:"center", gap: 12, marginBottom: 12 }}>
          <CAvatar T={T} name="iPhone Anna" hue={145}/>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>iPhone Anna</div>
            <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 2 }}>{lang==="ru"?"Reality · Lite":"Reality · Lite"}</div>
          </div>
        </div>

        {/* QR */}
        <div className="m-rise" style={{
          background: QRBG, borderRadius: 12, padding: 14,
          width: "fit-content", margin: "0 auto", boxShadow: T.isDark ? "0 12px 36px rgba(0,0,0,0.4)" : "0 12px 36px rgba(33,72,52,0.12)",
        }}>
          <svg width="240" height="240" viewBox={`0 0 ${N} ${N}`}>
            {cells.map((on, i) => on ? <rect key={i} x={i % N} y={Math.floor(i / N)} width="1" height="1" fill={QRINK}/> : null)}
          </svg>
        </div>

        {/* Toggle VLESS vs Sub */}
        <div className="qr-toggle">
          <div className="on">{L.encVless}</div>
          <div>{L.encSub}</div>
        </div>

        {/* Deeplinks */}
        <div style={{ display:"flex", gap: 6, marginBottom: 10 }}>
          <DeepBtn label={L.deepV2}     icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M12 12v9M12 12L3 8M12 12l9-4"/></svg>}/>
          <DeepBtn label={L.deepStreis} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>}/>
          <DeepBtn label={L.deepFox}    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8c1-3 4-4 7-4s6 1 7 4M5 8l-1 5 4 7h8l4-7-1-5M9 11l2 1 2-1M15 11l2 1"/></svg>}/>
          <DeepBtn label={L.deepClip}   icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="3" width="10" height="18" rx="2"/><rect x="9" y="3" width="6" height="2.5" rx="1"/></svg>}/>
        </div>

        {/* Save image + close */}
        <div style={{ display:"flex", gap: 10 }}>
          <button style={btnGhost(T)}>{L.saveImg}</button>
          <button className="m-press" style={btnPrimary(T)}>{L.close}</button>
        </div>
      </div>
    </div>
  );
}

// ─── C5 · Edit field (limit / rename / expiry) ──────────────────────
function EditField({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = CLIENTS_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, position:"relative", overflow:"hidden",
    }}>
      <style>{`
        .ef-back { position:absolute; inset:0; background: rgba(0,0,0,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .ef-sheet {
          position:absolute; left:0; right:0; bottom:0;
          background: ${T.card};
          border-top-left-radius: 18px; border-top-right-radius: 18px;
          border-top: 1px solid ${T.border};
          padding: 8px 18px 16px;
          animation: tcUp var(--m-slow) var(--m-soft) both;
        }
        .ef-grab { width: 36px; height: 4px; border-radius: 2px; background: ${T.ink3}; opacity: 0.35; margin: 0 auto 14px; }
        .ef-input {
          width: 100%; height: 48px; padding: 0 14px;
          background: ${T.card2}; border: 1.5px solid ${T.accent}; border-radius: 10px;
          color: ${T.ink}; font: inherit; font-size: 17px; font-weight: 600;
          outline: none; box-shadow: 0 0 0 3px ${T.focusRing};
        }
      `}</style>
      <div className="ef-back"/>
      <div className="ef-sheet">
        <div className="ef-grab"/>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{L.editLimitTitle}</h3>
        <p style={{ fontSize: 12.5, color: T.ink3, margin: "0 0 12px" }}>{L.editLimitHint}</p>
        <input className="ef-input" defaultValue="100" inputMode="numeric"/>
        <div style={{ fontSize: 11.5, color: T.ink3, margin: "8px 4px 16px" }}>{L.editLimitPh}</div>
        <div style={{ display:"flex", gap: 10 }}>
          <button style={btnGhost(T)}>{L.cancel}</button>
          <button className="m-press" style={btnPrimary(T)}>{L.save}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ClientsList, ClientCard, AddClient, QRShare, EditField });
