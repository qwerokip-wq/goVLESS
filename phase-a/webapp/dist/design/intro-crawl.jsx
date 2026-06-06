// First-run intro: a yellow perspective crawl on a starfield + a CTA strip.
// 360×740. Animated (loops). Two languages.

const INTRO_COPY = {
  ru: {
    skip: "Пропустить",
    above: "Давным-давно, в одном тихом дата-центре…",
    episode: "УСТАНОВКА I",
    title: "goVLESS",
    paragraphs: [
      "Это не сервис. Это инструмент, который поднимает VLESS-туннель на вашем собственном сервере. Никто между вами и сетью.",
      "Вы платите своему хостеру, а не нам. Соблюдайте законы своей страны. Не используйте туннель во вред — ни себе, ни другим.",
      "Дальше вы выберете сервер, добавите первого клиента и получите ссылку для подключения. Это занимает примерно три минуты.",
    ],
    needServer: "Нужен сервер",
    haveServer: "Сервер уже есть",
    needServerSub: "Партнёры со скидками",
    haveServerSub: "Перейти к мастеру",
  },
  en: {
    skip: "Skip",
    above: "A long time ago, in a quiet data center far, far away…",
    episode: "INSTALLATION I",
    title: "goVLESS",
    paragraphs: [
      "This is not a service. It is a tool that raises a VLESS tunnel on your own server. Nobody sits between you and the open internet.",
      "You pay your host, not us. Respect your local laws. Do not use the tunnel to harm yourself or anyone else.",
      "Next you will pick a server, add a first client, and get a connect link. The whole thing takes about three minutes.",
    ],
    needServer: "I need a server",
    haveServer: "I already have one",
    needServerSub: "Discounted partners",
    haveServerSub: "Go to setup wizard",
  },
};

// Deterministic pseudo-stars so they don't reshuffle on every render.
const STAR_FIELD = (() => {
  let s = 1337;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: 90 }, () => ({
    x: rnd() * 360,
    y: rnd() * 740,
    r: rnd() * 1.1 + 0.25,
    o: rnd() * 0.7 + 0.25,
    t: rnd() * 4 + 2, // twinkle period s
    d: rnd() * 4,    // delay s
  }));
})();

