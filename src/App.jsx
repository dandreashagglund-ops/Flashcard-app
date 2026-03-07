import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ───────────────────────────────────────────────────────
function cn(...c) { return c.filter(Boolean).join(" "); }
function fmtDate(d) { if (!d) return "–"; return new Date(d).toLocaleDateString("sv-SE"); }
function fmtDT(d) { if (!d) return "–"; return new Date(d).toLocaleString("sv-SE"); }

// ── Icon / SVG system ─────────────────────────────────────────────
const TABLER_ICONS = {
  dog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h2M10 8h4M12 8c2.667 2.333 4 4.667 4 7a4 4 0 0 1-8 0c0-2.333 1.333-4.667 4-7z"/><path d="M7 7l-2 3 2 2M17 7l2 3-2 2"/></svg>`,
  cat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l1-4 3 3M19 8l-1-4-3 3M9 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0M13 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/><path d="M7 8c0 4 1 7 5 8s5-4 5-8"/></svg>`,
  house: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12H3l9-9 9 9h-2M5 12v7a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-7"/></svg>`,
  car: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 17m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0M17 17m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/><path d="M5 17H3v-6l2-5h11l3 5 1 3v3h-2M5 17h12M3 11h18"/></svg>`,
  book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2.25l3.086 6.003 6.9 1.002-4.993 4.867 1.179 6.873z"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 1 1 7.5 6.566z"/></svg>`,
  tree: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l4 8H8zM12 11l5 9H7zM12 20v1M10 21h4"/></svg>`,
  flower: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 9a3 3 0 0 0 2.83-4A3 3 0 0 0 12 3a3 3 0 0 0-2.83 2A3 3 0 0 0 12 9zM15 12a3 3 0 0 0 2 2.83A3 3 0 0 0 21 12a3 3 0 0 0-2-2.83A3 3 0 0 0 15 12zM12 15a3 3 0 0 0-2.83 2A3 3 0 0 0 12 21a3 3 0 0 0 2.83-2A3 3 0 0 0 12 15zM9 12a3 3 0 0 0-2-2.83A3 3 0 0 0 3 12a3 3 0 0 0 2 2.83A3 3 0 0 0 9 12z"/></svg>`,
  person: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>`,
  music: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="17" r="2"/><polyline points="8 19 8 5 20 3 20 17"/><line x1="8" y1="11" x2="20" y2="9"/></svg>`,
  water: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6 10 4 14 4 16a8 8 0 0 0 16 0c0-2-2-6-8-14z"/></svg>`,
  fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 12c0-4-3-7-3-7s-1 3 0 5c-3-2-4-5-4-5S3 9 4 13a8 8 0 0 0 16 0c0-5-4-9-4-9s1 5-4 8z"/></svg>`,
  food: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12h20M2 12a10 10 0 0 0 20 0M12 2v4M8 3v3M16 3v3"/></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  money: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  key: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  bird: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.99.2L12 10H3.4z"/><path d="M6 18v.01M9.5 18v.01"/></svg>`,
  fish: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16.69 7.44A6.973 6.973 0 0 0 12 5c-3.868 0-7 3.132-7 7s3.132 7 7 7a6.973 6.973 0 0 0 4.69-1.44"/><path d="M20 12l-5-3v6l5-3z"/></svg>`,
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20.25c4.125 0 7.5-5.25 7.5-9.75 0-4.125-3-6.75-7.5-6.75S4.5 6.375 4.5 10.5c0 4.5 3.375 9.75 7.5 9.75z"/><path d="M12 3.75V2.25M10.5 3l3-1.5"/></svg>`,
  eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  hand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
  school: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
  computer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  mountain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 20l7-14 4 8 3-4 4 10H3z"/></svg>`,
  cloud: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
};

const ICON_MAP = {
  dog:"dog",hund:"dog",cat:"cat",katt:"cat",bird:"bird",fågel:"bird",fish:"fish",fisk:"fish",
  tree:"tree",träd:"tree",flower:"flower",blomma:"flower",sun:"sun",sol:"sun",moon:"moon",måne:"moon",
  star:"star",stjärna:"star",cloud:"cloud",moln:"cloud",water:"water",vatten:"water",fire:"fire",eld:"fire",
  house:"house",hus:"house",home:"house",hem:"house",car:"car",bil:"car",book:"book",bok:"book",
  heart:"heart",hjärta:"heart",person:"person",music:"music",musik:"music",eye:"eye",öga:"eye",
  hand:"hand",school:"school",skola:"school",computer:"computer",dator:"computer",
  mountain:"mountain",berg:"mountain",apple:"apple",äpple:"apple",food:"food",mat:"food",
  money:"money",pengar:"money",key:"key",nyckel:"key",clock:"clock",klocka:"clock",
};

function svgToDataUrl(s) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s); }
function lookupIcon(word) {
  if (!word) return null;
  const key = ICON_MAP[word.toLowerCase().trim()];
  if (!key || !TABLER_ICONS[key]) return null;
  return svgToDataUrl(TABLER_ICONS[key]);
}

const LANG_FLAGS = { sv:"🇸🇪",en:"🇬🇧",de:"🇩🇪",fr:"🇫🇷",es:"🇪🇸",it:"🇮🇹",pt:"🇵🇹",ja:"🇯🇵",zh:"🇨🇳",ar:"🇸🇦",ru:"🇷🇺",nl:"🇳🇱",pl:"🇵🇱",ko:"🇰🇷",concept:"📖" };
const LANG_NAMES = { sv:"Svenska",en:"Engelska",de:"Tyska",fr:"Franska",es:"Spanska",it:"Italienska",pt:"Portugisiska",ja:"Japanska",zh:"Kinesiska",ar:"Arabiska",ru:"Ryska",nl:"Holländska",pl:"Polska",ko:"Koreanska",concept:"Begrepp/Koncept" };
const ALL_LANGS = Object.keys(LANG_FLAGS);

// ── Spaced repetition ─────────────────────────────────────────────
function nextReviewDate(correct, wrong, streak) {
  const accuracy = correct + wrong > 0 ? correct / (correct + wrong) : 0;
  const days = accuracy > 0.9 ? Math.min(streak * 2 + 1, 30) : accuracy > 0.7 ? streak + 1 : 1;
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString();
}

// ── Log helper ────────────────────────────────────────────────────
async function logEvent(userId, eventType, metadata = {}) {
  await supabase.from("user_log").insert({ user_id: userId, event_type: eventType, metadata });
}

// ─────────────────────────────────────────────────────────────────
// ROOT ROUTER
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  if (loading) return <Splash />;
  if (!session) return <LandingPage />;
  return <MainApp session={session} />;
}

