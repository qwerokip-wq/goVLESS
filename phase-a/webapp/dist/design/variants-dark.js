/* generated from design/variants-dark.jsx by tools/build-webapp.js — DO NOT EDIT (edit the .jsx) */
// 6 DARK variants of the goVLESS Home / Главная screen.
const C = window.CONTENT;

/* ─────────────────────────────────────────────────────────────
   D1 — Carbon Pro
   Near-black bg, sharp green pill, precise Plex Sans + Plex Mono.
   ───────────────────────────────────────────────────────────── */
function D1_CarbonPro() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .D1 { background:#0c0c0e; color:#eeece4; font-family:"IBM Plex Sans", sans-serif; }
        .D1 .hd { display:flex; align-items:center; height:50px; padding:0 14px; gap:10px; border-bottom:1px solid #1d1d20; background:#101013; flex:0 0 auto; }
        .D1 .x { color:#7a7a7e; font-size:18px; width:28px; }
        .D1 .ti { flex:1; text-align:center; font-size:14.5px; font-weight:600; }
        .D1 .ti small { display:block; font-size:10.5px; font-weight:400; color:#7a7a7e; margin-top:1px; }
        .D1 .m { color:#7a7a7e; font-size:18px; width:28px; text-align:right; letter-spacing:1px; }
        .D1 .body { flex:1; overflow:auto; padding:14px 14px 24px; display:flex; flex-direction:column; gap:12px; }
        .D1 .hero { background:#15151a; border:1px solid #25252a; border-radius:12px; padding:18px 16px; }
        .D1 .pill { display:inline-flex; align-items:center; gap:6px; height:22px; padding:0 9px; border-radius:11px; background:rgba(78,210,140,0.12); color:#82e6a8; font-size:11px; font-weight:600; letter-spacing:0.02em; border:1px solid rgba(78,210,140,0.18); }
        .D1 .pill::before { content:""; width:6px; height:6px; border-radius:50%; background:#4ed28c; box-shadow:0 0 6px #4ed28c; }
        .D1 .lead { font-size:24px; font-weight:600; letter-spacing:-0.5px; margin:14px 0 4px; line-height:1.15; }
        .D1 .leadsub { font-size:12px; color:#8a8a8e; font-family:"IBM Plex Mono", monospace; letter-spacing:-0.1px; }
        .D1 .progr { margin-top:16px; }
        .D1 .progr .bar { height:4px; background:#222226; border-radius:2px; overflow:hidden; }
        .D1 .progr .bar > span { display:block; height:100%; background:#4ed28c; }
        .D1 .progr .lbl { display:flex; justify-content:space-between; font-size:11px; color:#8a8a8e; margin-top:6px; font-family:"IBM Plex Mono", monospace; }
        .D1 .progr .lbl b { color:#eeece4; font-weight:600; }
        .D1 .stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
        .D1 .stat { background:#15151a; border:1px solid #25252a; border-radius:10px; padding:10px 12px; }
        .D1 .stat .v { font-size:17px; font-weight:600; font-family:"IBM Plex Mono", monospace; letter-spacing:-0.4px; }
        .D1 .stat .l { font-size:10.5px; color:#8a8a8e; margin-top:2px; text-transform:uppercase; letter-spacing:0.04em; }
        .D1 .qa { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
        .D1 .qa button { background:#15151a; border:1px solid #25252a; border-radius:10px; padding:14px 8px 12px; font:inherit; color:#eeece4; font-size:12.5px; font-weight:500; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .D1 .qa svg { width:20px; height:20px; color:#a8a8ac; }
        .D1 .qa button.p { background:#fff; color:#000; border-color:#fff; }
        .D1 .qa button.p svg { color:#000; }
        .D1 .sec { display:flex; justify-content:space-between; align-items:baseline; padding:0 2px; }
        .D1 .sec h2 { margin:0; font-size:11px; font-weight:600; color:#8a8a8e; text-transform:uppercase; letter-spacing:0.06em; }
        .D1 .sec a { font-size:12px; color:#a8a8ac; }
        .D1 .list { background:#15151a; border:1px solid #25252a; border-radius:12px; overflow:hidden; }
        .D1 .li { display:flex; align-items:center; gap:12px; padding:12px 14px; }
        .D1 .li + .li { border-top:1px solid #1d1d20; }
        .D1 .av { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:600; }
        .D1 .nm { flex:1; min-width:0; }
        .D1 .nm .n { font-size:14px; font-weight:500; }
        .D1 .nm .s { font-size:11px; color:#8a8a8e; font-family:"IBM Plex Mono", monospace; margin-top:1px; }
        .D1 .dot { width:8px; height:8px; border-radius:50%; }
      `), /*#__PURE__*/React.createElement("div", {
    className: "frame D1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "x"
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "ti"
  }, C.appName, /*#__PURE__*/React.createElement("small", null, "Lite \xB7 Reality")), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, C.status), /*#__PURE__*/React.createElement("div", {
    className: "lead"
  }, "VPN \u0432\u043A\u043B\u044E\u0447\u0451\u043D."), /*#__PURE__*/React.createElement("div", {
    className: "leadsub"
  }, "tunnel-fra-04.trycloudflare.com"), /*#__PURE__*/React.createElement("div", {
    className: "progr"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bar"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '21%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, /*#__PURE__*/React.createElement("span", null, "\u0422\u0440\u0430\u0444\u0438\u043A ", /*#__PURE__*/React.createElement("b", null, "218.4 GB"), " / 1 TB"), /*#__PURE__*/React.createElement("span", null, "21%")))), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "4/5"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "\u041A\u043B\u0438\u0435\u043D\u0442\u044B")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "14\u0434"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "\u0410\u043F\u0442\u0430\u0439\u043C")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "12", /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: 11,
      color: '#8a8a8e',
      marginLeft: 2
    }
  }, "ms")), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "RPC"))), /*#__PURE__*/React.createElement("div", {
    className: "qa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "p"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })), "\u041A\u043B\u0438\u0435\u043D\u0442"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "14",
    width: "7",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14h3v3M19 17v4M14 21h3",
    strokeLinecap: "round"
  })), "QR"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 13l4-4M6.5 9.5L8 8a4 4 0 0 1 5.7 5.7L12 15M11.5 14.5L10 16a4 4 0 0 1-5.7-5.7L6 8.5"
  })), "\u041F\u043E\u0434\u043F\u0438\u0441\u043A\u0430")), /*#__PURE__*/React.createElement("div", {
    className: "sec"
  }, /*#__PURE__*/React.createElement("h2", null, "\u041A\u043B\u0438\u0435\u043D\u0442\u044B"), /*#__PURE__*/React.createElement("a", null, "\u0412\u0441\u0435 (", C.clientsTotal, ") \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, C.clients.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "li",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "av",
    style: {
      background: `oklch(0.55 0.13 ${c.hue})`
    }
  }, c.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, c.used, " \xB7 \u0434\u043E ", c.days)), /*#__PURE__*/React.createElement("div", {
    className: "dot",
    style: {
      background: c.on ? '#4ed28c' : '#3a3a3d',
      boxShadow: c.on ? '0 0 6px #4ed28c' : 'none'
    }
  })))))));
}

/* ─────────────────────────────────────────────────────────────
   D2 — Midnight Slate
   Deep blue-slate, warm cards, soft rounded, calm.
   ───────────────────────────────────────────────────────────── */
function D2_MidnightSlate() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .D2 { background:#13161f; color:#e8e7e2; font-family:"Manrope", sans-serif; }
        .D2 .hd { display:flex; align-items:center; height:54px; padding:0 16px; gap:10px; flex:0 0 auto; }
        .D2 .x { color:#7d8294; font-size:18px; width:28px; }
        .D2 .ti { flex:1; text-align:center; font-size:14.5px; font-weight:700; letter-spacing:-0.1px; }
        .D2 .ti small { display:block; font-size:11px; font-weight:500; color:#7d8294; margin-top:1px; }
        .D2 .m { color:#7d8294; font-size:18px; width:28px; text-align:right; letter-spacing:1px; }
        .D2 .body { flex:1; overflow:auto; padding:6px 16px 24px; display:flex; flex-direction:column; gap:14px; }
        .D2 .hero { background:linear-gradient(160deg,#1b2030,#171a26); border-radius:20px; padding:20px 18px; border:1px solid #232838; }
        .D2 .pill { display:inline-flex; align-items:center; gap:7px; padding:5px 11px; border-radius:12px; background:rgba(110,224,166,0.10); color:#86e3b0; font-size:11px; font-weight:700; }
        .D2 .pill::before { content:""; width:6px; height:6px; border-radius:50%; background:#6ee0a6; box-shadow:0 0 5px #6ee0a6; }
        .D2 .h1 { font-size:26px; font-weight:700; letter-spacing:-0.5px; margin:12px 0 4px; line-height:1.1; }
        .D2 .sub { font-size:12.5px; color:#8a90a4; }
        .D2 .meta { display:flex; gap:18px; margin-top:18px; padding-top:16px; border-top:1px solid #232838; }
        .D2 .mt { flex:1; }
        .D2 .mt .v { font-size:20px; font-weight:700; letter-spacing:-0.4px; font-variant-numeric:tabular-nums; }
        .D2 .mt .l { font-size:11px; color:#7d8294; font-weight:500; margin-top:2px; }
        .D2 .qa { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
        .D2 .qa button { background:#1b2030; border:1px solid #232838; border-radius:16px; padding:14px 8px 13px; font:inherit; color:#e8e7e2; font-size:12.5px; font-weight:600; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .D2 .qa svg { width:22px; height:22px; color:#a8aebf; }
        .D2 .qa .p { background:linear-gradient(160deg,#6ee0a6,#3fb98a); color:#0c1322; border-color:transparent; font-weight:700; }
        .D2 .qa .p svg { color:#0c1322; }
        .D2 .sec { display:flex; justify-content:space-between; align-items:baseline; padding:4px 2px 0; }
        .D2 .sec h2 { margin:0; font-size:13px; font-weight:700; }
        .D2 .sec a { font-size:12.5px; color:#86e3b0; font-weight:600; }
        .D2 .list { background:#1b2030; border:1px solid #232838; border-radius:18px; padding:4px 0; }
        .D2 .li { display:flex; align-items:center; gap:12px; padding:12px 16px; }
        .D2 .li + .li { border-top:1px solid #232838; }
        .D2 .av { width:36px; height:36px; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:700; }
        .D2 .nm { flex:1; min-width:0; }
        .D2 .nm .n { font-size:14px; font-weight:600; }
        .D2 .nm .s { font-size:11.5px; color:#7d8294; margin-top:1px; }
        .D2 .sw { width:34px; height:20px; border-radius:10px; background:#3fb98a; position:relative; }
        .D2 .sw::after { content:""; position:absolute; right:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
        .D2 .sw.off { background:#2a3046; }
        .D2 .sw.off::after { left:2px; right:auto; background:#7d8294; }
      `), /*#__PURE__*/React.createElement("div", {
    className: "frame D2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "x"
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "ti"
  }, C.appName, /*#__PURE__*/React.createElement("small", null, "Mini App")), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "Protected \xB7 Lite"), /*#__PURE__*/React.createElement("h1", {
    className: "h1"
  }, "\u0422\u0443\u043D\u043D\u0435\u043B\u044C \u0430\u043A\u0442\u0438\u0432\u0435\u043D."), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Reality \u043F\u043E\u0432\u0435\u0440\u0445 Cloudflare \xB7 4 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \u043E\u043D\u043B\u0430\u0439\u043D"), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "218 GB"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "\u042D\u0442\u043E\u0442 \u043C\u0435\u0441\u044F\u0446")), /*#__PURE__*/React.createElement("div", {
    className: "mt"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "14\u0434 06:22"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "\u0410\u043F\u0442\u0430\u0439\u043C")))), /*#__PURE__*/React.createElement("div", {
    className: "qa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "p"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 5v14M5 12h14"
  })), "\u041A\u043B\u0438\u0435\u043D\u0442"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "7",
    rx: "1.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "7",
    rx: "1.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "14",
    width: "7",
    height: "7",
    rx: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 14h3v3M19 17v4M14 21h3",
    strokeLinecap: "round"
  })), "QR"), /*#__PURE__*/React.createElement("button", null, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 13l4-4M6.5 9.5L8 8a4 4 0 0 1 5.7 5.7L12 15M11.5 14.5L10 16a4 4 0 0 1-5.7-5.7L6 8.5"
  })), "\u041F\u043E\u0434\u043F\u0438\u0441\u043A\u0430")), /*#__PURE__*/React.createElement("div", {
    className: "sec"
  }, /*#__PURE__*/React.createElement("h2", null, "\u041A\u043B\u0438\u0435\u043D\u0442\u044B"), /*#__PURE__*/React.createElement("a", null, "\u0412\u0441\u0435 \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, C.clients.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "li",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "av",
    style: {
      background: `oklch(0.58 0.12 ${c.hue})`
    }
  }, c.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, c.used, " \xB7 \u0434\u043E ", c.days)), /*#__PURE__*/React.createElement("div", {
    className: `sw ${c.on ? '' : 'off'}`
  })))))));
}

/* ─────────────────────────────────────────────────────────────
   D3 — Terminal
   JetBrains Mono, green-on-black, ASCII frames, TUI vibe.
   ───────────────────────────────────────────────────────────── */
function D3_Terminal() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .D3 { background:#0a0b0a; color:#c9d9c1; font-family:"JetBrains Mono", monospace; font-size:12px; line-height:1.55; }
        .D3 .hd { display:flex; align-items:center; height:32px; padding:0 12px; gap:8px; background:#11140f; border-bottom:1px solid #1c2018; }
        .D3 .dots { display:flex; gap:5px; }
        .D3 .dots span { width:9px; height:9px; border-radius:50%; }
        .D3 .dots .r { background:#5a2a2a; }
        .D3 .dots .y { background:#5a4a2a; }
        .D3 .dots .g { background:#2a5a3a; }
        .D3 .hd .ti { flex:1; text-align:center; font-size:11px; color:#6a7a62; letter-spacing:0.04em; }
        .D3 .hd .m { color:#6a7a62; font-size:13px; }
        .D3 .body { flex:1; overflow:auto; padding:12px 12px 22px; }
        .D3 .ln { white-space:pre; }
        .D3 .pr { color:#5fb86a; }
        .D3 .lb { color:#6a7a62; }
        .D3 .vl { color:#e3ecdb; }
        .D3 .ok { color:#5fb86a; }
        .D3 .wn { color:#d6b15a; }
        .D3 .dim { color:#4a5446; }
        .D3 .box { border:1px solid #1c2018; padding:8px 10px; margin:10px 0; }
        .D3 .box .ttl { color:#5fb86a; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; display:flex; justify-content:space-between; }
        .D3 .box .ttl::before { content:"╭─ "; color:#1c2018; }
        .D3 .row { display:flex; justify-content:space-between; padding:1px 0; }
        .D3 .bar { font-size:11px; color:#5fb86a; letter-spacing:-0.5px; }
        .D3 .btn { display:block; width:100%; text-align:left; background:transparent; color:#c9d9c1; border:1px dashed #2a3026; padding:8px 10px; font:inherit; font-size:12px; cursor:pointer; margin:6px 0; }
        .D3 .btn:hover { border-color:#5fb86a; background:rgba(95,184,106,0.05); }
        .D3 .btn .k { color:#5fb86a; }
        .D3 .btn.p { background:#152018; border-color:#5fb86a; color:#a8e6b0; }
        .D3 .cli { display:flex; gap:10px; padding:3px 0; }
        .D3 .cli .id { color:#5fb86a; width:30px; }
        .D3 .cli .nm { flex:1; }
        .D3 .cli .nm .n { color:#e3ecdb; }
        .D3 .cli .nm .s { color:#5a6452; font-size:10.5px; }
        .D3 .cli .st { font-size:10.5px; }
        .D3 .cli .st.on { color:#5fb86a; }
        .D3 .cli .st.off { color:#6a5a3a; }
        .D3 .footer { padding:6px 12px; background:#11140f; color:#5fb86a; font-size:11px; display:flex; justify-content:space-between; border-top:1px solid #1c2018; }
        .D3 .footer .cur::before { content:"▎"; animation:blink 1s steps(2) infinite; }
        @keyframes blink { 50% { opacity:0; } }
      `), /*#__PURE__*/React.createElement("div", {
    className: "frame D3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dots"
  }, /*#__PURE__*/React.createElement("span", {
    className: "r"
  }), /*#__PURE__*/React.createElement("span", {
    className: "y"
  }), /*#__PURE__*/React.createElement("span", {
    className: "g"
  })), /*#__PURE__*/React.createElement("div", {
    className: "ti"
  }, "~/goVLESS \xB7 status"), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "pr"
  }, "$"), " ", /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, "govless status")), /*#__PURE__*/React.createElement("div", {
    className: "ln dim"
  }, "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"), /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "  protocol  "), /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, "vless+reality")), /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "  mode      "), /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, "lite")), /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "  endpoint  "), /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, "tunnel-fra-04.trycloudflare.com")), /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "  uptime    "), /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, C.uptime)), /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "  rpc       "), /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, "ok"), /*#__PURE__*/React.createElement("span", {
    className: "dim"
  }, " \xB7 12ms")), /*#__PURE__*/React.createElement("div", {
    className: "ln"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "  health    "), /*#__PURE__*/React.createElement("span", {
    className: "ok"
  }, "\u25CF PROTECTED")), /*#__PURE__*/React.createElement("div", {
    className: "box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, /*#__PURE__*/React.createElement("span", null, "TRAFFIC"), /*#__PURE__*/React.createElement("span", {
    className: "dim"
  }, "\u2014 monthly")), /*#__PURE__*/React.createElement("div", {
    className: "bar"
  }, "[\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591] 21%"), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "used"), /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, "218.4 GB")), /*#__PURE__*/React.createElement("div", {
    className: "row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lb"
  }, "cap"), /*#__PURE__*/React.createElement("span", {
    className: "vl"
  }, "1024.0 GB"))), /*#__PURE__*/React.createElement("div", {
    className: "box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, /*#__PURE__*/React.createElement("span", null, "ACTIONS"), /*#__PURE__*/React.createElement("span", {
    className: "dim"
  }, "\u21B5 to run")), /*#__PURE__*/React.createElement("button", {
    className: "btn p"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, '> '), "add client"), /*#__PURE__*/React.createElement("button", {
    className: "btn"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "[1]"), " show qr"), /*#__PURE__*/React.createElement("button", {
    className: "btn"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "[2]"), " copy subscription url"), /*#__PURE__*/React.createElement("button", {
    className: "btn"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "[3]"), " switch mode lite \u2192 pro")), /*#__PURE__*/React.createElement("div", {
    className: "box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ttl"
  }, /*#__PURE__*/React.createElement("span", null, "CLIENTS \xB7 4 of 5"), /*#__PURE__*/React.createElement("span", {
    className: "dim"
  }, "--all")), C.clients.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "cli",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "id"
  }, "[", String(i + 1).padStart(2, '0'), "]"), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, c.used, " \xB7 exp ", c.days)), /*#__PURE__*/React.createElement("div", {
    className: `st ${c.on ? 'on' : 'off'}`
  }, c.on ? '● on' : '○ off'))))), /*#__PURE__*/React.createElement("div", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cur"
  }, "user@govless"), /*#__PURE__*/React.createElement("span", null, "v0.9.4 \xB7 ru"))));
}

/* ─────────────────────────────────────────────────────────────
   D4 — Dark Paper
   Warm dark, serif headlines (Newsreader), amber accent, calm.
   ───────────────────────────────────────────────────────────── */
function D4_DarkPaper() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .D4 { background:#1c1814; color:#ece6da; font-family:"IBM Plex Sans", sans-serif; }
        .D4 .hd { display:flex; align-items:center; height:50px; padding:0 16px; gap:10px; border-bottom:1px solid #2a251f; flex:0 0 auto; }
        .D4 .x { color:#8a7f6f; font-size:18px; width:28px; }
        .D4 .ti { flex:1; text-align:center; font-family:"Newsreader", serif; font-size:17px; font-weight:600; font-style:italic; letter-spacing:-0.2px; }
        .D4 .ti small { display:block; font-family:"IBM Plex Sans", sans-serif; font-size:10.5px; font-weight:400; font-style:normal; color:#8a7f6f; margin-top:1px; }
        .D4 .m { color:#8a7f6f; font-size:18px; width:28px; text-align:right; letter-spacing:1px; }
        .D4 .body { flex:1; overflow:auto; padding:16px 18px 28px; display:flex; flex-direction:column; gap:18px; }
        .D4 .kicker { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:#c79a4c; }
        .D4 .kicker::before { content:"—"; color:#c79a4c; margin-right:8px; }
        .D4 .h1 { font-family:"Newsreader", serif; font-size:36px; font-weight:600; line-height:1; letter-spacing:-0.8px; margin:4px 0 6px; }
        .D4 .h1 em { font-style:italic; color:#c79a4c; }
        .D4 .lede { font-size:14px; color:#bcb3a2; line-height:1.45; }
        .D4 .rule { height:1px; background:#2a251f; }
        .D4 .grid { display:grid; grid-template-columns:1fr 1fr; column-gap:18px; row-gap:14px; }
        .D4 .grid .k { font-size:10.5px; color:#8a7f6f; text-transform:uppercase; letter-spacing:0.08em; }
        .D4 .grid .v { font-family:"Newsreader", serif; font-size:22px; font-weight:600; letter-spacing:-0.4px; margin-top:2px; }
        .D4 .grid .v small { font-family:"IBM Plex Sans", sans-serif; font-size:11px; color:#8a7f6f; margin-left:4px; font-weight:500; }
        .D4 .qa { display:flex; flex-direction:column; gap:8px; }
        .D4 .qa button { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-radius:0; border:0; border-top:1px solid #2a251f; border-bottom:1px solid #2a251f; background:transparent; font:inherit; color:#ece6da; font-size:14px; cursor:pointer; text-align:left; }
        .D4 .qa button.p { background:#c79a4c; color:#1c1814; border-color:#c79a4c; font-weight:600; }
        .D4 .qa button::after { content:"→"; opacity:0.6; font-family:"Newsreader", serif; font-size:18px; }
        .D4 .clients-h { display:flex; justify-content:space-between; align-items:baseline; }
        .D4 .clients-h h2 { font-family:"Newsreader", serif; font-style:italic; font-size:22px; font-weight:600; margin:0; letter-spacing:-0.3px; }
        .D4 .clients-h a { font-size:12px; color:#c79a4c; }
        .D4 .li { display:flex; gap:12px; padding:12px 0; border-top:1px solid #2a251f; align-items:center; }
        .D4 .li:last-child { border-bottom:1px solid #2a251f; }
        .D4 .li .nu { font-family:"Newsreader", serif; font-size:24px; color:#8a7f6f; width:30px; line-height:1; }
        .D4 .li .nm { flex:1; }
        .D4 .li .nm .n { font-size:15px; font-weight:500; }
        .D4 .li .nm .s { font-size:11.5px; color:#8a7f6f; margin-top:2px; }
        .D4 .li .st { font-size:11px; color:#bcb3a2; text-transform:uppercase; letter-spacing:0.06em; }
        .D4 .li .st.on { color:#c79a4c; }
      `), /*#__PURE__*/React.createElement("div", {
    className: "frame D4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "x"
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "ti"
  }, "goVLESS", /*#__PURE__*/React.createElement("small", null, "Mini App \xB7 Lite")), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "kicker"
  }, "Status \xB7 14 \u0434\u043D\u0435\u0439 \u0431\u0435\u0437 \u0441\u0431\u043E\u0435\u0432"), /*#__PURE__*/React.createElement("h1", {
    className: "h1"
  }, "VPN ", /*#__PURE__*/React.createElement("em", null, "\u0432\u043A\u043B\u044E\u0447\u0451\u043D"), "."), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "\u0422\u0443\u043D\u043D\u0435\u043B\u044C Reality \u0441\u0442\u0430\u0431\u0438\u043B\u0435\u043D. ", C.clientsActive, " \u043A\u043B\u0438\u0435\u043D\u0442\u0430 \u043E\u043D\u043B\u0430\u0439\u043D, \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430\u044F \u043A\u0432\u043E\u0442\u0430 \u2014 \u043E\u043A\u043E\u043B\u043E 80%.")), /*#__PURE__*/React.createElement("div", {
    className: "rule"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "\u041A\u043B\u0438\u0435\u043D\u0442\u044B"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "4", /*#__PURE__*/React.createElement("small", null, "/ 5"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "\u0422\u0440\u0430\u0444\u0438\u043A"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "218", /*#__PURE__*/React.createElement("small", null, "GB"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "\u0410\u043F\u0442\u0430\u0439\u043C"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "14", /*#__PURE__*/React.createElement("small", null, "\u0434\u043D\u0435\u0439"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "RPC"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "12", /*#__PURE__*/React.createElement("small", null, "ms")))), /*#__PURE__*/React.createElement("div", {
    className: "qa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "p"
  }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u0430"), /*#__PURE__*/React.createElement("button", null, "QR \xB7 \u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F"), /*#__PURE__*/React.createElement("button", null, "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u0443")), /*#__PURE__*/React.createElement("div", {
    className: "clients-h"
  }, /*#__PURE__*/React.createElement("h2", null, "\u041A\u043B\u0438\u0435\u043D\u0442\u044B"), /*#__PURE__*/React.createElement("a", null, "\u0412\u0441\u0435 \u2192")), /*#__PURE__*/React.createElement("div", null, C.clients.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "li",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "nu"
  }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, c.used, " \xB7 \u0434\u043E ", c.days)), /*#__PURE__*/React.createElement("div", {
    className: `st ${c.on ? 'on' : ''}`
  }, c.on ? 'on' : 'off')))))));
}

/* ─────────────────────────────────────────────────────────────
   D5 — Neon Cyber
   Dark blue, cyan/lime accents, restrained sci-fi.
   ───────────────────────────────────────────────────────────── */
function D5_NeonCyber() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .D5 { background:#070b14; color:#e5ecf5; font-family:"Space Grotesk", sans-serif; position:relative; }
        .D5::before { content:""; position:absolute; inset:0; background:
          radial-gradient(circle at 20% 0%, rgba(58,255,208,0.10), transparent 50%),
          radial-gradient(circle at 90% 90%, rgba(80,140,255,0.10), transparent 50%);
          pointer-events:none; }
        .D5 > * { position:relative; }
        .D5 .hd { display:flex; align-items:center; height:50px; padding:0 14px; gap:10px; border-bottom:1px solid #142035; flex:0 0 auto; }
        .D5 .x { color:#5a708a; font-size:18px; width:28px; }
        .D5 .ti { flex:1; text-align:center; font-size:14px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; }
        .D5 .ti small { display:block; font-family:"JetBrains Mono", monospace; font-size:10px; font-weight:500; color:#3affd0; margin-top:2px; letter-spacing:0.1em; }
        .D5 .m { color:#5a708a; font-size:18px; width:28px; text-align:right; letter-spacing:1px; }
        .D5 .body { flex:1; overflow:auto; padding:14px 14px 24px; display:flex; flex-direction:column; gap:12px; }
        .D5 .hero { border:1px solid #142035; border-radius:14px; background:linear-gradient(160deg, rgba(20,32,53,0.7), rgba(7,11,20,0.2)); padding:16px; position:relative; overflow:hidden; }
        .D5 .hero .glow { position:absolute; right:-30px; top:-30px; width:160px; height:160px; border-radius:50%; background:radial-gradient(circle, rgba(58,255,208,0.18), transparent 60%); pointer-events:none; }
        .D5 .pill { display:inline-flex; align-items:center; gap:7px; padding:4px 10px; border:1px solid #3affd0; border-radius:4px; color:#3affd0; font-family:"JetBrains Mono", monospace; font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; }
        .D5 .pill::before { content:""; width:5px; height:5px; border-radius:50%; background:#3affd0; box-shadow:0 0 8px #3affd0; }
        .D5 .h1 { font-size:24px; font-weight:600; letter-spacing:-0.4px; margin:14px 0 4px; }
        .D5 .h1 .v { color:#3affd0; }
        .D5 .sub { font-family:"JetBrains Mono", monospace; font-size:11px; color:#7d8aa3; letter-spacing:-0.2px; }
        .D5 .stats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1px; background:#142035; margin-top:14px; border:1px solid #142035; }
        .D5 .stats div { background:#0b1322; padding:10px 12px; }
        .D5 .stats .v { font-family:"JetBrains Mono", monospace; font-size:17px; font-weight:600; letter-spacing:-0.3px; }
        .D5 .stats .v.g { color:#3affd0; }
        .D5 .stats .l { font-size:10px; color:#7d8aa3; margin-top:2px; text-transform:uppercase; letter-spacing:0.08em; font-family:"JetBrains Mono", monospace; }
        .D5 .qa { display:grid; grid-template-columns:2fr 1fr 1fr; gap:8px; }
        .D5 .qa button { padding:14px 12px; font:inherit; font-size:13px; font-weight:600; cursor:pointer; border-radius:8px; text-align:left; line-height:1.1; display:flex; flex-direction:column; gap:4px; }
        .D5 .qa button.p { background:#3affd0; color:#070b14; border:0; }
        .D5 .qa button.s { background:transparent; border:1px solid #142035; color:#e5ecf5; text-align:center; align-items:center; }
        .D5 .qa button small { font-family:"JetBrains Mono", monospace; font-size:10px; font-weight:500; opacity:0.7; letter-spacing:0.04em; }
        .D5 .sec { display:flex; justify-content:space-between; align-items:baseline; padding:4px 4px 0; }
        .D5 .sec h2 { margin:0; font-family:"JetBrains Mono", monospace; font-size:10px; color:#7d8aa3; text-transform:uppercase; letter-spacing:0.12em; }
        .D5 .sec a { font-size:12px; color:#3affd0; font-weight:600; }
        .D5 .list { border:1px solid #142035; border-radius:10px; }
        .D5 .li { display:flex; align-items:center; gap:12px; padding:11px 14px; }
        .D5 .li + .li { border-top:1px solid #142035; }
        .D5 .id { font-family:"JetBrains Mono", monospace; font-size:10px; color:#3affd0; width:24px; letter-spacing:0.04em; }
        .D5 .nm { flex:1; }
        .D5 .nm .n { font-size:14px; font-weight:600; }
        .D5 .nm .s { font-family:"JetBrains Mono", monospace; font-size:10.5px; color:#7d8aa3; margin-top:1px; }
        .D5 .led { width:8px; height:8px; border-radius:50%; }
        .D5 .led.on { background:#3affd0; box-shadow:0 0 8px #3affd0; }
        .D5 .led.off { background:#142035; }
      `), /*#__PURE__*/React.createElement("div", {
    className: "frame D5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "x"
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "ti"
  }, "goVLESS", /*#__PURE__*/React.createElement("small", null, "node \xB7 fra-04")), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "pill"
  }, "\u25CF Online \xB7 Lite"), /*#__PURE__*/React.createElement("h1", {
    className: "h1"
  }, "VPN ", /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, "activ\u0435"), "."), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "reality \xB7 cf-tunnel \xB7 14d 06:22"), /*#__PURE__*/React.createElement("div", {
    className: "stats"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "v g"
  }, "4/5"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "clients")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "218.4", /*#__PURE__*/React.createElement("small", {
    style: {
      fontSize: 10,
      opacity: 0.6,
      marginLeft: 3
    }
  }, "GB")), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "month")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "21%"), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "of cap")))), /*#__PURE__*/React.createElement("div", {
    className: "qa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "p"
  }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u0430", /*#__PURE__*/React.createElement("small", null, "SCAN \xB7 DEEP-LINK")), /*#__PURE__*/React.createElement("button", {
    className: "s"
  }, "QR", /*#__PURE__*/React.createElement("small", null, "SHARE")), /*#__PURE__*/React.createElement("button", {
    className: "s"
  }, "SUB", /*#__PURE__*/React.createElement("small", null, "COPY"))), /*#__PURE__*/React.createElement("div", {
    className: "sec"
  }, /*#__PURE__*/React.createElement("h2", null, "// active clients"), /*#__PURE__*/React.createElement("a", null, "view all \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "list"
  }, C.clients.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "li",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "id"
  }, "[", String(i + 1).padStart(2, '0'), "]"), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, c.used, " \xB7 exp ", c.days)), /*#__PURE__*/React.createElement("div", {
    className: `led ${c.on ? 'on' : 'off'}`
  })))))));
}

/* ─────────────────────────────────────────────────────────────
   D6 — Brutalist Dark
   Pitch black, white outlines, massive Space Grotesk display.
   ───────────────────────────────────────────────────────────── */
function D6_BrutalistDark() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .D6 { background:#000; color:#fff; font-family:"Space Grotesk", sans-serif; }
        .D6 .hd { display:flex; height:48px; align-items:center; padding:0 14px; gap:8px; border-bottom:2px solid #fff; }
        .D6 .x { font-size:20px; font-weight:700; }
        .D6 .ti { flex:1; text-align:center; font-size:13px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; }
        .D6 .m { font-size:18px; font-weight:700; letter-spacing:1px; }
        .D6 .body { flex:1; overflow:auto; }
        .D6 .hero { padding:18px 16px 22px; border-bottom:2px solid #fff; position:relative; }
        .D6 .stamp { display:inline-flex; align-items:center; gap:8px; border:2px solid #fff; padding:4px 10px 4px 8px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; }
        .D6 .stamp::before { content:""; width:8px; height:8px; border-radius:50%; background:#fff; }
        .D6 h1 { font-size:48px; font-weight:700; letter-spacing:-2px; line-height:0.92; margin:16px 0 6px; }
        .D6 h1 small { display:block; font-size:13px; font-weight:600; color:#aaa; letter-spacing:-0.2px; text-transform:none; margin-top:10px; font-family:"IBM Plex Mono", monospace; }
        .D6 .meta { display:flex; gap:0; border-top:2px solid #fff; border-bottom:2px solid #fff; }
        .D6 .meta div { flex:1; padding:12px 14px; border-right:2px solid #fff; }
        .D6 .meta div:last-child { border-right:0; }
        .D6 .meta .k { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#aaa; font-family:"IBM Plex Mono", monospace; }
        .D6 .meta .v { font-size:26px; font-weight:700; letter-spacing:-0.8px; line-height:1; margin-top:4px; font-variant-numeric:tabular-nums; }
        .D6 .qa { display:grid; grid-template-columns:2fr 1fr 1fr; border-bottom:2px solid #fff; }
        .D6 .qa button { padding:18px 14px; font:inherit; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:0.02em; border:0; border-right:2px solid #fff; background:#000; color:#fff; cursor:pointer; text-align:left; line-height:1.1; }
        .D6 .qa button:last-child { border-right:0; }
        .D6 .qa button.p { background:#fff; color:#000; }
        .D6 .qa button small { display:block; font-size:10px; font-weight:600; opacity:0.6; margin-top:3px; letter-spacing:0; text-transform:none; font-family:"IBM Plex Mono", monospace; }
        .D6 .sec { display:flex; justify-content:space-between; align-items:center; padding:14px 16px 4px; }
        .D6 .sec h2 { margin:0; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; }
        .D6 .sec a { font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; text-decoration:underline; text-underline-offset:3px; color:#fff; }
        .D6 .cli { display:flex; align-items:center; gap:12px; padding:14px 16px; border-top:2px solid #fff; }
        .D6 .cli .av { width:38px; height:38px; border:2px solid #fff; background:#000; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; }
        .D6 .cli .nm { flex:1; }
        .D6 .cli .nm .n { font-size:15px; font-weight:700; letter-spacing:-0.2px; }
        .D6 .cli .nm .s { font-size:11px; font-family:"IBM Plex Mono", monospace; color:#aaa; margin-top:2px; }
        .D6 .cli .st { font-size:11px; font-weight:700; padding:4px 8px; border:2px solid #fff; text-transform:uppercase; background:#000; color:#fff; }
        .D6 .cli .st.off { color:#aaa; border-color:#444; }
      `), /*#__PURE__*/React.createElement("div", {
    className: "frame D6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hd"
  }, /*#__PURE__*/React.createElement("div", {
    className: "x"
  }, "\u2715"), /*#__PURE__*/React.createElement("div", {
    className: "ti"
  }, C.appName), /*#__PURE__*/React.createElement("div", {
    className: "m"
  }, "\u22EF")), /*#__PURE__*/React.createElement("div", {
    className: "body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "stamp"
  }, "Protected"), /*#__PURE__*/React.createElement("h1", null, "VPN ON.", /*#__PURE__*/React.createElement("small", null, "Lite \xB7 Reality \xB7 CF tunnel \xB7 14d"))), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Clients"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "4/5")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "Month"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "218", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginLeft: 2
    }
  }, "GB"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "k"
  }, "RPC"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "12", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      marginLeft: 2
    }
  }, "ms")))), /*#__PURE__*/React.createElement("div", {
    className: "qa"
  }, /*#__PURE__*/React.createElement("button", {
    className: "p"
  }, "+ Add client", /*#__PURE__*/React.createElement("small", null, "scan \xB7 paste")), /*#__PURE__*/React.createElement("button", null, "QR", /*#__PURE__*/React.createElement("small", null, "share")), /*#__PURE__*/React.createElement("button", null, "Sub", /*#__PURE__*/React.createElement("small", null, "copy"))), /*#__PURE__*/React.createElement("div", {
    className: "sec"
  }, /*#__PURE__*/React.createElement("h2", null, "Clients"), /*#__PURE__*/React.createElement("a", null, "All \u2192")), C.clients.map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "cli",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "av"
  }, c.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    className: "nm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "n"
  }, c.name), /*#__PURE__*/React.createElement("div", {
    className: "s"
  }, c.used, " / exp ", c.days)), /*#__PURE__*/React.createElement("div", {
    className: `st ${c.on ? '' : 'off'}`
  }, c.on ? 'ON' : 'OFF'))))));
}
Object.assign(window, {
  D1_CarbonPro,
  D2_MidnightSlate,
  D3_Terminal,
  D4_DarkPaper,
  D5_NeonCyber,
  D6_BrutalistDark
});
