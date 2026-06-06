// states.jsx — universal UI states: loading skeleton, empty, error,
// inline banner, toast. Parameterized by theme + lang.

const STATES_T = {
  ru: {
    emptyClientsT: "Никого пока нет",
    emptyClientsS: "Добавь первого клиента — это займёт пару минут.",
    emptyClientsBtn: "+ Добавить клиента",

    errOfflineT: "Сеть недоступна",
    errOfflineS: "Не получается достучаться до сервера. Проверь интернет на устройстве.",
    errOfflineP: "Повторить",
    errOfflineSec: "Открыть бот напрямую",

    errTimeoutT: "Сервер не отвечает",
    errTimeoutS: "Демон не ответил за 30 секунд. Возможно идёт перезапуск.",
    errTimeoutP: "Повторить",
    errTimeoutHelp: "Проверь статус демона",
    errTimeoutCmd: "systemctl status govlessctl",

    bannerWarn: "Трафик 91% от лимита",
    bannerOk: "Подписка скопирована",
    bannerErr: "Не удалось переключить inbound",
    bannerRetry: "Повторить",

    toastOk: "Сохранено",
    toastWarn: "Проверь подключение",
    toastErr: "Не удалось обновить",

    skeletonHeader: "Загружаем…",
  },
  en: {
    emptyClientsT: "No clients yet",
    emptyClientsS: "Add the first one — it takes about a minute.",
    emptyClientsBtn: "+ Add client",

    errOfflineT: "Network unavailable",
    errOfflineS: "Can't reach the server. Check your device's internet.",
    errOfflineP: "Retry",
    errOfflineSec: "Open bot directly",

    errTimeoutT: "Server timed out",
    errTimeoutS: "The daemon didn't respond within 30 seconds. It may be restarting.",
    errTimeoutP: "Retry",
    errTimeoutHelp: "Check the daemon status",
    errTimeoutCmd: "systemctl status govlessctl",

    bannerWarn: "Traffic at 91% of cap",
    bannerOk: "Subscription copied",
    bannerErr: "Failed to toggle inbound",
    bannerRetry: "Retry",

    toastOk: "Saved",
    toastWarn: "Check your connection",
    toastErr: "Update failed",

    skeletonHeader: "Loading…",
  },
};

