// Shared theme tokens, derived from brief §2.1 + §2.2.
// Pass `theme: "L5" | "D2"` to any screen component; call getTokens(theme).

const TOKENS = {
  L5: {
    id: "L5",
    isDark: false,
    bg:           "#dfeee3",
    bgSoft:       "#eaf2ed",
    card:         "#ffffff",
    card2:        "#f7f6f2",
    border:       "#e6efea",
    hair:         "#eaf2ed",
    ink:          "#1c2820",
    ink2:         "#3b524a",
    ink3:         "#5b7568",
    accent:       "#3e8c5e",
    accent2:      "#2c6045",
    accentSoft:   "#e1efe4",
    warn:         "#b86a08",
    warnSoft:     "rgba(255,180,0,0.16)",
    danger:       "#b3322f",
    dangerSoft:   "rgba(232,90,90,0.12)",
    switchOff:    "#cfd9d3",
    shadow:       "0 6px 24px rgba(33,72,52,0.05)",
    chromeBg:     "#fbf9f2",
    font:         '"IBM Plex Sans", "Inter", system-ui, sans-serif',
    mono:         '"IBM Plex Mono", monospace',
    focusRing:    "rgba(62,140,94,0.35)",
    avatarRadius: "50%",
    primaryInk:   "#ffffff",
  },
  D2: {
    id: "D2",
    isDark: true,
    bg:           "#13161f",
    bgSoft:       "#191c27",
    card:         "#1b2030",
    card2:        "#1f243a",
    border:       "#232838",
    hair:         "#22273a",
    ink:          "#e8e7e2",
    ink2:         "#b9bccb",
    ink3:         "#7d8294",
    accent:       "#6ee0a6",
    accent2:      "#86e3b0",
    accentSoft:   "rgba(110,224,166,0.10)",
    warn:         "#e6b066",
    warnSoft:     "rgba(230,176,102,0.10)",
    danger:       "#e87a7a",
    dangerSoft:   "rgba(232,122,122,0.10)",
    switchOff:    "#2a3046",
    shadow:       "none",
    chromeBg:     "#191c27",
    font:         '"Manrope", "IBM Plex Sans", sans-serif',
    mono:         '"IBM Plex Mono", monospace',
    focusRing:    "rgba(110,224,166,0.35)",
    avatarRadius: "12px",
    primaryInk:   "#0c1322",
  },
};

function getTokens(theme) { return TOKENS[theme] || TOKENS.D2; }

// Shared button styles parameterized by tokens.
function btnPrimary(T, { disabled } = {}) {
  return {
    flex: 1, height: 46, borderRadius: 10, border: "none",
    background: disabled ? T.card : T.accent,
    color: disabled ? T.ink3 : T.primaryInk,
    fontFamily: "inherit", fontSize: 15, fontWeight: 600, letterSpacing: "-0.1px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    boxShadow: T.isDark
      ? "0 4px 12px rgba(110,224,166,0.18)"
      : "0 4px 12px rgba(62,140,94,0.18)",
  };
}
function btnGhost(T) {
  return {
    flex: "0 0 auto", padding: "0 18px", height: 46, borderRadius: 10,
    border: `1px solid ${T.border}`, background: "transparent", color: T.ink,
    fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
  };
}
function btnDanger(T) {
  return {
    flex: 1, height: 46, borderRadius: 10, border: "none",
    background: T.danger, color: "#fff",
    fontFamily: "inherit", fontSize: 15, fontWeight: 600, cursor: "pointer",
    boxShadow: T.isDark
      ? "0 4px 12px rgba(232,122,122,0.18)"
      : "0 4px 12px rgba(179,50,47,0.18)",
  };
}

// Header chrome.
function TgHeader({ T, title, sub, back = true, right }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", height:50, padding:"0 14px", gap:10,
      flex:"0 0 auto", background: T.chromeBg, borderBottom:`1px solid ${T.hair}`,
    }}>
      <div style={{ width:28, color: T.ink3, display:"flex", alignItems:"center" }}>
        {back ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 3.5L6 9l5.5 5.5"/></svg>
        ) : <span style={{ fontSize: 18, fontWeight: 300 }}>✕</span>}
      </div>
      <div style={{
        flex:1, textAlign:"center", fontSize:14.5, fontWeight:600, lineHeight:1.15,
        color: T.ink,
      }}>
        {title}
        {sub && <small style={{ display:"block", fontSize:11, fontWeight:500, color: T.ink3, marginTop:1 }}>{sub}</small>}
      </div>
      <div style={{ width:28, color: T.ink3, textAlign:"right", fontSize:18, letterSpacing:1 }}>{right ?? "⋯"}</div>
    </div>
  );
}

Object.assign(window, { TOKENS, getTokens, btnPrimary, btnGhost, btnDanger, TgHeader });
