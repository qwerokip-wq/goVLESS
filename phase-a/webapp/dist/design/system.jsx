// system.jsx — S1 Overview · S2 Panel access · S3 Mode switch · S4 Repair.

const SYS_T = {
  ru: {
    sys: "Система",
    services: "Сервисы",
    versions: "Версия",
    rpc: "RPC",
    tunnel: "Туннель",
    rotate: "Ротировать",
    started: (d) => `запущен ${d}`,
    panelTitle: "Доступ к панели",
    panelUrl: "URL",
    panelLogin: "Логин",
    panelPass: "Пароль",
    panelRotate: "Ротировать креды",
    panelHelp: "Куда заходить",
    panelHelpBody: "Из браузера на ноутбуке — открыть URL выше, войти под этим логином и паролем. Из приложения этим заходить не нужно.",
    modeTitle: "Режим работы",
    modeCurrent: "Сейчас",
    modeWillBe: "Будет",
    modeEstimate: (m) => `≈ ${m} минут`,
    modeWillHappen: "Что произойдёт",
    modeSwitchBtn: (m) => `Переключиться на ${m}`,
    repairTitle: "Восстановление",
    repairHint: "Сервисные операции. Каждая безопасна, но требует подтверждения.",
    rIP: "Перенастроить IP",
    rIPs: "Если у VPS сменился публичный адрес",
    rSub: "Включить sub-сервер",
    rSubs: "Если подписки клиентов перестали работать",
    rRegen: "Перегенерировать ссылки",
    rRegens: "Пересоздать VLESS-ссылки из базы",
    rReset: "Сбросить дисклеймер",
    rResets: "Снова показать условия использования при следующем запуске",
    pillOk: "OK", pillIdle: "ожидает", pillWarn: "внимание",
    cancel: "Отмена",
  },
  en: {
    sys: "System",
    services: "Services",
    versions: "Versions",
    rpc: "RPC",
    tunnel: "Tunnel",
    rotate: "Rotate",
    started: (d) => `up ${d}`,
    panelTitle: "Panel access",
    panelUrl: "URL",
    panelLogin: "Login",
    panelPass: "Password",
    panelRotate: "Rotate credentials",
    panelHelp: "Where to use this",
    panelHelpBody: "Open the URL above in a desktop browser; sign in with these credentials. You don't need them from inside the app.",
    modeTitle: "Mode",
    modeCurrent: "Current",
    modeWillBe: "Switching to",
    modeEstimate: (m) => `≈ ${m} min`,
    modeWillHappen: "What happens",
    modeSwitchBtn: (m) => `Switch to ${m}`,
    repairTitle: "Recovery",
    repairHint: "Maintenance ops. Each is safe but requires confirmation.",
    rIP: "Refresh IP",
    rIPs: "If your VPS public IP has changed",
    rSub: "Re-enable sub-server",
    rSubs: "If client subscriptions stopped working",
    rRegen: "Regenerate links",
    rRegens: "Rebuild VLESS links from the database",
    rReset: "Reset disclaimer marker",
    rResets: "Show terms of use again on next launch",
    pillOk: "OK", pillIdle: "idle", pillWarn: "warn",
    cancel: "Cancel",
  },
};

