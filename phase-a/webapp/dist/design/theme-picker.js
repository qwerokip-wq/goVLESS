/* generated from design/theme-picker.jsx by tools/build-webapp.js — DO NOT EDIT (edit the .jsx) */
// Settings → Theme & Language picker.
// One component, parameterized by lang ('ru'|'en') and mode ('light'|'dark') —
// 'mode' is the CURRENT app shell theme (so the picker chrome adapts), the
// grid tiles inside always show all 12 options (6 light + 6 dark).

const THEMES = [{
  id: "L5",
  name: "Mint",
  sub: "Пастельно",
  subEn: "Pastel",
  group: "light",
  bg: "#dfeee3",
  ink: "#1c2820",
  muted: "#5b7568",
  accent: "#2e7a55",
  font: '"IBM Plex Sans", sans-serif',
  tag: "Защищено"
}, {
  id: "D2",
  name: "Midnight",
  sub: "Спокойно",
  subEn: "Calm",
  group: "dark",
  bg: "#13161f",
  ink: "#e8e7e2",
  muted: "#7d8294",
  accent: "#6ee0a6",
  font: '"Manrope", sans-serif',
  tag: "Tunnel up"
}];
const T = {
  ru: {
    title: "Настройки",
    sub: "Тема и язык",
    langSec: "Язык интерфейса",
    langHint: "Применится сразу. Все экраны переведены.",
    themeSec: "Тема",
    themeHint: "Можно переключить в любой момент. Системная использует тему Telegram.",
    tabSystem: "Системная",
    tabLight: "Светлая",
    tabDark: "Тёмная",
    selected: "Выбрано",
    preview: "Предпросмотр",
    apply: "Применить",
    cancel: "Отмена",
    autoSwitch: "Авто по системе",
    autoSwitchHint: "Light днём, Dark вечером"
  },
  en: {
    title: "Settings",
    sub: "Appearance & language",
    langSec: "Interface language",
    langHint: "Applies instantly. All screens are translated.",
    themeSec: "Theme",
    themeHint: "Switch any time. ‘System’ follows your Telegram theme.",
    tabSystem: "System",
    tabLight: "Light",
    tabDark: "Dark",
    selected: "Selected",
    preview: "Preview",
    apply: "Apply",
    cancel: "Cancel",
    autoSwitch: "Match system",
    autoSwitchHint: "Light by day, dark by night"
  }
};

