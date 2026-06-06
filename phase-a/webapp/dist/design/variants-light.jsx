// 6 LIGHT variants of the goVLESS Home / Главная screen.
// Each is fully self-contained: scoped <style> block + JSX. Artboard 360×740.
// Content shared via window.CONTENT.

const C = window.CONTENT;

/* ─────────────────────────────────────────────────────────────
   L1 — Paper Minimal
   IBM Plex Sans, warm off-white, single muted-green accent, generous whitespace.
   ───────────────────────────────────────────────────────────── */
function L1_PaperMinimal() {
  return (
    <>
      <style>{`
        .L1 { background: #f5f3ec; color: #1a1917; font-family: "IBM Plex Sans", sans-serif; }
        .L1 .hd { display:flex; align-items:center; height:50px; padding:0 14px; gap:10px; background:#fbf9f2; border-bottom:1px solid #e8e4d6; flex:0 0 auto; }
        .L1 .hd .x { color:#8a877f; font-size:18px; font-weight:300; width:24px; }
        .L1 .hd .ti { flex:1; text-align:center; font-size:14.5px; font-weight:600; letter-spacing:-0.1px; }
        .L1 .hd .ti small { display:block; font-size:10.5px; font-weight:400; color:#8a877f; margin-top:1px; letter-spacing:0; }
        .L1 .hd .m { color:#8a877f; font-size:18px; width:24px; text-align:right; letter-spacing:1px; }
        .L1 .body { flex:1; min-height:0; overflow:auto; padding: 14px 14px 24px; display:flex; flex-direction:column; gap:14px; }
        .L1 .hero { background:#fff; border:1px solid #e8e4d6; border-radius:14px; padding:18px 16px; }
        .L1 .hero .row { display:flex; align-items:center; gap:10px; }
        .L1 .pill { display:inline-flex; align-items:center; gap:6px; height:22px; padding:0 9px; border-radius:11px; background:#e1efe4; color:#2c6045; font-size:11px; font-weight:600; letter-spacing:0.02em; }
        .L1 .pill::before { content:""; width:6px; height:6px; border-radius:50%; background:#3e8c5e; }
        .L1 .modetag { margin-left:auto; font-size:11px; font-weight:600; color:#5a5852; padding:3px 8px; background:#efece2; border-radius:10px; }
        .L1 .lead { font-size:24px; font-weight:600; letter-spacing:-0.5px; margin:14px 0 4px; line-height:1.15; }
        .L1 .leadsub { font-size:12.5px; color:#6e6c66; font-family:"IBM Plex Mono", monospace; }
        .L1 .stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
        .L1 .stat { background:#faf8f1; border:1px solid #ece8da; border-radius:10px; padding:10px 12px; }
        .L1 .stat .v { font-size:18px; font-weight:600; font-family:"IBM Plex Mono", monospace; letter-spacing:-0.5px; }
        .L1 .stat .l { font-size:11px; color:#6e6c66; margin-top:2px; }
        .L1 .qa { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
        .L1 .qa button { background:#fff; border:1px solid #e8e4d6; border-radius:12px; padding:14px 6px 12px; display:flex; flex-direction:column; align-items:center; gap:6px; font:inherit; cursor:pointer; }
        .L1 .qa svg { width:20px; height:20px; color:#3a3936; }
        .L1 .qa span { font-size:12px; color:#3a3936; font-weight:500; }
        .L1 .sec { font-size:11px; font-weight:600; color:#8a877f; text-transform:uppercase; letter-spacing:0.06em; margin:4px 4px 0; display:flex; justify-content:space-between; }
        .L1 .sec a { color:#3a3936; font-weight:500; text-transform:none; letter-spacing:0; font-size:12px; }
        .L1 .list { background:#fff; border:1px solid #e8e4d6; border-radius:14px; overflow:hidden; }
        .L1 .li { display:flex; align-items:center; gap:12px; padding:12px 14px; }
        .L1 .li + .li { border-top:1px solid #f0ece0; }
        .L1 .av { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:600; }
        .L1 .nm { flex:1; min-width:0; }
        .L1 .nm .n { font-size:14px; font-weight:500; color:#1a1917; }
        .L1 .nm .s { font-size:11.5px; color:#8a877f; font-family:"IBM Plex Mono", monospace; margin-top:1px; }
        .L1 .dot { width:8px; height:8px; border-radius:50%; }
        .L1 .nav { display:flex; height:54px; border-top:1px solid #e8e4d6; background:#fbf9f2; flex:0 0 auto; }
        .L1 .nav button { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; background:none; border:none; cursor:pointer; color:#8a877f; font:inherit; }
        .L1 .nav button.on { color:#1a1917; }
        .L1 .nav span { font-size:10px; font-weight:500; letter-spacing:0.02em; }
      `}</style>
      <div className="frame L1">
        <div className="hd">
          <div className="x">✕</div>
          <div className="ti">{C.appName}<small>WebApp · Mini App</small></div>
          <div className="m">⋯</div>
        </div>
        <div className="body">
          <div className="hero">
            <div className="row">
              <span className="pill">{C.status}</span>
              <span className="modetag">Lite · Reality</span>
            </div>
            <div className="lead">VPN включён.<br/>{C.clientsActive} клиента онлайн.</div>
            <div className="leadsub">{C.server.slice(0, 28)}…</div>
            <div className="stats">
              <div className="stat"><div className="v">{C.trafficMonth}</div><div className="l">Трафик за месяц</div></div>
              <div className="stat"><div className="v">{C.uptime}</div><div className="l">Аптайм</div></div>
            </div>
          </div>
          <div className="qa">
            <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8" strokeLinecap="round"/></svg><span>Клиент</span></button>
            <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M19 17v4M14 21h3" strokeLinecap="round"/></svg><span>QR</span></button>
            <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M10 13l4-4M6.5 9.5L8 8a4 4 0 0 1 5.7 5.7L12 15M11.5 14.5L10 16a4 4 0 0 1-5.7-5.7L6 8.5" strokeLinecap="round"/></svg><span>Подписка</span></button>
          </div>
          <div className="sec"><span>Клиенты</span><a>Все ({C.clientsTotal})</a></div>
          <div className="list">
            {C.clients.map((c, i) => (
              <div className="li" key={i}>
                <div className="av" style={{ background: `oklch(0.55 0.10 ${c.hue})` }}>
                  {c.name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="nm">
                  <div className="n">{c.name}</div>
                  <div className="s">{c.used} · до {c.days}</div>
                </div>
                <div className="dot" style={{ background: c.on ? "#3e8c5e" : "#c8c4b6" }} />
              </div>
            ))}
          </div>
        </div>
        <div className="nav">
          <button className="on"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg><span>Главная</span></button>
          <button><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="8" r="3"/><path d="M3 19c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5M16 11a2.5 2.5 0 1 0 0-5M21 19c-.4-1.8-1.5-3-3-3.5"/></svg><span>Клиенты</span></button>
          <button><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2l3 4-3 4M12 14l3 4-3 4M2 12l4-3 4 3M14 12l4-3 4 3"/></svg><span>Режим</span></button>
          <button><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg><span>Система</span></button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   L2 — Swiss Editorial
   Manrope, dense data, no cards — rules + numbered sections.
   ───────────────────────────────────────────────────────────── */
function L2_SwissEditorial() {
  return (
    <>
      <style>{`
        .L2 { background:#fff; color:#0a0a0a; font-family:"Manrope", sans-serif; }
        .L2 .hd { display:flex; align-items:center; height:48px; padding:0 16px; gap:10px; border-bottom:1px solid #0a0a0a; }
        .L2 .x { font-size:18px; }
        .L2 .ti { flex:1; text-align:center; font-size:13.5px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; }
        .L2 .m { font-size:18px; letter-spacing:1px; }
        .L2 .body { flex:1; min-height:0; overflow:auto; }
        .L2 .top { padding:20px 16px 18px; border-bottom:1px solid #0a0a0a; }
        .L2 .kicker { font-family:"IBM Plex Mono", monospace; font-size:10px; letter-spacing:0.08em; text-transform:uppercase; color:#666; }
        .L2 .h1 { font-size:30px; font-weight:800; letter-spacing:-0.7px; line-height:1.05; margin:4px 0 6px; }
        .L2 .h1 .dot { display:inline-block; width:10px; height:10px; border-radius:50%; background:#1f8a5b; margin-right:8px; vertical-align:middle; }
        .L2 .meta { display:flex; gap:14px; font-family:"IBM Plex Mono", monospace; font-size:11px; color:#666; margin-top:8px; }
        .L2 .meta span b { color:#0a0a0a; font-weight:600; }
        .L2 .grid { display:grid; grid-template-columns:1fr 1fr; }
        .L2 .grid > div { padding:14px 16px; border-bottom:1px solid #0a0a0a; }
        .L2 .grid > div:nth-child(odd) { border-right:1px solid #0a0a0a; }
        .L2 .gk { font-family:"IBM Plex Mono", monospace; font-size:9.5px; text-transform:uppercase; letter-spacing:0.1em; color:#666; }
        .L2 .gv { font-size:22px; font-weight:700; letter-spacing:-0.4px; margin-top:2px; font-variant-numeric:tabular-nums; }
        .L2 .gv small { font-size:11px; font-weight:500; color:#666; margin-left:4px; letter-spacing:0; }
        .L2 .sec { padding:16px 16px 8px; display:flex; align-items:baseline; justify-content:space-between; }
        .L2 .sec .n { font-family:"IBM Plex Mono", monospace; font-size:10.5px; color:#666; letter-spacing:0.06em; }
        .L2 .sec .t { font-size:16px; font-weight:700; letter-spacing:-0.2px; }
        .L2 .sec .all { font-family:"IBM Plex Mono", monospace; font-size:11px; color:#0a0a0a; text-decoration:underline; text-underline-offset:3px; }
        .L2 .act { display:flex; gap:0; border-top:1px solid #0a0a0a; }
        .L2 .act button { flex:1; padding:14px 6px 13px; border:0; border-right:1px solid #0a0a0a; background:#fff; font:inherit; font-size:13px; font-weight:700; letter-spacing:-0.1px; cursor:pointer; text-align:left; padding-left:14px; }
        .L2 .act button:last-child { border-right:0; }
        .L2 .act button span { display:block; font-family:"IBM Plex Mono", monospace; font-size:10px; font-weight:500; color:#666; letter-spacing:0.06em; text-transform:uppercase; margin-top:2px; }
        .L2 .clients { border-top:1px solid #0a0a0a; }
        .L2 .cli { display:flex; gap:12px; padding:12px 16px; border-bottom:1px solid #e1e1e1; align-items:center; }
        .L2 .cli .nu { font-family:"IBM Plex Mono", monospace; font-size:10.5px; color:#666; width:18px; }
        .L2 .cli .nm { flex:1; }
        .L2 .cli .nm .n { font-size:14px; font-weight:700; letter-spacing:-0.1px; }
        .L2 .cli .nm .s { font-family:"IBM Plex Mono", monospace; font-size:10.5px; color:#666; margin-top:2px; }
        .L2 .cli .v { font-family:"IBM Plex Mono", monospace; font-size:12px; font-weight:600; font-variant-numeric:tabular-nums; }
        .L2 .cli .st { width:8px; height:8px; border-radius:50%; }
        .L2 .ft { padding:14px 16px; border-top:1px solid #0a0a0a; display:flex; justify-content:space-between; font-family:"IBM Plex Mono", monospace; font-size:10.5px; color:#666; }
      `}</style>
      <div className="frame L2">
        <div className="hd"><div className="x">✕</div><div className="ti">{C.appName}</div><div className="m">⋯</div></div>
        <div className="body">
          <div className="top">
            <div className="kicker">01 / Status</div>
            <h1 className="h1"><span className="dot"/>Protected.</h1>
            <div className="meta">
              <span>Mode <b>Lite</b></span>
              <span>Reality</span>
              <span>Uptime <b>{C.uptime}</b></span>
            </div>
          </div>
          <div className="grid">
            <div><div className="gk">Clients</div><div className="gv">{C.clientsActive}<small>/ {C.clientsTotal}</small></div></div>
            <div><div className="gk">Traffic / mo</div><div className="gv">218<small>GB</small></div></div>
            <div><div className="gk">Pool</div><div className="gv">21<small>%</small></div></div>
            <div><div className="gk">Domain</div><div className="gv" style={{fontFamily:'"IBM Plex Mono", monospace', fontSize:11, fontWeight:500, marginTop:6}}>tunnel-fra-04<br/>.trycloudflare.com</div></div>
          </div>
          <div className="act">
            <button>Добавить<span>+ client</span></button>
            <button>QR<span>scan</span></button>
            <button>Подписка<span>copy</span></button>
          </div>
          <div className="sec"><div><div className="n">02 / Clients</div><div className="t">Активные</div></div><a className="all">all →</a></div>
          <div className="clients">
            {C.clients.map((c,i) => (
              <div className="cli" key={i}>
                <div className="nu">{String(i+1).padStart(2,'0')}</div>
                <div className="nm">
                  <div className="n">{c.name}</div>
                  <div className="s">expires in {c.days} · {c.used}</div>
                </div>
                <div className="st" style={{background: c.on ? '#1f8a5b' : '#c4c4c4'}}/>
              </div>
            ))}
          </div>
        </div>
        <div className="ft"><span>v 0.9.4-rc1</span><span>RPC ok · 12ms</span></div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   L3 — Soft Card
   Nunito, cream + soft pastels, big radii, friendly.
   ───────────────────────────────────────────────────────────── */
function L3_SoftCard() {
  return (
    <>
      <style>{`
        .L3 { background:#fdf8ef; color:#2a2520; font-family:"Nunito", sans-serif; }
        .L3 .hd { display:flex; align-items:center; height:54px; padding:0 16px; gap:10px; flex:0 0 auto; }
        .L3 .x { color:#a89c8a; font-size:18px; width:28px; }
        .L3 .ti { flex:1; text-align:center; font-size:15px; font-weight:800; letter-spacing:-0.2px; }
        .L3 .ti small { display:block; font-size:11px; font-weight:600; color:#a89c8a; margin-top:0; letter-spacing:0; }
        .L3 .m { color:#a89c8a; font-size:20px; width:28px; text-align:right; letter-spacing:1px; }
        .L3 .body { flex:1; overflow:auto; padding:8px 16px 24px; display:flex; flex-direction:column; gap:14px; }
        .L3 .hero { background:linear-gradient(160deg,#dff0db,#ecf7e6 60%,#fff); border-radius:24px; padding:20px 18px 22px; position:relative; overflow:hidden; }
        .L3 .hero .blob { position:absolute; right:-30px; bottom:-30px; width:160px; height:160px; border-radius:50%; background:radial-gradient(circle,#cfe6c6,transparent 70%); pointer-events:none; }
        .L3 .hero .pill { display:inline-flex; align-items:center; gap:6px; height:24px; padding:0 11px; border-radius:12px; background:#fff; color:#2c6045; font-size:11.5px; font-weight:700; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .L3 .hero .pill::before { content:""; width:7px; height:7px; border-radius:50%; background:#3e8c5e; box-shadow:0 0 0 3px rgba(62,140,94,0.18); }
        .L3 .hero h1 { font-size:24px; font-weight:800; letter-spacing:-0.4px; margin:12px 0 4px; line-height:1.15; }
        .L3 .hero .sub { font-size:13.5px; color:#5a5040; font-weight:500; }
        .L3 .hero .stats { display:flex; gap:14px; margin-top:18px; }
        .L3 .hero .st { flex:1; background:rgba(255,255,255,0.7); border-radius:14px; padding:10px 12px; backdrop-filter: blur(4px); }
        .L3 .hero .st .v { font-size:18px; font-weight:800; letter-spacing:-0.3px; }
        .L3 .hero .st .l { font-size:11px; color:#5a5040; font-weight:600; margin-top:1px; }
        .L3 .qa { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
        .L3 .qa button { background:#fff; border:0; border-radius:18px; padding:16px 8px; font:inherit; font-weight:700; font-size:12.5px; color:#2a2520; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.04); display:flex; flex-direction:column; gap:8px; align-items:center; }
        .L3 .qa .ic { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; }
        .L3 .qa .ic.a { background:#3e8c5e; }
        .L3 .qa .ic.b { background:#e68d4e; }
        .L3 .qa .ic.c { background:#5b8fc7; }
        .L3 .sec { display:flex; align-items:center; justify-content:space-between; padding:4px 4px 0; }
        .L3 .sec h2 { margin:0; font-size:15px; font-weight:800; letter-spacing:-0.2px; }
        .L3 .sec a { font-size:12.5px; font-weight:700; color:#3e8c5e; }
        .L3 .list { display:flex; flex-direction:column; gap:10px; }
        .L3 .li { background:#fff; border-radius:18px; padding:12px 14px; display:flex; align-items:center; gap:12px; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .L3 .av { width:40px; height:40px; border-radius:14px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:800; }
        .L3 .nm { flex:1; min-width:0; }
        .L3 .nm .n { font-size:14.5px; font-weight:700; }
        .L3 .nm .s { font-size:12px; color:#8a7e6c; font-weight:600; margin-top:1px; }
        .L3 .badge { font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:8px; }
        .L3 .badge.on { background:#e1efe4; color:#2c6045; }
        .L3 .badge.off { background:#f3eee3; color:#8a7e6c; }
      `}</style>
      <div className="frame L3">
        <div className="hd"><div className="x">✕</div><div className="ti">{C.appName}<small>mini app</small></div><div className="m">⋯</div></div>
        <div className="body">
          <div className="hero">
            <div className="blob"/>
            <span className="pill">Защищено · Lite</span>
            <h1>Всё в порядке 👌</h1>
            <div className="sub">4 устройства подключены к туннелю Reality.</div>
            <div className="stats">
              <div className="st"><div className="v">218 GB</div><div className="l">за месяц</div></div>
              <div className="st"><div className="v">14д</div><div className="l">аптайм</div></div>
              <div className="st"><div className="v">4 / 5</div><div className="l">клиентов</div></div>
            </div>
          </div>
          <div className="qa">
            <button><div className="ic a"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></div>Добавить</button>
            <button><div className="ic b"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M19 17v4M14 21h3"/></svg></div>QR-код</button>
            <button><div className="ic c"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 14L4 20M14 4l6 6M9 5l10 10M5 9l10 10"/></svg></div>Подписка</button>
          </div>
          <div className="sec"><h2>Клиенты</h2><a>Все →</a></div>
          <div className="list">
            {C.clients.map((c,i) => (
              <div className="li" key={i}>
                <div className="av" style={{background:`oklch(0.62 0.12 ${c.hue})`}}>
                  {c.name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="nm">
                  <div className="n">{c.name}</div>
                  <div className="s">{c.used} · {c.days}</div>
                </div>
                <div className={`badge ${c.on?'on':'off'}`}>{c.on?'ON':'OFF'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   L4 — Mono Industrial
   IBM Plex Mono everywhere, ASCII chrome, control-panel.
   ───────────────────────────────────────────────────────────── */
function L4_MonoIndustrial() {
  return (
    <>
      <style>{`
        .L4 { background:#f3f1ea; color:#0e0d0b; font-family:"IBM Plex Mono", monospace; font-size:12.5px; line-height:1.5; }
        .L4 .hd { display:flex; height:42px; align-items:center; padding:0 14px; gap:8px; border-bottom:1px solid #0e0d0b; background:#e8e5db; }
        .L4 .x { font-size:14px; }
        .L4 .ti { flex:1; text-align:center; font-size:12px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; }
        .L4 .m { font-size:14px; letter-spacing:1px; }
        .L4 .body { flex:1; overflow:auto; padding:14px 14px 24px; }
        .L4 .blk { background:#fff; border:1px solid #0e0d0b; padding:12px 14px; margin-bottom:12px; }
        .L4 .hd2 { display:flex; justify-content:space-between; font-size:10.5px; text-transform:uppercase; letter-spacing:0.1em; border-bottom:1px dashed #b0aa98; padding-bottom:6px; margin-bottom:8px; }
        .L4 .row { display:flex; justify-content:space-between; padding:2px 0; }
        .L4 .row .k { color:#5a5852; }
        .L4 .row .v { font-weight:600; }
        .L4 .row .v.ok { color:#1f7a4c; }
        .L4 .big { font-size:32px; font-weight:600; letter-spacing:-1px; line-height:1; padding:2px 0 4px; }
        .L4 .big::before { content:"["; color:#1f7a4c; margin-right:4px; }
        .L4 .big::after  { content:"]"; color:#1f7a4c; margin-left:4px; }
        .L4 .ascii { font-size:11px; color:#7a766b; white-space:pre; line-height:1.2; margin: 8px 0 4px; }
        .L4 .keys { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px; }
        .L4 .keys div { border:1px dashed #0e0d0b; padding:6px 8px; font-size:11px; }
        .L4 .keys div b { display:block; font-size:13px; }
        .L4 .actions { display:grid; grid-template-columns:1fr; gap:6px; margin-top:10px; }
        .L4 .actions button { background:#fff; border:1px solid #0e0d0b; padding:10px 12px; font:inherit; font-size:12.5px; font-weight:600; text-align:left; cursor:pointer; display:flex; justify-content:space-between; align-items:center; text-transform:uppercase; letter-spacing:0.04em; }
        .L4 .actions button::after { content:"→"; color:#7a766b; }
        .L4 .actions button.p { background:#0e0d0b; color:#fff; }
        .L4 .actions button.p::after { color:#a8a39a; }
        .L4 .cli { display:flex; gap:10px; padding:6px 0; border-bottom:1px dashed #b0aa98; align-items:center; font-size:12px; }
        .L4 .cli:last-child { border-bottom:0; }
        .L4 .cli .id { color:#7a766b; width:22px; }
        .L4 .cli .nm { flex:1; }
        .L4 .cli .nm .n { font-weight:600; }
        .L4 .cli .nm .s { font-size:10.5px; color:#7a766b; }
        .L4 .cli .st { font-size:10.5px; font-weight:600; }
        .L4 .cli .st.on { color:#1f7a4c; }
        .L4 .cli .st.off { color:#7a766b; }
        .L4 .ft { font-size:10.5px; padding:8px 14px; border-top:1px solid #0e0d0b; background:#e8e5db; color:#5a5852; display:flex; justify-content:space-between; flex:0 0 auto; }
      `}</style>
      <div className="frame L4">
        <div className="hd"><div className="x">[×]</div><div className="ti">goVLESS · status</div><div className="m">≡</div></div>
        <div className="body">
          <div className="blk">
            <div className="hd2"><span>// status</span><span>OK</span></div>
            <div className="big">PROTECTED</div>
            <div className="row"><span className="k">mode</span><span className="v ok">lite · reality</span></div>
            <div className="row"><span className="k">host</span><span className="v">tunnel-fra-04…</span></div>
            <div className="row"><span className="k">uptime</span><span className="v">{C.uptime}</span></div>
            <div className="ascii">├─ traffic ──────────────────┤{"\n"}[████████░░░░░░░░░░░░░░░] 21%</div>
            <div className="row"><span className="k">218.4 / 1024 GB</span><span className="v">21%</span></div>
          </div>

          <div className="blk">
            <div className="hd2"><span>// quick</span><span>tap</span></div>
            <div className="actions">
              <button className="p">+ add client</button>
              <button>show qr / link</button>
              <button>copy subscription</button>
            </div>
          </div>

          <div className="blk">
            <div className="hd2"><span>// clients · 4 of 5</span><a>view all</a></div>
            {C.clients.map((c,i) => (
              <div className="cli" key={i}>
                <div className="id">[{String(i+1).padStart(2,'0')}]</div>
                <div className="nm">
                  <div className="n">{c.name}</div>
                  <div className="s">{c.used} / exp {c.days}</div>
                </div>
                <div className={`st ${c.on?'on':'off'}`}>{c.on?'ON':'OFF'}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ft"><span>rpc 12ms</span><span>v0.9.4</span></div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   L5 — Pastel Mint
   Mint background, white rounded cards, very gentle.
   ───────────────────────────────────────────────────────────── */
function L5_PastelMint() {
  return (
    <>
      <style>{`
        .L5 { background:#dfeee3; color:#1c2820; font-family:"IBM Plex Sans", sans-serif; }
        .L5 .hd { display:flex; align-items:center; height:54px; padding:0 18px; gap:10px; flex:0 0 auto; }
        .L5 .x { color:#5b7568; font-size:18px; width:28px; }
        .L5 .ti { flex:1; text-align:center; font-size:14.5px; font-weight:600; }
        .L5 .ti small { display:block; font-size:11px; font-weight:400; color:#5b7568; margin-top:1px; }
        .L5 .m { color:#5b7568; font-size:18px; width:28px; text-align:right; letter-spacing:1px; }
        .L5 .body { flex:1; overflow:auto; padding:6px 16px 24px; display:flex; flex-direction:column; gap:12px; }
        .L5 .hero { background:#fff; border-radius:22px; padding:20px 18px; box-shadow:0 6px 24px rgba(33,72,52,0.05); }
        .L5 .hero h1 { font-size:22px; font-weight:600; margin:0; letter-spacing:-0.4px; }
        .L5 .hero .grn { color:#2e7a55; }
        .L5 .hero .sub { font-size:12.5px; color:#5b7568; margin-top:6px; }
        .L5 .hero .meta { display:flex; gap:14px; margin-top:14px; padding-top:14px; border-top:1px solid #e6efea; }
        .L5 .hero .m1 { flex:1; }
        .L5 .hero .m1 .v { font-size:18px; font-weight:600; font-variant-numeric:tabular-nums; letter-spacing:-0.3px; }
        .L5 .hero .m1 .l { font-size:11px; color:#5b7568; margin-top:2px; }
        .L5 .progr { margin-top:16px; }
        .L5 .progr .bar { height:5px; background:#dfeee3; border-radius:3px; overflow:hidden; }
        .L5 .progr .bar > span { display:block; height:100%; background:#3e8c5e; border-radius:3px; }
        .L5 .progr .lbl { display:flex; justify-content:space-between; font-size:11.5px; color:#5b7568; margin-top:6px; }
        .L5 .qa { background:#fff; border-radius:22px; padding:10px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; box-shadow:0 6px 24px rgba(33,72,52,0.05); }
        .L5 .qa button { border:0; background:transparent; padding:14px 4px; font:inherit; font-size:12px; font-weight:500; color:#1c2820; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:6px; border-radius:14px; }
        .L5 .qa button:hover { background:#f3f8f5; }
        .L5 .qa svg { color:#3e8c5e; width:22px; height:22px; }
        .L5 .sec { display:flex; justify-content:space-between; align-items:baseline; padding:8px 4px 0; }
        .L5 .sec h2 { margin:0; font-size:13px; font-weight:600; color:#5b7568; text-transform:uppercase; letter-spacing:0.06em; }
        .L5 .sec a { font-size:13px; color:#2e7a55; font-weight:500; }
        .L5 .list { background:#fff; border-radius:22px; padding:6px 0; box-shadow:0 6px 24px rgba(33,72,52,0.05); }
        .L5 .li { display:flex; align-items:center; gap:12px; padding:11px 18px; }
        .L5 .li + .li { border-top:1px solid #eaf2ed; }
        .L5 .av { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:600; }
        .L5 .nm { flex:1; min-width:0; }
        .L5 .nm .n { font-size:14px; font-weight:500; }
        .L5 .nm .s { font-size:11.5px; color:#5b7568; margin-top:1px; }
        .L5 .sw { width:34px; height:20px; border-radius:10px; background:#3e8c5e; position:relative; }
        .L5 .sw::after { content:""; position:absolute; right:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
        .L5 .sw.off { background:#cfd9d3; }
        .L5 .sw.off::after { left:2px; right:auto; }
      `}</style>
      <div className="frame L5">
        <div className="hd"><div className="x">✕</div><div className="ti">{C.appName}<small>Lite · Reality</small></div><div className="m">⋯</div></div>
        <div className="body">
          <div className="hero">
            <h1>VPN <span className="grn">включён</span>.</h1>
            <div className="sub">Туннель Cloudflare · 14 дней без обрывов</div>
            <div className="meta">
              <div className="m1"><div className="v">4 / 5</div><div className="l">клиентов онлайн</div></div>
              <div className="m1"><div className="v">218<span style={{fontSize:12, color:'#5b7568', marginLeft:3}}>GB</span></div><div className="l">за месяц</div></div>
            </div>
            <div className="progr">
              <div className="bar"><span style={{width:'21%'}}/></div>
              <div className="lbl"><span>218.4 GB из 1 TB</span><span>21%</span></div>
            </div>
          </div>
          <div className="qa">
            <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="9" r="3.5"/><path d="M4 20c1-3.5 4-5 8-5s7 1.5 8 5"/><path d="M19 4v4M17 6h4"/></svg>Добавить</button>
            <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M19 17v4M14 21h3" strokeLinecap="round"/></svg>QR</button>
            <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 3v4M15 17v4M3 9h4M17 15h4M5.5 5.5l3 3M15.5 15.5l3 3M5.5 18.5l3-3M15.5 8.5l3-3"/></svg>Подписка</button>
          </div>
          <div className="sec"><h2>Клиенты</h2><a>Все ({C.clientsTotal})</a></div>
          <div className="list">
            {C.clients.map((c,i) => (
              <div className="li" key={i}>
                <div className="av" style={{background:`oklch(0.58 0.10 ${c.hue})`}}>
                  {c.name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className="nm">
                  <div className="n">{c.name}</div>
                  <div className="s">{c.used} · до {c.days}</div>
                </div>
                <div className={`sw ${c.on?'':'off'}`}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   L6 — Brutalist White
   Space Grotesk, 2px black borders, sharp corners, big display type.
   ───────────────────────────────────────────────────────────── */
function L6_BrutalistWhite() {
  return (
    <>
      <style>{`
        .L6 { background:#fff; color:#000; font-family:"Space Grotesk", sans-serif; }
        .L6 .hd { display:flex; height:48px; align-items:center; padding:0 14px; gap:8px; border-bottom:2px solid #000; }
        .L6 .x { font-size:20px; font-weight:700; }
        .L6 .ti { flex:1; text-align:center; font-size:14px; font-weight:700; letter-spacing:0.02em; text-transform:uppercase; }
        .L6 .m { font-size:18px; font-weight:700; letter-spacing:1px; }
        .L6 .body { flex:1; overflow:auto; }
        .L6 .hero { padding:18px 16px 20px; border-bottom:2px solid #000; position:relative; }
        .L6 .hero::after { content:""; position:absolute; right:14px; top:14px; width:14px; height:14px; background:#000; border-radius:50%; box-shadow:0 0 0 6px rgba(0,0,0,0); animation:none; }
        .L6 .stamp { display:inline-block; border:2px solid #000; padding:3px 10px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; }
        .L6 h1 { font-size:42px; font-weight:700; letter-spacing:-1.6px; line-height:0.95; margin:14px 0 8px; }
        .L6 h1 small { display:block; font-size:14px; font-weight:500; color:#555; letter-spacing:-0.2px; text-transform:none; margin-top:8px; }
        .L6 .meta { display:flex; gap:0; border-top:2px solid #000; border-bottom:2px solid #000; }
        .L6 .meta div { flex:1; padding:12px 14px; border-right:2px solid #000; }
        .L6 .meta div:last-child { border-right:0; }
        .L6 .meta .k { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#555; }
        .L6 .meta .v { font-size:24px; font-weight:700; letter-spacing:-0.7px; line-height:1; margin-top:4px; font-variant-numeric:tabular-nums; }
        .L6 .qa { display:grid; grid-template-columns:2fr 1fr 1fr; gap:0; border-bottom:2px solid #000; }
        .L6 .qa button { padding:18px 14px; font:inherit; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; border:0; border-right:2px solid #000; background:#fff; cursor:pointer; text-align:left; line-height:1.1; }
        .L6 .qa button:last-child { border-right:0; }
        .L6 .qa button.p { background:#000; color:#fff; }
        .L6 .qa button small { display:block; font-size:10.5px; font-weight:600; color:inherit; opacity:0.6; margin-top:3px; letter-spacing:0; text-transform:none; }
        .L6 .sec { display:flex; justify-content:space-between; align-items:center; padding:14px 16px 4px; }
        .L6 .sec h2 { margin:0; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; }
        .L6 .sec a { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; text-decoration:underline; text-underline-offset:3px; }
        .L6 .cli { display:flex; align-items:center; gap:12px; padding:14px 16px; border-top:2px solid #000; }
        .L6 .cli .av { width:38px; height:38px; border:2px solid #000; background:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; }
        .L6 .cli .nm { flex:1; }
        .L6 .cli .nm .n { font-size:15px; font-weight:700; letter-spacing:-0.2px; }
        .L6 .cli .nm .s { font-size:11px; font-family:"IBM Plex Mono", monospace; color:#555; margin-top:2px; }
        .L6 .cli .st { font-size:11px; font-weight:700; padding:4px 8px; border:2px solid #000; text-transform:uppercase; }
        .L6 .cli .st.off { background:#000; color:#fff; opacity:0.4; }
      `}</style>
      <div className="frame L6">
        <div className="hd"><div className="x">✕</div><div className="ti">{C.appName}</div><div className="m">⋯</div></div>
        <div className="body">
          <div className="hero">
            <span className="stamp">● Protected</span>
            <h1>VPN ON.<small>Lite mode · Reality · Cloudflare tunnel</small></h1>
          </div>
          <div className="meta">
            <div><div className="k">Clients</div><div className="v">4/5</div></div>
            <div><div className="k">Month</div><div className="v">218<span style={{fontSize:13, fontWeight:600, marginLeft:2}}>GB</span></div></div>
            <div><div className="k">Up</div><div className="v">14d</div></div>
          </div>
          <div className="qa">
            <button className="p">+ Add client<small>scan QR · paste link</small></button>
            <button>QR<small>share</small></button>
            <button>Sub<small>copy</small></button>
          </div>
          <div className="sec"><h2>Active clients</h2><a>All →</a></div>
          {C.clients.map((c,i) => (
            <div className="cli" key={i}>
              <div className="av">{c.name.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
              <div className="nm"><div className="n">{c.name}</div><div className="s">{c.used} / exp {c.days}</div></div>
              <div className={`st ${c.on?'':'off'}`}>{c.on?'ON':'OFF'}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, {
  L1_PaperMinimal, L2_SwissEditorial, L3_SoftCard,
  L4_MonoIndustrial, L5_PastelMint, L6_BrutalistWhite,
});