// ── shared mini-atoms ───────────────────────────────────────────────
function SysCard({ T, title, right, children }) {
  return (
    <div className="m-enter" style={{
      background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
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
}
function SysKV({ T, k, v, mono, dot, dotKind = "ok", sub }) {
  const dotBg = dotKind === "ok" ? T.accent : dotKind === "warn" ? T.warn : dotKind === "err" ? T.danger : T.switchOff;
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding: "6px 0", fontSize: 13,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10, flex:1 }}>
        {dot && (
          <span className={dotKind === "ok" ? "m-halo" : ""} style={{
            width: 8, height: 8, borderRadius: "50%", background: dotBg,
            color: dotBg, flexShrink:0,
          }}/>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ color: T.ink, fontWeight: 500 }}>{k}</div>
          {sub && <div style={{ fontSize: 10.5, color: T.ink3, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      <span style={{
        color: T.ink2, fontWeight: 500,
        fontFamily: mono ? T.mono : "inherit",
        fontVariantNumeric: "tabular-nums", fontSize: 12,
      }}>{v}</span>
    </div>
  );
}

// ─── S1 · System overview ───────────────────────────────────────────
function SystemOverview({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = SYS_T[lang];

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.sys} sub="v 0.9.4-rc1" />

      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>

        {/* Tunnel pill hero */}
        <div className="m-rise" style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 16,
          padding: 14, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: T.accentSoft, color: T.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8a8 4 0 1 1 16 0v8a8 4 0 1 1-16 0V8z"/><path d="M4 12a8 4 0 1 0 16 0"/></svg>
          </div>
          <div style={{ flex:1, minWidth: 0 }}>
            <div style={{ display:"flex", alignItems:"center", gap: 6 }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:5,
                padding: "2px 8px 3px", borderRadius: 10,
                background: T.accentSoft, color: T.isDark ? T.accent2 : T.accent2,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
              }}>
                <span className="m-halo" style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: T.accent, color: T.accent,
                  boxShadow: T.isDark ? `0 0 4px ${T.accent}` : "none",
                }}/>
                Lite · Cloudflare
              </span>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 4, letterSpacing: "-0.2px" }}>
              {L.tunnel}
            </div>
            <div style={{ fontSize: 11, color: T.ink3, fontFamily: T.mono, marginTop: 2 }}>
              sha256:e9f4b1c8a2…
            </div>
          </div>
          <button className="m-press" style={{
            height: 32, padding: "0 10px", borderRadius: 8,
            background: T.warnSoft, color: T.warn, border: `1px solid ${T.warn}40`,
            fontFamily:"inherit", fontSize: 12, fontWeight: 600, cursor:"pointer",
          }}>{L.rotate}</button>
        </div>

        {/* Services */}
        <SysCard T={T} title={L.services}>
          <SysKV T={T} dot dotKind="ok"   k="govlessctl" v={L.started("14д 06:22")}/>
          <SysKV T={T} dot dotKind="ok"   k="x-ui"       v={L.started("14д")}/>
          <SysKV T={T} dot dotKind="ok"   k="xray-core"  v={L.started("14д")}/>
          <SysKV T={T} dot dotKind="idle" k="nginx"      v={lang==="ru"?"остановлен (Lite)":"stopped (Lite)"}/>
          <SysKV T={T} dot dotKind="ok"   k="cloudflared-quick" v={L.started("14д")}/>
        </SysCard>

        {/* Versions */}
        <SysCard T={T} title={L.versions}>
          <SysKV T={T} k="goVLESS" v="0.9.4-rc1" mono/>
          <SysKV T={T} k="3X-UI" v="v2.3.10" mono/>
          <SysKV T={T} k="cloudflared" v="2025.10.4" mono/>
          <SysKV T={T} k="OS" v="Debian 12.7" mono/>
          <SysKV T={T} k="kernel" v="6.1.0-25" mono/>
        </SysCard>

        {/* RPC */}
        <SysCard T={T} title={L.rpc}>
          <SysKV T={T} k="socket" v="/run/govlessctl.sock" mono/>
          <SysKV T={T} k={lang==="ru"?"задержка":"latency"} v="12 ms" mono/>
          <SysKV T={T} k={lang==="ru"?"последний вызов":"last call"} v="14:02:51" mono/>
        </SysCard>
      </div>
    </div>
  );
}

