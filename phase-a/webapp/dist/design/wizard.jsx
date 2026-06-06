// wizard.jsx — Setup wizard W1..W5.
// One component, parameterized by `step: 1..5`.

const WIZ_T = {
  ru: {
    title: "Установка",
    stepX: (n) => `Шаг ${n} из 4`,
    back: "Назад",
    next: "Далее",
    install: "Установить",
    cancel: "Отмена",

    // W1
    w1Host: "Адрес сервера",
    w1HostPh: "198.51.100.42",
    w1Port: "Порт",
    w1User: "Пользователь",
    w1Auth: "Метод входа",
    w1Pass: "Пароль",
    w1Key: "SSH-ключ",
    w1KeyPh: "Вставь приватный ключ (PEM или OpenSSH)",
    w1Test: "Проверить соединение",
    w1Testing: "Проверяем…",
    w1Ok: "Подключено",
    w1Fail: "Не удалось войти",
    w1Retry: "Повторить",
    w1Hint: "Тебе понадобится root-доступ к VPS. Пароль или ключ сохраняется только на устройстве.",

    // W2
    w2Title: "Режим работы",
    w2Lite: "Lite",
    w2LiteSub: "Cloudflare Quick Tunnel",
    w2LiteCopy: "Бесплатно. Поднимается мгновенно. URL может ротироваться.",
    w2Pro: "Pro",
    w2ProSub: "Nginx + Let's Encrypt",
    w2ProCopy: "Стабильный URL, свой сертификат. Нужен домен и пара минут на DNS.",
    w2Domain: "Свой домен",
    w2DomainPh: "vpn.example.com",
    w2DomainHint: "Поддомен или домен, направленный A-записью на IP сервера",

    // W3
    w3Title: "Протокол",
    w3Transport: "Транспорт",
    w3Mask: "Маскирующий домен",
    w3MaskPh: "google.com",
    w3MaskDefault: "по умолчанию",
    w3Keys: "Reality-ключи",
    w3KeysAuto: "Сгенерировать автоматически",
    w3Private: "private",
    w3Public: "public",

    // W4
    w4Title: "Устанавливаем…",
    w4Hint: "Это займёт около 2-3 минут. Можно свернуть Telegram — мы продолжим в фоне.",
    w4Steps: [
      "Проверяем зависимости",
      "Скачиваем 3X-UI",
      "Настраиваем xray-core",
      "Генерируем Reality ключи",
      "Запускаем cloudflared-quick",
      "Создаём первый inbound",
      "Прогреваем туннель",
    ],
    w4Log: "Лог",
    w4Past: "Нельзя отменить — установка прошла точку невозврата",

    // W5
    w5Pill: "Готово",
    w5Title: "VPN установлен.",
    w5Sub: "Lite · Reality · Cloudflare tunnel",
    w5Create: "Создать клиента",
    w5Copy: "Скопировать подписку",
    w5QR: "QR",
    w5Next: "Что дальше?",
    w5N1: "Добавь себе клиент и подключи телефон",
    w5N2: "Раздай ссылки родным — можно по QR",
    w5N3: "Когда домен будет готов — переключи в Pro",
  },
  en: {
    title: "Setup",
    stepX: (n) => `Step ${n} of 4`,
    back: "Back",
    next: "Next",
    install: "Install",
    cancel: "Cancel",

    w1Host: "Server address",
    w1HostPh: "198.51.100.42",
    w1Port: "Port",
    w1User: "User",
    w1Auth: "Auth method",
    w1Pass: "Password",
    w1Key: "SSH key",
    w1KeyPh: "Paste your private key (PEM or OpenSSH)",
    w1Test: "Test connection",
    w1Testing: "Testing…",
    w1Ok: "Connected",
    w1Fail: "Login failed",
    w1Retry: "Retry",
    w1Hint: "Root access required. Password or key is kept only on this device.",

    w2Title: "Mode",
    w2Lite: "Lite",
    w2LiteSub: "Cloudflare Quick Tunnel",
    w2LiteCopy: "Free. Up instantly. The URL may rotate.",
    w2Pro: "Pro",
    w2ProSub: "Nginx + Let's Encrypt",
    w2ProCopy: "Stable URL, your own cert. Needs a domain and a few DNS minutes.",
    w2Domain: "Your domain",
    w2DomainPh: "vpn.example.com",
    w2DomainHint: "Subdomain or domain A-pointed at the server IP",

    w3Title: "Protocol",
    w3Transport: "Transport",
    w3Mask: "Masking domain",
    w3MaskPh: "google.com",
    w3MaskDefault: "default",
    w3Keys: "Reality keys",
    w3KeysAuto: "Generate automatically",
    w3Private: "private",
    w3Public: "public",

    w4Title: "Installing…",
    w4Hint: "Takes 2-3 min. You can minimise Telegram — we continue in the background.",
    w4Steps: [
      "Checking dependencies",
      "Downloading 3X-UI",
      "Configuring xray-core",
      "Generating Reality keys",
      "Starting cloudflared-quick",
      "Creating first inbound",
      "Warming up the tunnel",
    ],
    w4Log: "Log",
    w4Past: "Can't cancel — past the point of no return",

    w5Pill: "Done",
    w5Title: "VPN is up.",
    w5Sub: "Lite · Reality · Cloudflare tunnel",
    w5Create: "Create client",
    w5Copy: "Copy subscription",
    w5QR: "QR",
    w5Next: "What's next?",
    w5N1: "Add a client and connect your phone",
    w5N2: "Share links with family — by QR if you want",
    w5N3: "When you have a domain, switch to Pro",
  },
};

