/* generated from design/system.jsx by tools/build-webapp.js — DO NOT EDIT (edit the .jsx) */
// system.jsx — S1 Overview · S2 Panel access · S3 Mode switch · S4 Repair.

const SYS_T = {
  ru: {
    sys: "Система",
    services: "Сервисы",
    versions: "Версия",
    rpc: "RPC",
    tunnel: "Туннель",
    rotate: "Ротировать",
    started: d => `запущен ${d}`,
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
    modeEstimate: m => `≈ ${m} минут`,
    modeWillHappen: "Что произойдёт",
    modeSwitchBtn: m => `Переключиться на ${m}`,
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
    pillOk: "OK",
    pillIdle: "ожидает",
    pillWarn: "внимание",
    cancel: "Отмена"
  },
  en: {
    sys: "System",
    services: "Services",
    versions: "Versions",
    rpc: "RPC",
    tunnel: "Tunnel",
    rotate: "Rotate",
    started: d => `up ${d}`,
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
    modeEstimate: m => `≈ ${m} min`,
    modeWillHappen: "What happens",
    modeSwitchBtn: m => `Switch to ${m}`,
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
    pillOk: "OK",
    pillIdle: "idle",
    pillWarn: "warn",
    cancel: "Cancel"
  }
};

// ── shared mini-atoms ───────────────────────────────────────────────
function SysCard({
  T,
  title,
  right,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "m-enter",
    style: {
      background: T.card,
      border: `1px solid ${T.hair}`,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingBottom: 8,
      borderBottom: `1px solid ${T.hair}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.ink3,
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, title), right), children);
}
function SysKV({
  T,
  k,
  v,
  mono,
  dot,
  dotKind = "ok",
  sub
}) {
  const dotBg = dotKind === "ok" ? T.accent : dotKind === "warn" ? T.warn : dotKind === "err" ? T.danger : T.switchOff;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 0",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: 1
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: dotKind === "ok" ? "m-halo" : "",
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: dotBg,
      color: dotBg,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: T.ink,
      fontWeight: 500
    }
  }, k), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: T.ink3,
      marginTop: 1
    }
  }, sub))), /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.ink2,
      fontWeight: 500,
      fontFamily: mono ? T.mono : "inherit",
      fontVariantNumeric: "tabular-nums",
      fontSize: 12
    }
  }, v));
}

// ─── S1 · System overview ───────────────────────────────────────────
function SystemOverview({
  theme = "D2",
  lang = "ru"
}) {
  const T = getTokens(theme);
  const L = SYS_T[lang];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: T.bg,
      color: T.ink,
      fontFamily: T.font,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TgHeader, {
    T: T,
    title: L.sys,
    sub: "v 0.9.4-rc1"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: "14px 14px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-rise",
    style: {
      background: T.card,
      border: `1px solid ${T.hair}`,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 12,
      flexShrink: 0,
      background: T.accentSoft,
      color: T.accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 8a8 4 0 1 1 16 0v8a8 4 0 1 1-16 0V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 12a8 4 0 1 0 16 0"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "2px 8px 3px",
      borderRadius: 10,
      background: T.accentSoft,
      color: T.isDark ? T.accent2 : T.accent2,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.02em"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "m-halo",
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: T.accent,
      color: T.accent,
      boxShadow: T.isDark ? `0 0 4px ${T.accent}` : "none"
    }
  }), "Lite \xB7 Cloudflare")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      marginTop: 4,
      letterSpacing: "-0.2px"
    }
  }, L.tunnel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.ink3,
      fontFamily: T.mono,
      marginTop: 2
    }
  }, "sha256:e9f4b1c8a2\u2026")), /*#__PURE__*/React.createElement("button", {
    className: "m-press",
    style: {
      height: 32,
      padding: "0 10px",
      borderRadius: 8,
      background: T.warnSoft,
      color: T.warn,
      border: `1px solid ${T.warn}40`,
      fontFamily: "inherit",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer"
    }
  }, L.rotate)), /*#__PURE__*/React.createElement(SysCard, {
    T: T,
    title: L.services
  }, /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    dot: true,
    dotKind: "ok",
    k: "govlessctl",
    v: L.started("14д 06:22")
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    dot: true,
    dotKind: "ok",
    k: "x-ui",
    v: L.started("14д")
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    dot: true,
    dotKind: "ok",
    k: "xray-core",
    v: L.started("14д")
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    dot: true,
    dotKind: "idle",
    k: "nginx",
    v: lang === "ru" ? "остановлен (Lite)" : "stopped (Lite)"
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    dot: true,
    dotKind: "ok",
    k: "cloudflared-quick",
    v: L.started("14д")
  })), /*#__PURE__*/React.createElement(SysCard, {
    T: T,
    title: L.versions
  }, /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: "goVLESS",
    v: "0.9.4-rc1",
    mono: true
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: "3X-UI",
    v: "v2.3.10",
    mono: true
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: "cloudflared",
    v: "2025.10.4",
    mono: true
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: "OS",
    v: "Debian 12.7",
    mono: true
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: "kernel",
    v: "6.1.0-25",
    mono: true
  })), /*#__PURE__*/React.createElement(SysCard, {
    T: T,
    title: L.rpc
  }, /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: "socket",
    v: "/run/govlessctl.sock",
    mono: true
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: lang === "ru" ? "задержка" : "latency",
    v: "12 ms",
    mono: true
  }), /*#__PURE__*/React.createElement(SysKV, {
    T: T,
    k: lang === "ru" ? "последний вызов" : "last call",
    v: "14:02:51",
    mono: true
  }))));
}

// ─── S2 · Panel access ──────────────────────────────────────────────
function PanelAccess({
  theme = "D2",
  lang = "ru"
}) {
  const T = getTokens(theme);
  const L = SYS_T[lang];
  const CredRow = ({
    k,
    v,
    mono,
    masked
  }) => {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: T.card2,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: T.ink3,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        width: 60,
        flexShrink: 0
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        fontFamily: mono ? T.mono : "inherit",
        fontSize: 13,
        fontWeight: 500,
        color: T.ink,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, masked ? "•••••••••••••" : v), masked && /*#__PURE__*/React.createElement("button", {
      className: "m-press",
      style: {
        width: 28,
        height: 28,
        borderRadius: 7,
        background: "transparent",
        color: T.ink3,
        border: `1px solid ${T.border}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M1.5 7C2.7 4.5 4.7 3 7 3s4.3 1.5 5.5 4C11.3 9.5 9.3 11 7 11S2.7 9.5 1.5 7z"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "7",
      cy: "7",
      r: "1.5"
    }))), /*#__PURE__*/React.createElement("button", {
      className: "m-press",
      style: {
        width: 28,
        height: 28,
        borderRadius: 7,
        background: "transparent",
        color: T.ink3,
        border: `1px solid ${T.border}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 14 14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "4",
      y: "4",
      width: "7",
      height: "7",
      rx: "1"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"
    }))));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: T.bg,
      color: T.ink,
      fontFamily: T.font,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TgHeader, {
    T: T,
    title: L.panelTitle,
    sub: "3X-UI"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: "14px 14px 24px"
    }
  }, /*#__PURE__*/React.createElement(SysCard, {
    T: T,
    title: "3X-UI"
  }, /*#__PURE__*/React.createElement(CredRow, {
    k: L.panelUrl,
    v: "https://198.51.100.42:54321/abc",
    mono: true
  }), /*#__PURE__*/React.createElement(CredRow, {
    k: L.panelLogin,
    v: "admin",
    mono: true
  }), /*#__PURE__*/React.createElement(CredRow, {
    k: L.panelPass,
    v: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    mono: true,
    masked: true
  }), /*#__PURE__*/React.createElement("button", {
    className: "m-press",
    style: {
      width: "100%",
      marginTop: 12,
      height: 42,
      borderRadius: 10,
      background: T.warnSoft,
      color: T.warn,
      border: `1px solid ${T.warn}40`,
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer"
    }
  }, L.panelRotate)), /*#__PURE__*/React.createElement(SysCard, {
    T: T,
    title: L.panelHelp
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12.5,
      color: T.ink2,
      lineHeight: 1.55
    }
  }, /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Откройте URL в браузере на компьютере." : "Open the URL in a desktop browser."), /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Войдите под логином и паролем выше." : "Sign in with the login and password above."), /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "В Mini App вход в панель не нужен — все операции уже здесь." : "Inside the Mini App, you don't need the panel — all ops are already here.")))));
}

// ─── S3 · Mode switch Lite ↔ Pro ────────────────────────────────────
function ModeSwitch({
  theme = "D2",
  lang = "ru"
}) {
  const T = getTokens(theme);
  const L = SYS_T[lang];
  const ModeTile = ({
    mode,
    label,
    sub,
    selected,
    est
  }) => /*#__PURE__*/React.createElement("div", {
    className: "m-rise",
    style: {
      background: T.card,
      border: `1px solid ${selected ? T.accent : T.hair}`,
      borderRadius: 16,
      padding: "16px 16px 14px",
      position: "relative",
      boxShadow: selected ? `0 0 0 1px ${T.accent}` : "none",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: T.mono,
      fontSize: 11,
      fontWeight: 700,
      color: selected ? T.accent : T.ink3,
      padding: "3px 8px",
      border: `1px solid ${selected ? T.accent : T.border}`,
      borderRadius: 5,
      letterSpacing: "0.04em"
    }
  }, mode), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: "-0.2px"
    }
  }, label), selected && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: 11,
      background: T.accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: T.primaryInk,
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.5L5 9l4.5-5.5"
  }))), !selected && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: T.mono,
      fontSize: 10.5,
      color: T.ink3,
      letterSpacing: "0.04em",
      textTransform: "uppercase"
    }
  }, est)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.ink3,
      lineHeight: 1.45
    }
  }, sub));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: T.bg,
      color: T.ink,
      fontFamily: T.font,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TgHeader, {
    T: T,
    title: L.modeTitle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: "14px 14px 16px"
    }
  }, /*#__PURE__*/React.createElement(ModeTile, {
    mode: "LITE",
    selected: true,
    label: lang === "ru" ? "Lite · быстрый старт" : "Lite · quick start",
    sub: lang === "ru" ? "Cloudflare Quick Tunnel. Бесплатно, поднимается за минуту. URL может меняться." : "Cloudflare Quick Tunnel. Free, up in a minute. URL may rotate."
  }), /*#__PURE__*/React.createElement(ModeTile, {
    mode: "PRO",
    est: L.modeEstimate(4),
    label: lang === "ru" ? "Pro · собственный домен" : "Pro · your own domain",
    sub: lang === "ru" ? "Nginx + Let's Encrypt. Стабильный URL, быстрее, свой сертификат. Нужен домен и пара минут на DNS." : "Nginx + Let's Encrypt. Stable URL, faster, your own cert. Requires a domain and a few DNS minutes."
  }), /*#__PURE__*/React.createElement(SysCard, {
    T: T,
    title: L.modeWillHappen
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12.5,
      color: T.ink2,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Снимаем снапшот БД" : "DB snapshot"), /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Останавливаем сервисы" : "Stop services"), /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Меняем конфиг" : "Swap config"), /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Заводим Let's Encrypt cert" : "Provision Let's Encrypt cert"), /*#__PURE__*/React.createElement("li", null, lang === "ru" ? "Запускаем nginx" : "Start nginx"), /*#__PURE__*/React.createElement("li", {
    style: {
      color: T.warn
    }
  }, lang === "ru" ? "Откат при любой ошибке" : "Rollback on any failure")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      padding: "10px 14px 14px",
      borderTop: `1px solid ${T.hair}`,
      background: T.chromeBg,
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: btnGhost(T)
  }, L.cancel), /*#__PURE__*/React.createElement("button", {
    className: "m-press",
    style: btnDanger(T)
  }, L.modeSwitchBtn("Pro"))));
}

// ─── S4 · Repair / Recovery ─────────────────────────────────────────
function Repair({
  theme = "D2",
  lang = "ru"
}) {
  const T = getTokens(theme);
  const L = SYS_T[lang];
  const Item = ({
    title,
    sub,
    icon,
    danger
  }) => /*#__PURE__*/React.createElement("div", {
    className: "m-press m-enter",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: 14,
      cursor: "pointer",
      background: T.card,
      transition: "background var(--m-fast) var(--m-tight)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: danger ? T.dangerSoft : T.card2,
      color: danger ? T.danger : T.accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: `1px solid ${danger ? T.danger + "40" : T.border}`
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: danger ? T.danger : T.ink,
      lineHeight: 1.2
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: T.ink3,
      marginTop: 3,
      lineHeight: 1.35
    }
  }, sub)), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none",
    stroke: T.ink3,
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 3l4 4-4 4"
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: T.bg,
      color: T.ink,
      fontFamily: T.font,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TgHeader, {
    T: T,
    title: L.repairTitle
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto",
      padding: "14px 14px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.ink3,
      lineHeight: 1.45,
      padding: "2px 4px 10px"
    }
  }, L.repairHint), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.hair}`,
      borderRadius: 14,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Item, {
    title: L.rIP,
    sub: L.rIPs,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 18 18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "9",
      r: "6.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M2.5 9h13M9 2.5c2 2 3 4 3 6.5s-1 4.5-3 6.5c-2-2-3-4-3-6.5s1-4.5 3-6.5z"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: T.hair,
      marginLeft: 14
    }
  }), /*#__PURE__*/React.createElement(Item, {
    title: L.rSub,
    sub: L.rSubs,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 18 18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2.5",
      y: "3",
      width: "13",
      height: "4.5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "2.5",
      y: "10.5",
      width: "13",
      height: "4.5",
      rx: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5",
      cy: "5.25",
      r: "0.6",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5",
      cy: "12.75",
      r: "0.6",
      fill: "currentColor"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: T.hair,
      marginLeft: 14
    }
  }), /*#__PURE__*/React.createElement(Item, {
    title: L.rRegen,
    sub: L.rRegens,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 18 18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M3 9a6 6 0 0 1 10.5-4M15 9a6 6 0 0 1-10.5 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13 2.5V5h-2.5M5 15.5V13h2.5"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: T.hair,
      marginLeft: 14
    }
  }), /*#__PURE__*/React.createElement(Item, {
    danger: true,
    title: L.rReset,
    sub: L.rResets,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 18 18",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4.5 2.5h6L14 6v9.5H4.5z"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10.5 2.5V6H14"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 9h4M7 11.5h4"
    }))
  }))));
}
Object.assign(window, {
  SystemOverview,
  PanelAccess,
  ModeSwitch,
  Repair
});