// ─── S2 · Panel access ──────────────────────────────────────────────
function PanelAccess({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = SYS_T[lang];

  const CredRow = ({ k, v, mono, masked }) => {
    return (
      <div style={{
        display:"flex", alignItems:"center", gap: 10,
        padding: "10px 12px",
        background: T.card2, border: `1px solid ${T.border}`,
        borderRadius: 10, marginTop: 8,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.ink3,
          letterSpacing: "0.08em", textTransform: "uppercase",
          width: 60, flexShrink: 0,
        }}>{k}</div>
        <div style={{
          flex: 1, minWidth: 0,
          fontFamily: mono ? T.mono : "inherit",
          fontSize: 13, fontWeight: 500, color: T.ink,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>{masked ? "•••••••••••••" : v}</div>
        {masked && (
          <button className="m-press" style={{
            width: 28, height: 28, borderRadius: 7, background: "transparent", color: T.ink3,
            border:`1px solid ${T.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 7C2.7 4.5 4.7 3 7 3s4.3 1.5 5.5 4C11.3 9.5 9.3 11 7 11S2.7 9.5 1.5 7z"/><circle cx="7" cy="7" r="1.5"/></svg>
          </button>
        )}
        <button className="m-press" style={{
          width: 28, height: 28, borderRadius: 7, background: "transparent", color: T.ink3,
          border:`1px solid ${T.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="7" height="7" rx="1"/><path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/></svg>
        </button>
      </div>
    );
  };

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.panelTitle} sub="3X-UI" />

      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>

        <SysCard T={T} title="3X-UI">
          <CredRow k={L.panelUrl} v="https://198.51.100.42:54321/abc" mono/>
          <CredRow k={L.panelLogin} v="admin" mono/>
          <CredRow k={L.panelPass} v="••••••••" mono masked/>
          <button className="m-press" style={{
            width:"100%", marginTop: 12, height: 42, borderRadius: 10,
            background: T.warnSoft, color: T.warn, border: `1px solid ${T.warn}40`,
            fontFamily:"inherit", fontSize: 13, fontWeight: 600, cursor:"pointer",
          }}>{L.panelRotate}</button>
        </SysCard>

        <SysCard T={T} title={L.panelHelp}>
          <ol style={{
            margin: 0, paddingLeft: 18,
            fontSize: 12.5, color: T.ink2, lineHeight: 1.55,
          }}>
            <li>{lang==="ru"
                ? "Откройте URL в браузере на компьютере."
                : "Open the URL in a desktop browser."}</li>
            <li>{lang==="ru"
                ? "Войдите под логином и паролем выше."
                : "Sign in with the login and password above."}</li>
            <li>{lang==="ru"
                ? "В Mini App вход в панель не нужен — все операции уже здесь."
                : "Inside the Mini App, you don't need the panel — all ops are already here."}</li>
          </ol>
        </SysCard>
      </div>
    </div>
  );
}

// ─── S3 · Mode switch Lite ↔ Pro ────────────────────────────────────
function ModeSwitch({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = SYS_T[lang];

  const ModeTile = ({ mode, label, sub, selected, est }) => (
    <div className="m-rise" style={{
      background: T.card,
      border: `1px solid ${selected ? T.accent : T.hair}`,
      borderRadius: 16,
      padding: "16px 16px 14px",
      position: "relative",
      boxShadow: selected ? `0 0 0 1px ${T.accent}` : "none",
      marginBottom: 10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 8 }}>
        <div style={{
          fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: selected ? T.accent : T.ink3,
          padding: "3px 8px", border: `1px solid ${selected ? T.accent : T.border}`, borderRadius: 5,
          letterSpacing: "0.04em",
        }}>{mode}</div>
        <div style={{ flex:1, fontSize: 16, fontWeight: 700, letterSpacing: "-0.2px" }}>{label}</div>
        {selected && (
          <div style={{
            width: 22, height: 22, borderRadius: 11, background: T.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke={T.primaryInk} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5L5 9l4.5-5.5"/></svg>
          </div>
        )}
        {!selected && (
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.ink3, letterSpacing: "0.04em", textTransform: "uppercase" }}>{est}</div>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.45 }}>{sub}</div>
    </div>
  );

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.modeTitle} />

      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 16px" }}>

        <ModeTile mode="LITE" selected
          label={lang==="ru" ? "Lite · быстрый старт" : "Lite · quick start"}
          sub={lang==="ru"
            ? "Cloudflare Quick Tunnel. Бесплатно, поднимается за минуту. URL может меняться."
            : "Cloudflare Quick Tunnel. Free, up in a minute. URL may rotate."}
        />
        <ModeTile mode="PRO" est={L.modeEstimate(4)}
          label={lang==="ru" ? "Pro · собственный домен" : "Pro · your own domain"}
          sub={lang==="ru"
            ? "Nginx + Let's Encrypt. Стабильный URL, быстрее, свой сертификат. Нужен домен и пара минут на DNS."
            : "Nginx + Let's Encrypt. Stable URL, faster, your own cert. Requires a domain and a few DNS minutes."}
        />

        <SysCard T={T} title={L.modeWillHappen}>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: T.ink2, lineHeight: 1.6 }}>
            <li>{lang==="ru" ? "Снимаем снапшот БД" : "DB snapshot"}</li>
            <li>{lang==="ru" ? "Останавливаем сервисы" : "Stop services"}</li>
            <li>{lang==="ru" ? "Меняем конфиг" : "Swap config"}</li>
            <li>{lang==="ru" ? "Заводим Let's Encrypt cert" : "Provision Let's Encrypt cert"}</li>
            <li>{lang==="ru" ? "Запускаем nginx" : "Start nginx"}</li>
            <li style={{ color: T.warn }}>{lang==="ru" ? "Откат при любой ошибке" : "Rollback on any failure"}</li>
          </ol>
        </SysCard>

      </div>

      <div style={{
        flex:"0 0 auto", padding:"10px 14px 14px",
        borderTop:`1px solid ${T.hair}`, background: T.chromeBg,
        display:"flex", gap: 10,
      }}>
        <button style={btnGhost(T)}>{L.cancel}</button>
        <button className="m-press" style={btnDanger(T)}>
          {L.modeSwitchBtn("Pro")}
        </button>
      </div>
    </div>
  );
}

// ─── S4 · Repair / Recovery ─────────────────────────────────────────
function Repair({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = SYS_T[lang];

  const Item = ({ title, sub, icon, danger }) => (
    <div className="m-press m-enter" style={{
      display:"flex", alignItems:"center", gap: 12,
      padding: 14, cursor:"pointer",
      background: T.card,
      transition: "background var(--m-fast) var(--m-tight)",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: danger ? T.dangerSoft : T.card2,
        color: danger ? T.danger : T.accent,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink: 0, border: `1px solid ${danger ? T.danger + "40" : T.border}`,
      }}>{icon}</div>
      <div style={{ flex:1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: danger ? T.danger : T.ink, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 3, lineHeight: 1.35 }}>{sub}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.ink3} strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4"/></svg>
    </div>
  );

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.repairTitle} />

      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>
        <div style={{
          fontSize: 12.5, color: T.ink3, lineHeight: 1.45,
          padding: "2px 4px 10px",
        }}>{L.repairHint}</div>

        <div style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
          overflow: "hidden",
        }}>
          <Item
            title={L.rIP} sub={L.rIPs}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="6.5"/><path d="M2.5 9h13M9 2.5c2 2 3 4 3 6.5s-1 4.5-3 6.5c-2-2-3-4-3-6.5s1-4.5 3-6.5z"/></svg>}
          />
          <div style={{ height: 1, background: T.hair, marginLeft: 14 }}/>
          <Item
            title={L.rSub} sub={L.rSubs}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="3" width="13" height="4.5" rx="1"/><rect x="2.5" y="10.5" width="13" height="4.5" rx="1"/><circle cx="5" cy="5.25" r="0.6" fill="currentColor"/><circle cx="5" cy="12.75" r="0.6" fill="currentColor"/></svg>}
          />
          <div style={{ height: 1, background: T.hair, marginLeft: 14 }}/>
          <Item
            title={L.rRegen} sub={L.rRegens}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9a6 6 0 0 1 10.5-4M15 9a6 6 0 0 1-10.5 4"/><path d="M13 2.5V5h-2.5M5 15.5V13h2.5"/></svg>}
          />
          <div style={{ height: 1, background: T.hair, marginLeft: 14 }}/>
          <Item
            danger
            title={L.rReset} sub={L.rResets}
            icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5h6L14 6v9.5H4.5z"/><path d="M10.5 2.5V6H14"/><path d="M7 9h4M7 11.5h4"/></svg>}
          />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SystemOverview, PanelAccess, ModeSwitch, Repair });
