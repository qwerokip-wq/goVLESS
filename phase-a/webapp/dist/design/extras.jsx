// admins.jsx · inbounds.jsx · settings-about.jsx · backup.jsx
// Batched into one delivery (lighter screens, share chrome).

// ════════ ADMINS · A1 ════════════════════════════════════════════════
const ADM_T = {
  ru: {
    title: "Админы", sub: "Кто управляет ботом",
    current: "Текущие",
    invite: "Пригласить",
    invitePh: "Telegram id или @username",
    inviteBtn: "Отправить приглашение",
    inviteHint: "Пользователь станет админом после первого /start с этого аккаунта.",
    you: "вы",
    remove: "Убрать",
  },
  en: {
    title: "Admins", sub: "Who manages the bot",
    current: "Current",
    invite: "Invite",
    invitePh: "Telegram id or @username",
    inviteBtn: "Send invitation",
    inviteHint: "The user becomes admin after their first /start.",
    you: "you",
    remove: "Remove",
  },
};

function Admins({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = ADM_T[lang];
  const admins = [
    { id: 384929111, name: "@antenka",     me: true },
    { id: 712348822, name: "@sergey_m",    me: false },
    { id: 198477312, name: "anna.frolova", me: false },
  ];

  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.title} sub={L.sub}/>
      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>
        {/* Current admins */}
        <div className="m-enter" style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
          padding: "8px 0", marginBottom: 14, overflow:"hidden",
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.ink3,
            letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "6px 14px 8px", borderBottom: `1px solid ${T.hair}`,
          }}>{L.current}</div>
          {admins.map((a, i) => (
            <div key={a.id} style={{
              display:"flex", alignItems:"center", gap: 12, padding: "12px 14px",
              borderTop: i > 0 ? `1px solid ${T.hair}` : "none",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: T.avatarRadius,
                background: `oklch(0.55 0.10 ${200 + i * 30})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color: "#fff", fontSize: 12, fontWeight: 700,
              }}>{a.name.replace("@","").slice(0,2).toUpperCase()}</div>
              <div style={{ flex:1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {a.name}{a.me && <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 700, padding: "2px 6px",
                    borderRadius: 4, background: T.accentSoft, color: T.accent2,
                    letterSpacing: "0.04em", textTransform: "uppercase",
                  }}>{L.you}</span>}
                </div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, marginTop: 2 }}>id {a.id}</div>
              </div>
              {!a.me && (
                <button className="m-press" style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "transparent", color: T.danger,
                  border: `1px solid ${T.danger}40`, cursor: "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 5h7M6 5V3.5h2V5M5 5l.7 6.5h3.6L10 5"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Invite */}
        <div className="m-enter m-stagger-3" style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
          padding: 14,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.ink3,
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10,
          }}>{L.invite}</div>
          <div style={{ display:"flex", gap: 8 }}>
            <input placeholder={L.invitePh} style={{
              flex: 1, height: 44, padding: "0 14px",
              background: T.card2, border: `1.5px solid ${T.border}`, borderRadius: 10,
              color: T.ink, fontFamily: T.mono, fontSize: 13, outline: "none",
            }}/>
            <button className="m-press" style={{
              padding: "0 16px", height: 44, borderRadius: 10,
              background: T.accent, color: T.primaryInk, border: "none",
              fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor:"pointer",
            }}>+</button>
          </div>
          <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 8, lineHeight: 1.45 }}>
            {L.inviteHint}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════ INBOUNDS · I1 list / I2 detail / I3 add ════════════════════
const INB_T = {
  ru: {
    title: "Inbounds", sub: (n) => `${n} активных`,
    proto: "Протокол", net: "Транспорт", sec: "Безопасность", cli: "Клиентов",
    enable: "Включить", disable: "Выключить",
    detailTitle: "Inbound",
    keys: "Reality keys",
    addBtn: "Добавить inbound",
    addTitle: "Новый inbound",
    addMask: "Маскирующий домен",
    addAuto: "Авто-генерация ключей",
    create: "Создать",
    cancel: "Отмена",
  },
  en: {
    title: "Inbounds", sub: (n) => `${n} active`,
    proto: "Protocol", net: "Transport", sec: "Security", cli: "Clients",
    enable: "Enable", disable: "Disable",
    detailTitle: "Inbound",
    keys: "Reality keys",
    addBtn: "Add inbound",
    addTitle: "New inbound",
    addMask: "Masking domain",
    addAuto: "Auto-generate keys",
    create: "Create",
    cancel: "Cancel",
  },
};

function InboundsList({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = INB_T[lang];
  const inbs = [
    { n: 1, port: 443, proto: "vless", net: "tcp",   sec: "reality", clients: 4, on: true  },
    { n: 2, port: 8443, proto: "vless", net: "xhttp", sec: "reality", clients: 1, on: true  },
    { n: 3, port: 2053, proto: "vless", net: "grpc",  sec: "reality", clients: 0, on: false },
  ];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.title} sub={L.sub(2)}/>
      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 80px", position:"relative" }}>
        {inbs.map((b, i) => (
          <div key={b.n} className={`m-enter m-stagger-${i}`} style={{
            background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
            padding: 14, marginBottom: 10,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.2px" }}>
                Inbound #{b.n}
                <span style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3, marginLeft: 8, fontWeight: 500 }}>:{b.port}</span>
              </div>
              <div style={{ flex: 1 }}/>
              <span style={{
                display:"inline-flex", alignItems:"center", gap: 5,
                padding: "2px 8px 3px", borderRadius: 10,
                background: b.on ? T.accentSoft : T.card2,
                color: b.on ? (T.isDark ? T.accent2 : T.accent2) : T.ink3,
                fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: b.on ? T.accent : T.switchOff }}/>
                {b.on ? "on" : "off"}
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: "6px 12px", marginBottom: 10 }}>
              <KV T={T} k={L.proto} v={b.proto}/>
              <KV T={T} k={L.net}   v={b.net}/>
              <KV T={T} k={L.sec}   v={b.sec}/>
              <KV T={T} k={L.cli}   v={b.clients}/>
            </div>
            <button className="m-press" style={{
              width:"100%", height: 38, borderRadius: 8,
              background: b.on ? T.warnSoft : T.accentSoft,
              color: b.on ? T.warn : (T.isDark ? T.accent2 : T.accent2),
              border: `1px solid ${b.on ? T.warn + "40" : T.accent + "40"}`,
              fontFamily:"inherit", fontSize: 12.5, fontWeight: 600, cursor:"pointer",
            }}>{b.on ? L.disable : L.enable}</button>
          </div>
        ))}
        <button className="m-press" style={{
          position: "absolute", right: 18, bottom: 22,
          height: 44, padding: "0 18px", borderRadius: 22,
          background: T.accent, color: T.primaryInk, border: "none",
          fontFamily: "inherit", fontSize: 14, fontWeight: 700,
          cursor: "pointer", display:"flex", alignItems:"center", gap: 8,
          boxShadow: T.isDark ? "0 8px 24px rgba(110,224,166,0.30)" : "0 8px 24px rgba(62,140,94,0.25)",
        }}>+ {L.addBtn}</button>
      </div>
    </div>
  );
}

function KV({ T, k, v }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: T.ink3, fontWeight: 600, letterSpacing: "0.04em", textTransform:"uppercase" }}>{k}</div>
      <div style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 600, color: T.ink, fontVariantNumeric: "tabular-nums" }}>{v}</div>
    </div>
  );
}

function InboundDetail({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = INB_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={`${L.detailTitle} #1`} sub=":443 · reality"/>
      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>
        <SimpleCard T={T} title="Inbound" className="m-enter">
          <KvRow T={T} k={L.proto} v="vless"/>
          <KvRow T={T} k={L.net} v="tcp"/>
          <KvRow T={T} k={L.sec} v="reality"/>
          <KvRow T={T} k={lang==="ru"?"маска":"sni"} v="google.com" mono/>
          <KvRow T={T} k={L.cli} v="4"/>
        </SimpleCard>

        <SimpleCard T={T} title={L.keys} className="m-enter m-stagger-1">
          <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"6px 0" }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, textTransform: "uppercase", letterSpacing:"0.06em", width: 50 }}>private</span>
            <span style={{ flex:1, fontFamily: T.mono, fontSize: 11, color: T.ink, letterSpacing: 1 }}>•••••••••••••••••••</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.ink3} strokeWidth="1.6" strokeLinecap="round"><path d="M1.5 7C2.7 4.5 4.7 3 7 3s4.3 1.5 5.5 4C11.3 9.5 9.3 11 7 11S2.7 9.5 1.5 7z"/><circle cx="7" cy="7" r="1.5"/></svg>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap: 10, padding:"6px 0", borderTop: `1px dashed ${T.border}` }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, textTransform: "uppercase", letterSpacing:"0.06em", width: 50 }}>public</span>
            <span style={{ flex:1, fontFamily: T.mono, fontSize: 11, color: T.ink, wordBreak: "break-all" }}>mZ_Yx9D4kFnW2qS3aT4u5V6w7X8Y9Z0a…</span>
          </div>
        </SimpleCard>

        <SimpleCard T={T} title={lang==="ru"?"Действия":"Actions"}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: 6 }}>
            <button className="m-press" style={{
              height: 42, borderRadius: 10,
              background: T.warnSoft, color: T.warn, border: `1px solid ${T.warn}40`,
              fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{L.disable}</button>
            <button className="m-press" style={{
              height: 42, borderRadius: 10,
              background: T.dangerSoft, color: T.danger, border: `1px solid ${T.danger}40`,
              fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{lang==="ru"?"Удалить":"Delete"}</button>
          </div>
        </SimpleCard>
      </div>
    </div>
  );
}

function SimpleCard({ T, title, children, className }) {
  return (
    <div className={"m-enter " + (className || "")} style={{
      background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14,
      padding: 14, marginBottom: 12,
    }}>
      {title && (
        <div style={{
          fontSize: 11, fontWeight: 700, color: T.ink3,
          letterSpacing: "0.06em", textTransform: "uppercase",
          marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${T.hair}`,
        }}>{title}</div>
      )}
      {children}
    </div>
  );
}

function KvRow({ T, k, v, mono }) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding: "6px 0", fontSize: 13,
    }}>
      <span style={{ color: T.ink3 }}>{k}</span>
      <span style={{
        color: T.ink, fontWeight: 500,
        fontFamily: mono ? T.mono : "inherit",
        fontVariantNumeric: "tabular-nums",
      }}>{v}</span>
    </div>
  );
}

// ════════ SETTINGS · ST1 About · ST2 Notifications ═══════════════════
const ABOUT_T = {
  ru: {
    title: "О приложении", sub: "v 0.9.4-rc1",
    notifTitle: "Уведомления", notifSub: "Что приходит в чат",
    n1: "URL туннеля изменился",
    n2: "Добавлен клиент",
    n3: "Достигнут лимит трафика",
    n4: "Переключён режим",
    n5: "Перезапуск демона",
    n6: "Резервная копия создана",
    aboutBuild: "Сборка",
    aboutGh: "Исходники на GitHub",
    aboutLic: "Лицензия GPL-3.0",
    aboutContact: "Связаться с автором",
    aboutReread: "Перечитать условия",
  },
  en: {
    title: "About", sub: "v 0.9.4-rc1",
    notifTitle: "Notifications", notifSub: "What lands in the chat",
    n1: "Tunnel URL changed",
    n2: "Client added",
    n3: "Traffic cap reached",
    n4: "Mode switched",
    n5: "Daemon restarted",
    n6: "Backup created",
    aboutBuild: "Build",
    aboutGh: "Source on GitHub",
    aboutLic: "License GPL-3.0",
    aboutContact: "Contact author",
    aboutReread: "Re-read terms",
  },
};

function About({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = ABOUT_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.title} sub={L.sub}/>
      <div style={{ flex:1, overflow:"auto", padding: "20px 14px 24px" }}>
        {/* Hero logo */}
        <div className="m-rise" style={{ textAlign:"center", marginBottom: 24 }}>
          <div className="m-breath" style={{
            width: 84, height: 84, margin: "0 auto",
            background: T.card, border: `1px solid ${T.hair}`, borderRadius: 24,
            display:"flex", alignItems:"center", justifyContent:"center",
            color: T.accent, marginBottom: 12,
          }}>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 5l13 5v10c0 8-5 14-13 18C14 34 9 28 9 20V10z"/>
              <path d="M16 22l4 4 8-10"/>
            </svg>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px" }}>goVLESS</div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3, marginTop: 4 }}>v 0.9.4-rc1 · build 482</div>
        </div>

        <SimpleCard T={T}>
          <Row T={T} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="6.5"/><path d="M9 3v6l4 2"/></svg>} title={L.aboutBuild} sub="goVLESS 0.9.4-rc1"/>
          <RowDiv T={T}/>
          <Row T={T} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2.5a3 3 0 0 0-1 5.8C5 9.4 5.5 10 6 10v3.5L9 12l3 1.5V10c0.5 0 1-0.6 1-1.7A3 3 0 0 0 12 2.5"/></svg>} title={L.aboutGh} chev/>
          <RowDiv T={T}/>
          <Row T={T} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="2.5" width="11" height="13" rx="1"/><path d="M6 6h6M6 8.5h6M6 11h3"/></svg>} title={L.aboutLic} chev/>
          <RowDiv T={T}/>
          <Row T={T} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="6.5" r="2.5"/><path d="M3.5 15c.8-2.8 3-4 5.5-4s4.7 1.2 5.5 4"/></svg>} title={L.aboutContact} chev/>
          <RowDiv T={T}/>
          <Row T={T} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 2.5h6L14 6v9.5H4.5z"/><path d="M10.5 2.5V6H14"/></svg>} title={L.aboutReread} chev/>
        </SimpleCard>
      </div>
    </div>
  );
}

function Row({ T, icon, title, sub, chev, right }) {
  return (
    <div className="m-press" style={{
      display:"flex", alignItems:"center", gap: 12, padding: "11px 4px", cursor:"pointer",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: T.card2, color: T.ink2,
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink: 0, border: `1px solid ${T.border}`,
      }}>{icon}</div>
      <div style={{ flex:1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
      {chev && <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={T.ink3} strokeWidth="1.5" strokeLinecap="round"><path d="M5 3l4 4-4 4"/></svg>}
    </div>
  );
}
function RowDiv({ T }) {
  return <div style={{ height: 1, background: T.hair, marginLeft: 48 }}/>;
}

function Notifications({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = ABOUT_T[lang];
  const items = [
    { l: L.n1, on: true,  warn: false },
    { l: L.n2, on: true,  warn: false },
    { l: L.n3, on: true,  warn: true  },
    { l: L.n4, on: true,  warn: false },
    { l: L.n5, on: false, warn: false },
    { l: L.n6, on: true,  warn: false },
  ];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.notifTitle} sub={L.notifSub}/>
      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>
        <SimpleCard T={T}>
          {items.map((it, i) => (
            <React.Fragment key={i}>
              {i > 0 && <RowDiv T={T}/>}
              <div style={{ display:"flex", alignItems:"center", gap: 12, padding: "12px 4px" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: it.warn ? T.warnSoft : T.card2,
                  color: it.warn ? T.warn : T.ink2,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink: 0, border: `1px solid ${it.warn ? T.warn + "40" : T.border}`,
                }}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 13.5h9l-1-1.5V8a3.5 3.5 0 0 0-7 0v4l-1 1.5z"/><path d="M7.5 15.5a1.5 1.5 0 0 0 3 0"/></svg>
                </div>
                <div style={{ flex:1, fontSize: 14, fontWeight: 500 }}>{it.l}</div>
                <div style={{
                  width: 36, height: 22, borderRadius: 11, position: "relative",
                  background: it.on ? T.accent : T.switchOff,
                  transition: "background var(--m-base) var(--m-soft)",
                }}>
                  <div style={{
                    position: "absolute", top: 2, left: 2,
                    width: 18, height: 18, borderRadius: 9,
                    background: it.on ? "#fff" : (T.isDark ? T.ink3 : "#fff"),
                    transform: it.on ? "translateX(14px)" : "translateX(0)",
                    transition: "transform var(--m-base) var(--m-soft), background var(--m-base) var(--m-soft)",
                  }}/>
                </div>
              </div>
            </React.Fragment>
          ))}
        </SimpleCard>
      </div>
    </div>
  );
}

// ════════ BACKUP · B1 list · B2 restore ══════════════════════════════
const BCK_T = {
  ru: {
    title: "Резервные копии", sub: "Снапшоты конфигурации",
    create: "Создать копию",
    creating: "Создаём…",
    restoreT: "Восстановить",
    restoreS: "Сервисы будут остановлены и затем запущены заново. Текущая конфигурация заменится снапшотом.",
    restoreBtn: "Восстановить",
    cancel: "Отмена",
    size: "Размер", made: "Создан",
    empty: "Резервных копий ещё нет",
    emptyS: "Снапшот включает БД, конфиги и ключи. Можно создать вручную или включить авто-копию в Настройках.",
  },
  en: {
    title: "Backups", sub: "Config snapshots",
    create: "Create backup",
    creating: "Creating…",
    restoreT: "Restore",
    restoreS: "Services will stop and restart. Current config replaces with the snapshot.",
    restoreBtn: "Restore",
    cancel: "Cancel",
    size: "Size", made: "Made",
    empty: "No backups yet",
    emptyS: "A snapshot includes DB, configs and keys. Create one manually or enable auto-backup in Settings.",
  },
};

function BackupList({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = BCK_T[lang];
  const backups = [
    { ts: "2026-05-25 02:00",  size: "1.2 MB", auto: true },
    { ts: "2026-05-24 02:00",  size: "1.2 MB", auto: true },
    { ts: "2026-05-22 14:38",  size: "1.1 MB", auto: false, before: true },
    { ts: "2026-05-20 02:00",  size: "1.1 MB", auto: true },
  ];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <TgHeader T={T} title={L.title} sub={L.sub}/>
      <div style={{ flex:1, overflow:"auto", padding: "14px 14px 24px" }}>
        <button className="m-press m-shine" style={{
          ...btnPrimary(T), width:"100%", flex: "0 0 auto", marginBottom: 14, height: 46,
          position: "relative", overflow: "hidden",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 6 }}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>
          {L.create}
        </button>

        <div className="m-enter" style={{
          background: T.card, border: `1px solid ${T.hair}`, borderRadius: 14, overflow: "hidden",
        }}>
          {backups.map((b, i) => (
            <div key={i} className={`m-press m-enter m-stagger-${i}`} style={{
              display:"flex", alignItems:"center", gap: 12, padding: "12px 14px", cursor: "pointer",
              borderTop: i > 0 ? `1px solid ${T.hair}` : "none",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: b.before ? T.warnSoft : T.card2,
                color: b.before ? T.warn : T.accent,
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink: 0, border: `1px solid ${b.before ? T.warn + "40" : T.border}`,
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5h12v9.5H3z"/><path d="M3 8h12M6 11h6"/></svg>
              </div>
              <div style={{ flex:1, minWidth: 0 }}>
                <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600 }}>{b.ts}</div>
                <div style={{ fontSize: 11, color: T.ink3, marginTop: 3, display:"flex", gap: 8 }}>
                  <span style={{ fontFamily: T.mono }}>{b.size}</span>
                  <span>·</span>
                  <span>{b.auto ? (lang==="ru"?"авто":"auto") : b.before ? (lang==="ru"?"перед переключением":"pre-switch") : (lang==="ru"?"вручную":"manual")}</span>
                </div>
              </div>
              <button className="m-press" style={{
                width: 32, height: 32, borderRadius: 8,
                background: "transparent", color: T.ink2,
                border: `1px solid ${T.border}`, cursor: "pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2v8M4 7l3 3 3-3M2 12h10"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackupRestore({ theme = "D2", lang = "ru" }) {
  const T = getTokens(theme);
  const L = BCK_T[lang];
  return (
    <div style={{
      width:"100%", height:"100%", background: T.bg, color: T.ink,
      fontFamily: T.font, position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", inset:0, background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      }}/>
      <div style={{
        position:"absolute", left:0, right:0, bottom:0,
        background: T.card, borderTopLeftRadius: 18, borderTopRightRadius: 18,
        borderTop: `1px solid ${T.border}`, padding: "8px 18px 16px",
        animation: "tcUp var(--m-slow) var(--m-soft) both",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.ink3, opacity: 0.35, margin: "0 auto 14px" }}/>

        <div style={{
          display:"flex", alignItems:"center", gap: 12, padding: "8px 0 14px",
          borderBottom: `1px solid ${T.hair}`, marginBottom: 14,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: T.warnSoft, color: T.warn,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15.7-5.7"/><path d="M21 12a9 9 0 0 1-15.7 5.7"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>
          </div>
          <div style={{ flex:1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.2px" }}>{L.restoreT}</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, color: T.ink3, marginTop: 4 }}>2026-05-22 14:38</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: T.ink2, lineHeight: 1.55, marginBottom: 12 }}>{L.restoreS}</div>

        <div style={{
          background: T.card2, border: `1px solid ${T.border}`, borderRadius: 10,
          padding: 12, marginBottom: 16,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: T.ink3 }}>{L.size}</span>
            <span style={{ fontFamily: T.mono, color: T.ink }}>1.1 MB</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize: 12 }}>
            <span style={{ color: T.ink3 }}>{lang==="ru"?"Содержимое":"Contents"}</span>
            <span style={{ color: T.ink }}>{lang==="ru"?"БД, конфиги, ключи":"DB, configs, keys"}</span>
          </div>
        </div>

        <div style={{ display:"flex", gap: 10 }}>
          <button style={btnGhost(T)}>{L.cancel}</button>
          <button className="m-press" style={btnDanger(T)}>{L.restoreBtn}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Admins,
  InboundsList, InboundDetail,
  About, Notifications,
  BackupList, BackupRestore,
});
