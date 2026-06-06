// Partner / hosting page — 3 variants. All built on the D2 Midnight base theme.

const PART = {
  ru: {
    title: "Хостинг",
    sub: "",
    why: "Эти ссылки помогают развитию goVLESS. Цена для вас при этом не меняется.",
    open: "Перейти к хостингу",
    openShort: "К хостингу →",
    copy: "Скопировать",
    copied: "Скопировано",
    code: "Промокод",
    codes: "Промокоды",
    why2: "Промокоды можно вводить при оформлении тарифа.",
    deal: "−60%",
    dealBy: "по ссылке + промокоду OFF60",
    otherPromos: "Другие промокоды",
    bestPick: "Рекомендуем",
    h1: "Хостинг #1",
    h1tag: "Основной вариант",
    h2: "Хостинг #2",
    h2tag: "Альтернатива на резерв",
    jurisLabel: "Юрисдикция",
    payLabel: "Валюта",
    cardsLabel: "Карты",
    promoH1: [
      { code:"OFF60",     d:"60% скидка",                                            badge:"−60%" },
      { code:"antenka20", d:"+20% к балансу и 3% скидка при оплате за 3 мес.", badge:"+20% / +3%" },
      { code:"antenka6",  d:"+15% к балансу и 5% скидка при оплате за 6 мес.", badge:"+15% / +5%" },
    ],
    promoH2: [
      { code:"OFF60",     d:"60% скидка",                                            badge:"−60%" },
    ],
    continue: "Продолжить",
    skip: "Пропустить",
    later: "Позже",
    nav1: "Карта", nav2: "Сравнить", nav3: "FAQ",
    pickRec: "Минимальный тариф",
    rec1: "от 200 ₽/мес",
    rec2: "от 250 ₽/мес",
    locs1: "RU · EU · TR · US",
    locs2: "RU · EU · US",
    speed1: "1 Gbps · KVM",
    speed2: "200 Mbps · KVM",
    setup1: "≈ 3 минуты",
    setup2: "≈ 3 минуты",
    cheap: "Дешевле",
    fast: "Быстрее",
    why3: "Подходит, если хочется поднять VPN на собственном VPS, не разбираясь в инфраструктуре. Установка одной командой.",
  },
  en: {
    title: "Hosting",
    sub: "",
    why: "These links support goVLESS development. They cost you the same.",
    open: "Open hosting",
    openShort: "Open →",
    copy: "Copy",
    copied: "Copied",
    code: "Promo",
    codes: "Promo codes",
    why2: "Enter promo codes at checkout.",
    deal: "−60%",
    dealBy: "via this link + promo OFF60",
    otherPromos: "More promo codes",
    bestPick: "Recommended",
    h1: "Hosting #1",
    h1tag: "Primary pick",
    h2: "Hosting #2",
    h2tag: "Reliable alternative",
    jurisLabel: "Jurisdiction",
    payLabel: "Currency",
    cardsLabel: "Cards",
    promoH1: [
      { code:"OFF60",     d:"60% off",                                  badge:"−60%" },
      { code:"antenka20", d:"+20% balance & 3% off the 3-month plan",   badge:"+20% / +3%" },
      { code:"antenka6",  d:"+15% balance & 5% off the 6-month plan",   badge:"+15% / +5%" },
    ],
    promoH2: [
      { code:"OFF60",     d:"60% off",                                  badge:"−60%" },
    ],
    continue: "Continue",
    skip: "Skip",
    later: "Later",
    nav1: "Map", nav2: "Compare", nav3: "FAQ",
    pickRec: "Cheapest plan",
    rec1: "from $2.50/mo",
    rec2: "from $3/mo",
    locs1: "RU · EU · TR · US",
    locs2: "RU · EU · US",
    speed1: "1 Gbps · KVM",
    speed2: "200 Mbps · KVM",
    setup1: "≈ 3 minutes",
    setup2: "≈ 3 minutes",
    cheap: "Cheaper",
    fast: "Faster",
    why3: "Good fit when you want a VPN on your own VPS without managing infra. One-command setup.",
  },
};