// Reusable wizard chrome
function WizFrame({ T, L, step, title, sub, children, footer }) {
  const progressPct = step <= 4 ? Math.round((step / 4) * 100) : 100;
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <div style={{
        position: "relative",
        display:"flex", alignItems:"center", height:50, padding:"0 14px", gap:10,
        flex:"0 0 auto", background: T.chromeBg, borderBottom:`1px solid ${T.hair}`,
      }}>
        <div style={{ width:28, color: T.ink3 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 3.5L6 9l5.5 5.5"/></svg>
        </div>
        <div style={{ flex:1, textAlign:"center", fontSize:14.5, fontWeight:600, lineHeight:1.15 }}>
          {title}
          <small style={{ display:"block", fontSize:11, fontWeight:500, color: T.ink3, marginTop:1 }}>{sub}</small>
        </div>
        <div style={{ width:28, color: T.ink3, textAlign:"right", fontSize:18, letterSpacing:1 }}>⋯</div>
        {step <= 4 && (
          <div className="m-progress" style={{
            position:"absolute", left:0, right:0, bottom:-1, height:2,
            background:"rgba(255,255,255,0.06)",
          }}>
            <div style={{ width: `${progressPct}%`, height:"100%", background: T.accent }}/>
          </div>
        )}
      </div>
      <div style={{ flex:1, overflow:"auto", padding: "16px 16px 16px" }}>
        {children}
      </div>
      {footer}
    </div>
  );
}

function WizFooter({ T, primaryLabel, primaryDisabled, secondaryLabel = "", danger }) {
  return (
    <div style={{
      flex:"0 0 auto", padding:"10px 14px 14px",
      borderTop:`1px solid ${T.hair}`, background: T.chromeBg,
      display:"flex", gap: 10,
    }}>
      {secondaryLabel && <button style={btnGhost(T)}>{secondaryLabel}</button>}
      <button className="m-press" style={
        danger ? btnDanger(T)
        : primaryDisabled ? btnPrimary(T, { disabled: true })
        : btnPrimary(T)
      }>
        {primaryLabel} {!primaryDisabled && !danger ? "→" : ""}
      </button>
    </div>
  );
}

function FieldLabel({ T, children }) {
  return <label style={{ display:"block", fontSize: 12, color: T.ink3, fontWeight: 600, marginBottom: 6 }}>{children}</label>;
}

function TxtInput({ T, mono, ...rest }) {
  return <input style={{
    width: "100%", height: 44, padding: "0 14px",
    background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 10,
    color: T.ink, font: "inherit", fontSize: 14,
    fontFamily: mono ? T.mono : "inherit",
    outline: "none",
    transition: "border-color var(--m-fast) var(--m-tight)",
  }} {...rest}/>;
}

// ─── W1 · Connect to VPS ────────────────────────────────────────────
function W1Connect({ theme = "D2", lang = "ru", state = "ok" }) {
  const T = getTokens(theme);
  const L = WIZ_T[lang];

  const probeChip = state === "probing" ? (
    <span style={{
      display:"inline-flex", alignItems:"center", gap: 6,
      padding: "4px 10px", borderRadius: 11,
      background: T.warnSoft, color: T.warn, fontSize: 11, fontWeight: 700,
    }}>
      <span className="m-breath" style={{ width: 6, height: 6, borderRadius: "50%", background: T.warn }}/>
      {L.w1Testing}
    </span>
  ) : state === "ok" ? (
    <span style={{
      display:"inline-flex", alignItems:"center", gap: 6,
      padding: "4px 10px", borderRadius: 11,
      background: T.accentSoft, color: T.accent2, fontSize: 11, fontWeight: 700,
    }}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7.5L5.5 10l5.5-6"/></svg>
      {L.w1Ok}
    </span>
  ) : state === "fail" ? (
    <span style={{
      display:"inline-flex", alignItems:"center", gap: 6,
      padding: "4px 10px", borderRadius: 11,
      background: T.dangerSoft, color: T.danger, fontSize: 11, fontWeight: 700,
    }}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5.5"/><path d="M5 5l4 4M9 5l-4 4"/></svg>
      {L.w1Fail}
    </span>
  ) : null;

  return (
    <WizFrame T={T} L={L} step={1} title={L.title} sub={L.stepX(1)}
      footer={<WizFooter T={T} primaryLabel={L.next} primaryDisabled={state !== "ok"} secondaryLabel={L.back}/>}
    >
      <div style={{ marginBottom: 14 }}>
        <FieldLabel T={T}>{L.w1Host}</FieldLabel>
        <TxtInput T={T} mono defaultValue="198.51.100.42" placeholder={L.w1HostPh}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <FieldLabel T={T}>{L.w1Port}</FieldLabel>
          <TxtInput T={T} mono defaultValue="22"/>
        </div>
        <div>
          <FieldLabel T={T}>{L.w1User}</FieldLabel>
          <TxtInput T={T} mono defaultValue="root"/>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel T={T}>{L.w1Auth}</FieldLabel>
        <div style={{
          display:"flex", padding: 3, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 10, marginBottom: 10,
        }}>
          <div style={{
            flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer", color: T.ink3,
          }}>{L.w1Pass}</div>
          <div style={{
            flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: T.bg, color: T.ink,
          }}>{L.w1Key}</div>
        </div>
        <textarea placeholder={L.w1KeyPh} rows={3} style={{
          width: "100%", padding: "10px 12px",
          background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 10,
          color: T.ink, font: "inherit", fontSize: 11.5, fontFamily: T.mono,
          outline: "none", resize: "vertical",
        }} defaultValue="-----BEGIN OPENSSH PRIVATE KEY-----&#10;b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAA…"/>
      </div>

      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom: 8 }}>
        <button className="m-press" style={{
          height: 36, padding: "0 14px", borderRadius: 8,
          background: T.card, border: `1px solid ${T.border}`, color: T.ink,
          fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>{L.w1Test}</button>
        {probeChip}
      </div>

      <div style={{ fontSize: 11.5, color: T.ink3, lineHeight: 1.45, marginTop: 4 }}>
        {L.w1Hint}
      </div>
    </WizFrame>
  );
}

// ─── W2 · Mode pick + (optional) domain ─────────────────────────────
function W2Mode({ theme = "D2", lang = "ru", mode = "lite" }) {
  const T = getTokens(theme);
  const L = WIZ_T[lang];

  const Tile = ({ id, head, label, copy, selected, bullets }) => (
    <div className="m-rise" style={{
      background: T.card,
      border: `1px solid ${selected ? T.accent : T.hair}`,
      borderRadius: 16, padding: "16px 14px 14px",
      marginBottom: 10, position: "relative",
      boxShadow: selected ? `0 0 0 1px ${T.accent}` : "none",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 4 }}>
        <span style={{
          fontFamily: T.mono, fontSize: 10, fontWeight: 700,
          padding: "2px 7px", borderRadius: 4,
          background: selected ? T.accent : T.card2,
          color: selected ? T.primaryInk : T.ink3, letterSpacing: "0.06em",
        }}>{head}</span>
        <div style={{ flex:1, fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>{label}</div>
        {selected && (
          <div style={{
            width: 22, height: 22, borderRadius: 11, background: T.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={T.primaryInk} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5L5 9l4.5-5.5"/></svg>
          </div>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: T.ink3, lineHeight: 1.45, marginBottom: 8 }}>{copy}</div>
      <ul style={{
        margin: 0, paddingLeft: 18, fontSize: 12, color: T.ink2, lineHeight: 1.5,
      }}>
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );

  return (
    <WizFrame T={T} L={L} step={2} title={L.title} sub={L.stepX(2)}
      footer={<WizFooter T={T} primaryLabel={L.next} secondaryLabel={L.back}/>}
    >
      <Tile id="lite" head="LITE" label={L.w2Lite + " · " + L.w2LiteSub} copy={L.w2LiteCopy}
        selected={mode === "lite"}
        bullets={lang==="ru"
          ? ["домен не нужен", "URL появится сразу", "может ротироваться"]
          : ["no domain", "instant URL", "may rotate"]}/>
      <Tile id="pro" head="PRO" label={L.w2Pro + " · " + L.w2ProSub} copy={L.w2ProCopy}
        selected={mode === "pro"}
        bullets={lang==="ru"
          ? ["свой домен и cert", "стабильный URL", "быстрее"]
          : ["your domain & cert", "stable URL", "faster"]}/>

      {mode === "pro" && (
        <div style={{ marginTop: 4 }}>
          <FieldLabel T={T}>{L.w2Domain}</FieldLabel>
          <TxtInput T={T} mono placeholder={L.w2DomainPh} defaultValue="vpn.example.com"/>
          <div style={{ fontSize: 11, color: T.ink3, marginTop: 6 }}>{L.w2DomainHint}</div>
        </div>
      )}
    </WizFrame>
  );
}

// ─── W3 · Protocol details ──────────────────────────────────────────
function W3Protocol({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = WIZ_T[lang];

  return (
    <WizFrame T={T} L={L} step={3} title={L.title} sub={L.stepX(3)}
      footer={<WizFooter T={T} primaryLabel={L.install} secondaryLabel={L.back}/>}
    >
      <div style={{ marginBottom: 14 }}>
        <FieldLabel T={T}>{L.w3Transport}</FieldLabel>
        <div style={{
          display:"flex", padding: 3, background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 10,
        }}>
          {["TCP", "XHTTP", "gRPC"].map((t, i) => (
            <div key={t} style={{
              flex: 1, padding: "8px 0", textAlign: "center", borderRadius: 7,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: i === 0 ? T.bg : "transparent",
              color: i === 0 ? T.ink : T.ink3,
            }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <FieldLabel T={T}>{L.w3Mask}</FieldLabel>
        <TxtInput T={T} mono defaultValue="google.com" placeholder={L.w3MaskPh}/>
        <div style={{ fontSize: 11, color: T.ink3, marginTop: 6 }}>
          {lang==="ru"
            ? "Этот домен будет виден провайдеру вместо реального трафика."
            : "This domain is what your ISP sees instead of real traffic."}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
          <FieldLabel T={T}>{L.w3Keys}</FieldLabel>
          <span style={{ fontSize: 11.5, color: T.accent, fontWeight: 600 }}>{L.w3KeysAuto} ✓</span>
        </div>
        <div style={{
          background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: "10px 12px", display:"flex", flexDirection:"column", gap: 6,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
            <span style={{
              fontFamily: T.mono, fontSize: 10, color: T.ink3,
              textTransform: "uppercase", letterSpacing: "0.06em", width: 50,
            }}>{L.w3Private}</span>
            <span style={{
              flex:1, fontFamily: T.mono, fontSize: 11, color: T.ink, letterSpacing: 1,
            }}>•••••••••••••••••••••</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.ink3} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 7C2.7 4.5 4.7 3 7 3s4.3 1.5 5.5 4C11.3 9.5 9.3 11 7 11S2.7 9.5 1.5 7z"/><circle cx="7" cy="7" r="1.5"/></svg>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
            <span style={{
              fontFamily: T.mono, fontSize: 10, color: T.ink3,
              textTransform: "uppercase", letterSpacing: "0.06em", width: 50,
            }}>{L.w3Public}</span>
            <span style={{
              flex:1, fontFamily: T.mono, fontSize: 11, color: T.ink, wordBreak: "break-all",
            }}>mZ_Yx9D4kFnW2qS3aT4u5V6w7X8Y9Z0a1b2c3d4=</span>
          </div>
        </div>
      </div>
    </WizFrame>
  );
}

// ─── W4 · Installing ────────────────────────────────────────────────
function W4Install({ theme = "D2", lang = "ru", currentStep = 3 }) {
  const T = getTokens(theme);
  const L = WIZ_T[lang];
  const stepsList = L.w4Steps;

  return (
    <WizFrame T={T} L={L} step={4} title={L.title} sub={L.stepX(4)}
      footer={
        <div style={{
          flex:"0 0 auto", padding:"10px 14px 14px",
          borderTop:`1px solid ${T.hair}`, background: T.chromeBg,
        }}>
          <button className="m-press" style={{
            width: "100%", height: 46, borderRadius: 10,
            background: T.card2, color: T.ink3,
            border: `1px solid ${T.border}`,
            fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "not-allowed", opacity: 0.7,
          }}>{L.w4Past}</button>
        </div>
      }
    >
      {/* Hero: status + current step */}
      <div className="m-rise" style={{
        background: T.card, border: `1px solid ${T.hair}`, borderRadius: 16,
        padding: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: T.accentSoft, color: T.accent,
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink: 0,
        }}>
          <span className="m-breath" style={{
            width: 14, height: 14, borderRadius: "50%", background: T.accent,
            boxShadow: T.isDark ? `0 0 12px ${T.accent}` : "none",
          }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: T.ink3, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {Math.round((currentStep + 1) / stepsList.length * 100)}%
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px", marginTop: 2 }}>
            {stepsList[currentStep]}…
          </div>
          <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 4 }}>{L.w4Hint}</div>
        </div>
      </div>

      {/* Step list */}
      <div style={{
        background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
        overflow: "hidden", marginBottom: 12,
      }}>
        {stepsList.map((s, i) => {
          const status = i < currentStep ? "ok" : i === currentStep ? "now" : "queued";
          return (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap: 12, padding: "10px 14px",
              borderBottom: i < stepsList.length - 1 ? `1px solid ${T.hair}` : "none",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: status === "ok" ? T.accent : status === "now" ? T.accentSoft : T.card2,
                color: status === "ok" ? T.primaryInk : status === "now" ? T.accent : T.ink3,
                border: status === "queued" ? `1px solid ${T.border}` : "none",
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0,
              }}>
                {status === "ok" ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5L5 9l4.5-5.5"/></svg>
                ) : status === "now" ? (
                  <span className="m-breath" style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }}/>
                ) : (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.ink3 }}/>
                )}
              </div>
              <div style={{
                flex: 1, fontSize: 13, fontWeight: status === "now" ? 600 : 500,
                color: status === "queued" ? T.ink3 : T.ink,
              }}>{s}</div>
              {status === "ok" && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3 }}>0.6s</span>}
            </div>
          );
        })}
      </div>

      {/* Log */}
      <details style={{
        background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden",
      }}>
        <summary style={{
          listStyle: "none", cursor: "pointer",
          padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: T.ink2,
          display:"flex", alignItems:"center", gap: 8,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M5 4l4 3-4 3"/></svg>
          {L.w4Log}
        </summary>
        <div style={{
          padding: "0 12px 10px",
          fontFamily: T.mono, fontSize: 10, color: T.ink3, lineHeight: 1.5,
          maxHeight: 100, overflow: "auto",
        }}>
{`[14:02:51] apt-get update… 0.4s
[14:02:52] install xray-core v25.10.4… ok
[14:02:54] xray binary verified · sha256:e9f4b1c8…
[14:02:55] writing /etc/xray/config.json
[14:02:55] cloudflared 2025.10.4 already present
[14:02:56] generating reality keys…`}
        </div>
      </details>
    </WizFrame>
  );
}

// ─── W5 · Done ──────────────────────────────────────────────────────
function W5Done({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = WIZ_T[lang];

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <div style={{
        display:"flex", alignItems:"center", height:50, padding:"0 14px", gap:10,
        flex:"0 0 auto", background: T.chromeBg, borderBottom:`1px solid ${T.hair}`,
      }}>
        <div style={{ width:28, color: T.ink3, fontSize: 18, fontWeight: 300 }}>✕</div>
        <div style={{ flex:1, textAlign:"center", fontSize:14.5, fontWeight:600 }}>goVLESS</div>
        <div style={{ width:28 }}/>
      </div>

      <div style={{ flex:1, overflow:"auto", padding: "20px 16px 24px" }}>
        {/* Hero */}
        <div className="m-rise" style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 20,
          padding: "22px 18px 20px", marginBottom: 14, position: "relative", overflow: "hidden",
        }}>
          <span style={{
            display:"inline-flex", alignItems:"center", gap: 6,
            padding: "4px 10px 5px", borderRadius: 12,
            background: T.accentSoft, color: T.isDark ? T.accent2 : T.accent2,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.02em",
          }}>
            <span className="m-halo" style={{
              width: 6, height: 6, borderRadius: "50%", background: T.accent, color: T.accent,
              boxShadow: T.isDark ? `0 0 5px ${T.accent}` : "none",
            }}/>
            {L.w5Pill}
          </span>
          <div style={{
            fontSize: 26, fontWeight: 700, letterSpacing: "-0.5px",
            marginTop: 12, lineHeight: 1.1,
          }}>{L.w5Title}</div>
          <div style={{ fontSize: 13, color: T.ink3, marginTop: 6 }}>{L.w5Sub}</div>
          <div style={{ fontFamily: T.mono, fontSize: 11.5, color: T.ink2, marginTop: 10 }}>
            sha256:e9f4b1c8a2…
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display:"grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
          <button className="m-press m-shine" style={{
            padding: "14px 8px 13px", borderRadius: 14, border: "none",
            background: T.accent, color: T.primaryInk,
            fontFamily: "inherit", fontSize: 11.5, fontWeight: 600,
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            boxShadow: T.isDark ? "0 4px 12px rgba(110,224,166,0.25)" : "0 4px 12px rgba(62,140,94,0.25)",
            position: "relative", overflow: "hidden",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="9" cy="8" r="3"/><path d="M3 19c1-3 3.5-4.5 6-4.5s5 1.5 6 4.5M15 4v6M18 7h-6"/></svg>
            {L.w5Create}
          </button>
          <button className="m-press" style={{
            padding: "14px 8px 13px", borderRadius: 14,
            background: T.card, color: T.ink, border: `1px solid ${T.border}`,
            fontFamily: "inherit", fontSize: 11.5, fontWeight: 600,
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13l4-4M6.5 9.5L8 8a4 4 0 0 1 5.7 5.7L12 15M11.5 14.5L10 16a4 4 0 0 1-5.7-5.7L6 8.5"/></svg>
            {L.w5Copy}
          </button>
          <button className="m-press" style={{
            padding: "14px 8px 13px", borderRadius: 14,
            background: T.card, color: T.ink, border: `1px solid ${T.border}`,
            fontFamily: "inherit", fontSize: 11.5, fontWeight: 600,
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M19 17v4M14 21h3" strokeLinecap="round"/></svg>
            {L.w5QR}
          </button>
        </div>

        {/* What's next */}
        <div style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
          padding: "14px 16px",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.ink3,
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12,
          }}>{L.w5Next}</div>
          {[L.w5N1, L.w5N2, L.w5N3].map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "8px 0",
              borderTop: i > 0 ? `1px solid ${T.hair}` : "none",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: T.card2, color: T.accent,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink: 0,
                fontFamily: T.mono, fontSize: 11, fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.45, flex: 1 }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { W1Connect, W2Mode, W3Protocol, W4Install, W5Done });
