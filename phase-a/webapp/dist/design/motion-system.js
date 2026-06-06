/* generated from design/motion-system.jsx by tools/build-webapp.js — DO NOT EDIT (edit the .jsx) */
// Motion System — living documentation artboard.
// Shows our motion language with running examples so the team
// (and future contributors) know the rules.
// 360 × 740, in the D2 Midnight Slate base.

function MotionSystem() {
  const D = {
    bg: "#13161f",
    bgAlt: "#191c27",
    card: "#1b2030",
    card2: "#1f243a",
    border: "#252a3a",
    hair: "#22273a",
    ink: "#e8e7e2",
    ink2: "#b9bccb",
    ink3: "#7d8294",
    accent: "#6ee0a6",
    warn: "#e6b066",
    font: '"Manrope", "IBM Plex Sans", sans-serif',
    mono: '"IBM Plex Mono", monospace'
  };
  const Section = ({
    n,
    title,
    kicker,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      marginBottom: 10,
      paddingBottom: 8,
      borderBottom: `1px solid ${D.hair}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: D.mono,
      fontSize: 11,
      fontWeight: 700,
      color: D.accent,
      letterSpacing: "0.06em"
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700
    }
  }, title), kicker && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      fontFamily: D.mono,
      fontSize: 10.5,
      color: D.ink3,
      letterSpacing: "0.04em",
      textTransform: "uppercase"
    }
  }, kicker)), children);
  const Token = ({
    k,
    v,
    demo
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "82px 82px 1fr",
      alignItems: "center",
      gap: 8,
      padding: "8px 0",
      borderBottom: `1px solid ${D.hair}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: D.mono,
      fontSize: 11.5,
      fontWeight: 600,
      color: D.ink
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: D.mono,
      fontSize: 10.5,
      color: D.ink3
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, demo));

  // ── Live demo blocks ─────────────────────────────────────
  const DurBar = ({
    ms,
    color
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 4,
      background: D.bgAlt,
      borderRadius: 2,
      overflow: "hidden",
      border: `1px solid ${D.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: "100%",
      background: color || D.accent,
      animation: `motion-bar ${ms}ms cubic-bezier(0.32,0.72,0,1) infinite`,
      transformOrigin: "left center"
    }
  }));
  const EasingDemo = ({
    ease
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 24,
      background: D.bgAlt,
      borderRadius: 12,
      position: "relative",
      border: `1px solid ${D.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 4,
      left: 4,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: D.accent,
      animation: `motion-easing 2200ms ${ease} infinite`
    }
  }));
  const BreathDot = ({
    kind
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: kind === "halo" ? D.accent : D.warn,
      animation: kind === "halo" ? "motion-halo 2400ms cubic-bezier(0.32,0.72,0,1) infinite" : "motion-breath 3200ms cubic-bezier(0.32,0.72,0,1) infinite",
      color: kind === "halo" ? D.accent : D.warn
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: D.mono,
      fontSize: 10.5,
      color: D.ink3
    }
  }, kind === "halo" ? "live" : "idle"));
  const PressBtn = ({
    kind
  }) => /*#__PURE__*/React.createElement("button", {
    className: kind === "primary" ? "ms-btn ms-btn-primary" : "ms-btn"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "Press"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: D.bg,
      color: D.ink,
      fontFamily: D.font,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("style", null, `
        @keyframes motion-bar {
          0%   { transform: scaleX(0); }
          70%  { transform: scaleX(1); }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes motion-easing {
          0%, 100% { transform: translateX(0); }
          50%      { transform: translateX(72px); }
        }
        @keyframes motion-breath {
          0%,100% { opacity:1;    transform:scale(1); }
          50%     { opacity:0.5;  transform:scale(0.9); }
        }
        @keyframes motion-halo {
          0%, 100% { box-shadow: 0 0 0 0px rgba(110,224,166,0.55); }
          70%      { box-shadow: 0 0 0 9px rgba(110,224,166,0); }
        }
        .ms-btn {
          background: ${D.card2}; border: 1px solid ${D.border}; color: ${D.ink};
          font-family: inherit; padding: 6px 14px; border-radius: 7px; cursor: pointer;
          transition: transform 140ms cubic-bezier(0.4,0,0.2,1), opacity 140ms cubic-bezier(0.4,0,0.2,1);
        }
        .ms-btn:active { transform: scale(0.97); opacity: 0.85; }
        .ms-btn-primary { background: ${D.accent}; color: ${D.bg}; border-color: transparent; font-weight: 700; }
        .ms-lift {
          transition: transform 240ms cubic-bezier(0.32,0.72,0,1), box-shadow 240ms cubic-bezier(0.32,0.72,0,1);
        }
        .ms-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }

        .ms-card { background:${D.card}; border:1px solid ${D.hair}; border-radius:12px; padding:12px 14px; }
      `), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      height: 50,
      padding: "0 14px",
      gap: 10,
      flex: "0 0 auto",
      background: D.bgAlt,
      borderBottom: `1px solid ${D.hair}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      color: D.ink3
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M11.5 3.5L6 9l5.5 5.5"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center",
      fontSize: 14.5,
      fontWeight: 700,
      lineHeight: 1.15
    }
  }, "Motion System", /*#__PURE__*/React.createElement("small", {
    style: {
      display: "block",
      fontSize: 11,
      fontWeight: 500,
      color: D.ink3,
      marginTop: 1
    }
  }, "v 0.1 \xB7 Apple-inspired")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      color: D.ink3,
      textAlign: "right",
      fontSize: 18,
      letterSpacing: 1
    }
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflow: "auto",
      padding: "16px 18px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: D.ink2,
      lineHeight: 1.55,
      padding: "0 0 14px",
      marginBottom: 4,
      borderBottom: `1px solid ${D.hair}`
    }
  }, /*#__PURE__*/React.createElement("b", null, "\u041F\u0440\u0438\u043D\u0446\u0438\u043F\u044B."), " Spring-\u0444\u0438\u0437\u0438\u043A\u0430. \u041D\u0438\u043A\u043E\u0433\u0434\u0430 \u043D\u0435 \u043B\u0438\u043D\u0435\u0439\u043D\u043E, \u043D\u0438\u043A\u043E\u0433\u0434\u0430 \u043D\u0435 \u0430\u0433\u0440\u0435\u0441\u0441\u0438\u0432\u043D\u043E. \u0413\u043B\u0443\u0431\u0438\u043D\u0430 \u0447\u0435\u0440\u0435\u0437 blur, \u043D\u0435 \u0442\u0435\u043D\u0438. \u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 subtle ambient motion."), /*#__PURE__*/React.createElement(Section, {
    n: "01",
    title: "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438",
    kicker: "ms"
  }, /*#__PURE__*/React.createElement(Token, {
    k: "fast",
    v: "140 ms",
    demo: /*#__PURE__*/React.createElement(DurBar, {
      ms: 140
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "base",
    v: "240 ms",
    demo: /*#__PURE__*/React.createElement(DurBar, {
      ms: 240
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "slow",
    v: "460 ms",
    demo: /*#__PURE__*/React.createElement(DurBar, {
      ms: 460
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "ambient",
    v: "3.2 s",
    demo: /*#__PURE__*/React.createElement(DurBar, {
      ms: 3200
    })
  })), /*#__PURE__*/React.createElement(Section, {
    n: "02",
    title: "Easings",
    kicker: "cubic-bezier"
  }, /*#__PURE__*/React.createElement(Token, {
    k: "soft",
    v: "0.32,0.72",
    demo: /*#__PURE__*/React.createElement(EasingDemo, {
      ease: "cubic-bezier(0.32,0.72,0,1)"
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "tight",
    v: "0.4,0.2",
    demo: /*#__PURE__*/React.createElement(EasingDemo, {
      ease: "cubic-bezier(0.4,0,0.2,1)"
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "spring",
    v: "1.56,0.64",
    demo: /*#__PURE__*/React.createElement(EasingDemo, {
      ease: "cubic-bezier(0.34,1.56,0.64,1)"
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "exit",
    v: "0.4,1.0",
    demo: /*#__PURE__*/React.createElement(EasingDemo, {
      ease: "cubic-bezier(0.4,0,1,1)"
    })
  })), /*#__PURE__*/React.createElement(Section, {
    n: "03",
    title: "Ambient motion",
    kicker: "loops"
  }, /*#__PURE__*/React.createElement(Token, {
    k: "breath",
    v: "1% / 3.2s",
    demo: /*#__PURE__*/React.createElement(BreathDot, {
      kind: "breath"
    })
  }), /*#__PURE__*/React.createElement(Token, {
    k: "halo",
    v: "0\u21929px / 2.4s",
    demo: /*#__PURE__*/React.createElement(BreathDot, {
      kind: "halo"
    })
  })), /*#__PURE__*/React.createElement(Section, {
    n: "04",
    title: "Press & hover",
    kicker: "states"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      paddingBottom: 12,
      borderBottom: `1px solid ${D.hair}`
    }
  }, /*#__PURE__*/React.createElement(PressBtn, {
    kind: "primary"
  }), /*#__PURE__*/React.createElement(PressBtn, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "6px 12px",
      background: D.card,
      border: `1px solid ${D.border}`,
      borderRadius: 7,
      fontSize: 11.5,
      color: D.ink3
    },
    className: "ms-lift"
  }, "hover \u2191")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 10,
      fontSize: 11,
      color: D.ink3,
      lineHeight: 1.4
    }
  }, "\u0422\u0430\u043F: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: D.ink2
    }
  }, "scale 0.97 \xB7 opacity 0.85 \xB7 140ms"), /*#__PURE__*/React.createElement("br", null), "Hover: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: D.ink2
    }
  }, "translateY \u22122px \xB7 shadow blur 20px \xB7 240ms"))), /*#__PURE__*/React.createElement(Section, {
    n: "05",
    title: "Entrance",
    kicker: "stagger 35ms"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, [0, 1, 2, 3].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: `m-enter m-stagger-${i}`,
    style: {
      padding: "7px 12px",
      background: D.card,
      border: `1px solid ${D.hair}`,
      borderRadius: 8,
      display: "flex",
      justifyContent: "space-between",
      fontFamily: D.mono,
      fontSize: 11,
      color: D.ink2
    }
  }, /*#__PURE__*/React.createElement("span", null, "row ", i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      color: D.ink3
    }
  }, "+", i * 35, "ms"))))), /*#__PURE__*/React.createElement(Section, {
    n: "06",
    title: "A11Y",
    kicker: "prefers-reduced-motion"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: D.ink2,
      lineHeight: 1.5,
      padding: "8px 12px",
      background: D.bgAlt,
      border: `1px solid ${D.border}`,
      borderRadius: 10
    }
  }, "\u041F\u0440\u0438 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: D.mono,
      color: D.warn
    }
  }, "prefers-reduced-motion"), " \u0432\u0441\u0435 ambient-\u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0438 \u0438 entrance \u043E\u0442\u043A\u043B\u044E\u0447\u0430\u044E\u0442\u0441\u044F. \u041E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0435 state-\u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F."))));
}
Object.assign(window, {
  MotionSystem
});