const HOSTS = [
  { id:"h1", url:"vk.cc/ct29NQ", full:"https://vk.cc/ct29NQ", hue: 160,
    flag:"🇷🇺", juris:"РФ",       jurisEn:"Russia",
    pay:"₽ рубли",     payEn:"₽ RUB",
    cards:"RU + зарубеж.", cardsEn:"RU + foreign" },
  { id:"h2", url:"vk.cc/cUxAhj", full:"https://vk.cc/cUxAhj", hue: 250,
    flag:"🇧🇾", juris:"Беларусь", jurisEn:"Belarus",
    pay:"₽ рубли",     payEn:"₽ RUB",
    cards:"RU + зарубеж.", cardsEn:"RU + foreign" },
];

// Shared theme tokens (D2 Midnight) ─────────────────────
const D2 = {
  bg:      "#13161f",
  bgAlt:   "#191c27",
  card:    "#1b2030",
  card2:   "#1f243a",
  border:  "#252a3a",
  hair:    "#22273a",
  ink:     "#e8e7e2",
  ink2:    "#b9bccb",
  ink3:    "#7d8294",
  accent:  "#6ee0a6",
  accent2: "#86e3b0",
  warn:    "#e6b066",
  font:    '"Manrope", "IBM Plex Sans", sans-serif',
  mono:    '"IBM Plex Mono", monospace',
};

// Tiny info-chip used to show jurisdiction / cards / etc.
function MetaChip({ label, value, tone = "neutral", flag }) {
  const palette = tone === "ok"
    ? { bg: "rgba(110,224,166,0.08)", bd: "rgba(110,224,166,0.25)", ink: D2.accent2 }
    : tone === "warm"
    ? { bg: "rgba(230,176,102,0.08)", bd: "rgba(230,176,102,0.30)", ink: "#e6b066" }
    : { bg: D2.bgAlt,                  bd: D2.border,                ink: D2.ink2 };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:6,
      padding:"3px 8px 4px", borderRadius:6,
      background: palette.bg,
      border:`1px solid ${palette.bd}`,
      fontFamily: D2.font, fontSize: 10.5, lineHeight: 1,
      color: palette.ink,
      whiteSpace:"nowrap",
    }}>
      <span style={{
        fontFamily: D2.mono, fontWeight: 600,
        textTransform:"uppercase", letterSpacing:"0.06em",
        fontSize: 10, opacity: 0.65,
      }}>{label}</span>
      {flag && (
        <span style={{
          fontSize: 13, lineHeight: 1,
          fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
        }}>{flag}</span>
      )}
      <span style={{ fontWeight: 700, fontSize: 11.5 }}>{value}</span>
    </span>
  );
}

// Loud savings banner shown on every host card: "−60% по ссылке + промокоду OFF60"
function DealBanner({ T, accent = true }) {
  return (
    <div style={{
      margin:"0 14px 12px",
      display:"flex", alignItems:"center", gap:14,
      padding:"12px 14px",
      borderRadius: 12,
      background: accent ? "rgba(255,216,74,0.10)" : D2.bgAlt,
      border: `1px solid ${accent ? "rgba(255,216,74,0.45)" : D2.border}`,
      position: "relative", overflow: "hidden",
    }}>
      <div className="m-breath" style={{
        flex:"0 0 auto", padding:"6px 12px 7px",
        borderRadius: 8, background:"#ffd84a", color:"#1a1100",
        fontFamily: D2.mono, fontSize: 24, fontWeight: 800, letterSpacing:"-0.8px",
        lineHeight: 1, boxShadow: "0 0 18px rgba(255,216,74,0.35)",
      }}>
        −60%
      </div>
      <div style={{ flex:1, minWidth:0, fontSize: 12, color: D2.ink, lineHeight:1.35 }}>
        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{T.dealBy}</div>
      </div>
      {/* slow shine pass */}
      <div className="m-shine" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
      }}/>
    </div>
  );
}

