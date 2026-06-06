// Motion System — living documentation artboard.
// Shows our motion language with running examples so the team
// (and future contributors) know the rules.
// 360 × 740, in the D2 Midnight Slate base.

function MotionSystem() {
  const D = {
    bg:     "#13161f",
    bgAlt:  "#191c27",
    card:   "#1b2030",
    card2:  "#1f243a",
    border: "#252a3a",
    hair:   "#22273a",
    ink:    "#e8e7e2",
    ink2:   "#b9bccb",
    ink3:   "#7d8294",
    accent: "#6ee0a6",
    warn:   "#e6b066",
    font:   '"Manrope", "IBM Plex Sans", sans-serif',
    mono:   '"IBM Plex Mono", monospace',
  };

  const Section = ({ n, title, kicker, children }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        display:"flex", alignItems:"baseline", gap: 10, marginBottom: 10,
        paddingBottom: 8, borderBottom:`1px solid ${D.hair}`,
      }}>
        <div style={{ fontFamily: D.mono, fontSize: 11, fontWeight: 700, color: D.accent, letterSpacing:"0.06em" }}>{n}</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {kicker && <div style={{ marginLeft:"auto", fontFamily: D.mono, fontSize: 10.5, color: D.ink3, letterSpacing:"0.04em", textTransform:"uppercase" }}>{kicker}</div>}
      </div>
      {children}
    </div>
  );

  const Token = ({ k, v, demo }) => (
    <div style={{
      display:"grid", gridTemplateColumns:"82px 82px 1fr", alignItems:"center", gap: 8,
      padding:"8px 0", borderBottom: `1px solid ${D.hair}`,
    }}>
      <div style={{ fontFamily: D.mono, fontSize: 11.5, fontWeight: 600, color: D.ink }}>{k}</div>
      <div style={{ fontFamily: D.mono, fontSize: 10.5, color: D.ink3 }}>{v}</div>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>{demo}</div>
    </div>
  );

  // ── Live demo blocks ─────────────────────────────────────
  const DurBar = ({ ms, color }) => (
    <div style={{ width: 96, height: 4, background: D.bgAlt, borderRadius: 2, overflow:"hidden", border: `1px solid ${D.border}` }}>
      <div style={{
        height: "100%", width:"100%", background: color || D.accent,
        animation: `motion-bar ${ms}ms cubic-bezier(0.32,0.72,0,1) infinite`,
        transformOrigin: "left center",
      }}/>
    </div>
  );

  const EasingDemo = ({ ease }) => (
    <div style={{ width: 96, height: 24, background: D.bgAlt, borderRadius: 12, position:"relative", border: `1px solid ${D.border}` }}>
      <div style={{
        position:"absolute", top: 4, left: 4, width: 16, height: 16, borderRadius: "50%",
        background: D.accent,
        animation: `motion-easing 2200ms ${ease} infinite`,
      }}/>
    </div>
  );

  const BreathDot = ({ kind }) => (
    <div style={{ width: 96, display:"flex", justifyContent:"flex-end", alignItems:"center", gap: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: kind === "halo" ? D.accent : D.warn,
        animation: kind === "halo"
          ? "motion-halo 2400ms cubic-bezier(0.32,0.72,0,1) infinite"
          : "motion-breath 3200ms cubic-bezier(0.32,0.72,0,1) infinite",
        color: kind === "halo" ? D.accent : D.warn,
      }}/>
      <span style={{ fontFamily: D.mono, fontSize: 10.5, color: D.ink3 }}>{kind === "halo" ? "live" : "idle"}</span>
    </div>
  );

  const PressBtn = ({ kind }) => (
    <button className={kind === "primary" ? "ms-btn ms-btn-primary" : "ms-btn"}>
      <span style={{ fontSize: 11.5, fontWeight: 600 }}>Press</span>
    </button>
  );

  return (
    <div style={{
      width:"100%", height:"100%", background: D.bg, color: D.ink,
      fontFamily: D.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
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
      `}</style>

      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", height:50, padding:"0 14px", gap:10,
        flex:"0 0 auto", background: D.bgAlt, borderBottom:`1px solid ${D.hair}`,
      }}>
        <div style={{ width:28, color: D.ink3 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11.5 3.5L6 9l5.5 5.5"/></svg>
        </div>
        <div style={{ flex:1, textAlign:"center", fontSize:14.5, fontWeight:700, lineHeight:1.15 }}>
          Motion System
          <small style={{ display:"block", fontSize:11, fontWeight:500, color:D.ink3, marginTop:1 }}>
            v 0.1 · Apple-inspired
          </small>
        </div>
        <div style={{ width:28, color: D.ink3, textAlign:"right", fontSize:18, letterSpacing:1 }}>⋯</div>
      </div>

      {/* Body */}
      <div style={{
        flex:1, minHeight:0, overflow:"auto",
        padding:"16px 18px 24px",
      }}>
        {/* Intro */}
        <div style={{
          fontSize: 12.5, color: D.ink2, lineHeight: 1.55,
          padding: "0 0 14px", marginBottom: 4, borderBottom: `1px solid ${D.hair}`,
        }}>
          <b>Принципы.</b> Spring-физика. Никогда не линейно, никогда не агрессивно. Глубина через blur, не тени. Подсказки через subtle ambient motion.
        </div>

        {/* 01 Durations */}
        <Section n="01" title="Длительности" kicker="ms">
          <Token k="fast"    v="140 ms"  demo={<DurBar ms={140}/>} />
          <Token k="base"    v="240 ms"  demo={<DurBar ms={240}/>} />
          <Token k="slow"    v="460 ms"  demo={<DurBar ms={460}/>} />
          <Token k="ambient" v="3.2 s"   demo={<DurBar ms={3200}/>} />
        </Section>

        {/* 02 Easings */}
        <Section n="02" title="Easings" kicker="cubic-bezier">
          <Token k="soft"   v="0.32,0.72" demo={<EasingDemo ease="cubic-bezier(0.32,0.72,0,1)"/>} />
          <Token k="tight"  v="0.4,0.2"   demo={<EasingDemo ease="cubic-bezier(0.4,0,0.2,1)"/>} />
          <Token k="spring" v="1.56,0.64" demo={<EasingDemo ease="cubic-bezier(0.34,1.56,0.64,1)"/>} />
          <Token k="exit"   v="0.4,1.0"   demo={<EasingDemo ease="cubic-bezier(0.4,0,1,1)"/>} />
        </Section>

        {/* 03 Ambient */}
        <Section n="03" title="Ambient motion" kicker="loops">
          <Token k="breath" v="1% / 3.2s" demo={<BreathDot kind="breath"/>} />
          <Token k="halo"   v="0→9px / 2.4s" demo={<BreathDot kind="halo"/>} />
        </Section>

        {/* 04 Interactions */}
        <Section n="04" title="Press & hover" kicker="states">
          <div style={{ display:"flex", gap:10, paddingBottom: 12, borderBottom:`1px solid ${D.hair}` }}>
            <PressBtn kind="primary"/>
            <PressBtn/>
            <div style={{
              flex:1, padding:"6px 12px", background:D.card, border:`1px solid ${D.border}`,
              borderRadius:7, fontSize:11.5, color:D.ink3,
            }} className="ms-lift">hover ↑</div>
          </div>
          <div style={{ paddingTop: 10, fontSize: 11, color: D.ink3, lineHeight: 1.4 }}>
            Тап: <span style={{ color: D.ink2 }}>scale 0.97 · opacity 0.85 · 140ms</span>
            <br/>
            Hover: <span style={{ color: D.ink2 }}>translateY −2px · shadow blur 20px · 240ms</span>
          </div>
        </Section>

        {/* 05 Entrance */}
        <Section n="05" title="Entrance" kicker="stagger 35ms">
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`m-enter m-stagger-${i}`} style={{
                padding:"7px 12px", background:D.card, border:`1px solid ${D.hair}`,
                borderRadius:8, display:"flex", justifyContent:"space-between",
                fontFamily: D.mono, fontSize: 11, color: D.ink2,
              }}>
                <span>row {i+1}</span>
                <span style={{ color: D.ink3 }}>+{i*35}ms</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 06 Reduced motion */}
        <Section n="06" title="A11Y" kicker="prefers-reduced-motion">
          <div style={{
            fontSize: 11.5, color: D.ink2, lineHeight: 1.5,
            padding: "8px 12px", background: D.bgAlt, border:`1px solid ${D.border}`, borderRadius: 10,
          }}>
            При <span style={{ fontFamily: D.mono, color: D.warn }}>prefers-reduced-motion</span> все ambient-анимации и entrance отключаются. Остаются только мгновенные state-переключения.
          </div>
        </Section>

      </div>
    </div>
  );
}

Object.assign(window, { MotionSystem });