function Splash() {
  return (
    <div className="splash" role="status" aria-label="Laddar">
      <div className="splash-logo">✦</div>
      <p>Laddar…</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LANDING PAGE (ej inloggad)
// ─────────────────────────────────────────────────────────────────
function LandingPage() {
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'signup'
  const appUrl = typeof window !== "undefined" ? window.location.href : "";

  const features = [
    { icon: "🃏", title: "Smarta flashcards", desc: "Träna glospar och begrepp med bild, emoji och förklaring på baksidan." },
    { icon: "📊", title: "Spaced repetition", desc: "Algoritmen visar ord du behöver öva mer – inga onödiga repetitioner." },
    { icon: "🔖", title: "Teman & taggar", desc: "Sortera ord i teman och tagga med svårighet, ordklass m.m." },
    { icon: "📈", title: "Din statistik", desc: "Följ framstegen per lista, tagg och totalt. Se din träffsäkerhet." },
    { icon: "🌐", title: "Dela listor", desc: "Gör dina ordlistor publika och hjälp andra att lära sig." },
    { icon: "📥", title: "Importera CSV", desc: "Ladda upp egna ordlistor snabbt med format ord1,ord2,kommentar,emoji." },
  ];

  if (authMode) return <AuthPage mode={authMode} onBack={() => setAuthMode(null)} />;

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">✦ Glosträning</div>
        <div className="landing-header-btns">
          <button className="btn-ghost" onClick={() => setAuthMode("login")}>Logga in</button>
          <button className="btn-primary" onClick={() => setAuthMode("signup")}>Skapa konto</button>
        </div>
      </header>

      <section className="landing-hero landing-hero-centered">
        <div className="landing-hero-text">
          <h1 className="landing-h1">Lär dig ord<br /><em>på riktigt</em></h1>
          <p className="landing-lead">Glosträning hjälper dig memorera ord och begrepp med flashcards, spaced repetition och emoji — gratis och enkelt.</p>
          <div className="landing-cta-group">
            <button className="btn-primary btn-lg" onClick={() => setAuthMode("signup")}>Kom igång gratis →</button>
            <button className="btn-ghost btn-lg" onClick={() => setAuthMode("login")}>Logga in</button>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <h2 className="landing-h2">Allt du behöver för att lära dig</h2>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" aria-hidden="true">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-qr">
        <div className="qr-content">
          <h2 className="landing-h2">Dela med mobilen</h2>
          <p>Scanna QR-koden för att öppna appen direkt på telefonen.</p>
          <div className="qr-placeholder" aria-label="QR-kod för appen">
            <QRCodeSVG url={appUrl} size={140} />
          </div>
          <p className="qr-url">{appUrl}</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Glosträning · WCAG 2.1 AA · GDPR-kompatibel</p>
        <p><button className="btn-link" onClick={() => setAuthMode("login")}>Logga in</button> · <button className="btn-link" onClick={() => setAuthMode("signup")}>Skapa konto</button></p>
      </footer>
    </div>
  );
}

// Simple QR code component (pure SVG, no external dep)
function QRCodeSVG({ url, size = 120 }) {
  // Very simple visual placeholder – in production use a QR library
  return (
    <div className="qr-box" style={{ width: size, height: size }} title={`QR: ${url}`}>
      <svg viewBox="0 0 10 10" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <rect width="10" height="10" fill="white"/>
        <rect x="1" y="1" width="3" height="3" fill="#1a1714"/>
        <rect x="6" y="1" width="3" height="3" fill="#1a1714"/>
        <rect x="1" y="6" width="3" height="3" fill="#1a1714"/>
        <rect x="1.5" y="1.5" width="2" height="2" fill="white"/>
        <rect x="6.5" y="1.5" width="2" height="2" fill="white"/>
        <rect x="1.5" y="6.5" width="2" height="2" fill="white"/>
        <rect x="2" y="2" width="1" height="1" fill="#1a1714"/>
        <rect x="7" y="2" width="1" height="1" fill="#1a1714"/>
        <rect x="2" y="7" width="1" height="1" fill="#1a1714"/>
        <rect x="5" y="4" width="1" height="1" fill="#1a1714"/>
        <rect x="7" y="4" width="1" height="1" fill="#1a1714"/>
        <rect x="4" y="5" width="1" height="1" fill="#1a1714"/>
        <rect x="6" y="5" width="1" height="1" fill="#1a1714"/>
        <rect x="8" y="5" width="1" height="1" fill="#1a1714"/>
        <rect x="5" y="6" width="1" height="1" fill="#1a1714"/>
        <rect x="7" y="6" width="2" height="1" fill="#1a1714"/>
        <rect x="4" y="7" width="2" height="1" fill="#1a1714"/>
        <rect x="7" y="8" width="2" height="1" fill="#1a1714"/>
        <text x="5" y="5.5" textAnchor="middle" fontSize="1" fill="#c84b2f">✦</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AUTH PAGE
// ─────────────────────────────────────────────────────────────────
function AuthPage({ mode: initMode = "login", onBack }) {
  const [mode, setMode] = useState(initMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
        if (error) throw error;
        if (data.user) {
          await logEvent(data.user.id, "user_created", { email, username });
        }
        setInfo("Kolla din e-post för att bekräfta ditt konto!");
      }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {onBack && <button className="btn-ghost auth-back" onClick={onBack} aria-label="Tillbaka">← Tillbaka</button>}
        <div className="auth-logo">✦ Glosträning</div>
        <div className="auth-tabs" role="tablist">
          <button role="tab" aria-selected={mode==="login"} className={cn("auth-tab", mode==="login"&&"active")} onClick={()=>setMode("login")}>Logga in</button>
          <button role="tab" aria-selected={mode==="signup"} className={cn("auth-tab", mode==="signup"&&"active")} onClick={()=>setMode("signup")}>Skapa konto</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {mode==="signup" && (
            <div className="form-field">
              <label htmlFor="auth-username" className="form-label">Användarnamn</label>
              <input id="auth-username" className="auth-input" type="text" placeholder="Ditt namn" value={username} onChange={e=>setUsername(e.target.value)} autoComplete="username" />
            </div>
          )}
          <div className="form-field">
            <label htmlFor="auth-email" className="form-label">E-post</label>
            <input id="auth-email" className="auth-input" type="email" placeholder="din@epost.se" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="form-field">
            <label htmlFor="auth-password" className="form-label">Lösenord</label>
            <input id="auth-password" className="auth-input" type="password" placeholder="Minst 6 tecken" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={mode==="login"?"current-password":"new-password"} minLength={6} />
          </div>
          {error && <div className="auth-error" role="alert">{error}</div>}
          {info && <div className="auth-info" role="status">{info}</div>}
          <button className="auth-btn" type="submit" disabled={busy} aria-busy={busy}>{busy?"Väntar…":mode==="login"?"Logga in":"Skapa konto"}</button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────
function MainApp({ session }) {
  const uid = session.user.id;
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState("decks");
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [themes, setThemes] = useState([]);
  const [progress, setProgress] = useState({});
  const [studyConfig, setStudyConfig] = useState({ tagId: null, themeId: null, direction: "front", onlyFlagged: false, onlyWithIcon: false });
  const sessionStart = useRef(Date.now());
  const cardsShownRef = useRef(0);

  // Load profile
  const loadProfile = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
    // Update last_active
    await supabase.from("profiles").update({ last_active: new Date().toISOString() }).eq("id", uid);
  }, [uid]);

  const loadGlobals = useCallback(async () => {
    const [{ data: th }, { data: tg }] = await Promise.all([
      supabase.from("themes").select("*").eq("is_active", true).order("name"),
      supabase.from("tags").select("*").or("scope.eq.global,user_id.eq." + uid).order("name"),
    ]);
    setThemes(th || []);
    setTags(tg || []);
  }, [uid]);

  const loadDecks = useCallback(async () => {
    const { data } = await supabase.from("decks").select("*").eq("user_id", uid).order("created_at");
    setDecks(data || []);
  }, [uid]);

  const loadDeckData = useCallback(async (deckId) => {
    if (!deckId) return;
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("cards").select("*").eq("user_id", uid).eq("deck_id", deckId).order("created_at"),
      supabase.from("progress").select("*").eq("user_id", uid),
    ]);
    setCards(c || []);
    const pm = {}; (p || []).forEach(r => pm[r.card_id] = r);
    setProgress(pm);
  }, [uid]);

  useEffect(() => { loadProfile(); loadGlobals(); loadDecks(); }, [loadProfile, loadGlobals, loadDecks]);
  useEffect(() => { if (activeDeck) loadDeckData(activeDeck.id); }, [activeDeck, loadDeckData]);

  // Session end log
  useEffect(() => {
    return () => {
      const secs = Math.round((Date.now() - sessionStart.current) / 1000);
      logEvent(uid, "session_ended", { session_seconds: secs, cards_shown: cardsShownRef.current });
    };
  }, [uid]);

  const refreshAll = useCallback(() => { loadDecks(); if (activeDeck) loadDeckData(activeDeck.id); loadGlobals(); }, [loadDecks, loadDeckData, activeDeck, loadGlobals]);

  function openDeck(deck) { setActiveDeck(deck); setView("home"); }
  function goHome() { setActiveDeck(null); setView("decks"); loadDecks(); }
  function startStudy(cfg = {}) { setStudyConfig(c => ({...c,...cfg})); setView("study"); }

  const isAdmin = profile?.role === "sysadmin";
  const isManager = profile?.role === "group_manager" || isAdmin;

  // NAV
  const insideDeck = activeDeck && !["decks","explore","stats","admin","profile","themes","study_theme"].includes(view);
  const deckNav = [
    { id:"home", icon:"⌂", label:"Hem" },
    { id:"study", icon:"◈", label:"Träna" },
    { id:"cards", icon:"▦", label:"Kort" },
    { id:"import", icon:"↑", label:"Importera" },
    { id:"stats", icon:"◉", label:"Statistik" },
  ];
  const mainNav = [
    { id:"decks", icon:"◧", label:"Ordlistor" },
    { id:"explore", icon:"🌐", label:"Utforska" },
    { id:"study_theme", icon:"🎯", label:"Öva tema" },
    { id:"stats", icon:"📈", label:"Statistik" },
    { id:"profile", icon:"👤", label:"Profil" },
    ...(isAdmin ? [{ id:"admin", icon:"⚙️", label:"Admin" }] : []),
  ];

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">Hoppa till innehåll</a>
      <nav className="sidebar" aria-label="Huvudnavigation">
        <button className="sidebar-logo" onClick={goHome} title="Alla ordlistor" aria-label="Gå till startsidan">✦</button>
        {insideDeck && (
          <div className="sidebar-deck-badge" style={{"--dc": activeDeck.color||"#c84b2f"}}>
            <span aria-hidden="true">{activeDeck.theme_icon||"📚"}</span>
            <span className="nav-label deck-label">{activeDeck.name}</span>
          </div>
        )}
        {insideDeck
          ? deckNav.map(n => <NavBtn key={n.id} n={n} active={view===n.id} onClick={()=>setView(n.id)} />)
          : mainNav.map(n => <NavBtn key={n.id} n={n} active={view===n.id} onClick={()=>{ if(n.id!=="study_theme") setActiveDeck(null); setView(n.id); }} />)
        }
        <div className="sidebar-spacer" />
        <button className="nav-btn logout-btn" onClick={async()=>{
          const secs=Math.round((Date.now()-sessionStart.current)/1000);
          await logEvent(uid,"session_ended",{session_seconds:secs,cards_shown:cardsShownRef.current});
          supabase.auth.signOut();
        }} aria-label="Logga ut">
          <span className="nav-icon" aria-hidden="true">←</span>
          <span className="nav-label">Logga ut</span>
        </button>
      </nav>

      <main className="content" id="main-content">
        {view==="decks" && <DecksView decks={decks} uid={uid} tags={tags} themes={themes} onOpen={openDeck} onUpdate={loadDecks} />}
        {view==="explore" && <ExploreView uid={uid} tags={tags} themes={themes} onImport={loadDecks} />}
        {view==="study_theme" && <StudyThemeView uid={uid} themes={themes} tags={tags} onStart={startStudy} />}
        {view==="stats" && <GlobalStatsView uid={uid} decks={decks} />}
        {view==="profile" && profile && <ProfileView profile={profile} uid={uid} onUpdate={loadProfile} />}
        {view==="admin" && isAdmin && <AdminView uid={uid} themes={themes} tags={tags} onUpdate={refreshAll} />}
        {view==="home" && activeDeck && <HomeView deck={activeDeck} cards={cards} tags={tags} themes={themes} progress={progress} onStudy={startStudy} onUpdate={refreshAll} />}
        {view==="study" && activeDeck && <StudyView cards={cards} tags={tags} themes={themes} progress={progress} config={studyConfig} onProgressUpdate={refreshAll} uid={uid} cardsShownRef={cardsShownRef} />}
        {view==="cards" && activeDeck && <CardsView cards={cards} tags={tags} themes={themes} onUpdate={refreshAll} uid={uid} deckId={activeDeck.id} />}
        {view==="import" && activeDeck && <ImportView deck={activeDeck} uid={uid} onUpdate={refreshAll} />}
      </main>
    </div>
  );
}