// Collapsible "more promo codes" spoiler using native <details>.
function PromoSpoiler({ label, count, children }) {
  return (
    <details style={{
      borderRadius: 10,
      border: `1px solid ${D2.border}`,
      background: D2.bgAlt,
      overflow: "hidden",
    }}>
      <summary style={{
        listStyle: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        fontFamily: D2.font,
        fontSize: 12.5,
        fontWeight: 600,
        color: D2.ink2,
        userSelect: "none",
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transition: "transform .2s" }} className="spoiler-caret">
          <path d="M5 4l4 3-4 3"/>
        </svg>
        <span style={{ flex:1 }}>{label}</span>
        {typeof count === "number" && (
          <span style={{
            fontFamily: D2.mono, fontSize: 10.5, fontWeight: 700,
            padding: "2px 7px", borderRadius: 5,
            background: D2.card2, border: `1px solid ${D2.border}`, color: D2.ink3,
            letterSpacing: "0.02em",
          }}>+{count}</span>
        )}
      </summary>
      <style>{`details[open] > summary .spoiler-caret { transform: rotate(90deg); }`}</style>
      <div style={{
        padding: "2px 10px 10px",
        display:"flex", flexDirection:"column", gap: 8,
        borderTop: `1px dashed ${D2.border}`,
        marginTop: 2, paddingTop: 10,
      }}>
        {children}
      </div>
    </details>
  );
}

// Pill / chip showing the promo code with a copy affordance.
function PromoChip({ code, desc, badge, big }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap: big ? 12 : 10,
      padding: big ? "12px 12px 12px 14px" : "10px 10px 10px 12px",
      background: D2.card2,
      border: `1px dashed ${D2.border}`,
      borderRadius: 10,
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontFamily: D2.mono, fontSize: big ? 18 : 15, fontWeight: 700,
          color: D2.ink, letterSpacing: "-0.2px", lineHeight: 1,
        }}>
          {code}
        </div>
        <div style={{ fontSize: big ? 12 : 11, color: D2.ink3, marginTop: 4, lineHeight: 1.35 }}>
          {desc}
        </div>
      </div>
      <div style={{
        fontFamily: D2.mono, fontSize: 10.5, fontWeight: 600,
        color: D2.accent2, background: "rgba(110,224,166,0.08)",
        border: "1px solid rgba(110,224,166,0.25)",
        padding: "2px 7px", borderRadius: 6, letterSpacing: "0.02em",
      }}>{badge}</div>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: D2.bgAlt,
        display:"flex", alignItems:"center", justifyContent:"center",
        color: D2.ink2, border: `1px solid ${D2.border}`,
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="7" height="7" rx="1.3"/>
          <path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/>
        </svg>
      </div>
    </div>
  );
}