function IntroCrawl({ lang = "ru", paused = false }) {
  const T = INTRO_COPY[lang];

  return (
    <div className="intro-root">
      <style>{`
        .intro-root {
          width:100%; height:100%; overflow:hidden; position:relative;
          background: radial-gradient(ellipse at 50% 110%, #1a1230 0%, #060512 55%, #000 100%);
          font-family: "Manrope", "IBM Plex Sans", sans-serif;
          color: #ffd84a;
        }
        .intro-root .stars { position:absolute; inset:0; pointer-events:none; }
        .intro-root .stars .layer-1 { animation: layer1pan 38s linear infinite; }
        .intro-root .stars .layer-2 { animation: layer2pan 24s linear infinite; }
        .intro-root .stars .layer-3 { animation: layer3pan 14s linear infinite; }
        @keyframes layer1pan { from { transform: translateY(0); } to { transform: translateY(-12px); } }
        @keyframes layer2pan { from { transform: translateY(0); } to { transform: translateY(-28px); } }
        @keyframes layer3pan { from { transform: translateY(0); } to { transform: translateY(-60px); } }
        .intro-root .stars circle { animation: tw var(--t,3s) ease-in-out infinite; animation-delay: var(--d,0s); }
        @keyframes tw { 0%,100% { opacity:var(--o,0.5); } 50% { opacity:0.05; } }

        /* ── Flying objects ───────────────────────────────────── */
        .intro-root .flyers {
          position:absolute; inset:0; pointer-events:none;
          z-index:2; overflow:hidden;
        }
        .intro-root .flyer {
          position:absolute; left:0; top:0;
          opacity:0.88;
          will-change: transform;
          filter: drop-shadow(0 0 8px rgba(126,180,255,0.18));
        }
        @keyframes flyA { 0%{ transform: translate(-80px, 480px) rotate(-10deg); } 100%{ transform: translate(420px,  60px) rotate(15deg); } }
        @keyframes flyB { 0%{ transform: translate(420px, 540px) rotate(20deg);  } 100%{ transform: translate(-80px,  40px) rotate(-25deg); } }
        @keyframes flyC { 0%{ transform: translate(-100px,200px) rotate(8deg);   } 100%{ transform: translate(440px, 500px) rotate(-12deg); } }
        @keyframes flyD { 0%{ transform: translate(420px, 110px) rotate(-6deg);  } 100%{ transform: translate(-100px,560px) rotate(14deg); } }
        @keyframes flyE { 0%{ transform: translate(-90px, 620px) rotate(12deg);  } 100%{ transform: translate(440px, 150px) rotate(-8deg); } }
        @keyframes flyF { 0%{ transform: translate(440px, 280px) rotate(-18deg); } 100%{ transform: translate(-110px,420px) rotate(22deg); } }
        @keyframes flyG { 0%{ transform: translate(-90px,  90px) rotate(4deg);   } 100%{ transform: translate(440px, 600px) rotate(-30deg); } }
        @keyframes flyH { 0%{ transform: translate(440px, 380px) rotate(0deg);   } 100%{ transform: translate(-90px, 200px) rotate(45deg); } }

        .intro-root .flyer-1 { animation: flyA 28s linear  0s    infinite; }
        .intro-root .flyer-2 { animation: flyB 36s linear  6s    infinite; }
        .intro-root .flyer-3 { animation: flyC 24s linear  12s   infinite; }
        .intro-root .flyer-4 { animation: flyD 32s linear  3s    infinite; }
        .intro-root .flyer-5 { animation: flyE 26s linear  18s   infinite; }
        .intro-root .flyer-6 { animation: flyF 30s linear  9s    infinite; }
        .intro-root .flyer-7 { animation: flyG 22s linear  22s   infinite; }
        .intro-root .flyer-8 { animation: flyH 34s linear  15s   infinite; }

        .intro-root .flyer .spin { animation: flyspin 18s linear infinite; transform-origin: center; display: block; transform-box: fill-box; }
        @keyframes flyspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .intro-root .flyer .bob  { animation: flybob 4s ease-in-out infinite; transform-box: fill-box; }
        @keyframes flybob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

        @keyframes flyblink { 0%, 80% { opacity: 1; } 90% { opacity: 0.2; } }
        .intro-root .blink    { animation: flyblink 1.8s ease-out infinite; }
        .intro-root .blink-2  { animation: flyblink 1.4s ease-out 0.6s infinite; }

        @keyframes flybeam { 0%,100% { opacity: 0.15; } 50% { opacity: 0.45; } }
        .intro-root .ufo-beam { animation: flybeam 2s ease-in-out infinite; }

        .intro-root .topbar {
          position:absolute; top:0; left:0; right:0; z-index:5;
          height:50px; display:flex; align-items:center; justify-content:space-between;
          padding: 0 14px;
        }
        .intro-root .x {
          width:28px; color:rgba(255,255,255,0.7); font-size:18px; font-weight:300;
        }
        .intro-root .skip {
          color:rgba(255,255,255,0.65); font-size:12.5px; font-weight:500;
          letter-spacing:0.02em; padding:6px 10px; border-radius:6px;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
        }

        .intro-root .above {
          position:absolute; left:0; right:0; top:84px;
          text-align:center;
          color:#7eb4ff;
          font-size:13.5px;
          font-weight:500;
          line-height:1.45;
          padding:0 24px;
          letter-spacing:0.01em;
          z-index:3;
          font-style:italic;
          opacity:0;
          animation: aboveIn 1400ms cubic-bezier(0.32,0.72,0,1) 200ms forwards;
        }
        @keyframes aboveIn { 0% { opacity:0; transform:translateY(-4px); } 100% { opacity:0.92; transform:translateY(0); } }

        .intro-root .stage {
          position:absolute; left:0; right:0; top:140px; bottom:120px;
          perspective:340px;
          overflow:hidden;
          z-index:2;
          mask-image: linear-gradient(to top, transparent 0%, #000 12%, #000 70%, transparent 100%);
          -webkit-mask-image: linear-gradient(to top, transparent 0%, #000 12%, #000 70%, transparent 100%);
        }
        .intro-root .crawl {
          position:absolute; left:0; right:0; top:100%;
          transform: rotateX(32deg);
          transform-origin: 50% 100%;
          padding: 0 30px;
          text-align: justify;
          font-weight: 700;
          color:#ffd84a;
          text-shadow: 0 0 18px rgba(255,200,40,0.25);
          font-size: 14.5px;
          line-height: 1.55;
          animation: scroll 38s linear infinite;
          ${paused ? "animation-play-state: paused;" : ""}
        }
        @keyframes scroll {
          0%   { top: 100%; }
          100% { top: -240%; }
        }
        .intro-root .crawl .ep {
          font-size: 14px; font-weight: 700; letter-spacing: 0.18em;
          text-align:center; margin-bottom: 6px; color:#ffd84a;
        }
        .intro-root .crawl .title {
          margin: 0 0 28px;
          font-family: "Manrope", sans-serif;
          font-size: 44px; font-weight: 800;
          text-align:center; letter-spacing: -0.5px;
          line-height: 1;
          text-shadow: 0 0 32px rgba(255,200,40,0.45);
          animation: titleGlow 5.6s cubic-bezier(0.32,0.72,0,1) infinite;
        }
        @keyframes titleGlow {
          0%,100% { text-shadow: 0 0 24px rgba(255,200,40,0.35); }
          50%     { text-shadow: 0 0 48px rgba(255,200,40,0.62); }
        }
        .intro-root .crawl p {
          margin: 0 0 22px;
          text-align: justify;
          text-align-last: center;
        }

        .intro-root .bottom {
          position:absolute; bottom:0; left:0; right:0; z-index:5;
          padding: 12px 14px 18px;
          background: linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.6) 50%, transparent);
          display:flex; gap:10px;
        }
        .intro-root .cta {
          flex:1; border-radius:12px; padding:11px 12px;
          font-family: inherit; font-size:13.5px; font-weight:600;
          letter-spacing:-0.1px; line-height:1.15;
          text-align:left; cursor:pointer; border:1px solid rgba(255,255,255,0.18);
          background:rgba(255,255,255,0.06); color:#fff;
          display:flex; flex-direction:column; gap:3px;
          transition: transform 140ms cubic-bezier(0.4,0,0.2,1), background 240ms cubic-bezier(0.32,0.72,0,1), border-color 240ms cubic-bezier(0.32,0.72,0,1);
          opacity:0; animation: ctaIn 600ms cubic-bezier(0.32,0.72,0,1) 600ms forwards;
        }
        .intro-root .cta:active { transform: scale(0.97); }
        @keyframes ctaIn { 0% { opacity:0; transform:translateY(8px); } 100% { opacity:1; transform:translateY(0); } }
        .intro-root .cta small {
          font-size:11px; font-weight:500; color:rgba(255,255,255,0.55);
          letter-spacing:0;
        }
        .intro-root .cta.primary {
          background:#ffd84a; color:#1a1100; border-color:#ffd84a;
          box-shadow: 0 0 20px rgba(255,216,74,0.25);
          animation: ctaIn 600ms cubic-bezier(0.32,0.72,0,1) 600ms forwards, primaryGlow 3.2s cubic-bezier(0.32,0.72,0,1) infinite 1.2s;
        }
        @keyframes primaryGlow {
          0%,100% { box-shadow: 0 0 20px rgba(255,216,74,0.25); }
          50%     { box-shadow: 0 0 32px rgba(255,216,74,0.45); }
        }
        .intro-root .cta.primary small { color:rgba(26,17,0,0.6); }

        .intro-root .footer-hint {
          position:absolute; bottom:84px; left:0; right:0;
          text-align:center; font-size:10.5px;
          color:rgba(255,255,255,0.4); letter-spacing:0.06em;
          text-transform:uppercase; z-index:4;
        }
      `}</style>

      {/* Starfield — 3 parallax layers */}
      <svg className="stars" viewBox="0 0 360 740" preserveAspectRatio="none">
        <g className="layer-1">
          {STAR_FIELD.filter((_,i) => i % 3 === 0).map((s, i) => (
            <circle key={"a"+i} cx={s.x} cy={s.y} r={s.r * 0.6} fill="#fff"
              style={{ "--o": s.o * 0.5, "--t": `${s.t}s`, "--d": `${s.d}s`, opacity: s.o * 0.5 }} />
          ))}
        </g>
        <g className="layer-2">
          {STAR_FIELD.filter((_,i) => i % 3 === 1).map((s, i) => (
            <circle key={"b"+i} cx={s.x} cy={s.y} r={s.r * 0.9} fill="#fff"
              style={{ "--o": s.o * 0.8, "--t": `${s.t}s`, "--d": `${s.d}s`, opacity: s.o * 0.8 }} />
          ))}
        </g>
        <g className="layer-3">
          {STAR_FIELD.filter((_,i) => i % 3 === 2).map((s, i) => (
            <circle key={"c"+i} cx={s.x} cy={s.y} r={s.r * 1.3} fill="#fff"
              style={{ "--o": s.o, "--t": `${s.t}s`, "--d": `${s.d}s`, opacity: s.o }} />
          ))}
        </g>
      </svg>

      {/* Top bar */}{/* Top bar */}
      <div className="topbar">
        <div className="x">✕</div>
        <div className="skip">{T.skip} →</div>
      </div>

      {/* Blue subtitle */}
      <div className="above">{T.above}</div>

      {/* Crawl stage */}
      <div className="stage">
        <div className="crawl">
          <div className="ep">{T.episode}</div>
          <h1 className="title">{T.title}</h1>
          {T.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>

      {/* Faint hint */}
      <div className="footer-hint">{lang === "ru" ? "выберите путь" : "choose your path"}</div>

      {/* Two CTAs */}
      <div className="bottom">
        <button className="cta primary">{T.needServer}<small>{T.needServerSub}</small></button>
        <button className="cta">{T.haveServer}<small>{T.haveServerSub}</small></button>
      </div>
    </div>
  );
}

Object.assign(window, { IntroCrawl });