function NavBtn({ n, active, onClick }) {
  return (
    <button className={cn("nav-btn", active&&"active")} onClick={onClick} aria-current={active?"page":undefined} aria-label={n.label}>
      <span className="nav-icon" aria-hidden="true">{n.icon}</span>
      <span className="nav-label">{n.label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// DECKS VIEW
// ─────────────────────────────────────────────────────────────────
function DecksView({ decks, uid, tags, themes, onOpen, onUpdate }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cardCounts, setCardCounts] = useState({});
  const [sort, setSort] = useState("created_at");
  const [search, setSearch] = useState("");
  const [filterTheme, setFilterTheme] = useState("");

  useEffect(() => {
    (async()=>{
      const { data } = await supabase.from("cards").select("deck_id").eq("user_id", uid);
      const c={}; (data||[]).forEach(r=>{c[r.deck_id]=(c[r.deck_id]||0)+1;}); setCardCounts(c);
    })();
  }, [uid, decks]);

  async function saveDeck(data) {
    if (data.id) { await supabase.from("decks").update(data).eq("id", data.id); }
    else {
      const { data: nd } = await supabase.from("decks").insert({...data, user_id: uid}).select().single();
      if (nd) await logEvent(uid, "deck_created", { deck_name: data.name });
    }
    setShowEditor(false); setEditing(null); onUpdate();
  }
  async function deleteDeck(id) {
    if (!confirm("Radera ordlistan och alla dess kort?")) return;
    await supabase.from("decks").delete().eq("id", id); onUpdate();
  }
  async function toggleShare(deck) {
    await supabase.from("decks").update({ is_public: !deck.is_public }).eq("id", deck.id); onUpdate();
  }

  const sorted = useMemo(() => {
    let d = decks.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (!filterTheme || (d.theme_ids||[]).includes(filterTheme))
    );
    if (sort==="name") d.sort((a,b)=>a.name.localeCompare(b.name));
    else if (sort==="count") d.sort((a,b)=>(cardCounts[b.id]||0)-(cardCounts[a.id]||0));
    else if (sort==="use_count") d.sort((a,b)=>(b.use_count||0)-(a.use_count||0));
    else d.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    return d;
  }, [decks, search, sort, filterTheme, cardCounts]);

  return (
    <div className="view">
      <div className="view-header">
        <div><h1 className="view-title">Mina ordlistor</h1><p className="view-sub">Välj en lista att träna, eller skapa en ny.</p></div>
        <button className="btn-primary" onClick={()=>{setEditing(null);setShowEditor(true);}}>+ Ny ordlista</button>
      </div>

      <div className="toolbar">
        <input className="search-input" type="search" placeholder="Sök lista…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Sök ordlistor" />
        <select className="select-sm" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sortera">
          <option value="created_at">Nyast</option>
          <option value="name">Namn A–Ö</option>
          <option value="count">Antal kort</option>
          <option value="use_count">Mest använd</option>
        </select>
        {themes.length>0 && (
          <select className="select-sm" value={filterTheme} onChange={e=>setFilterTheme(e.target.value)} aria-label="Filtrera tema">
            <option value="">Alla teman</option>
            {themes.map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </select>
        )}
      </div>

      {showEditor && <DeckEditor deck={editing} themes={themes} tags={tags} onSave={saveDeck} onCancel={()=>{setShowEditor(false);setEditing(null);}} />}

      {sorted.length===0 && !showEditor && <p className="muted center-msg">Inga ordlistor ännu – skapa din första!</p>}
      <div className="decks-grid">
        {sorted.map(deck => (
          <article key={deck.id} className="deck-card" style={{"--dc": deck.color||"#c84b2f"}} onClick={()=>onOpen(deck)}>
            <div className="deck-card-top">
              <span className="deck-icon" aria-hidden="true">{deck.theme_icon||"📚"}</span>
              <div className="deck-badges">
                {deck.is_public && <span className="badge badge-green">Delad</span>}
                {deck.pair_type==="concept" && <span className="badge badge-blue">Begrepp</span>}
              </div>
            </div>
            <h2 className="deck-name">{deck.name}</h2>
            {deck.description && <p className="deck-desc">{deck.description}</p>}
            <div className="deck-meta">
              <span>{cardCounts[deck.id]||0} kort</span>
              <span>{LANG_FLAGS[deck.front_lang]||"?"} → {LANG_FLAGS[deck.back_lang]||"?"}</span>
            </div>
            <div className="deck-actions" onClick={e=>e.stopPropagation()}>
              <button className="btn-sm" onClick={()=>onOpen(deck)}>Träna →</button>
              <button className="btn-sm btn-ghost-sm" onClick={()=>{setEditing(deck);setShowEditor(true);}}>Redigera</button>
              <button className="btn-sm btn-ghost-sm" onClick={()=>toggleShare(deck)} title={deck.is_public?"Gör privat":"Dela"}>{deck.is_public?"🔓":"🔒"}</button>
              <button className="btn-sm btn-danger-sm" onClick={()=>deleteDeck(deck.id)}>Ta bort</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ── Deck Editor ───────────────────────────────────────────────────
function DeckEditor({ deck, themes, tags, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: deck?.name||"", description: deck?.description||"",
    pair_type: deck?.pair_type||"vocabulary",
    front_lang: deck?.front_lang||"en", back_lang: deck?.back_lang||"sv",
    color: deck?.color||"#c84b2f", theme_icon: deck?.theme_icon||"📚",
    is_public: deck?.is_public||false,
    theme_ids: deck?.theme_ids||[], tag_ids: deck?.tag_ids||[],
    ...(deck?.id ? {id: deck.id} : {}),
  });

  const f = v => setForm(prev=>({...prev,...v}));
  const ICONS = ["📚","🇬🇧","🇸🇪","🇩🇪","🇫🇷","🇪🇸","🇯🇵","🔬","💊","⚖️","💻","🧮","🎵","🏛️","🌍","🎨","⭐","🐾","🍎","🧍","🏠","🌿","🚗","👕","📐","⚽","🎯"];
  const COLORS = ["#c84b2f","#2f7dc8","#2a7a4f","#7a2f8f","#c87a2f","#1a3a5c","#5a2f7a","#c82f4b","#2fa87a","#8f2fc8"];

  function toggleArr(arr, id) { return arr.includes(id) ? arr.filter(x=>x!==id) : [...arr,id]; }

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Redigera ordlista">
      <div className="editor-card">
        <h2>{deck?.id?"Redigera ordlista":"Ny ordlista"}</h2>

        <div className="form-field">
          <label className="form-label" htmlFor="deck-name">Namn *</label>
          <input id="deck-name" className="form-input" value={form.name} onChange={e=>f({name:e.target.value})} required />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="deck-desc">Beskrivning</label>
          <input id="deck-desc" className="form-input" value={form.description} onChange={e=>f({description:e.target.value})} />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Typ av par</label>
            <select className="form-input" value={form.pair_type} onChange={e=>f({pair_type:e.target.value})}>
              <option value="vocabulary">Glospar (olika språk)</option>
              <option value="concept">Begreppspar (samma språk)</option>
            </select>
          </div>
        </div>

        {form.pair_type==="vocabulary" ? (
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="front-lang">Framsida språk *</label>
              <select id="front-lang" className="form-input" value={form.front_lang} onChange={e=>f({front_lang:e.target.value})}>
                {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="back-lang">Baksida språk *</label>
              <select id="back-lang" className="form-input" value={form.back_lang} onChange={e=>f({back_lang:e.target.value})}>
                {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className="form-field">
            <label className="form-label" htmlFor="concept-lang">Språk</label>
            <select id="concept-lang" className="form-input" value={form.front_lang} onChange={e=>f({front_lang:e.target.value,back_lang:e.target.value})}>
              {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
            </select>
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Ikon</label>
          <div className="icon-picker">
            {ICONS.map(ic=><button key={ic} type="button" className={cn("icon-opt",form.theme_icon===ic&&"active")} onClick={()=>f({theme_icon:ic})} aria-pressed={form.theme_icon===ic}>{ic}</button>)}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Färg</label>
          <div className="color-picker">
            {COLORS.map(c=><button key={c} type="button" className={cn("color-opt",form.color===c&&"active")} style={{background:c}} onClick={()=>f({color:c})} aria-label={`Välj färg ${c}`} aria-pressed={form.color===c} />)}
          </div>
        </div>

        {themes.length>0 && (
          <div className="form-field">
            <label className="form-label">Teman</label>
            <div className="tag-picker">
              {themes.map(t=>(
                <button key={t.id} type="button" className={cn("tag-chip",form.theme_ids.includes(t.id)&&"active")} onClick={()=>f({theme_ids:toggleArr(form.theme_ids,t.id)})} aria-pressed={form.theme_ids.includes(t.id)}>
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="form-label checkbox-label">
          <input type="checkbox" checked={form.is_public} onChange={e=>f({is_public:e.target.checked})} />
          <span>Gör listan publik (synlig för alla)</span>
        </label>

        <div className="editor-actions">
          <button className="btn-primary" onClick={()=>form.name.trim()&&onSave(form)} disabled={!form.name.trim()}>Spara</button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HOME VIEW (dashboard för en deck)
// ─────────────────────────────────────────────────────────────────
function HomeView({ deck, cards, tags, themes, progress, onStudy, onUpdate }) {
  const due = cards.filter(c => {
    const p = progress[c.id];
    if (!p || !p.next_review) return true;
    return new Date(p.next_review) <= new Date();
  });
  const total = cards.length;
  const withIcon = cards.filter(c=>c.front_emoji||c.front_icon).length;
  const correct = Object.values(progress).reduce((s,p)=>s+(p.correct||0),0);
  const wrong = Object.values(progress).reduce((s,p)=>s+(p.wrong||0),0);
  const accuracy = correct+wrong>0 ? Math.round(100*correct/(correct+wrong)) : null;
  const favorites = Object.values(progress).filter(p=>p.is_favorite).length;

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1 className="view-title">{deck.theme_icon} {deck.name}</h1>
          <p className="view-sub">{deck.description||"Välj hur du vill träna."}</p>
        </div>
      </div>

      <div className="stats-row">
        <StatCard label="Att repetera" value={due.length} accent={due.length>0} />
        <StatCard label="Totalt" value={total} />
        <StatCard label="Träffsäkerhet" value={accuracy!==null?`${accuracy}%`:"–"} />
        <StatCard label="Favoriter" value={favorites} />
        <StatCard label="Med ikon" value={withIcon} />
      </div>

      <div className="home-study-options">
        <h2 className="section-title">Träna</h2>
        <div className="study-btns-grid">
          <button className="study-opt-card" onClick={()=>onStudy({direction:"front",onlyFlagged:false,onlyWithIcon:false})}>
            <span className="study-opt-icon" aria-hidden="true">🃏</span>
            <span>Hela listan</span>
            <span className="study-opt-count">{total} kort</span>
          </button>
          <button className="study-opt-card" onClick={()=>onStudy({direction:"front",onlyFlagged:false,onlyWithIcon:false,onlyDue:true})}>
            <span className="study-opt-icon" aria-hidden="true">⏰</span>
            <span>Dags att repetera</span>
            <span className="study-opt-count">{due.length} kort</span>
          </button>
          <button className="study-opt-card" onClick={()=>onStudy({direction:"back",onlyFlagged:false,onlyWithIcon:false})}>
            <span className="study-opt-icon" aria-hidden="true">🔄</span>
            <span>Baksidan först</span>
            <span className="study-opt-count">{total} kort</span>
          </button>
          {withIcon>0 && (
            <button className="study-opt-card" onClick={()=>onStudy({onlyWithIcon:true,direction:"front"})}>
              <span className="study-opt-icon" aria-hidden="true">🖼️</span>
              <span>Bara med ikon/emoji</span>
              <span className="study-opt-count">{withIcon} kort</span>
            </button>
          )}
          {favorites>0 && (
            <button className="study-opt-card" onClick={()=>onStudy({onlyFavorites:true,direction:"front"})}>
              <span className="study-opt-icon" aria-hidden="true">⭐</span>
              <span>Favoriter</span>
              <span className="study-opt-count">{favorites} kort</span>
            </button>
          )}
        </div>

        {tags.length>0 && (
          <div className="home-tag-section">
            <h3 className="section-title">Öva per tagg</h3>
            <div className="tags-row">
              {tags.map(tag=>(
                <button key={tag.id} className="tag-chip-study" style={{"--tc":tag.color||"#6b9bce"}} onClick={()=>onStudy({tagId:tag.id,direction:"front"})}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={cn("stat-card",accent&&"stat-card-accent")}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STUDY VIEW
// ─────────────────────────────────────────────────────────────────
function StudyView({ cards, tags, themes, progress, config, onProgressUpdate, uid, cardsShownRef }) {
  const { tagId, themeId, direction="front", onlyFlagged, onlyWithIcon, onlyDue, onlyFavorites } = config;

  const queue = useMemo(() => {
    let q = [...cards];
    if (tagId) q = q.filter(c=>(c.tag_ids||[]).includes(tagId));
    if (themeId) q = q.filter(c=>(c.theme_ids||[]).includes(themeId));
    if (onlyWithIcon) q = q.filter(c=>c.front_emoji||c.front_icon);
    if (onlyDue) q = q.filter(c=>{
      const p=progress[c.id]; if(!p||!p.next_review) return true;
      return new Date(p.next_review)<=new Date();
    });
    if (onlyFavorites) q = q.filter(c=>progress[c.id]?.is_favorite);
    // Shuffle
    return q.sort(()=>Math.random()-0.5);
  }, [cards, tagId, themeId, onlyWithIcon, onlyDue, onlyFavorites, progress]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  const card = queue[idx];

  useEffect(() => { setFlipped(false); setAnswered(false); }, [idx]);

  async function answer(correct) {
    if (!card) return;
    const prev = progress[card.id] || { correct:0, wrong:0, streak:0 };
    const newCorrect = prev.correct + (correct?1:0);
    const newWrong = prev.wrong + (correct?0:1);
    const newStreak = correct ? prev.streak+1 : 0;
    const payload = {
      user_id: uid, card_id: card.id,
      correct: newCorrect, wrong: newWrong, streak: newStreak,
      last_seen: new Date().toISOString(),
      next_review: nextReviewDate(newCorrect, newWrong, newStreak),
    };
    await supabase.from("progress").upsert(payload, { onConflict: "user_id,card_id" });
    // Increment view count
    await supabase.from("cards").update({ view_count: (card.view_count||0)+1 }).eq("id", card.id);
    if (cardsShownRef) cardsShownRef.current++;
    if (correct) setSessionCorrect(s=>s+1); else setSessionWrong(s=>s+1);
    setAnswered(true);
    onProgressUpdate();
  }

  async function toggleFavorite() {
    if (!card) return;
    const prev = progress[card.id] || {};
    await supabase.from("progress").upsert({ user_id:uid, card_id:card.id, is_favorite:!prev.is_favorite }, {onConflict:"user_id,card_id"});
    onProgressUpdate();
  }

  async function flagCard() {
    if (!card) return;
    const reason = prompt("Varför flaggar du detta kort? (valfritt)");
    await supabase.from("cards").update({ is_flagged:true, flag_reason:reason||"", flag_count:(card.flag_count||0)+1 }).eq("id", card.id);
    await logEvent(uid, "card_flagged", { card_id: card.id, reason });
    alert("Kortet är flaggat. Tack!");
    next();
  }

  function next() {
    if (idx+1 >= queue.length) setDone(true);
    else setIdx(i=>i+1);
  }

  if (queue.length===0) return (
    <div className="view center-msg">
      <p className="muted">Inga kort att träna just nu.</p>
    </div>
  );

  if (done) return (
    <div className="view center-msg">
      <div className="done-card">
        <div className="done-emoji" aria-hidden="true">🎉</div>
        <h2>Bra jobbat!</h2>
        <p>{queue.length} kort genomgångna</p>
        <div className="done-stats">
          <span className="correct-txt">✓ {sessionCorrect} rätt</span>
          <span className="wrong-txt">✗ {sessionWrong} fel</span>
        </div>
        <button className="btn-primary" onClick={()=>{setIdx(0);setDone(false);setSessionCorrect(0);setSessionWrong(0);}}>Öva igen</button>
      </div>
    </div>
  );

  const showFront = direction==="front" ? !flipped : flipped;
  const frontText = direction==="front" ? card.front : card.back;
  const backText = direction==="front" ? card.back : card.front;
  const frontEmoji = direction==="front" ? card.front_emoji : card.back_emoji;
  const frontIcon = direction==="front" ? card.front_icon : card.back_icon;
  const isFav = progress[card.id]?.is_favorite;

  return (
    <div className="view study-view">
      <div className="study-progress-bar" aria-label={`Kort ${idx+1} av ${queue.length}`}>
        <div className="study-progress-fill" style={{width:`${((idx)/queue.length)*100}%`}} />
      </div>
      <div className="study-counter">{idx+1} / {queue.length}</div>

      <div
        className={cn("flashcard", flipped&&"flipped")}
        onClick={()=>setFlipped(f=>!f)}
        role="button"
        tabIndex={0}
        aria-label={showFront ? `Framsida: ${frontText}. Tryck för att vända.` : `Baksida: ${backText}. Tryck för att vända.`}
        onKeyDown={e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();setFlipped(f=>!f);}}}
      >
        <div className="flashcard-inner">
          <div className="flashcard-front">
            {frontEmoji && <div className="card-emoji" aria-hidden="true">{frontEmoji}</div>}
            {frontIcon && !frontEmoji && <img className="card-icon" src={frontIcon} alt="" aria-hidden="true" />}
            <div className="card-word">{frontText}</div>
            <div className="card-flip-hint">Klicka för att vända ↩</div>
          </div>
          <div className="flashcard-back">
            {card.back_emoji && direction==="front" && <div className="card-emoji" aria-hidden="true">{card.back_emoji}</div>}
            <div className="card-word">{backText}</div>
            {card.notes && <div className="card-notes">{card.notes}</div>}
            <div className="card-flip-hint">Klicka för att vända ↩</div>
          </div>
        </div>
      </div>

      <div className="study-actions">
        {!answered && flipped && (
          <>
            <button className="btn-wrong" onClick={()=>answer(false)} aria-label="Fel svar">✗ Fel</button>
            <button className="btn-correct" onClick={()=>answer(true)} aria-label="Rätt svar">✓ Rätt</button>
          </>
        )}
        {answered && (
          <button className="btn-primary" onClick={next} autoFocus>Nästa →</button>
        )}
        {!answered && !flipped && (
          <button className="btn-ghost" onClick={()=>setFlipped(true)}>Visa svar</button>
        )}
      </div>

      <div className="study-meta-actions">
        <button className={cn("btn-icon",isFav&&"active")} onClick={toggleFavorite} aria-label={isFav?"Ta bort favorit":"Markera som favorit"} aria-pressed={isFav} title="Favorit">⭐</button>
        <button className="btn-icon btn-flag" onClick={flagCard} aria-label="Flagga kortet som felaktigt" title="Flagga">🚩</button>
        <button className="btn-icon" onClick={next} aria-label="Hoppa över kortet" title="Hoppa över">⟩</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CARDS VIEW (hantera kort i en lista)
// ─────────────────────────────────────────────────────────────────
function CardsView({ cards, tags, themes, onUpdate, uid, deckId }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const filtered = cards.filter(c =>
    (c.front+c.back+(c.notes||"")).toLowerCase().includes(search.toLowerCase()) &&
    (!filterTag || (c.tag_ids||[]).includes(filterTag))
  );

  async function saveCard(data) {
    if (data.id) await supabase.from("cards").update(data).eq("id", data.id);
    else await supabase.from("cards").insert({...data, user_id:uid, deck_id:deckId});
    setShowEditor(false); setEditing(null); onUpdate();
  }
  async function deleteCard(id) {
    if (!confirm("Ta bort kortet?")) return;
    await supabase.from("cards").delete().eq("id", id); onUpdate();
  }

  return (
    <div className="view">
      <div className="view-header">
        <div><h1 className="view-title">Kort ({cards.length})</h1></div>
        <button className="btn-primary" onClick={()=>{setEditing(null);setShowEditor(true);}}>+ Nytt kort</button>
      </div>
      <div className="toolbar">
        <input className="search-input" type="search" placeholder="Sök kort…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Sök kort" />
        {tags.length>0 && (
          <select className="select-sm" value={filterTag} onChange={e=>setFilterTag(e.target.value)} aria-label="Filtrera tagg">
            <option value="">Alla taggar</option>
            {tags.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      </div>

      {showEditor && <CardEditor card={editing} tags={tags} themes={themes} deckId={deckId} onSave={saveCard} onCancel={()=>{setShowEditor(false);setEditing(null);}} />}

      <div className="cards-table-wrap">
        <table className="cards-table" aria-label="Kort i listan">
          <thead>
            <tr>
              <th scope="col">Framsida</th>
              <th scope="col">Baksida</th>
              <th scope="col">Kommentar</th>
              <th scope="col">Svårighet</th>
              <th scope="col">Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(card=>(
              <tr key={card.id} className={cn(card.is_flagged&&"row-flagged")}>
                <td>
                  {card.front_emoji && <span aria-hidden="true">{card.front_emoji} </span>}
                  {card.front}
                  {card.is_flagged && <span className="flag-indicator" title={card.flag_reason||"Flaggad"} aria-label="Flaggad">🚩</span>}
                </td>
                <td>{card.back_emoji && <span aria-hidden="true">{card.back_emoji} </span>}{card.back}</td>
                <td className="notes-cell">{card.notes}</td>
                <td><DifficultyDots n={card.difficulty||2} /></td>
                <td>
                  <button className="btn-sm btn-ghost-sm" onClick={()=>{setEditing(card);setShowEditor(true);}}>Redigera</button>
                  <button className="btn-sm btn-danger-sm" onClick={()=>deleteCard(card.id)}>Ta bort</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <p className="muted center-msg">Inga kort hittades.</p>}
      </div>
    </div>
  );
}

function DifficultyDots({ n }) {
  return (
    <span className="difficulty-dots" aria-label={`Svårighet ${n} av 5`}>
      {[1,2,3,4,5].map(i=><span key={i} className={cn("dot",i<=n&&"dot-filled")} aria-hidden="true" />)}
    </span>
  );
}

// ── Card Editor ───────────────────────────────────────────────────
function CardEditor({ card, tags, themes, deckId, onSave, onCancel }) {
  const [form, setForm] = useState({
    front: card?.front||"", back: card?.back||"",
    notes: card?.notes||"",
    front_emoji: card?.front_emoji||"", back_emoji: card?.back_emoji||"",
    front_icon: card?.front_icon||"", back_icon: card?.back_icon||"",
    difficulty: card?.difficulty||2,
    tag_ids: card?.tag_ids||[], theme_ids: card?.theme_ids||[],
    ...(card?.id?{id:card.id}:{}),
  });
  const f = v=>setForm(p=>({...p,...v}));

  function toggleArr(arr,id){ return arr.includes(id)?arr.filter(x=>x!==id):[...arr,id]; }

  function autoIcon(word, side) {
    const url = lookupIcon(word);
    if (url) f({ [`${side}_icon`]: url });
  }

  function handleImageUpload(e, side) {
    const file = e.target.files[0]; if(!file) return;
    if(file.size > 512*1024) { alert("Bild max 512 KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => f({ [`${side}_icon`]: ev.target.result });
    reader.readAsDataURL(file);
  }

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Redigera kort">
      <div className="editor-card editor-card-wide">
        <h2>{card?.id?"Redigera kort":"Nytt kort"}</h2>
        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="card-front">Framsida (ord/begrepp) *</label>
            <input id="card-front" className="form-input" value={form.front} onChange={e=>f({front:e.target.value})} required />
            <div className="icon-row">
              <input className="form-input form-input-sm" placeholder="Emoji 🐶" value={form.front_emoji} onChange={e=>f({front_emoji:e.target.value})} aria-label="Emoji framsida" />
              <button type="button" className="btn-sm btn-ghost-sm" onClick={()=>autoIcon(form.front,"front")} title="Auto-ikon">🔍 Auto</button>
              <label className="btn-sm btn-ghost-sm file-btn" aria-label="Ladda upp bild framsida">
                📷 Bild<input type="file" accept="image/*" className="sr-only" onChange={e=>handleImageUpload(e,"front")} />
              </label>
              {form.front_icon && <img src={form.front_icon} alt="Framsida ikon" className="icon-preview" />}
              {form.front_icon && <button type="button" className="btn-sm btn-danger-sm" onClick={()=>f({front_icon:""})}>✕</button>}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="card-back">Baksida (översättning/förklaring) *</label>
            <input id="card-back" className="form-input" value={form.back} onChange={e=>f({back:e.target.value})} required />
            <div className="icon-row">
              <input className="form-input form-input-sm" placeholder="Emoji 🐕" value={form.back_emoji} onChange={e=>f({back_emoji:e.target.value})} aria-label="Emoji baksida" />
              <button type="button" className="btn-sm btn-ghost-sm" onClick={()=>autoIcon(form.back,"back")} title="Auto-ikon">🔍 Auto</button>
              <label className="btn-sm btn-ghost-sm file-btn" aria-label="Ladda upp bild baksida">
                📷 Bild<input type="file" accept="image/*" className="sr-only" onChange={e=>handleImageUpload(e,"back")} />
              </label>
              {form.back_icon && <img src={form.back_icon} alt="Baksida ikon" className="icon-preview" />}
              {form.back_icon && <button type="button" className="btn-sm btn-danger-sm" onClick={()=>f({back_icon:""})}>✕</button>}
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="card-notes">Kommentar/förklaring (visas på baksidan)</label>
          <textarea id="card-notes" className="form-input form-textarea" value={form.notes} onChange={e=>f({notes:e.target.value})} rows={2} />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Svårighet</label>
            <div className="difficulty-selector" role="group" aria-label="Välj svårighet">
              {[1,2,3,4,5].map(n=>(
                <button key={n} type="button" className={cn("diff-btn",form.difficulty===n&&"active")} onClick={()=>f({difficulty:n})} aria-pressed={form.difficulty===n}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {tags.length>0 && (
          <div className="form-field">
            <label className="form-label">Taggar</label>
            <div className="tag-picker">
              {tags.map(t=>(
                <button key={t.id} type="button" className={cn("tag-chip",form.tag_ids.includes(t.id)&&"active")} style={{"--tc":t.color}} onClick={()=>f({tag_ids:toggleArr(form.tag_ids,t.id)})} aria-pressed={form.tag_ids.includes(t.id)}>{t.name}</button>
              ))}
            </div>
          </div>
        )}

        {themes.length>0 && (
          <div className="form-field">
            <label className="form-label">Teman</label>
            <div className="tag-picker">
              {themes.map(t=>(
                <button key={t.id} type="button" className={cn("tag-chip",form.theme_ids.includes(t.id)&&"active")} onClick={()=>f({theme_ids:toggleArr(form.theme_ids,t.id)})} aria-pressed={form.theme_ids.includes(t.id)}>{t.icon} {t.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="editor-actions">
          <button className="btn-primary" onClick={()=>form.front.trim()&&form.back.trim()&&onSave(form)} disabled={!form.front.trim()||!form.back.trim()}>Spara</button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

function ImportView({ deck, uid, onUpdate }) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function parseCSV(text) {
    return text.trim().split("\n").map(line => {
      const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
      return { front: parts[0]||"", back: parts[1]||"", notes: parts[2]||"", front_emoji: parts[3]||"" };
    }).filter(r => r.front && r.back);
  }

  useEffect(() => { if (csv) setPreview(parseCSV(csv).slice(0, 5)); else setPreview([]); }, [csv]);

  async function doImport() {
    setBusy(true); setStatus("");
    const rows = parseCSV(csv);
    if (!rows.length) { setStatus("Inga giltiga rader hittades."); setBusy(false); return; }
    const inserts = rows.map(r => ({ ...r, user_id: uid, deck_id: deck.id }));
    const { error } = await supabase.from("cards").insert(inserts);
    if (error) { setStatus("Fel: " + error.message); }
    else {
      await logEvent(uid, "data_imported", { deck_id: deck.id, count: rows.length });
      setStatus(`✓ ${rows.length} kort importerade!`); setCsv(""); onUpdate();
    }
    setBusy(false);
  }

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Importera kort</h1>
      </div>
      <div className="import-box">
        <p className="import-format">Format per rad: <code>ord1, ord2, kommentar, emoji</code> (kommentar och emoji är valfria)</p>
        <p className="import-format">Exempel: <code>hund, dog, En fyrbent vän, 🐶</code></p>
        <textarea
          className="form-input form-textarea import-textarea"
          value={csv}
          onChange={e => setCsv(e.target.value)}
          placeholder={"hund, dog, En fyrbent vän, 🐶\nkatt, cat,,🐱\nfågel, bird"}
          rows={10}
          aria-label="CSV-data"
        />
        {preview.length > 0 && (
          <div className="import-preview">
            <strong>Förhandsgranskning ({preview.length} av {parseCSV(csv).length} rader):</strong>
            <table className="cards-table">
              <thead><tr><th>Framsida</th><th>Baksida</th><th>Kommentar</th><th>Emoji</th></tr></thead>
              <tbody>{preview.map((r, i) => <tr key={i}><td>{r.front}</td><td>{r.back}</td><td>{r.notes}</td><td>{r.front_emoji}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {status && <div className={cn("import-status", status.startsWith("✓") ? "import-ok" : "import-err")} role="status">{status}</div>}
        <button className="btn-primary" onClick={doImport} disabled={!csv.trim() || busy} aria-busy={busy}>
          {busy ? "Importerar…" : "Importera"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXPLORE VIEW (publika listor)
// ─────────────────────────────────────────────────────────────────
function ExploreView({ uid, tags, themes, onImport }) {
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const { data } = await supabase.from("decks").select("*").eq("is_public",true).eq("is_active",true).order("use_count",{ascending:false});
      setDecks(data||[]); setLoading(false);
    })();
  },[]);

  async function copyDeck(srcDeck) {
    // Copy deck
    const { data: nd } = await supabase.from("decks").insert({
      user_id:uid, name:`${srcDeck.name} (kopia)`, description:srcDeck.description,
      pair_type:srcDeck.pair_type, front_lang:srcDeck.front_lang, back_lang:srcDeck.back_lang,
      color:srcDeck.color, theme_icon:srcDeck.theme_icon,
    }).select().single();
    if (!nd) return;
    // Copy cards
    const { data: srcCards } = await supabase.from("cards").select("*").eq("deck_id",srcDeck.id);
    if (srcCards?.length) {
      await supabase.from("cards").insert(srcCards.map(c=>({
        user_id:uid, deck_id:nd.id, front:c.front, back:c.back, notes:c.notes,
        front_emoji:c.front_emoji, back_emoji:c.back_emoji, difficulty:c.difficulty,
        tag_ids:c.tag_ids, theme_ids:c.theme_ids,
      })));
    }
    // Increment use_count
    await supabase.from("decks").update({use_count:(srcDeck.use_count||0)+1}).eq("id",srcDeck.id);
    await logEvent(uid,"data_imported",{from_deck:srcDeck.id,name:srcDeck.name});
    onImport(); alert("Ordlistan kopierades till dina listor!");
  }

  const filtered = decks.filter(d=>d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Utforska publika listor</h1>
      </div>
      <div className="toolbar">
        <input className="search-input" type="search" placeholder="Sök lista…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Sök publika listor" />
      </div>
      {loading && <p className="muted">Laddar…</p>}
      <div className="decks-grid">
        {filtered.map(deck=>(
          <article key={deck.id} className="deck-card" style={{"--dc":deck.color||"#c84b2f"}}>
            <div className="deck-card-top">
              <span className="deck-icon" aria-hidden="true">{deck.theme_icon||"📚"}</span>
              <span className="badge badge-green">Publik</span>
            </div>
            <h2 className="deck-name">{deck.name}</h2>
            {deck.description && <p className="deck-desc">{deck.description}</p>}
            <div className="deck-meta">
              <span>{LANG_FLAGS[deck.front_lang]||"?"} → {LANG_FLAGS[deck.back_lang]||"?"}</span>
              <span>Använd {deck.use_count||0}×</span>
            </div>
            <button className="btn-sm" onClick={()=>copyDeck(deck)}>Kopiera till mina listor</button>
          </article>
        ))}
        {!loading && filtered.length===0 && <p className="muted center-msg">Inga publika listor hittades.</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STUDY BY THEME (träna ett tema från alla listor)
// ─────────────────────────────────────────────────────────────────
function StudyThemeView({ uid, themes, tags, onStart }) {
  const [selected, setSelected] = useState(null);
  const [cards, setCards] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [onlyWithIcon, setOnlyWithIcon] = useState(false);

  async function loadThemeCards(themeId) {
    setLoading(true);
    const [{ data: c }, { data: p }] = await Promise.all([
      supabase.from("cards").select("*").contains("theme_ids",[themeId]).eq("user_id",uid),
      supabase.from("progress").select("*").eq("user_id",uid),
    ]);
    setCards(c||[]);
    const pm={}; (p||[]).forEach(r=>pm[r.card_id]=r); setProgress(pm);
    setLoading(false);
  }

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Öva ett tema</h1>
        <p className="view-sub">Träna ord från alla dina listor som har ett visst tema.</p>
      </div>
      <div className="themes-grid">
        {themes.map(t=>(
          <button key={t.id} className={cn("theme-card",selected?.id===t.id&&"active")} style={{"--tc":t.color||"#c84b2f"}} onClick={()=>{ setSelected(t); loadThemeCards(t.id); }}>
            <span className="theme-card-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>
      {selected && !loading && (
        <div className="theme-start-box">
          <p>{cards.length} kort med temat <strong>{selected.icon} {selected.name}</strong></p>
          <label className="form-label checkbox-label">
            <input type="checkbox" checked={onlyWithIcon} onChange={e=>setOnlyWithIcon(e.target.checked)} />
            <span>Bara kort med ikon/emoji</span>
          </label>
          {cards.length>0
            ? <button className="btn-primary" onClick={()=>onStart({themeId:selected.id,onlyWithIcon,direction:"front"})}>Starta träning →</button>
            : <p className="muted">Inga kort i detta tema ännu.</p>
          }
        </div>
      )}
      {loading && <p className="muted">Laddar…</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// GLOBAL STATS VIEW
// ─────────────────────────────────────────────────────────────────
function GlobalStatsView({ uid, decks }) {
  const [progress, setProgress] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      const [{ data:p },{ data:c }] = await Promise.all([
        supabase.from("progress").select("*").eq("user_id",uid),
        supabase.from("cards").select("id,deck_id,front,back").eq("user_id",uid),
      ]);
      setProgress(p||[]); setCards(c||[]); setLoading(false);
    })();
  },[uid]);

  const totalCorrect = progress.reduce((s,p)=>s+(p.correct||0),0);
  const totalWrong = progress.reduce((s,p)=>s+(p.wrong||0),0);
  const accuracy = totalCorrect+totalWrong>0 ? Math.round(100*totalCorrect/(totalCorrect+totalWrong)) : null;
  const favorites = progress.filter(p=>p.is_favorite).length;
  const streakers = progress.filter(p=>(p.streak||0)>=3).sort((a,b)=>b.streak-a.streak).slice(0,5);

  if (loading) return <div className="view"><p className="muted">Laddar…</p></div>;

  return (
    <div className="view">
      <h1 className="view-title">Min statistik</h1>
      <div className="stats-row">
        <StatCard label="Listor" value={decks.length} />
        <StatCard label="Kort" value={cards.length} />
        <StatCard label="Totalt rätt" value={totalCorrect} />
        <StatCard label="Totalt fel" value={totalWrong} />
        <StatCard label="Träffsäkerhet" value={accuracy!==null?`${accuracy}%`:"–"} />
        <StatCard label="Favoriter" value={favorites} />
      </div>

      {streakers.length>0 && (
        <div className="stats-section">
          <h2 className="section-title">Bästa streak</h2>
          <ul className="streak-list">
            {streakers.map(p=>{
              const card = cards.find(c=>c.id===p.card_id);
              return <li key={p.id} className="streak-item"><span>{card?.front||"?"} → {card?.back||"?"}</span><span className="streak-badge">🔥 {p.streak}</span></li>;
            })}
          </ul>
        </div>
      )}

      <div className="stats-section">
        <h2 className="section-title">Per ordlista</h2>
        <table className="cards-table">
          <thead><tr><th>Lista</th><th>Rätt</th><th>Fel</th><th>Träffsäkerhet</th></tr></thead>
          <tbody>
            {decks.map(deck=>{
              const deckCards = cards.filter(c=>c.deck_id===deck.id);
              const deckProg = progress.filter(p=>deckCards.some(c=>c.id===p.card_id));
              const c = deckProg.reduce((s,p)=>s+(p.correct||0),0);
              const w = deckProg.reduce((s,p)=>s+(p.wrong||0),0);
              const acc = c+w>0?Math.round(100*c/(c+w)):null;
              return (
                <tr key={deck.id}>
                  <td>{deck.theme_icon} {deck.name}</td>
                  <td>{c}</td><td>{w}</td>
                  <td>{acc!==null?`${acc}%`:"–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROFILE VIEW (GDPR etc.)
// ─────────────────────────────────────────────────────────────────
function ProfileView({ profile, uid, onUpdate }) {
  const [username, setUsername] = useState(profile?.username||"");
  const [msg, setMsg] = useState("");
  const [showGdpr, setShowGdpr] = useState(false);

  const roleLabels = { sysadmin:"Systemadministratör", group_manager:"Gruppansvarig", user:"Användare" };
  const planLabels = { free:"Gratis", paid:"Betald" };

  async function saveProfile() {
    await supabase.from("profiles").update({ username }).eq("id", uid);
    setMsg("Sparat!"); setTimeout(()=>setMsg(""),2000); onUpdate();
  }

  async function deletePersonalData() {
    if (!confirm("Radera dina personuppgifter? Dina anonyma användningsdata bevaras. Ditt konto inaktiveras.")) return;
    if (!confirm("Är du säker? Detta kan inte ångras.")) return;
    // Anonymize
    await supabase.from("profiles").update({ username:"[raderad]", gdpr_deleted:true, is_active:false }).eq("id", uid);
    // Keep progress but anonymize – set user_id in log to null for old records would need server-side function
    await logEvent(uid, "account_deleted", { anonymized: true });
    await supabase.auth.signOut();
  }

  return (
    <div className="view">
      <h1 className="view-title">Min profil</h1>
      <div className="profile-card">
        <div className="profile-info-box">
          <div className="profile-avatar" aria-hidden="true">👤</div>
          <div>
            <div className="profile-name">{profile?.username || "(inget användarnamn)"}</div>
            <div className="profile-role-badge">{roleLabels[profile?.role] || profile?.role}</div>
            <div className="profile-plan-badge">{planLabels[profile?.plan] || profile?.plan} plan</div>
          </div>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="profile-username">Användarnamn</label>
          <input id="profile-username" className="form-input" value={username} onChange={e=>setUsername(e.target.value)} />
        </div>
        <div className="profile-meta">
          <span>Roll: <strong>{roleLabels[profile?.role] || "–"}</strong></span>
          <span>Plan: <strong>{planLabels[profile?.plan] || "–"}</strong></span>
          <span>Medlem sedan: <strong>{fmtDate(profile?.created_at)}</strong></span>
        </div>
        {msg && <div className="auth-info" role="status">{msg}</div>}
        <button className="btn-primary" onClick={saveProfile}>Spara</button>

        <hr className="profile-hr" />
        <h2 className="section-title">GDPR &amp; Integritet</h2>
        <button className="btn-ghost" onClick={()=>setShowGdpr(s=>!s)}>
          {showGdpr?"Dölj":"Visa"} mina rättigheter
        </button>
        {showGdpr && (
          <div className="gdpr-box">
            <p>Du har rätt att:</p>
            <ul>
              <li>Begära ut dina uppgifter (kontakta support)</li>
              <li>Rätta felaktiga uppgifter (använd formuläret ovan)</li>
              <li>Radera dina personuppgifter (anonymisering nedan)</li>
              <li>Invända mot behandling</li>
            </ul>
            <p>Anonymiserad statistik (utan koppling till dig) kan behållas för systemförbättringar.</p>
          </div>
        )}
        <button className="btn-danger" onClick={deletePersonalData}>Radera mina personuppgifter</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ADMIN VIEW
// ─────────────────────────────────────────────────────────────────
function AdminView({ uid, themes, tags, onUpdate }) {
  const [tab, setTab] = useState("stats");
  const tabs = [
    { id:"stats", label:"📊 Statistik" },
    { id:"cards", label:"🃏 Kort" },
    { id:"users", label:"👥 Användare" },
    { id:"tags", label:"🏷️ Taggar" },
    { id:"themes", label:"🎨 Teman" },
    { id:"log", label:"📋 Logg" },
    { id:"import", label:"📥 Import" },
    { id:"docs", label:"📖 Dokumentation" },
  ];

  return (
    <div className="view admin-view admin-bg">
      <div className="admin-header-bar">
        <span className="admin-badge" aria-label="Administratörspanel">⚙️ Administratörspanel</span>
      </div>
      <h1 className="view-title">Administration</h1>
      <div className="admin-tabs" role="tablist">
        {tabs.map(t=><button key={t.id} role="tab" aria-selected={tab===t.id} className={cn("admin-tab",tab===t.id&&"active")} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      <div className="admin-panel">
        {tab==="stats" && <AdminStats />}
        {tab==="cards" && <AdminCards tags={tags} themes={themes} onUpdate={onUpdate} />}
        {tab==="users" && <AdminUsers uid={uid} />}
        {tab==="tags" && <AdminTags tags={tags} uid={uid} onUpdate={onUpdate} />}
        {tab==="themes" && <AdminThemes themes={themes} uid={uid} onUpdate={onUpdate} />}
        {tab==="log" && <AdminLog />}
        {tab==="import" && <AdminImport uid={uid} tags={tags} themes={themes} onUpdate={onUpdate} />}
        {tab==="docs" && <DevDocs />}
      </div>
    </div>
  );
}

// ── Admin: Stats ──────────────────────────────────────────────────
function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(()=>{
    (async()=>{
      const [
        {count:decks},{count:cards},{count:users},{count:views},{data:wrong}
      ] = await Promise.all([
        supabase.from("decks").select("*",{count:"exact",head:true}),
        supabase.from("cards").select("*",{count:"exact",head:true}),
        supabase.from("profiles").select("*",{count:"exact",head:true}),
        supabase.from("progress").select("correct",{count:"exact",head:true}),
        supabase.from("cards").select("front,back,flag_count,view_count").order("flag_count",{ascending:false}).limit(10),
      ]);
      setStats({ decks,cards,users,views,wrong:wrong||[] });
    })();
  },[]);

  if (!stats) return <p className="muted">Laddar…</p>;
  return (
    <div>
      <div className="stats-row">
        <StatCard label="Ordlistor" value={stats.decks||0} />
        <StatCard label="Kort" value={stats.cards||0} />
        <StatCard label="Användare" value={stats.users||0} />
        <StatCard label="Kortvisningar" value={stats.views||0} />
      </div>
      {stats.wrong.filter(c=>c.flag_count>0).length>0 && (
        <div className="stats-section">
          <h3 className="section-title">Mest flaggade kort</h3>
          <table className="cards-table"><thead><tr><th>Framsida</th><th>Baksida</th><th>Flaggningar</th></tr></thead>
            <tbody>{stats.wrong.filter(c=>c.flag_count>0).map((c,i)=><tr key={i}><td>{c.front}</td><td>{c.back}</td><td>{c.flag_count}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin: Cards ──────────────────────────────────────────────────
function AdminCards({ tags, themes, onUpdate }) {
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkAction, setBulkAction] = useState("");

  async function load() {
    setLoading(true);
    let q = supabase.from("cards").select("*").order("created_at",{ascending:false});
    if (filter==="flagged") q=q.eq("is_flagged",true);
    else if (filter==="no_icon") q=q.eq("front_emoji","").eq("front_icon","");
    else if (filter==="no_tags") q=q.eq("tag_ids","{}");
    const { data } = await q; setCards(data||[]); setLoading(false);
  }

  useEffect(()=>{ load(); },[filter]);

  async function applyBulk() {
    if (!selected.length || !bulkAction) return;
    if (bulkAction==="deactivate") await supabase.from("cards").update({is_active:false}).in("id",selected);
    if (bulkAction==="activate") await supabase.from("cards").update({is_active:true}).in("id",selected);
    if (bulkAction==="delete") { if(!confirm("Ta bort valda kort?")) return; await supabase.from("cards").delete().in("id",selected); }
    if (bulkAction==="unflag") await supabase.from("cards").update({is_flagged:false}).in("id",selected);
    setSelected([]); load(); onUpdate();
  }

  const filtered = cards.filter(c=>(c.front+c.back).toLowerCase().includes(search.toLowerCase()));
  const toggleAll = () => setSelected(s=>s.length===filtered.length?[]:filtered.map(c=>c.id));

  return (
    <div>
      <div className="toolbar">
        <select className="select-sm" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">Alla kort</option>
          <option value="flagged">Flaggade</option>
          <option value="no_icon">Saknar ikon</option>
          <option value="no_tags">Saknar taggar</option>
        </select>
        <input className="search-input" type="search" placeholder="Sök kort…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Sök kort" />
        {selected.length>0 && (
          <>
            <select className="select-sm" value={bulkAction} onChange={e=>setBulkAction(e.target.value)} aria-label="Massåtgärd">
              <option value="">Välj åtgärd…</option>
              <option value="activate">Aktivera</option>
              <option value="deactivate">Inaktivera</option>
              <option value="unflag">Ta bort flaggning</option>
              <option value="delete">Ta bort</option>
            </select>
            <button className="btn-sm btn-primary-sm" onClick={applyBulk} disabled={!bulkAction}>Verkställ ({selected.length})</button>
          </>
        )}
      </div>
      {loading ? <p className="muted">Laddar…</p> : (
        <div className="cards-table-wrap">
          <table className="cards-table">
            <thead><tr>
              <th><input type="checkbox" checked={selected.length===filtered.length&&filtered.length>0} onChange={toggleAll} aria-label="Välj alla" /></th>
              <th>Framsida</th><th>Baksida</th><th>Kommentar</th>
              <th>Flaggad</th><th>Aktiv</th><th>Skapad</th>
            </tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id} className={cn(c.is_flagged&&"row-flagged",!c.is_active&&"row-inactive")}>
                  <td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>setSelected(s=>s.includes(c.id)?s.filter(x=>x!==c.id):[...s,c.id])} aria-label={`Välj ${c.front}`} /></td>
                  <td>{c.front_emoji} {c.front}</td>
                  <td>{c.back_emoji} {c.back}</td>
                  <td className="notes-cell">{c.notes}</td>
                  <td>{c.is_flagged?<span className="badge badge-red" title={c.flag_reason}>🚩 Ja</span>:"Nej"}</td>
                  <td>{c.is_active?"Ja":"Nej"}</td>
                  <td>{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <p className="muted center-msg">Inga kort.</p>}
        </div>
      )}
    </div>
  );
}

// ── Admin: Users ──────────────────────────────────────────────────
function AdminUsers({ uid: adminUid }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at",{ascending:false});
    setUsers(data||[]); setLoading(false);
  }
  useEffect(()=>{ load(); },[]);

  async function updateUser(userId, updates) {
    await supabase.from("profiles").update(updates).eq("id",userId); load();
  }

  async function deleteUser(userId) {
    if (!confirm("Inaktivera och anonymisera denna användare?")) return;
    await supabase.from("profiles").update({ is_active:false, username:"[raderad]", gdpr_deleted:true }).eq("id",userId);
    load();
  }

  const roleLabel = { sysadmin:"Systemadmin", group_manager:"Gruppansvarig", user:"Användare" };
  const planLabel = { free:"Gratis", paid:"Betald" };

  return (
    <div>
      {loading ? <p className="muted">Laddar…</p> : (
        <div className="cards-table-wrap">
          <table className="cards-table">
            <thead><tr><th>Användare</th><th>Roll</th><th>Plan</th><th>Aktiv</th><th>Senast aktiv</th><th>Skapad</th><th>Åtgärder</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} className={cn(!u.is_active&&"row-inactive")}>
                  <td>{u.gdpr_deleted?"[raderad]":u.username||u.id.slice(0,8)}</td>
                  <td>
                    <select className="select-xs" value={u.role} onChange={e=>updateUser(u.id,{role:e.target.value})} disabled={u.id===adminUid} aria-label="Roll">
                      <option value="user">Användare</option>
                      <option value="group_manager">Gruppansvarig</option>
                      <option value="sysadmin">Systemadmin</option>
                    </select>
                  </td>
                  <td>
                    <select className="select-xs" value={u.plan} onChange={e=>updateUser(u.id,{plan:e.target.value})} aria-label="Plan">
                      <option value="free">Gratis</option>
                      <option value="paid">Betald</option>
                    </select>
                  </td>
                  <td>
                    <button className={cn("btn-sm",u.is_active?"btn-ghost-sm":"btn-primary-sm")} onClick={()=>updateUser(u.id,{is_active:!u.is_active})}>
                      {u.is_active?"Inaktivera":"Aktivera"}
                    </button>
                  </td>
                  <td>{fmtDate(u.last_active)}</td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td>
                    {u.id!==adminUid && <button className="btn-sm btn-danger-sm" onClick={()=>deleteUser(u.id)}>Anonymisera</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin: Tags ───────────────────────────────────────────────────
function AdminTags({ tags, uid, onUpdate }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b9bce");

  async function createTag() {
    if (!name.trim()) return;
    await supabase.from("tags").insert({ name:name.trim(), color, scope:"global", user_id:uid });
    setName(""); onUpdate();
  }

  async function toggleTag(t) {
    await supabase.from("tags").update({ is_active: !t.is_active }).eq("id", t.id); onUpdate();
  }
  async function deleteTag(id) {
    if (!confirm("Ta bort tagg?")) return;
    await supabase.from("tags").delete().eq("id",id); onUpdate();
  }

  return (
    <div>
      <div className="form-row" style={{marginBottom:"16px"}}>
        <input className="form-input" placeholder="Ny taggnnamn" value={name} onChange={e=>setName(e.target.value)} aria-label="Taggnamn" />
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} aria-label="Färg" style={{height:"38px",padding:"2px",borderRadius:"6px",border:"1px solid var(--border)"}} />
        <button className="btn-primary" onClick={createTag} disabled={!name.trim()}>Skapa global tagg</button>
      </div>
      <table className="cards-table">
        <thead><tr><th>Tagg</th><th>Typ</th><th>Aktiv</th><th>Åtgärder</th></tr></thead>
        <tbody>
          {tags.map(t=>(
            <tr key={t.id} className={cn(!t.is_active&&"row-inactive")}>
              <td><span style={{display:"inline-block",width:12,height:12,borderRadius:"50%",background:t.color,marginRight:6,verticalAlign:"middle"}} aria-hidden="true" />{t.name}</td>
              <td>{t.scope==="global"?"Global":"Personlig"}</td>
              <td>{t.is_active?"Ja":"Nej"}</td>
              <td>
                <button className="btn-sm btn-ghost-sm" onClick={()=>toggleTag(t)}>{t.is_active?"Inaktivera":"Aktivera"}</button>
                {t.scope==="global" && <button className="btn-sm btn-danger-sm" onClick={()=>deleteTag(t.id)}>Ta bort</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Admin: Themes ─────────────────────────────────────────────────
function AdminThemes({ themes, uid, onUpdate }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#c84b2f");

  async function createTheme() {
    if (!name.trim()) return;
    await supabase.from("themes").insert({ name:name.trim(), icon, color, created_by:uid });
    setName(""); onUpdate();
  }

  async function toggleTheme(t) {
    await supabase.from("themes").update({ is_active: !t.is_active }).eq("id", t.id); onUpdate();
  }

  return (
    <div>
      <div className="form-row" style={{marginBottom:"16px"}}>
        <input className="form-input" placeholder="Temanamn" value={name} onChange={e=>setName(e.target.value)} aria-label="Temanamn" />
        <input className="form-input form-input-sm" placeholder="Ikon (emoji)" value={icon} onChange={e=>setIcon(e.target.value)} style={{width:80}} aria-label="Ikon" />
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} aria-label="Färg" style={{height:"38px",padding:"2px",borderRadius:"6px",border:"1px solid var(--border)"}} />
        <button className="btn-primary" onClick={createTheme} disabled={!name.trim()}>Skapa tema</button>
      </div>
      <div className="themes-grid">
        {themes.map(t=>(
          <div key={t.id} className={cn("theme-card",!t.is_active&&"inactive-theme")} style={{"--tc":t.color}}>
            <span className="theme-card-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.name}</span>
            <button className="btn-sm btn-ghost-sm" onClick={()=>toggleTheme(t)}>{t.is_active?"Inaktivera":"Aktivera"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin: Log ────────────────────────────────────────────────────
function AdminLog() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const eventTypes = ["user_created","data_imported","deck_created","session_ended","card_flagged","account_deleted"];

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      let q = supabase.from("user_log").select("*").order("created_at",{ascending:false}).limit(200);
      if (filter) q=q.eq("event_type",filter);
      const { data } = await q; setLog(data||[]); setLoading(false);
    })();
  },[filter]);

  const eventIcon = { user_created:"👤",data_imported:"📥",deck_created:"📚",session_ended:"🔚",card_flagged:"🚩",account_deleted:"🗑️" };

  return (
    <div>
      <div className="toolbar">
        <select className="select-sm" value={filter} onChange={e=>setFilter(e.target.value)} aria-label="Filtrera händelsetyp">
          <option value="">Alla händelser</option>
          {eventTypes.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      {loading ? <p className="muted">Laddar…</p> : (
        <div className="cards-table-wrap">
          <table className="cards-table">
            <thead><tr><th>Tid</th><th>Händelse</th><th>Metadata</th></tr></thead>
            <tbody>
              {log.map(l=>(
                <tr key={l.id}>
                  <td style={{whiteSpace:"nowrap"}}>{fmtDT(l.created_at)}</td>
                  <td>{eventIcon[l.event_type]||"•"} {l.event_type}</td>
                  <td className="notes-cell"><code style={{fontSize:11}}>{JSON.stringify(l.metadata)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
          {log.length===0 && <p className="muted center-msg">Inga loggrader.</p>}
        </div>
      )}
    </div>
  );
}

// ── Admin: Import (CSV med admin-alternativ) ──────────────────────
function AdminImport({ uid, tags, themes, onUpdate }) {
  const [csv, setCsv] = useState("");
  const [frontLang, setFrontLang] = useState("en");
  const [backLang, setBackLang] = useState("sv");
  const [deckName, setDeckName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function doAdminImport() {
    if (!deckName.trim()) { setStatus("Ange listnamn."); return; }
    setBusy(true); setStatus("");
    const rows = csv.trim().split("\n").map(line=>{
      const p = line.split(",").map(x=>x.trim().replace(/^["']|["']$/g,""));
      return { front:p[0]||"", back:p[1]||"", notes:p[2]||"", front_emoji:p[3]||"", theme_ids:[], tag_ids:[] };
    }).filter(r=>r.front&&r.back);
    if (!rows.length) { setStatus("Inga giltiga rader."); setBusy(false); return; }
    const { data: deck, error: de } = await supabase.from("decks").insert({ user_id:uid, name:deckName, front_lang:frontLang, back_lang:backLang }).select().single();
    if (de) { setStatus("Fel vid skapande av lista: "+de.message); setBusy(false); return; }
    const { error } = await supabase.from("cards").insert(rows.map(r=>({...r, user_id:uid, deck_id:deck.id})));
    if (error) { setStatus("Fel: "+error.message); }
    else { await logEvent(uid,"data_imported",{deck_id:deck.id,count:rows.length}); setStatus(`✓ Importerade ${rows.length} kort till "${deckName}"`); setCsv(""); setDeckName(""); onUpdate(); }
    setBusy(false);
  }

  return (
    <div>
      <p className="import-format">Admin-import: <code>ord1, ord2, kommentar, emoji</code></p>
      <div className="form-field"><label className="form-label" htmlFor="adm-deck-name">Nytt listnamn *</label><input id="adm-deck-name" className="form-input" value={deckName} onChange={e=>setDeckName(e.target.value)} required /></div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="adm-fl">Framsida språk *</label>
          <select id="adm-fl" className="form-input" value={frontLang} onChange={e=>setFrontLang(e.target.value)}>
            {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="adm-bl">Baksida språk *</label>
          <select id="adm-bl" className="form-input" value={backLang} onChange={e=>setBackLang(e.target.value)}>
            {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
          </select>
        </div>
      </div>
      <textarea className="form-input form-textarea import-textarea" value={csv} onChange={e=>setCsv(e.target.value)} placeholder={"the, det/den, artikel\nbe, vara, verb"} rows={10} aria-label="CSV-data" />
      {status && <div className={cn("import-status",status.startsWith("✓")?"import-ok":"import-err")} role="status">{status}</div>}
      <button className="btn-primary" onClick={doAdminImport} disabled={busy||!csv.trim()||!deckName.trim()} aria-busy={busy}>{busy?"Importerar…":"Importera"}</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DEVELOPER DOCUMENTATION
// ─────────────────────────────────────────────────────────────────
function DevDocs() {
  const [section, setSection] = useState("overview");
  const sections = [
    {id:"overview",label:"Översikt"},
    {id:"db",label:"Databastabeller"},
    {id:"functions",label:"Funktioner"},
    {id:"constants",label:"Konstanter & Variabler"},
    {id:"design",label:"Designmönster"},
    {id:"wcag",label:"WCAG & GDPR"},
    {id:"tests",label:"Testfall"},
    {id:"notes",label:"Dev-anteckningar"},
  ];

  return (
    <div className="docs-view">
      <div className="docs-nav">
        {sections.map(s=><button key={s.id} className={cn("docs-nav-btn",section===s.id&&"active")} onClick={()=>setSection(s.id)}>{s.label}</button>)}
      </div>
      <div className="docs-content">
        {section==="overview" && <DocsOverview />}
        {section==="db" && <DocsTables />}
        {section==="functions" && <DocsFunctions />}
        {section==="constants" && <DocsConstants />}
        {section==="design" && <DocsDesign />}
        {section==="wcag" && <DocsWCAG />}
        {section==="tests" && <DocsTests />}
        {section==="notes" && <DocsNotes />}
      </div>
    </div>
  );
}

function DocsOverview() {
  return (
    <div className="docs-section">
      <h2>Glosträning v3 – Systemöversikt</h2>
      <p><strong>Stack:</strong> React 18 + Vite (frontend), Supabase (PostgreSQL + Auth + RLS), Vercel (hosting)</p>
      <p><strong>Fil:</strong> Hela appen i <code>src/App.jsx</code> + <code>src/index.css</code></p>
      <h3>Appstruktur</h3>
      <pre>{`App (Router)
├── LandingPage (ej inloggad)
│   └── AuthPage (logga in / skapa konto)
└── MainApp (inloggad)
    ├── DecksView – lista & hantera ordlistor
    ├── ExploreView – publika listor
    ├── StudyThemeView – öva ett tema
    ├── GlobalStatsView – personlig statistik
    ├── ProfileView – profil & GDPR
    ├── AdminView – systemadministration
    │   ├── AdminStats
    │   ├── AdminCards
    │   ├── AdminUsers
    │   ├── AdminTags
    │   ├── AdminThemes
    │   ├── AdminLog
    │   ├── AdminImport
    │   └── DevDocs
    └── (Per deck)
        ├── HomeView – dashboard
        ├── StudyView – flashcard-träning
        ├── CardsView – hantera kort
        └── ImportView – CSV-import`}</pre>
    </div>
  );
}

function DocsTables() {
  const tables = [
    { name:"profiles", desc:"Användarprofiler, roller (sysadmin/group_manager/user), plan (free/paid), GDPR-status", cols:"id, username, role, plan, is_active, gdpr_deleted, last_active, created_at" },
    { name:"themes", desc:"Globala teman (t.ex. Djur, Mat). Hanteras av admin.", cols:"id, name, icon, color, is_active, created_by, created_at" },
    { name:"tags", desc:"Taggar – antingen globala (scope=global) eller personliga (scope=user). Används för att kategorisera kort.", cols:"id, name, color, scope, is_active, user_id, created_at" },
    { name:"decks", desc:"Ordlistor. Kan vara publika. Har pair_type (vocabulary|concept) och front/back-språk.", cols:"id, user_id, name, description, pair_type, front_lang, back_lang, color, theme_icon, theme_ids[], tag_ids[], is_public, is_active, use_count, created_at" },
    { name:"cards", desc:"Enskilda par (glospar eller begreppspar). Har emoji, icon (base64/SVG), taggar, teman, svårighet.", cols:"id, user_id, deck_id, front, back, notes, front_emoji, back_emoji, front_icon, back_icon, theme_ids[], tag_ids[], difficulty, is_active, is_flagged, flag_reason, flag_count, view_count, created_at" },
    { name:"progress", desc:"Spaced-repetition progress per användare+kort. is_favorite för favoritmarkering.", cols:"id, user_id, card_id, correct, wrong, streak, last_seen, next_review, is_favorite" },
    { name:"user_log", desc:"Händelselogg. user_id kan vara NULL för anonymiserade poster.", cols:"id, user_id, event_type, metadata(jsonb), created_at" },
  ];
  return (
    <div className="docs-section">
      <h2>Databastabeller</h2>
      {tables.map(t=>(
        <div key={t.name} className="docs-table-entry">
          <h3><code>{t.name}</code></h3>
          <p>{t.desc}</p>
          <p><strong>Kolumner:</strong> <code>{t.cols}</code></p>
        </div>
      ))}
      <h3>Row Level Security (RLS)</h3>
      <p>Alla tabeller har RLS aktiverat. Användare ser och ändrar bara sina egna data. Admins (role=sysadmin) har fullständig åtkomst via separata policies. Publika decks/cards läses av alla (auth.uid() or not).</p>
    </div>
  );
}

function DocsFunctions() {
  const fns = [
    { name:"App()", desc:"Rot-komponent. Hanterar Supabase auth-session. Renderar LandingPage (ej inloggad) eller MainApp (inloggad)." },
    { name:"MainApp({session})", desc:"Hanterar all state: profil, decks, cards, tags, themes, progress, studyConfig. Laddar data, loggar sessioner." },
    { name:"LandingPage()", desc:"Startsida för ej inloggade. Visar features, QR-kod, CTA." },
    { name:"AuthPage({mode, onBack})", desc:"Logga in / skapa konto. Anropar Supabase auth. Loggar user_created." },
    { name:"DecksView(…)", desc:"Lista alla ordlistor. Sortering, sökning, filtrering. Skapar/redigerar/tar bort listor via DeckEditor." },
    { name:"DeckEditor(…)", desc:"Modal-formulär för att skapa/redigera deck. Väljer typ (vocabulary|concept), språk, ikon, färg, teman." },
    { name:"HomeView(…)", desc:"Dashboard för en deck. Visar statistik, studiealternativ (hela listan, dags att repetera, baksidan först, m.m.)." },
    { name:"StudyView(…)", desc:"Flashcard-läge. Hanterar queue med filter (tagId, themeId, onlyWithIcon, onlyDue, onlyFavorites). Spaced repetition via nextReviewDate(). Favorit-markering, flaggning." },
    { name:"CardsView(…)", desc:"Tabell med alla kort i en deck. Sökning, taggfilter. Redigera/ta bort via CardEditor." },
    { name:"CardEditor(…)", desc:"Formulär för kort. Emoji, auto-ikon (lookupIcon), bilduppladdning (base64), taggar, teman, svårighet, notes." },
    { name:"ImportView(…)", desc:"CSV-import för användare. Format: ord1,ord2,kommentar,emoji. Förhandsgranskning. Loggar data_imported." },
    { name:"ExploreView(…)", desc:"Utforska publika listor. Kopiera till egna listor." },
    { name:"StudyThemeView(…)", desc:"Välj ett tema och öva alla dina kort med det temat." },
    { name:"GlobalStatsView(…)", desc:"Personlig statistik: total rätt/fel, träffsäkerhet, streak, per-deck breakdown." },
    { name:"ProfileView(…)", desc:"Profil-inställningar. GDPR-information. Radering av personuppgifter (anonymisering)." },
    { name:"AdminView(…)", desc:"Admin-panel med 8 flikar: Statistik, Kort, Användare, Taggar, Teman, Logg, Import, Dokumentation." },
    { name:"nextReviewDate(correct, wrong, streak)", desc:"Beräknar nästa repetitionsdatum. Hög träffsäkerhet → längre intervall (spaced repetition)." },
    { name:"logEvent(userId, eventType, metadata)", desc:"Infogar en rad i user_log. Används för: user_created, data_imported, deck_created, session_ended, card_flagged, account_deleted." },
    { name:"lookupIcon(word)", desc:"Slår upp ett SVG-ikon baserat på ett ord via ICON_MAP + TABLER_ICONS. Returnerar SVG data-URI eller null." },
    { name:"svgToDataUrl(svgString)", desc:"Konverterar SVG-sträng till data:image/svg+xml URI." },
  ];
  return (
    <div className="docs-section">
      <h2>Funktioner</h2>
      {fns.map(fn=>(
        <div key={fn.name} className="docs-fn-entry">
          <code>{fn.name}</code>
          <p>{fn.desc}</p>
        </div>
      ))}
    </div>
  );
}

function DocsConstants() {
  const consts = [
    { name:"SUPABASE_URL", desc:"Från VITE_SUPABASE_URL env-variabel." },
    { name:"SUPABASE_ANON_KEY", desc:"Från VITE_SUPABASE_ANON_KEY env-variabel." },
    { name:"TABLER_ICONS", desc:"Objekt med SVG-strängar (Tabler Icons, MIT-licens). Nycklar: dog, cat, house, car, book, sun, moon, star, heart, tree, flower, person, music, water, fire, food, clock, money, key, bird, fish, apple, eye, hand, school, computer, mountain, cloud." },
    { name:"ICON_MAP", desc:"Flerspråkig mappning av ord → TABLER_ICONS-nyckel. T.ex. hund→dog, katt→cat." },
    { name:"LANG_FLAGS", desc:"Språkkod → flagg-emoji. sv🇸🇪, en🇬🇧, de🇩🇪, fr🇫🇷, es🇪🇸, it🇮🇹, pt🇵🇹, ja🇯🇵, zh🇨🇳, ar🇸🇦, ru🇷🇺, nl🇳🇱, pl🇵🇱, ko🇰🇷, concept📖" },
    { name:"LANG_NAMES", desc:"Språkkod → visningsnamn. t.ex. sv→Svenska" },
    { name:"ALL_LANGS", desc:"Array av alla språkkoder." },
    { name:"MAX_UPLOAD_SIZE", desc:"512 * 1024 (512 KB) – max storlek för uppladdade bilder." },
  ];
  return (
    <div className="docs-section">
      <h2>Konstanter & Variabler</h2>
      {consts.map(c=>(
        <div key={c.name} className="docs-fn-entry">
          <code>{c.name}</code>
          <p>{c.desc}</p>
        </div>
      ))}
      <h3>State (MainApp)</h3>
      <pre>{`session      – Supabase-session (auth)
profile      – Profilobjekt från profiles-tabellen
view         – Aktiv vy (string)
decks        – Array av användarens decks
activeDeck   – Vald deck (objekt)
cards        – Kort i activeDeck
tags         – Taggar (globala + egna)
themes       – Globala teman
progress     – Objekt {card_id: progress_row}
studyConfig  – {tagId, themeId, direction, onlyFlagged, onlyWithIcon, onlyDue, onlyFavorites}
sessionStart – useRef(Date.now()) – start av session
cardsShownRef– useRef(0) – antal visade kort under session`}</pre>
    </div>
  );
}

function DocsDesign() {
  return (
    <div className="docs-section">
      <h2>Designmönster & Kodstruktur</h2>
      <h3>Komponenthierarki</h3>
      <p>Applikationen är en single-page React-app utan router-bibliotek. Vy-växling sker via <code>view</code>-state i MainApp. Alla komponenter är funktionskomponenter med hooks.</p>
      <h3>Dataflöde</h3>
      <p>Data hämtas i MainApp och skickas ner via props. Uppdateringar sker via callback-funktioner (onUpdate, onProgressUpdate) som triggar nya laddningar. Inga globala state-bibliotek används (Redux etc.).</p>
      <h3>Supabase-integration</h3>
      <p>En enda global <code>supabase</code>-klient. Row Level Security (RLS) på alla tabeller. Inga känsliga operationer sker på klienten.</p>
      <h3>Tillgänglighet (WCAG)</h3>
      <p>Alla interaktiva element har ARIA-labels. Tabeller har kolumnrubriker med scope. Felmeddelanden har role=alert. Framsteg-indikatorer har role=status. Skip-link för tangentbordsnavigering. Färgkontrast uppfyller WCAG 2.1 AA.</p>
      <h3>CSS-arkitektur</h3>
      <p>CSS-variabler i :root för konsekvent theming. BEM-liknande klassnamn. Inga CSS-in-JS-bibliotek.</p>
      <h3>Ikonsystem</h3>
      <p>SVG-ikoner (Tabler Icons, MIT) lagras inline som data-URIs. Emoji lagras som text. Bilder laddas upp som base64 (max 512 KB). Auto-ikon via lookupIcon() matchar ord mot ICON_MAP.</p>
    </div>
  );
}

function DocsWCAG() {
  return (
    <div className="docs-section">
      <h2>WCAG 2.1 AA & GDPR</h2>
      <h3>WCAG-implementering</h3>
      <ul>
        <li>Skip-link "Hoppa till innehåll" i toppen av sidan</li>
        <li>Alla formulärfält har kopplade <code>&lt;label&gt;</code>-element</li>
        <li>Knappar har <code>aria-label</code> när ikoner används utan text</li>
        <li>Tabeller har <code>scope="col"</code> på alla kolumnrubriker</li>
        <li>Flashcard-knapp har <code>role="button"</code>, <code>tabIndex=0</code> och tangentbordshantering (Space/Enter)</li>
        <li>Felmeddelanden: <code>role="alert"</code></li>
        <li>Statusmeddelanden: <code>role="status"</code></li>
        <li>Laddningsstatus: <code>aria-busy</code> på knappar under laddning</li>
        <li>Fannar/tabs: <code>role="tab"</code>, <code>aria-selected</code></li>
        <li>Aktiv nav-länk: <code>aria-current="page"</code></li>
        <li>Toggle-knappar: <code>aria-pressed</code></li>
        <li>Dekorativa element: <code>aria-hidden="true"</code></li>
        <li>Screenreader-only text: <code>.sr-only</code>-klass</li>
      </ul>
      <h3>GDPR-funktionalitet</h3>
      <ul>
        <li>Användare kan se sina rättigheter i Profil-vyn</li>
        <li>Anonymisering: username sätts till [raderad], gdpr_deleted=true, is_active=false</li>
        <li>Händelselogg: user_id kan vara NULL för anonymiserade poster</li>
        <li>Inga tredjepartsanalytiker inkluderade</li>
        <li>Ingen cookiespårning</li>
        <li>Data lagras i EU (välj Frankfurt/eu-central-1 i Supabase)</li>
      </ul>
    </div>
  );
}

function DocsTests() {
  const tests = [
    { id:"T01", desc:"Registrering: Skapa nytt konto med e-post/lösenord. Verifiera att profil skapas i profiles-tabellen och att user_created loggas.", data:"test@example.com / TestPass123" },
    { id:"T02", desc:"Inloggning: Logga in med befintligt konto. Verifiera att MainApp renderas.", data:"test@example.com / TestPass123" },
    { id:"T03", desc:"Skapa deck (glospar): Välj pair_type=vocabulary, front_lang=en, back_lang=sv. Verifiera att deck_created loggas.", data:"Namn: Engelska Ord, en→sv" },
    { id:"T04", desc:"Skapa deck (begreppspar): Välj pair_type=concept, ett språk. Verifiera att kort kan skapas utan baksida-språk.", data:"Namn: Grammatik, sv" },
    { id:"T05", desc:"Lägg till kort manuellt: Framsida 'hund', baksida 'dog', emoji 🐶. Verifiera att kortet visas i tabellen.", data:"hund / dog / 🐶" },
    { id:"T06", desc:"Auto-ikon: Skriv 'hund' i framsidans fält och klicka 🔍 Auto. Verifiera att en SVG-ikon sätts.", data:"front: hund" },
    { id:"T07", desc:"Importera CSV: Klistra in 3 rader CSV. Verifiera att preview visas och att import fungerar. Kontrollera att data_imported loggas.", data:"hund,dog\nkatt,cat\nfågel,bird" },
    { id:"T08", desc:"Träning: Starta träning på en lista. Visa kort, klicka för att vända, klicka Rätt/Fel. Verifiera att progress uppdateras.", data:"Minst 3 kort i decken" },
    { id:"T09", desc:"Favorit: Klicka ⭐ under ett kort i träningsläge. Verifiera att is_favorite=true i progress-tabellen.", data:"" },
    { id:"T10", desc:"Flaggning: Klicka 🚩 under ett kort. Ange orsak. Verifiera att is_flagged=true och card_flagged loggas.", data:"Orsak: felaktig" },
    { id:"T11", desc:"Spaced repetition: Svara rätt 3 gånger på samma kort. Verifiera att next_review ökar exponentiellt.", data:"3 rätt svar i rad" },
    { id:"T12", desc:"Dela lista: Klicka 🔒 på en deck. Verifiera att is_public=true. Logga ut, verifiera att decken visas i ExploreView.", data:"" },
    { id:"T13", desc:"Kopiera publik lista: I ExploreView, kopiera en publik lista. Verifiera att ny deck och kort skapas för användaren.", data:"Minst 1 publik lista" },
    { id:"T14", desc:"Öva tema: Välj ett tema i StudyThemeView. Verifiera att bara kort med det temat visas.", data:"Minst 1 kort med tema" },
    { id:"T15", desc:"Admin - Taggar: Logga in som sysadmin. Skapa global tagg. Verifiera att den syns för alla användare.", data:"Sysadmin-konto" },
    { id:"T16", desc:"Admin - Användare: Se användarlistan. Ändra roll till group_manager. Verifiera att rollen sparas.", data:"Sysadmin-konto" },
    { id:"T17", desc:"Admin - Flaggade kort: Filtrera på 'Flaggade' i AdminCards. Verifiera att flaggade kort visas. Ta bort flaggning.", data:"Minst 1 flaggat kort" },
    { id:"T18", desc:"Admin - Logg: Verifiera att user_log innehåller poster för user_created, data_imported, session_ended.", data:"Kör T01, T07 först" },
    { id:"T19", desc:"GDPR - Radera personuppgifter: I Profil, klicka Radera mina personuppgifter. Verifiera att username=[raderad], gdpr_deleted=true, account_deleted loggas.", data:"Testanvändare" },
    { id:"T20", desc:"WCAG - Tangentbordsnavigering: Navigera hela appen med endast Tab/Enter/Space. Verifiera att flashcard kan vändas med Space.", data:"" },
    { id:"T21", desc:"WCAG - Skärmläsare: Verifiera att aria-labels läses korrekt för nav, flashcard, progress-bar.", data:"VoiceOver eller NVDA" },
    { id:"T22", desc:"Sortering av decks: Testa alla sorteringsalternativ (Nyast, Namn, Antal kort, Mest använd).", data:"Minst 3 decks" },
    { id:"T23", desc:"Admin-import med obligatoriskt språk: Verifiera att språkval krävs (front_lang, back_lang). Importera CSV som admin.", data:"Sysadmin-konto" },
  ];
  return (
    <div className="docs-section">
      <h2>Testfall</h2>
      <table className="cards-table">
        <thead><tr><th>ID</th><th>Beskrivning</th><th>Testdata</th></tr></thead>
        <tbody>
          {tests.map(t=>(
            <tr key={t.id}>
              <td><strong>{t.id}</strong></td>
              <td>{t.desc}</td>
              <td><code>{t.data||"–"}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocsNotes() {
  return (
    <div className="docs-section">
      <h2>Saker att tänka på vid vidareutveckling</h2>
      <h3>Prestandaoptimering</h3>
      <ul>
        <li>Vid många kort (&gt;1000): Lägg till paginering i CardsView och AdminCards.</li>
        <li>Progress laddas alla i ett anrop – överväg att filtrera per deck vid stor datamängd.</li>
        <li>Base64-bilder i DB: Begränsa till 512 KB per ikon. Vid behov, migrera till Supabase Storage.</li>
      </ul>
      <h3>Säkerhet</h3>
      <ul>
        <li>Sysadmin-roll sätts i profiles-tabellen. Verifiera alltid role server-side via RLS-policies.</li>
        <li>Admin-funktioner förlitar sig på client-side check (profile.role==='sysadmin'). RLS i Supabase är den faktiska säkerhetsmekanismen.</li>
        <li>CSV-import sanitar inte input – lägg till validering vid behov.</li>
      </ul>
      <h3>Utökningar</h3>
      <ul>
        <li>Betald plan: Lägg till feature-gates baserat på profile.plan ('free'|'paid').</li>
        <li>Gruppfunktion: group_manager kan skapa decks som delas med en grupp – kräver ny groups-tabell.</li>
        <li>QR-kod: Ersätt QRCodeSVG-komponenten med ett riktigt QR-bibliotek (t.ex. qrcode.react).</li>
        <li>Bildlagring: Migrera från base64 i DB till Supabase Storage för bilder större än 100 KB.</li>
        <li>Notifikationer: Påminn användare om kort som är dags att repetera (kräver server-side cron).</li>
        <li>Offline-stöd: Service Worker + IndexedDB för offline-träning.</li>
        <li>Flerspråkigt UI: Flytta alla strängar till en i18n-konfigurationsfil.</li>
      </ul>
      <h3>Kända begränsningar</h3>
      <ul>
        <li>QR-koden är en visuell placeholder – ej scannerbar. Installera qrcode.react för riktig QR.</li>
        <li>GDPR-radering anonymiserar profilen men raderar inte kort (dessa tillhör tekniskt fortfarande user_id). Fullständig radering kräver serverless function.</li>
        <li>Sessionslängd loggas i useEffect cleanup – fungerar ej om sidan stängs abrupt (beforeunload behövs).</li>
      </ul>
      <h3>Kodkonventioner</h3>
      <ul>
        <li>Funktioner: camelCase. Komponenter: PascalCase.</li>
        <li>CSS-klasser: kebab-case med BEM-inspiration.</li>
        <li>All text UI på svenska (kan ändras via i18n-lager).</li>
        <li>Inga externa komponentbibliotek – all UI är egenutvecklad.</li>
      </ul>
    </div>
  );
}