// Header & wrapper shared across variants ───────────────
function PartnerFrame({ title, sub, children, bottom, currentNav }) {
  return (
    <div style={{
      width:"100%", height:"100%", background: D2.bg, color: D2.ink,
      fontFamily: D2.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <div style={{
        display:"flex", alignItems:"center", height:50, padding:"0 14px", gap:10,
        flex:"0 0 auto",
      }}>
        <div style={{ width:28, color: D2.ink3 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 3.5L6 9l5.5 5.5"/></svg>
        </div>
        <div style={{ flex:1, textAlign:"center", fontSize:14.5, fontWeight:700, lineHeight:1.15 }}>
          {title}
          {sub && <small style={{ display:"block", fontSize:11, fontWeight:500, color: D2.ink3, marginTop:1 }}>{sub}</small>}
        </div>
        <div style={{ width:28, color: D2.ink3, textAlign:"right", fontSize:18, letterSpacing:1 }}>⋯</div>
      </div>
      <div style={{ flex:1, minHeight:0, overflow:"auto", padding:"6px 14px 16px", display:"flex", flexDirection:"column", gap:14 }}>
        {children}
      </div>
      {bottom}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant A · Card stack
   Two hosting cards, promo codes as chips. Quiet, scannable.
   ───────────────────────────────────────────────────────────── */
function PartnersA({ lang = "ru" }) {
  const T = PART[lang];
  return (
    <PartnerFrame title={T.title} sub={T.sub}
      bottom={
        <div style={{ flex:"0 0 auto", padding:"10px 14px 16px", borderTop:`1px solid ${D2.hair}`, display:"flex", gap:10 }}>
          <button style={pBtnGhost()}>{T.later}</button>
          <button style={pBtnPrimary()}>{T.continue} →</button>
        </div>
      }>

      {/* Disclosure */}
      <div style={{
        background: D2.card, border:`1px solid ${D2.hair}`, borderRadius: 12,
        padding:"11px 12px 11px 38px", position:"relative", fontSize: 11.5, color: D2.ink3, lineHeight:1.45,
      }}>
        <span style={{ position:"absolute", left:12, top:10, color: D2.accent }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.5"/><path d="M8 5.5v3M8 10.5v.5" strokeLinecap="round"/></svg>
        </span>
        {T.why}
      </div>

      {[
        { idx:0, name:T.h1, tag:T.h1tag, url:HOSTS[0].url, full:HOSTS[0].full, promos:T.promoH1, hue:HOSTS[0].hue, rec:true },
        { idx:1, name:T.h2, tag:T.h2tag, url:HOSTS[1].url, full:HOSTS[1].full, promos:T.promoH2, hue:HOSTS[1].hue, rec:false },
      ].map((h, hi) => (
        <div key={h.idx} className={`m-rise m-lift m-stagger-${hi+1}`} style={{
          background: D2.card, border:`1px solid ${h.rec ? D2.accent : D2.hair}`,
          borderRadius: 16, overflow:"hidden",
          boxShadow: h.rec ? `0 0 0 1px ${D2.accent}, 0 8px 24px rgba(110,224,166,0.08)` : "none",
        }}>
          {/* Hosting head */}
          <div style={{ padding:"14px 14px 12px", display:"flex", gap:12, alignItems:"flex-start" }}>
            <div style={{
              width:42, height:42, borderRadius:12, flexShrink:0,
              background: `oklch(0.45 0.10 ${h.hue})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily: D2.mono, fontSize: 15, fontWeight: 700, color: "#fff",
              border: `1px solid oklch(0.55 0.10 ${h.hue})`,
            }}>{h.idx === 0 ? "#1" : "#2"}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing:"-0.2px" }}>{h.name}</div>
                {h.rec && (
                  <span style={{
                    fontFamily: D2.mono, fontSize: 10, fontWeight: 700,
                    color: D2.bg, background: D2.accent,
                    padding: "2px 7px", borderRadius: 4, letterSpacing: "0.05em", textTransform:"uppercase",
                  }}>{T.bestPick}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: D2.ink3, marginTop: 2 }}>{h.tag}</div>
              {/* Jurisdiction + cards chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
                <MetaChip label={T.jurisLabel} value={lang=="en" ? HOSTS[h.idx].jurisEn : HOSTS[h.idx].juris} flag={HOSTS[h.idx].flag} tone={h.rec ? "ok" : "neutral"} />
                <MetaChip label={T.cardsLabel} value={lang=="en" ? HOSTS[h.idx].cardsEn : HOSTS[h.idx].cards} tone={h.idx === 1 ? "warm" : "neutral"} />
              </div>
            </div>
          </div>

          {/* Loud savings deal */}
          <DealBanner T={T} accent />

          {/* Promo codes */}
          <div style={{ padding:"0 14px 12px", display:"flex", flexDirection:"column", gap: 8 }}>
            <div style={{
              fontSize: 10.5, fontWeight: 700, color: D2.ink3, letterSpacing: "0.08em",
              textTransform: "uppercase", padding: "4px 2px 2px",
            }}>{h.promos.length > 1 ? T.codes : T.code}</div>
            {h.promos.map((p, i) => <PromoChip key={i} code={p.code} desc={p.d} badge={p.badge}/>)}
          </div>

          {/* CTA — primary go-to-host link */}
          <div style={{ padding:"0 12px 12px" }}>
            <a href={h.full} target="_blank" rel="noopener noreferrer" style={{
              width:"100%", height: 46, borderRadius: 10,
              background: D2.accent, color: D2.bg, border: "none",
              fontFamily: "inherit", fontSize: 14.5, fontWeight: 700, letterSpacing:"-0.1px",
              cursor: "pointer", textDecoration:"none",
              display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
              boxShadow: "0 4px 12px rgba(110,224,166,0.18)",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 10l5-5M6 5h5v5"/>
              </svg>
              {T.open}
            </a>
          </div>
        </div>
      ))}
    </PartnerFrame>
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant B · Boarding-pass / coupon
   Each hosting feels like a physical coupon: perforated edge, big
   ticker-style code, monospace pricing. Tactile + memorable.
   ───────────────────────────────────────────────────────────── */
function PartnersB({ lang = "ru" }) {
  const T = PART[lang];

  function Coupon({ idx, name, url, full, promos, hue, rec }) {
    const main = promos[0];
    const extra = promos.slice(1);
    return (
      <div style={{
        background: D2.card,
        borderRadius: 16,
        position: "relative",
        boxShadow: rec ? `0 0 0 1px ${D2.accent}` : `inset 0 0 0 1px ${D2.hair}`,
        overflow: "hidden",
      }}>
        {/* Perforation row */}
        {/* Top stub: label, big number */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 86px", borderBottom:`1px dashed ${D2.border}` }}>
          <div style={{ padding:"14px 16px 14px 16px" }}>
            <div style={{
              fontFamily: D2.mono, fontSize: 10.5, fontWeight: 600, color: D2.ink3,
              letterSpacing:"0.08em", textTransform:"uppercase",
            }}>{idx === 0 ? "01" : "02"} · {name}</div>
            <div style={{
              fontSize: 24, fontWeight: 800, color: D2.ink, letterSpacing:"-0.5px", marginTop: 4, lineHeight: 1.1,
            }}>
              {main.badge.startsWith("−") ? main.badge : "−60%"}
            </div>
            {/* Jurisdiction + cards chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
              <MetaChip label={T.jurisLabel} value={lang==="en" ? HOSTS[idx].jurisEn : HOSTS[idx].juris} flag={HOSTS[idx].flag} tone={rec ? "ok" : "neutral"} />
              <MetaChip label={T.cardsLabel} value={lang==="en" ? HOSTS[idx].cardsEn : HOSTS[idx].cards} tone={idx === 1 ? "warm" : "neutral"} />
            </div>
          </div>
          <div style={{
            background: `oklch(0.18 0.04 ${hue})`,
            borderLeft: `1px dashed ${D2.border}`,
            display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", padding: 4,
          }}>
            <div style={{ fontFamily: D2.mono, fontSize: 10, color: D2.ink3, letterSpacing:"0.08em", textTransform:"uppercase" }}>
              {lang === "ru" ? "хостинг" : "host"}
            </div>
            <div style={{ fontFamily: D2.mono, fontSize: 28, fontWeight: 700, color: D2.ink, letterSpacing:"-0.5px", lineHeight: 1, marginTop: 4 }}>
              #{idx + 1}
            </div>
            {rec && (
              <div style={{
                marginTop: 6, fontFamily: D2.mono, fontSize: 8.5, fontWeight: 700, color: D2.accent,
                letterSpacing:"0.08em", textTransform:"uppercase",
              }}>{T.bestPick}</div>
            )}
          </div>
        </div>

        {/* Notches */}
        <div style={{ position:"absolute", left:-7, top:"50%", width:14, height:14, borderRadius:7, background: D2.bg, transform:"translateY(-50%)" }}/>
        <div style={{ position:"absolute", right:-7, top:"50%", width:14, height:14, borderRadius:7, background: D2.bg, transform:"translateY(-50%)" }}/>

        {/* Bottom stub: code */}
        <div style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily: D2.mono, fontSize: 10, color: D2.ink3, letterSpacing:"0.1em", textTransform:"uppercase" }}>{T.code}</div>
              <div style={{ fontFamily: D2.mono, fontSize: 22, fontWeight: 700, color: D2.ink, letterSpacing:"-0.2px", marginTop: 2, lineHeight: 1 }}>
                {main.code}
              </div>
            </div>
            <button style={{
              padding:"8px 12px", height:38, borderRadius: 8,
              background: D2.bgAlt, color: D2.ink, border: `1px solid ${D2.border}`,
              fontFamily:"inherit", fontSize: 12.5, fontWeight: 600, letterSpacing:"0.02em",
              cursor:"pointer", display:"flex", alignItems:"center", gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="7" height="7" rx="1"/>
                <path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/>
              </svg>{T.copy}
            </button>
          </div>

          {extra.length > 0 && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:`1px dashed ${D2.border}`, display:"flex", flexDirection:"column", gap:6 }}>
              {extra.map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, fontSize: 12 }}>
                  <span style={{
                    fontFamily: D2.mono, fontSize: 12, fontWeight: 700, color: D2.ink,
                    background: D2.bgAlt, padding: "3px 8px", borderRadius: 5,
                    border: `1px solid ${D2.border}`,
                  }}>{p.code}</span>
                  <span style={{ flex:1, color: D2.ink3, fontSize: 11.5, lineHeight: 1.35 }}>{p.d}</span>
                  <span style={{
                    fontFamily: D2.mono, fontSize: 10, color: D2.accent2,
                    background: "rgba(110,224,166,0.08)", border:"1px solid rgba(110,224,166,0.22)",
                    padding: "2px 6px", borderRadius: 5, letterSpacing:"0.02em",
                  }}>{p.badge}</span>
                </div>
              ))}
            </div>
          )}

          <a href={full} target="_blank" rel="noopener noreferrer" style={{
            width:"100%", marginTop: 12, height: 46, borderRadius: 10, border: "none",
            background: D2.accent, color: D2.bg, fontFamily:"inherit", textDecoration:"none",
            fontSize: 14, fontWeight: 700, letterSpacing:"-0.1px", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap: 8,
            boxShadow: "0 4px 12px rgba(110,224,166,0.18)",
          }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 10l5-5M6 5h5v5"/>
            </svg>
            {T.open}
          </a>
        </div>
      </div>
    );
  }

  return (
    <PartnerFrame title={T.title} sub={T.sub}
      bottom={
        <div style={{ flex:"0 0 auto", padding:"10px 14px 16px", borderTop:`1px solid ${D2.hair}`, display:"flex", gap:10 }}>
          <button style={pBtnGhost()}>{T.later}</button>
          <button style={pBtnPrimary()}>{T.continue} →</button>
        </div>
      }>
      <div style={{ fontSize: 12, color: D2.ink3, lineHeight: 1.45, padding: "2px 4px" }}>
        {T.why}
      </div>
      <Coupon idx={0} name={T.h1} url={HOSTS[0].url} full={HOSTS[0].full} promos={T.promoH1} hue={HOSTS[0].hue} rec/>
      <Coupon idx={1} name={T.h2} url={HOSTS[1].url} full={HOSTS[1].full} promos={T.promoH2} hue={HOSTS[1].hue}/>
      <div style={{ fontSize: 11, color: D2.ink3, textAlign:"center", padding: "2px 0", opacity: 0.7 }}>
        {T.why2}
      </div>
    </PartnerFrame>
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant C · Side-by-side compare
   Two hostings as a comparison strip — specs lined up, codes
   below. Decision-oriented.
   ───────────────────────────────────────────────────────────── */
function PartnersC({ lang = "ru" }) {
  const T = PART[lang];

  const rows = [
    { key: T.cardsLabel, a: lang==="en" ? HOSTS[0].cardsEn : HOSTS[0].cards, b: lang==="en" ? HOSTS[1].cardsEn : HOSTS[1].cards, hi: "b" },
    { key: T.pickRec,                     a: T.rec1, b: T.rec2 },
    { key: lang==="ru"?"Локации":"Locations",  a: T.locs1, b: T.locs2 },
    { key: lang==="ru"?"Канал":"Channel",      a: T.speed1, b: T.speed2 },
    { key: lang==="ru"?"Установка":"Setup",    a: T.setup1, b: T.setup2 },
  ];

  return (
    <PartnerFrame title={T.title} sub={lang==="ru"?"Сравнение":"Comparison"}
      bottom={
        <div style={{ flex:"0 0 auto", padding:"10px 14px 16px", borderTop:`1px solid ${D2.hair}`, display:"flex", gap:10 }}>
          <button style={pBtnGhost()}>{T.later}</button>
          <button style={pBtnPrimary()}>{T.continue} →</button>
        </div>
      }>

      <div style={{ fontSize: 12, color: D2.ink3, lineHeight: 1.45, padding: "2px 4px" }}>
        {T.why}
      </div>

      {/* Compare table */}
      <div style={{
        background: D2.card, border: `1px solid ${D2.hair}`, borderRadius: 16, overflow:"hidden",
      }}>
        {/* slim head */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          borderBottom: `1px solid ${D2.hair}`,
          background: D2.bgAlt,
        }}>
          <div/>
          <div style={{
            padding:"8px 10px", borderLeft:`1px solid ${D2.hair}`,
            fontFamily: D2.mono, fontSize: 11, fontWeight: 700, color: D2.accent2,
            letterSpacing: "0.04em",
          }}>#1</div>
          <div style={{
            padding:"8px 10px", borderLeft:`1px solid ${D2.hair}`,
            fontFamily: D2.mono, fontSize: 11, fontWeight: 700, color: D2.ink3,
            letterSpacing: "0.04em",
          }}>#2</div>
        </div>

        {/* rows */}
        {rows.map((r, i) => (
          <div key={i} style={{
            display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            borderBottom: i < rows.length-1 ? `1px solid ${D2.hair}` : "none",
          }}>
            <div style={{ padding:"10px 12px", fontSize: 11, fontWeight: 600, color: D2.ink3, letterSpacing:"0.02em" }}>{r.key}</div>
            <div style={{ padding:"10px 10px", borderLeft: `1px solid ${D2.hair}`, fontFamily: D2.mono, fontSize: 11.5, fontWeight: 600, color: D2.ink }}>{r.a}</div>
            <div style={{ padding:"10px 10px", borderLeft: `1px solid ${D2.hair}`, fontFamily: D2.mono, fontSize: 11.5, fontWeight: 600, color: D2.ink2 }}>{r.b}</div>
          </div>
        ))}
      </div>

      {/* Quick-access CTAs */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10 }}>
        {[
          { idx:0, name: T.h1, full: HOSTS[0].full, url: HOSTS[0].url, hue: HOSTS[0].hue, rec:true },
          { idx:1, name: T.h2, full: HOSTS[1].full, url: HOSTS[1].url, hue: HOSTS[1].hue, rec:false },
        ].map(h => (
          <a key={h.idx} href={h.full} target="_blank" rel="noopener noreferrer" style={{
            background: h.rec ? D2.accent : D2.card2,
            color: h.rec ? D2.bg : D2.ink,
            border: h.rec ? "none" : `1px solid ${D2.border}`,
            borderRadius: 12, padding: "12px 14px", textDecoration:"none",
            fontFamily:"inherit", display:"flex", flexDirection:"column", gap: 4,
            boxShadow: h.rec ? "0 4px 12px rgba(110,224,166,0.18)" : "none",
            cursor:"pointer",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:700, letterSpacing:"-0.1px" }}>
                {lang==="ru" ? "Открыть " : "Open "}{h.idx===0?"#1":"#2"}
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 10l5-5M6 5h5v5"/>
              </svg>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, opacity: h.rec ? 0.7 : 0.65 }}>
              –60% · OFF60
            </div>
          </a>
        ))}
      </div>

      {/* Promo codes section: Host #1 */}
      <div>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          fontSize: 11, fontWeight: 700, color: D2.ink3, letterSpacing:"0.06em",
          textTransform:"uppercase", padding:"6px 4px 8px",
        }}>
          <span>{T.codes} · {T.h1}</span>
          <a href={HOSTS[0].full} target="_blank" rel="noopener noreferrer" style={{ color: D2.accent, fontSize:11, fontWeight:600, textDecoration:"none" }}>{T.openShort}</a>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
          {T.promoH1.map((p, i) => <PromoChip key={i} code={p.code} desc={p.d} badge={p.badge}/>)}
        </div>
      </div>

      {/* Promo codes section: Host #2 */}
      <div>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          fontSize: 11, fontWeight: 700, color: D2.ink3, letterSpacing:"0.06em",
          textTransform:"uppercase", padding:"6px 4px 8px",
        }}>
          <span>{T.code} · {T.h2}</span>
          <a href={HOSTS[1].full} target="_blank" rel="noopener noreferrer" style={{ color: D2.accent, fontSize:11, fontWeight:600, textDecoration:"none" }}>{T.openShort}</a>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
          {T.promoH2.map((p, i) => <PromoChip key={i} code={p.code} desc={p.d} badge={p.badge}/>)}
        </div>
      </div>

      <div style={{ fontSize: 11, color: D2.ink3, padding: "2px 4px", lineHeight: 1.4, opacity: 0.75 }}>
        {T.why2}
      </div>
    </PartnerFrame>
  );
}

// Shared button styles ─────────────────────────────────────
function pBtnGhost() {
  return {
    flex: "0 0 auto", padding: "0 18px", height: 46, borderRadius: 10,
    border: `1px solid ${D2.border}`, background: "transparent", color: D2.ink,
    fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer",
  };
}
function pBtnPrimary() {
  return {
    flex: 1, height: 46, borderRadius: 10, border: "none",
    background: D2.accent, color: D2.bg,
    fontFamily: "inherit", fontSize: 15, fontWeight: 700, letterSpacing: "-0.1px",
    cursor: "pointer",
  };
}

Object.assign(window, { PartnersA, PartnersB, PartnersC });
