// Full legal disclaimer / Terms-of-use screen.
// One serious, scrollable page in the D2 Midnight base theme.
// Chrome translates (lang=ru/en); the legal body stays in Russian
// — that's how jurisdiction-specific terms are usually handled.

const DZ = {
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
  danger: "#e87a7a",
  font:   '"Manrope", "IBM Plex Sans", sans-serif',
  mono:   '"IBM Plex Mono", monospace',
};

const DISCLAIMER_TEXT = {
  ru: [
    {
      n: "01",
      h: "Назначение материалов",
      body: (
        <>
          <p>Все материалы, представленные в этом приложении и сопровождающей документации, носят <b>информационный характер</b> и раскрывают техническую сторону развертывания частного (белого) VPN-сервера.</p>
          <p>Информация предназначена исключительно для законного применения:</p>
          <ul>
            <li>безопасный удалённый доступ к собственным ресурсам (NAS, файлы, серверы);</li>
            <li>ускорение соединения с легальными зарубежными сервисами (облако, рабочие CRM);</li>
            <li>обновление ПО и оборудования, поставляемого из-за рубежа;</li>
            <li>цифровая гигиена при подключении через общедоступные Wi-Fi сети;</li>
            <li>доступ к корпоративным и учебным ресурсам, не подпадающим под блокировки.</li>
          </ul>
        </>
      ),
    },
    {
      n: "02",
      h: "Законность и ответственность",
      body: (
        <>
          <p>Использование VPN-технологий в РФ <b>не запрещено</b>. Однако доступ к ресурсам, заблокированным по решению Роскомнадзора (в т.ч. признанным экстремистскими), может рассматриваться как нарушение законодательства.</p>
          <p>Сам факт установки и использования VPN не является правонарушением, но использование в противоправных целях (распространение запрещённого контента, экстремизм, клевета, дискредитация и т.д.) может повлечь административную или уголовную ответственность.</p>
          <p>Автор <b>не распространяет</b> информацию о способах обхода блокировок, <b>не призывает</b> к нарушению закона и <b>не рекламирует</b> VPN-сервисы.</p>
          <p>Ответственность за соблюдение законодательства страны, в которой используется информация, <b>целиком и полностью ложится на пользователя</b>.</p>
        </>
      ),
    },
    {
      n: "03",
      h: "Категорически запрещено",
      danger: true,
      body: (
        <ul>
          <li>обходить блокировки экстремистских и иных запрещённых ресурсов;</li>
          <li>получать анонимный доступ к деструктивному, пиратскому, фейковому или вредоносному контенту;</li>
          <li>распространять призывы к незаконной деятельности, киберпреступлениям и иным противоправным действиям;</li>
          <li>распространять инструкции или ссылки, подпадающие под действующее законодательство РФ о противодействии экстремизму и дезинформации.</li>
        </ul>
      ),
    },
    {
      n: "04",
      h: "Что важно понимать",
      body: (
        <>
          <p>Ни один VPN <b>не гарантирует полной анонимности</b>. В Российской Федерации действуют системы контроля интернет-трафика (СОРМ, ТСПУ), а административные и уголовные санкции применимы при выявлении противоправных действий, <b>даже если они совершены через VPN</b>.</p>
          <p>Все материалы распространяются «как есть» (as is). Автор не несёт ответственности за последствия их использования.</p>
        </>
      ),
    },
  ],
  en: [
    {
      n: "01",
      h: "Purpose of these materials",
      body: (
        <>
          <p>Everything inside this app and its documentation is provided <b>for informational purposes</b>. It describes the technical side of deploying a private (white) VPN server on a server you own or rent.</p>
          <p>The information is intended strictly for lawful use:</p>
          <ul>
            <li>secure remote access to your own resources (NAS, files, servers);</li>
            <li>faster connection to legitimate foreign services (cloud, work CRM, etc.);</li>
            <li>updating software and hardware that ship from abroad;</li>
            <li>basic digital hygiene on public Wi-Fi networks;</li>
            <li>access to corporate and educational resources that are not subject to local blocks.</li>
          </ul>
        </>
      ),
    },
    {
      n: "02",
      h: "Legality and responsibility",
      body: (
        <>
          <p>The use of VPN technology is <b>not prohibited</b> in the Russian Federation in itself. However, accessing resources blocked by the regulator (Roskomnadzor) — including content classified as extremist — may be treated as a violation of the law.</p>
          <p>Installing and running a VPN is not an offense on its own, but using it for unlawful purposes (distributing prohibited content, extremism, defamation, public discrediting, etc.) may lead to administrative or criminal liability.</p>
          <p>The author of this software <b>does not distribute</b> information on bypassing blocks, <b>does not encourage</b> breaking the law, and <b>does not advertise</b> any commercial VPN service.</p>
          <p>Compliance with the laws of the country in which this information is used <b>is fully and solely the user’s responsibility</b>.</p>
        </>
      ),
    },
    {
      n: "03",
      h: "Strictly prohibited uses",
      danger: true,
      body: (
        <ul>
          <li>bypassing blocks of extremist or otherwise prohibited resources;</li>
          <li>obtaining anonymous access to destructive, pirated, fake, or malicious content;</li>
          <li>distributing calls for illegal activity, cybercrime, or any other unlawful actions;</li>
          <li>distributing instructions or links that fall under the laws of your jurisdiction on extremism, disinformation, or related matters.</li>
        </ul>
      ),
    },
    {
      n: "04",
      h: "What you should keep in mind",
      body: (
        <>
          <p>No VPN <b>guarantees complete anonymity</b>. Many jurisdictions — including the Russian Federation, with systems such as SORM and TSPU — operate large-scale traffic-inspection infrastructure. Administrative and criminal sanctions still apply to unlawful acts <b>even when committed via a VPN</b>.</p>
          <p>All materials are distributed «as is». The author accepts no responsibility for any consequences arising from their use.</p>
        </>
      ),
    },
  ],
};