// A small chip preview that mimics a theme's hero block. Square-ish 152×96.
function ThemeTile({
  theme,
  selected,
  currentLang,
  picker,
  wide
}) {
  const isMono = /Mono|Terminal/.test(theme.font + theme.name);
  const labelTrans = currentLang === "en" ? theme.subEn : theme.sub;
  // Tile chrome adapts to outer picker mode
  const tileBorder = picker === "dark" ? "#2a2a2e" : "#e6e3d8";
  const tileBg = picker === "dark" ? "#1a1a1d" : "#fff";
  const labelInk = picker === "dark" ? "#e8e6df" : "#1a1917";
  const labelMute = picker === "dark" ? "#8a8a8e" : "#8a877f";
  const checkBg = picker === "dark" ? "#fff" : "#0a0a0a";
  const checkInk = picker === "dark" ? "#0a0a0a" : "#fff";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: tileBg,
      border: `1px solid ${selected ? picker === "dark" ? "#fff" : "#0a0a0a" : tileBorder}`,
      borderRadius: 14,
      padding: wide ? 10 : 8,
      position: "relative",
      boxShadow: selected ? `0 0 0 1px ${picker === "dark" ? "#fff" : "#0a0a0a"}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: theme.bg,
      borderRadius: 10,
      padding: wide ? "18px 20px 20px" : "10px 11px 11px",
      height: wide ? 180 : 96,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignSelf: "flex-start",
      alignItems: "center",
      gap: wide ? 6 : 4,
      padding: wide ? "4px 11px 5px" : "1px 6px 2px",
      borderRadius: 8,
      background: theme.group === "light" ? `color-mix(in oklch, ${theme.accent} 18%, ${theme.bg})` : `color-mix(in oklch, ${theme.accent} 22%, ${theme.bg})`,
      color: theme.accent,
      fontFamily: theme.font,
      fontSize: wide ? 11 : 8.5,
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: wide ? 6 : 5,
      height: wide ? 6 : 5,
      borderRadius: "50%",
      background: theme.accent
    }
  }), theme.tag), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: theme.font,
      fontSize: wide ? 26 : 14,
      fontWeight: 700,
      color: theme.ink,
      letterSpacing: "-0.4px",
      lineHeight: 1.05
    }
  }, "VPN on."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: isMono ? theme.font : '"IBM Plex Mono", monospace',
      fontSize: wide ? 11.5 : 8.5,
      color: theme.muted,
      letterSpacing: 0,
      lineHeight: 1,
      display: "flex",
      gap: wide ? 12 : 8
    }
  }, /*#__PURE__*/React.createElement("span", null, "4/5 clients"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "218 GB"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "14d"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      padding: wide ? "12px 4px 4px" : "8px 2px 2px",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSize: wide ? 15 : 12.5,
      fontWeight: 600,
      color: labelInk,
      letterSpacing: "-0.1px",
      lineHeight: 1.15,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, theme.name, " \xB7 ", theme.id), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSize: wide ? 12.5 : 10.5,
      color: labelMute,
      marginTop: 2,
      lineHeight: 1.2
    }
  }, labelTrans)), selected && /*#__PURE__*/React.createElement("div", {
    style: {
      width: wide ? 22 : 18,
      height: wide ? 22 : 18,
      borderRadius: 11,
      background: checkBg,
      color: checkInk,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: wide ? 13 : 11,
    height: wide ? 13 : 11,
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.5L5 9l4.5-5.5"
  })))));
}

// The full picker screen.
//   lang:    'ru' | 'en'
//   mode:    'light' | 'dark'  (the picker UI itself, NOT the selected theme)
//   selected: theme id currently active (default 'D1' for dark picker, 'L1' light)
function ThemePicker({
  lang = "ru",
  mode = "light",
  selected
}) {
  const t = T[lang];
  const isDark = mode === "dark";
  const sel = selected || (isDark ? "D1" : "L1");
  const activeTab = (THEMES.find(x => x.id === sel) || THEMES[0]).group;

  // Chrome palettes
  const cBg = isDark ? "#0d0e10" : "#f5f3ec";
  const cBgAlt = isDark ? "#111114" : "#fbf9f2";
  const cCard = isDark ? "#15151a" : "#ffffff";
  const cBorder = isDark ? "#23232a" : "#e8e4d6";
  const cInk = isDark ? "#eeece4" : "#1a1917";
  const cInk2 = isDark ? "#a8a8ac" : "#3a3936";
  const cInk3 = isDark ? "#7a7a7e" : "#8a877f";
  const cAccent = isDark ? "#ffffff" : "#0a0a0a";
  const cAccentInk = isDark ? "#0a0a0a" : "#ffffff";
  return /*#__PURE__*/React.createElement("div", {
    className: "frame",
    style: {
      background: cBg,
      color: cInk,
      fontFamily: '"IBM Plex Sans", sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      height: 50,
      padding: "0 14px",
      gap: 10,
      borderBottom: `1px solid ${cBorder}`,
      background: cBgAlt,
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      color: cInk2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11.5 3.5L6 9l5.5 5.5"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center",
      fontSize: 14.5,
      fontWeight: 600,
      lineHeight: 1.15
    }
  }, t.title, /*#__PURE__*/React.createElement("small", {
    style: {
      display: "block",
      fontSize: 10.5,
      fontWeight: 400,
      color: cInk3,
      marginTop: 1
    }
  }, t.sub)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      color: cInk3,
      textAlign: "right",
      fontSize: 18,
      letterSpacing: 1
    }
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflow: "auto",
      padding: "14px 14px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      padding: "0 4px 6px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      color: cInk3,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, t.langSec)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: cCard,
      border: `1px solid ${cBorder}`,
      borderRadius: 14,
      padding: 6,
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 4
    }
  }, [{
    code: "ru",
    label: "Русский",
    sub: "RU"
  }, {
    code: "en",
    label: "English",
    sub: "EN"
  }].map(L => {
    const on = L.code === lang;
    return /*#__PURE__*/React.createElement("div", {
      key: L.code,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 9,
        background: on ? isDark ? "rgba(255,255,255,0.07)" : "#f3f0e6" : "transparent"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 11,
        border: `1.5px solid ${on ? cAccent : cBorder}`,
        background: on ? cAccent : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "11",
      height: "11",
      viewBox: "0 0 12 12",
      fill: "none",
      stroke: cAccentInk,
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 6.5L5 9l4.5-5.5"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1.15
      }
    }, L.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 10.5,
        color: cInk3,
        marginTop: 1
      }
    }, L.sub)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 4px 0",
      fontSize: 11.5,
      color: cInk3,
      lineHeight: 1.4
    }
  }, t.langHint)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      padding: "0 4px 6px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 11,
      fontWeight: 600,
      color: cInk3,
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, t.themeSec), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 10.5,
      color: cInk3
    }
  }, THEMES.find(x => x.id === sel)?.id, " \xB7 ", THEMES.find(x => x.id === sel)?.name)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      background: cCard,
      border: `1px solid ${cBorder}`,
      borderRadius: 12,
      padding: 3,
      gap: 2,
      marginBottom: 12
    }
  }, [{
    v: "system",
    label: t.tabSystem,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "3",
      width: "10",
      height: "7",
      rx: "1"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.5 10v2M8.5 10v2M4 12h6"
    }))
  }, {
    v: "light",
    label: t.tabLight,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "7",
      cy: "7",
      r: "2.6"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 1v1.4M7 11.6V13M1 7h1.4M11.6 7H13M2.8 2.8l1 1M10.2 10.2l1 1M2.8 11.2l1-1M10.2 3.8l1-1"
    }))
  }, {
    v: "dark",
    label: t.tabDark,
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 14 14",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M11 8.5a4.5 4.5 0 0 1-5.5-5.8A5 5 0 1 0 11 8.5z"
    }))
  }].map(tab => {
    const on = tab.v === activeTab;
    return /*#__PURE__*/React.createElement("div", {
      key: tab.v,
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 8px",
        borderRadius: 9,
        background: on ? cAccent : "transparent",
        color: on ? cAccentInk : cInk2,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: "-0.1px"
      }
    }, tab.icon, tab.label);
  })), (() => {
    const filtered = THEMES.filter(x => x.group === activeTab);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: filtered.length === 1 ? "1fr" : "1fr 1fr",
        gap: 10
      }
    }, filtered.map(theme => /*#__PURE__*/React.createElement(ThemeTile, {
      key: theme.id,
      theme: theme,
      selected: theme.id === sel,
      currentLang: lang,
      picker: mode,
      wide: filtered.length === 1
    })));
  })(), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 4px 0",
      fontSize: 11.5,
      color: cInk3,
      lineHeight: 1.4
    }
  }, t.themeHint)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: cCard,
      border: `1px solid ${cBorder}`,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: isDark ? "rgba(255,255,255,0.06)" : "#f3f0e6",
      color: cInk2,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "9",
    r: "6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 3v12M3 9h12",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 3a6 6 0 0 0 0 12V3z",
    fill: "currentColor",
    opacity: "0.18"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500
    }
  }, t.autoSwitch), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: cInk3,
      marginTop: 1
    }
  }, t.autoSwitchHint)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 22,
      borderRadius: 11,
      background: cBorder,
      position: "relative",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 2,
      top: 2,
      width: 18,
      height: 18,
      borderRadius: 9,
      background: isDark ? "#7a7a7e" : "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      padding: "10px 14px 16px",
      borderTop: `1px solid ${cBorder}`,
      background: cBgAlt,
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      flex: "0 0 auto",
      padding: "0 18px",
      height: 46,
      borderRadius: 10,
      border: `1px solid ${cBorder}`,
      background: "transparent",
      color: cInk,
      fontFamily: "inherit",
      fontSize: 14.5,
      fontWeight: 500,
      cursor: "pointer"
    }
  }, t.cancel), /*#__PURE__*/React.createElement("button", {
    style: {
      flex: 1,
      height: 46,
      borderRadius: 10,
      border: "none",
      background: cAccent,
      color: cAccentInk,
      fontFamily: "inherit",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "-0.1px",
      cursor: "pointer"
    }
  }, t.apply, " \xB7 ", THEMES.find(x => x.id === sel)?.name)));
}
Object.assign(window, {
  ThemePicker
});