// ── Shimmer skeleton (Clients list, while client.list resolves) ─────
function SkeletonClientsList({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = STATES_T[lang];

  const shimmerBg = T.isDark
    ? `linear-gradient(100deg, ${T.card2} 30%, ${T.border} 50%, ${T.card2} 70%)`
    : `linear-gradient(100deg, ${T.bgSoft} 30%, ${T.border} 50%, ${T.bgSoft} 70%)`;

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
        @keyframes sk-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .sk-bar {
          background-image: ${shimmerBg};
          background-size: 200% 100%;
          animation: sk-shimmer 1200ms ease-in-out infinite;
          border-radius: 5px;
        }
        @media (prefers-reduced-motion: reduce) {
          .sk-bar { animation: none; background: ${T.isDark ? T.card2 : T.bgSoft}; }
        }
        .sk-row {
          display:flex; align-items:center; gap: 12px;
          padding: 13px 16px;
          border-bottom: 1px solid ${T.hair};
        }
        .sk-row:last-child { border-bottom: none; }
        .sk-card {
          background: ${T.card}; border: 1px solid ${T.hair}; border-radius: 16px;
          overflow: hidden;
        }
        .sk-search {
          height: 36px; border-radius: 10px;
          background-image: ${shimmerBg};
          background-size: 200% 100%;
          animation: sk-shimmer 1200ms ease-in-out infinite;
        }
      `}</style>
      <TgHeader T={T} title={L.skeletonHeader} sub="" />
      <div style={{ flex:1, overflow:"auto", padding: "12px 14px 24px" }}>
        <div className="sk-search" style={{ marginBottom: 12 }}/>
        <div className="sk-card">
          {[0,1,2,3,4].map(i => (
            <div className="sk-row" key={i}>
              {/* avatar circle */}
              <div className="sk-bar" style={{
                width: 36, height: 36, borderRadius: T.avatarRadius, flexShrink:0,
              }}/>
              <div style={{ flex:1 }}>
                <div className="sk-bar" style={{ width: `${56 + (i*7)%30}%`, height: 11, marginBottom: 7 }}/>
                <div className="sk-bar" style={{ width: `${36 + (i*11)%24}%`, height: 9 }}/>
              </div>
              <div className="sk-bar" style={{ width: 34, height: 20, borderRadius: 10, flexShrink:0 }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty state (Clients) ───────────────────────────────────────────
function EmptyClients({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = STATES_T[lang];

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={lang==="ru" ? "Клиенты" : "Clients"} sub="0" />
      <div style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding: "0 32px", textAlign:"center", gap: 16,
      }} className="m-enter">
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: T.accentSoft,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: T.accent,
        }} className="m-breath">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5"/>
            <path d="M3 19c1-3.5 3.5-5 6-5"/>
            <path d="M15 13v6M18 16h-6"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>{L.emptyClientsT}</div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 6, lineHeight: 1.45, maxWidth: 260 }}>{L.emptyClientsS}</div>
        </div>
        <button className="m-press m-shine" style={{
          ...btnPrimary(T), flex: "0 0 auto", width: "100%", maxWidth: 240, marginTop: 8,
          height: 48,
        }}>{L.emptyClientsBtn}</button>
      </div>
    </div>
  );
}

// ── Error · Offline (network unavailable) ───────────────────────────
function ErrorOffline({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = STATES_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title="goVLESS" sub={lang==="ru" ? "Соединение прервано" : "Connection lost"} />
      <div style={{
        flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding: "0 32px", textAlign:"center", gap: 16,
      }} className="m-enter">
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: T.dangerSoft, color: T.danger,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7.5C5.5 5.5 8.5 4.5 12 4.5s6.5 1 9 3"/>
            <path d="M6 11.5C7.5 10 9.5 9.3 12 9.3"/>
            <path d="M9 15c1-0.8 2-1.2 3-1.2"/>
            <circle cx="12" cy="18" r="1.2" fill="currentColor"/>
            <path d="M3 3l18 18" stroke={T.bg} strokeWidth="2.5"/>
            <path d="M3 3l18 18"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>{L.errOfflineT}</div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 6, lineHeight: 1.45, maxWidth: 280 }}>{L.errOfflineS}</div>
        </div>
        <div style={{ width:"100%", maxWidth: 260, display:"flex", flexDirection:"column", gap: 8, marginTop: 8 }}>
          <button className="m-press" style={btnPrimary(T)}>{L.errOfflineP}</button>
          <button className="m-press" style={{
            ...btnGhost(T), width:"100%", flex: "0 0 auto", padding: 0, height: 44,
          }}>{L.errOfflineSec}</button>
        </div>
      </div>
    </div>
  );
}

// ── Error · Daemon timeout (with help block on extended fail) ───────
function ErrorTimeout({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = STATES_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title="goVLESS" sub={lang==="ru" ? "Демон" : "Daemon"} />
      <div style={{
        flex:1, overflow:"auto", padding: "32px 24px 24px",
        display:"flex", flexDirection:"column", alignItems:"center", gap: 16,
      }} className="m-enter">
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: T.warnSoft, color: T.warn,
          display:"flex", alignItems:"center", justifyContent:"center",
        }} className="m-breath">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
          </svg>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>{L.errTimeoutT}</div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 6, lineHeight: 1.45, maxWidth: 280 }}>{L.errTimeoutS}</div>
        </div>
        <button className="m-press" style={{ ...btnPrimary(T), maxWidth: 240 }}>{L.errTimeoutP}</button>

        {/* Help card after 3 fails */}
        <div style={{
          width: "100%", marginTop: 8,
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 12,
          padding: "12px 14px",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.ink3,
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6,
          }}>{lang==="ru" ? "Диагностика" : "Diagnostics"}</div>
          <div style={{ fontSize: 12.5, color: T.ink2, lineHeight: 1.4 }}>{L.errTimeoutHelp}:</div>
          <div style={{
            fontFamily: T.mono, fontSize: 11.5, color: T.ink,
            background: T.card2, padding: "8px 10px", borderRadius: 6,
            marginTop: 8, border: `1px solid ${T.border}`,
            wordBreak: "break-all",
          }}>{L.errTimeoutCmd}</div>
        </div>
      </div>
    </div>
  );
}

// ── Inline banners + toast showcase ─────────────────────────────────
function BannersShowcase({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = STATES_T[lang];

  const Banner = ({ kind, label, action }) => {
    const palette = kind === "warn"
      ? { bg: T.warnSoft, ink: T.warn, ic: T.warn }
      : kind === "ok"
      ? { bg: T.accentSoft, ink: T.accent2, ic: T.accent }
      : { bg: T.dangerSoft, ink: T.danger, ic: T.danger };
    const icon = kind === "warn" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 16H3L12 3z"/><path d="M12 10v4M12 17v0.4"/></svg>
    ) : kind === "ok" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M7.5 12.5L11 16l5.5-7"/></svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
    );
    return (
      <div style={{
        display:"flex", alignItems:"center", gap: 10,
        padding: "10px 12px", borderRadius: 10,
        background: palette.bg,
        border: `1px solid ${palette.ink}33`,
        color: palette.ink,
      }}>
        <div style={{ color: palette.ic, display:"flex" }}>{icon}</div>
        <div style={{ flex:1, fontSize: 12.5, fontWeight: 500, lineHeight: 1.4 }}>{label}</div>
        {action ? (
          <button style={{
            border:"none", background:"transparent", color: palette.ink, fontFamily:"inherit",
            fontSize: 12, fontWeight: 700, cursor:"pointer", padding: "4px 8px", borderRadius: 6,
          }}>{action}</button>
        ) : (
          <span style={{ color: palette.ink, opacity: 0.6, cursor:"pointer", padding: "0 4px" }}>✕</span>
        )}
      </div>
    );
  };

  const Toast = ({ kind, label }) => {
    const palette = kind === "warn" ? { bg: T.warn, ink: T.isDark ? T.bg : "#fff" }
                  : kind === "err"  ? { bg: T.danger, ink: "#fff" }
                  : { bg: T.accent, ink: T.primaryInk };
    return (
      <div style={{
        display:"inline-flex", alignItems:"center", gap: 8,
        padding: "9px 16px",
        background: palette.bg, color: palette.ink,
        borderRadius: 999, fontSize: 13, fontWeight: 600,
        boxShadow: T.isDark
          ? "0 8px 20px rgba(0,0,0,0.35)"
          : "0 8px 20px rgba(33,72,52,0.18)",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5L5.5 10l5.5-6"/></svg>
        {label}
      </div>
    );
  };

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={lang==="ru" ? "Состояния · banners" : "States · banners"} sub={lang==="ru" ? "Справочник" : "Reference"} />
      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px", display:"flex", flexDirection:"column", gap: 14 }}>
        <SectionTitle T={T}>{lang==="ru" ? "Инлайн-баннеры" : "Inline banners"}</SectionTitle>
        <Banner kind="warn"   label={L.bannerWarn} />
        <Banner kind="ok"     label={L.bannerOk} />
        <Banner kind="err"    label={L.bannerErr} action={L.bannerRetry} />

        <SectionTitle T={T}>{lang==="ru" ? "Тосты" : "Toasts"}</SectionTitle>
        <div style={{ display:"flex", flexDirection:"column", gap: 10, alignItems:"flex-start" }}>
          <Toast kind="ok"   label={L.toastOk}/>
          <Toast kind="warn" label={L.toastWarn}/>
          <Toast kind="err"  label={L.toastErr}/>
        </div>

        <div style={{
          marginTop: 4, fontSize: 11, color: T.ink3, lineHeight: 1.4,
          padding: "8px 12px", background: T.card, border: `1px solid ${T.hair}`, borderRadius: 10,
        }}>
          {lang==="ru"
            ? "Тосты появляются сверху по центру, fade-in 240мс, авто-исчезают через 2 с. Inline-баннеры — внутри body, dismissible или с действием."
            : "Toasts appear top-center, fade-in 240ms, auto-dismiss after 2s. Inline banners live inside the body, dismissible or with an action."}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ T, children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: T.ink3,
      letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "4px 4px 0",
    }}>{children}</div>
  );
}

Object.assign(window, {
  SkeletonClientsList, EmptyClients,
  ErrorOffline, ErrorTimeout,
  BannersShowcase,
});