const DZ_TEXT = {
  ru: {
    title: "Условия использования",
    sub: "Прочитайте перед началом",
    intro: "Если вы не согласны с этими условиями, либо намерены использовать материалы в целях, противоречащих законодательству, — закройте приложение.",
    contactsH: "Контакт автора",
    contactsBody: "По вопросам и для запросов на возврат средств:",
    tg: "Telegram автора",
    mail: "1vpn1@rambler.ru",
    confirm: "Я прочитал(а) и согласен(на) с условиями",
    decline: "Не согласен",
    accept: "Согласен · продолжить",
    progress: "прочитано",
    asisLabel: "as is",
  },
  en: {
    title: "Terms of use",
    sub: "Please read before continuing",
    intro: "If you do not agree with these terms, or intend to use the materials for purposes contrary to applicable law, close the app now.",
    contactsH: "Author contact",
    contactsBody: "For questions and refund requests:",
    tg: "Author on Telegram",
    mail: "1vpn1@rambler.ru",
    confirm: "I have read and accept the terms",
    decline: "Decline",
    accept: "Accept · continue",
    progress: "read",
    asisLabel: "as is",
  },
};

function DisclaimerScreen({ lang = "ru", agreed = false, scrollPct = 35 }) {
  const T = DZ_TEXT[lang];
  const canAccept = agreed && scrollPct >= 95;

  return (
    <div style={{
      width:"100%", height:"100%", background: DZ.bg, color: DZ.ink,
      fontFamily: DZ.font, display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <style>{`
        .dz-body p { margin: 0 0 10px; }
        .dz-body p:last-child { margin-bottom: 0; }
        .dz-body ul { margin: 0; padding-left: 18px; }
        .dz-body li { margin-bottom: 6px; }
        .dz-body li::marker { color: ${DZ.ink3}; }
        .dz-body b { color: ${DZ.ink}; font-weight: 700; }
      `}</style>

      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", height:50, padding:"0 14px", gap:10,
        flex:"0 0 auto", background: DZ.bgAlt, borderBottom:`1px solid ${DZ.hair}`, position:"relative",
      }}>
        <div style={{ width:28, color: DZ.ink3 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11.5 3.5L6 9l5.5 5.5"/></svg>
        </div>
        <div style={{ flex:1, textAlign:"center", fontSize:14.5, fontWeight:700, lineHeight:1.15 }}>
          {T.title}
          <small style={{ display:"block", fontSize:11, fontWeight:500, color:DZ.ink3, marginTop:1 }}>{T.sub}</small>
        </div>
        <div style={{ width:28, color: DZ.ink3, textAlign:"right", fontSize:18, letterSpacing:1 }}>⋯</div>
        {/* read progress */}
        <div style={{
          position:"absolute", left:0, right:0, bottom:-1, height:2,
          background:"rgba(255,255,255,0.06)",
        }} className="m-progress">
          <div style={{ width:`${scrollPct}%`, height:"100%", background: DZ.accent }}/>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex:1, minHeight:0, overflow:"auto", padding:"16px 16px 20px",
        display:"flex", flexDirection:"column", gap: 18,
      }}>
        {/* Stamp */}
        <div className="m-enter m-stagger-0" style={{
          display:"flex", alignItems:"flex-start", gap: 12,
          padding:"12px 14px",
          background: "rgba(230,176,102,0.05)",
          border:`1px solid rgba(230,176,102,0.22)`,
          borderRadius: 12,
        }}>
          <div style={{ width:24, height:24, flexShrink:0, color: DZ.warn, marginTop: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l9 16H3L12 3z"/><path d="M12 10v4M12 16.5v.5"/>
            </svg>
          </div>
          <div style={{ flex:1, fontSize:12.5, color: DZ.ink2, lineHeight:1.5 }}>
            <div style={{ color: DZ.warn, fontWeight: 700, fontSize: 11.5, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom: 4 }}>
              {lang==="ru" ? "Правовое предупреждение" : "Legal notice"}
            </div>
            {T.intro}
          </div>
        </div>

        {/* Numbered sections */}
        {DISCLAIMER_TEXT[lang].map((s, i) => (
          <div key={i} className={`m-enter m-stagger-${i+1}`}>
            <div style={{
              display:"flex", alignItems:"baseline", gap: 10, marginBottom: 10,
              paddingBottom: 8, borderBottom:`1px solid ${DZ.hair}`,
            }}>
              <div style={{
                fontFamily: DZ.mono, fontSize: 12, fontWeight: 700,
                color: s.danger ? DZ.danger : DZ.ink3, letterSpacing:"0.04em",
                width: 22,
              }}>{s.n}</div>
              <div style={{
                fontSize: 15, fontWeight: 700, letterSpacing:"-0.2px",
                color: s.danger ? DZ.danger : DZ.ink, flex: 1,
              }}>{s.h}</div>
              {s.danger && (
                <div style={{
                  fontFamily: DZ.mono, fontSize: 10, fontWeight: 700,
                  color: DZ.danger, padding:"2px 7px",
                  border:`1px solid ${DZ.danger}`, borderRadius: 4, letterSpacing:"0.08em",
                  textTransform:"uppercase", opacity: 0.85,
                }}>!</div>
              )}
            </div>
            <div className="dz-body" style={{ fontSize: 12.5, color: DZ.ink2, lineHeight: 1.55, paddingLeft: 32 }}>
              {s.body}
            </div>
          </div>
        ))}

        {/* As-is stamp */}
        <div className="m-enter m-stagger-5" style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          padding: "8px 12px", border:`1px dashed ${DZ.border}`, borderRadius: 10,
          fontFamily: DZ.mono, fontSize: 11, color: DZ.ink3, letterSpacing:"0.08em",
          textTransform: "uppercase",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5.5"/><path d="M7 4v3.5l2 1"/></svg>
          {T.asisLabel} · v 0.9.4 · 2025-11
        </div>

        {/* Contact card */}
        <div className="m-enter m-stagger-6 m-lift" style={{
          background: DZ.card, border:`1px solid ${DZ.hair}`, borderRadius: 14,
          padding: "14px 14px 12px",
        }}>
          <div style={{
            fontSize:11, fontWeight:700, color:DZ.ink3, letterSpacing:"0.06em",
            textTransform:"uppercase", marginBottom: 8,
          }}>{T.contactsH}</div>
          <div style={{ fontSize: 12.5, color: DZ.ink2, lineHeight:1.45, marginBottom: 10 }}>
            {T.contactsBody}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap: 6 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
              background: DZ.card2, border:`1px solid ${DZ.border}`, borderRadius: 8,
            }}>
              <div style={{ width:24, height:24, borderRadius:6, background:"#3a4868", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 8.2-1.9 8.8c-.1.6-.5.8-1 .5l-2.8-2.1-1.4 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.3-4.8c.2-.2 0-.3-.3-.1l-6.5 4.1-2.8-.9c-.6-.2-.6-.6.1-.9l11-4.3c.5-.2 1 .1.7 1z"/></svg>
              </div>
              <div style={{ flex:1, fontSize: 13, fontWeight: 500 }}>{T.tg}</div>
              <span style={{ color: DZ.ink3 }}>→</span>
            </div>
            <div style={{
              display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
              background: DZ.card2, border:`1px solid ${DZ.border}`, borderRadius: 8,
            }}>
              <div style={{ width:24, height:24, borderRadius:6, background: DZ.bgAlt, color: DZ.ink2, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${DZ.border}` }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1.5" y="3" width="11" height="8" rx="1"/><path d="M2 4l5 4 5-4" strokeLinecap="round"/></svg>
              </div>
              <div style={{ flex:1, fontFamily: DZ.mono, fontSize: 12.5, color: DZ.ink }}>{T.mail}</div>
              <span style={{ color: DZ.ink3 }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="7" height="7" rx="1"/><path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/></svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom: consent + CTAs */}
      <div style={{
        flex:"0 0 auto", borderTop:`1px solid ${DZ.hair}`, background: DZ.bgAlt,
        padding: "10px 14px 14px",
      }}>
        {/* checkbox row */}
        <div style={{
          display:"flex", alignItems:"flex-start", gap:10, padding:"6px 4px 10px",
        }}>
          <div style={{
            width:20, height:20, borderRadius:6, flexShrink:0,
            border: `1.5px solid ${agreed ? DZ.accent : DZ.border}`,
            background: agreed ? DZ.accent : "transparent",
            display:"flex", alignItems:"center", justifyContent:"center",
            marginTop: 1,
          }}>
            {agreed && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={DZ.bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6L5 8.5l4.5-5"/></svg>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: DZ.ink2, lineHeight:1.4, flex:1 }}>
            {T.confirm}
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{
            flex:"0 0 auto", padding:"0 18px", height:46, borderRadius:10,
            border:`1px solid ${DZ.border}`, background:"transparent", color: DZ.ink,
            fontFamily:"inherit", fontSize:14, fontWeight:500, cursor:"pointer",
          }}>{T.decline}</button>
          <button style={{
            flex:1, height:46, borderRadius:10, border:"none",
            background: canAccept ? DZ.accent : DZ.card,
            color: canAccept ? DZ.bg : DZ.ink3,
            fontFamily:"inherit", fontSize:15, fontWeight:700, letterSpacing:"-0.1px",
            cursor: canAccept ? "pointer" : "not-allowed",
            opacity: canAccept ? 1 : 0.7,
          }}>{T.accept}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DisclaimerScreen });
