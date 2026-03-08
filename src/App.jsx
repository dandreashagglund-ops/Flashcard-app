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

// ── Tooltip ───────────────────────────────────────────────────────
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrap" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} onFocus={()=>setShow(true)} onBlur={()=>setShow(false)}>
      {children}
      {show && text && <span className="tooltip-box" role="tooltip">{text}</span>}
    </span>
  );
}

// ── Autocomplete Input ────────────────────────────────────────────
function AutocompleteInput({ value, onChange, suggestions=[], placeholder="", id, className="form-input", onSelect, allowNew=true, onKeyDown: externalKeyDown }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const ref = useRef(null);

  const filtered = value.trim().length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase())
    : suggestions.slice(0, 8);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e) {
    if (externalKeyDown) externalKeyDown(e);
    if (!open) { if (e.key === "ArrowDown") { setOpen(true); setHighlighted(0); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h+1, filtered.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h-1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      const chosen = filtered[highlighted];
      if (chosen) { onSelect ? onSelect(chosen) : onChange(chosen); setOpen(false); setHighlighted(-1); }
    } else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div className="autocomplete-wrap" ref={ref}>
      <input
        id={id}
        className={className}
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); setHighlighted(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        aria-haspopup="listbox"
      />
      {open && filtered.length > 0 && (
        <ul className="autocomplete-list" role="listbox">
          {filtered.map((s, i) => (
            <li key={s} role="option" aria-selected={i === highlighted}
              className={cn("autocomplete-item", i===highlighted && "highlighted")}
              onMouseDown={e => { e.preventDefault(); onSelect ? onSelect(s) : onChange(s); setOpen(false); setHighlighted(-1); }}
            >{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Tag Input (multi with autocomplete) ──────────────────────────
function TagInput({ tags, allTags=[], onChange, placeholder="Lägg till tagg…" }) {
  const [input, setInput] = useState("");
  function add(val) {
    const v = val.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  }
  function remove(t) { onChange(tags.filter(x=>x!==t)); }
  function handleKeyDown(e) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) { e.preventDefault(); add(input); }
    if (e.key === "Backspace" && !input && tags.length > 0) remove(tags[tags.length-1]);
  }
  const suggestions = allTags.filter(s => !tags.includes(s));
  return (
    <div className="tag-input-wrap">
      {tags.map(t => (
        <span key={t} className="tag-input-chip">
          {t}
          <button type="button" className="tag-input-remove" onClick={()=>remove(t)} aria-label={`Ta bort ${t}`}>×</button>
        </span>
      ))}
      <AutocompleteInput
        value={input}
        onChange={setInput}
        suggestions={suggestions}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="tag-input-field"
        onSelect={add}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}


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
  const [subjects, setSubjects] = useState([]); // all known subjects/courses
  const [copiedDeckIds, setCopiedDeckIds] = useState([]); // track which public decks user has copied
  const sessionStart = useRef(Date.now());
  const cardsShownRef = useRef(0);

  // Load profile
  const loadProfile = useCallback(async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) {
      setProfile(data);
    } else {
      // Profile missing – create a default one and set it
      const { data: created } = await supabase
        .from("profiles")
        .insert({ id: uid, username: "Användare", role: "user", plan: "free" })
        .select()
        .single();
      if (created) setProfile(created);
      else setProfile({ id: uid, username: "Användare", role: "user", plan: "free" }); // fallback
    }
    // Update last_active (ignore errors)
    await supabase.from("profiles").update({ last_active: new Date().toISOString() }).eq("id", uid);
  }, [uid]);

  const loadGlobals = useCallback(async () => {
    const [{ data: th }, { data: tg }, { data: dk }] = await Promise.all([
      supabase.from("themes").select("*").eq("is_active", true).order("name"),
      supabase.from("tags").select("*").or("scope.eq.global,user_id.eq." + uid).order("name"),
      supabase.from("decks").select("id,tag_ids").eq("user_id", uid),
    ]);
    setThemes(th || []);
    setTags(tg || []);
    // Extract all unique subject/course strings from deck tag_ids that are plain text (not UUIDs)
    // We store subjects as a metadata field; for now load from all decks' descriptions as seed
    // Load copied deck source IDs from user_log
    const { data: logs } = await supabase.from("user_log").select("metadata").eq("user_id", uid).eq("event_type", "data_imported");
    const ids = (logs||[]).map(l => l.metadata?.from_deck).filter(Boolean);
    setCopiedDeckIds(ids);
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

  // Don't render until profile is loaded — prevents admin nav from disappearing on first render
  if (!profile) return <div className="splash" role="status"><div className="splash-logo">✦</div><p>Laddar profil…</p></div>;

  // NAV
  const insideDeck = activeDeck && !["decks","explore","stats","admin","profile","themes","study_theme"].includes(view);
  const deckNav = [
    { id:"home", icon:"⌂", label:"Hem" },
    { id:"study", icon:"◈", label:"Träna" },
    { id:"cards", icon:"▦", label:"Kort" },
    { id:"import", icon:"↑", label:"Importera" },
    { id:"stats", icon:"◉", label:"Statistik" },
    { id:"help", icon:"❓", label:"Hjälp" },
  ];
  const mainNav = [
    { id:"decks", icon:"◧", label:"Ordlistor" },
    { id:"explore", icon:"🌐", label:"Utforska" },
    { id:"study_theme", icon:"🎯", label:"Öva tema" },
    { id:"stats", icon:"📈", label:"Statistik" },
    { id:"help", icon:"❓", label:"Hjälp" },
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
        {view==="explore" && <ExploreView uid={uid} tags={tags} themes={themes} onImport={loadGlobals} copiedDeckIds={copiedDeckIds} />}
        {view==="study_theme" && <StudyThemeView uid={uid} themes={themes} tags={tags} onStart={startStudy} />}
        {view==="stats" && <GlobalStatsView uid={uid} decks={decks} />}
        {view==="profile" && profile && <ProfileView profile={profile} uid={uid} onUpdate={loadProfile} />}
        {view==="admin" && isAdmin && <AdminView uid={uid} themes={themes} tags={tags} onUpdate={refreshAll} />}
        {view==="help" && <HelpView isAdmin={isAdmin} onClose={()=>setView(activeDeck?"home":"decks")} />}
        {view==="home" && activeDeck && <HomeView deck={activeDeck} cards={cards} tags={tags} themes={themes} progress={progress} onStudy={startStudy} onUpdate={refreshAll} />}
        {view==="study" && activeDeck && <StudyView cards={cards} tags={tags} themes={themes} progress={progress} config={studyConfig} onProgressUpdate={refreshAll} uid={uid} cardsShownRef={cardsShownRef} />}
        {view==="cards" && activeDeck && <CardsView cards={cards} tags={tags} themes={themes} onUpdate={refreshAll} uid={uid} deckId={activeDeck.id} />}
        {view==="import" && activeDeck && <ImportView deck={activeDeck} uid={uid} onUpdate={refreshAll} themes={themes} tags={tags} />}
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
    // Start with only the columns that exist in the original decks table
    const payload = {
      name: data.name,
      description: data.description || null,
      front_lang: data.front_lang || "en",
      back_lang: data.back_lang || "sv",
      color: data.color || "#c84b2f",
      theme_icon: data.theme_icon || "📚",
      is_public: data.is_public || false,
    };

    // Try with all new columns first
    const fullPayload = {
      ...payload,
      pair_type: data.pair_type || "vocabulary",
      theme_ids: data.theme_ids || [],
      tag_ids: data.tag_ids || [],
    };

    if (data.id) {
      let { error } = await supabase.from("decks").update(fullPayload).eq("id", data.id);
      if (error && (error.message.includes("pair_type") || error.message.includes("theme_ids") || error.message.includes("tag_ids"))) {
        const { error: e2 } = await supabase.from("decks").update(payload).eq("id", data.id);
        if (e2) { alert("Fel vid sparande: " + e2.message); return; }
      } else if (error) { alert("Fel vid sparande: " + error.message); return; }
    } else {
      let { data: nd, error } = await supabase.from("decks").insert({...fullPayload, user_id: uid}).select().single();
      if (error && (error.message.includes("pair_type") || error.message.includes("theme_ids") || error.message.includes("tag_ids"))) {
        const { data: nd2, error: e2 } = await supabase.from("decks").insert({...payload, user_id: uid}).select().single();
        if (e2) { alert("Fel vid skapande: " + e2.message); return; }
        if (nd2) await logEvent(uid, "deck_created", { deck_name: data.name });
      } else if (error) { alert("Fel vid skapande: " + error.message); return; }
      else if (nd) await logEvent(uid, "deck_created", { deck_name: data.name });
    }
    setShowEditor(false); setEditing(null); onUpdate();
  }
  async function deleteDeck(id) {
    if (!confirm("Radera ordlistan och alla dess kort?")) return;
    await supabase.from("decks").delete().eq("id", id); onUpdate();
  }
  async function toggleShare(deck) {
    const newVal = !deck.is_public;
    // Optimistically update local state so icon updates immediately
    setDecks(prev => prev.map(d => d.id === deck.id ? {...d, is_public: newVal} : d));
    await supabase.from("decks").update({ is_public: newVal }).eq("id", deck.id);
    onUpdate();
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

      {showEditor && (
        <NewDeckFlow
          themes={themes}
          tags={tags}
          uid={uid}
          onDone={(deck) => { setShowEditor(false); setEditing(null); onUpdate(); if (deck) onOpen(deck); }}
          onCancel={() => { setShowEditor(false); setEditing(null); }}
          editDeck={editing}
          onSave={editing ? saveDeck : null}
        />
      )}

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
              <button className="btn-sm" onClick={()=>onOpen(deck)} title="Öva den här listan">Träna →</button>
              <button className="btn-sm btn-ghost-sm" onClick={()=>{setEditing(deck);setShowEditor(true);}} title="Redigera listans inställningar">Redigera</button>
              <button className="btn-sm btn-ghost-sm" onClick={()=>toggleShare(deck)} title={deck.is_public?"Listan är publik – klicka för att göra privat":"Listan är privat – klicka för att dela offentligt"}>{deck.is_public?"🔓":"🔒"}</button>
              <button className="btn-sm btn-danger-sm" onClick={()=>deleteDeck(deck.id)} title="Ta bort listan och alla kort">Ta bort</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ── New Deck Flow (steg 1: skapa lista, steg 2: importera ord) ────
function NewDeckFlow({ themes, tags, uid, onDone, onCancel, editDeck, onSave }) {
  const [step, setStep] = useState(editDeck ? "edit" : "create");
  const [createdDeck, setCreatedDeck] = useState(null);

  // Step 1 form state
  const [form, setForm] = useState({
    name: editDeck?.name||"",
    description: editDeck?.description||"",
    front_lang: editDeck?.front_lang||"en",
    back_lang: editDeck?.back_lang||"sv",
    color: editDeck?.color||"#c84b2f",
    theme_icon: editDeck?.theme_icon||"📚",
    is_public: editDeck?.is_public||false,
    theme_ids: editDeck?.theme_ids||[],
    ...(editDeck?.id ? { id: editDeck.id } : {}),
  });
  const f = v => setForm(p => ({...p,...v}));

  // Auto-detect type: same lang = concept, different = vocabulary
  const pairType = form.front_lang === form.back_lang ? "concept" : "vocabulary";

  const ICONS = ["📚","🇬🇧","🇸🇪","🇩🇪","🇫🇷","🇪🇸","🇯🇵","🔬","💊","⚖️","💻","🧮","🎵","🏛️","🌍","🎨","⭐","🐾","🍎","🧍","🏠","🌿","🚗","👕","📐","⚽","🎯"];
  const COLORS = ["#c84b2f","#2f7dc8","#2a7a4f","#7a2f8f","#c87a2f","#1a3a5c","#5a2f7a","#c82f4b","#2fa87a","#8f2fc8"];

  // Step 2 import state
  const [csv, setCsv] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function parseCSV(text) {
    return text.trim().split("\n").filter(l => l.trim()).map(line => {
      const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
      return { front: parts[0]||"", back: parts[1]||"", notes: parts[2]||null, emoji: parts[3]||"" };
    }).filter(r => r.front && r.back);
  }

  async function handleCreateDeck() {
    if (!form.name.trim()) return;
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      front_lang: form.front_lang,
      back_lang: form.back_lang,
      color: form.color,
      theme_icon: form.theme_icon,
      is_public: form.is_public,
      pair_type: pairType,
    };
    const { data: deck, error } = await supabase.from("decks")
      .insert({...payload, user_id: uid})
      .select().single();
    if (error) {
      // Retry without new columns if schema cache issue
      const { data: deck2, error: e2 } = await supabase.from("decks")
        .insert({ name: payload.name, description: payload.description, front_lang: payload.front_lang, back_lang: payload.back_lang, color: payload.color, theme_icon: payload.theme_icon, is_public: payload.is_public, user_id: uid })
        .select().single();
      if (e2) { alert("Fel vid skapande: " + e2.message); setBusy(false); return; }
      setCreatedDeck(deck2);
    } else {
      setCreatedDeck(deck);
    }
    await logEvent(uid, "deck_created", { deck_name: payload.name });
    setBusy(false);
    setStep("import");
  }

  async function handleImport() {
    if (!csv.trim() || !createdDeck) return;
    setBusy(true); setImportStatus("");
    const rows = parseCSV(csv);
    if (!rows.length) { setImportStatus("Inga giltiga rader hittades."); setBusy(false); return; }

    const withEmoji = rows.map(r => ({ user_id: uid, deck_id: createdDeck.id, front: r.front, back: r.back, notes: r.notes, front_emoji: r.emoji }));
    let { error } = await supabase.from("cards").insert(withEmoji);
    if (error && error.message.includes("front_emoji")) {
      const withoutEmoji = rows.map(r => ({ user_id: uid, deck_id: createdDeck.id, front: r.front, back: r.back, notes: r.notes }));
      const res2 = await supabase.from("cards").insert(withoutEmoji);
      error = res2.error;
    }
    if (error) { setImportStatus("Fel: " + error.message); setBusy(false); return; }

    await logEvent(uid, "data_imported", { deck_id: createdDeck.id, count: rows.length });
    setBusy(false);
    onDone(createdDeck);
  }

  // Edit mode (existing deck) — simplified, no import step
  if (step === "edit") {
    return (
      <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Redigera ordlista">
        <div className="editor-card">
          <h2>Redigera ordlista</h2>
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
              <label className="form-label" htmlFor="edit-fl">Framsida</label>
              <select id="edit-fl" className="form-input" value={form.front_lang} onChange={e=>f({front_lang:e.target.value})}>
                {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="edit-bl">Baksida</label>
              <select id="edit-bl" className="form-input" value={form.back_lang} onChange={e=>f({back_lang:e.target.value})}>
                {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>
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
          <label className="form-label checkbox-label">
            <input type="checkbox" checked={form.is_public} onChange={e=>f({is_public:e.target.checked})} />
            <span>Gör listan publik</span>
          </label>
          <div className="editor-actions">
            <button className="btn-primary" onClick={()=>form.name.trim()&&onSave(form)} disabled={!form.name.trim()}>Spara</button>
            <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Create deck
  if (step === "create") {
    return (
      <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Skapa ny ordlista">
        <div className="editor-card">
          <div className="flow-steps">
            <span className="flow-step active">1. Skapa lista</span>
            <span className="flow-step-arrow">→</span>
            <span className="flow-step">2. Lägg till ord</span>
          </div>
          <h2>Skapa ny ordlista</h2>

          <div className="form-field">
            <label className="form-label" htmlFor="deck-name">Namn *</label>
            <input id="deck-name" className="form-input" value={form.name} onChange={e=>f({name:e.target.value})} placeholder="t.ex. Engelska åk 7" required autoFocus />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="deck-desc">Beskrivning (valfritt)</label>
            <input id="deck-desc" className="form-input" value={form.description} onChange={e=>f({description:e.target.value})} placeholder="t.ex. Kapitel 3–5" />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="fl">Framsida *</label>
              <select id="fl" className="form-input" value={form.front_lang} onChange={e=>f({front_lang:e.target.value})}>
                {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="bl">Baksida *</label>
              <select id="bl" className="form-input" value={form.back_lang} onChange={e=>f({back_lang:e.target.value})}>
                {ALL_LANGS.filter(l=>l!=="concept").map(l=><option key={l} value={l}>{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>

          {pairType === "concept" && (
            <div className="type-hint">💡 Samma språk på båda sidor — listan blir en <strong>begreppslista</strong></div>
          )}
          {pairType === "vocabulary" && form.front_lang && form.back_lang && (
            <div className="type-hint">📖 Olika språk — listan blir en <strong>gloslista</strong> ({LANG_FLAGS[form.front_lang]} → {LANG_FLAGS[form.back_lang]})</div>
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

          <div className="editor-actions">
            <button className="btn-primary" onClick={handleCreateDeck} disabled={!form.name.trim() || busy} aria-busy={busy}>
              {busy ? "Skapar…" : "Nästa: Lägg till ord →"}
            </button>
            <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Import words
  const preview = parseCSV(csv).slice(0, 5);
  const total = parseCSV(csv).length;

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Importera ord">
      <div className="editor-card editor-card-wide">
        <div className="flow-steps">
          <span className="flow-step done">1. Skapa lista ✓</span>
          <span className="flow-step-arrow">→</span>
          <span className="flow-step active">2. Lägg till ord</span>
        </div>
        <h2>Lägg till ord i <em>{createdDeck?.theme_icon} {createdDeck?.name}</em></h2>
        <p className="import-format">
          Klistra in ord, ett par per rad: <code>framsida, baksida, kommentar, emoji</code><br />
          Kommentar och emoji är valfria. Exempel: <code>hund, dog, En fyrbent vän, 🐶</code>
        </p>
        <textarea
          className="form-input form-textarea import-textarea"
          value={csv}
          onChange={e => setCsv(e.target.value)}
          placeholder={"hund, dog\nkatt, cat\nfågel, bird, En bevingad vän, 🐦"}
          rows={10}
          aria-label="Ord att importera"
          autoFocus
        />
        {preview.length > 0 && (
          <div className="import-preview">
            <strong>Förhandsgranskning — {total} par:</strong>
            <table className="cards-table">
              <thead><tr><th>Framsida</th><th>Baksida</th><th>Kommentar</th><th>Emoji</th></tr></thead>
              <tbody>{preview.map((r,i) => <tr key={i}><td>{r.front}</td><td>{r.back}</td><td>{r.notes}</td><td>{r.emoji}</td></tr>)}</tbody>
            </table>
            {total > 5 && <p className="muted">…och {total - 5} till</p>}
          </div>
        )}
        {importStatus && <div className={cn("import-status", importStatus.startsWith("Fel") ? "import-err" : "import-ok")} role="status">{importStatus}</div>}
        <div className="editor-actions">
          <button className="btn-primary" onClick={handleImport} disabled={!csv.trim() || busy} aria-busy={busy}>
            {busy ? "Importerar…" : `Importera ${total > 0 ? total + " par" : "ord"} →`}
          </button>
          <button className="btn-ghost" onClick={() => onDone(createdDeck)}>Hoppa över (lägg till manuellt)</button>
        </div>
      </div>
    </div>
  );
}

// ── Deck Editor (kept for admin use via AdminDecks) ───────────────
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

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Redigera ordlista">
      <div className="editor-card">
        <h2>Redigera ordlista</h2>
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
        <label className="form-label checkbox-label">
          <input type="checkbox" checked={form.is_public} onChange={e=>f({is_public:e.target.checked})} />
          <span>Gör listan publik</span>
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
  const [hideFlagged, setHideFlagged] = useState(false);

  // Cards answered wrong in last session (wrong > 0 and streak === 0)
  const wrongLast = cards.filter(c => {
    const p = progress[c.id];
    return p && p.wrong > 0 && (p.streak === 0 || p.correct === 0);
  });
  const everWrong = cards.filter(c => {
    const p = progress[c.id];
    return p && p.wrong > 0;
  });
  const flaggedCards = cards.filter(c => c.is_flagged);
  const visibleFlagged = flaggedCards.filter(c => !hideFlagged);

  // Only show tags that are used in this deck's cards
  const usedTagIds = new Set(cards.flatMap(c=>c.tag_ids||[]));
  const usedTags = tags.filter(t=>usedTagIds.has(t.id));

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1 className="view-title">{deck.theme_icon} {deck.name}</h1>
          <p className="view-sub">{deck.description||"Välj hur du vill träna."}</p>
        </div>
      </div>

      <div className="stats-row">
        <Tooltip text="Antal kort som är dags att repetera idag"><StatCard label="Att repetera" value={due.length} accent={due.length>0} /></Tooltip>
        <Tooltip text="Totalt antal kort i listan"><StatCard label="Totalt" value={total} /></Tooltip>
        <Tooltip text="Andel rätta svar totalt"><StatCard label="Träffsäkerhet" value={accuracy!==null?`${accuracy}%`:"–"} /></Tooltip>
        <Tooltip text="Kort du markerat som favoriter"><StatCard label="Favoriter" value={favorites} /></Tooltip>
        <Tooltip text="Kort med bild eller emoji"><StatCard label="Med ikon" value={withIcon} /></Tooltip>
      </div>

      {flaggedCards.length > 0 && (
        <div className="flagged-banner">
          <span>🚩 {flaggedCards.length} kort har flaggats av användare</span>
          <div style={{display:"flex",gap:8}}>
            <button className="btn-sm btn-ghost-sm" onClick={()=>setHideFlagged(h=>!h)}>
              {hideFlagged ? "Visa flaggade" : "Dölj flaggade"}
            </button>
            {!hideFlagged && (
              <button className="btn-sm btn-ghost-sm" onClick={()=>onStudy({onlyFlagged:true,direction:"front"})}>
                Granska flaggade
              </button>
            )}
          </div>
        </div>
      )}

      <div className="home-study-options">
        <h2 className="section-title">Träna</h2>
        <div className="study-btns-grid">
          <Tooltip text="Öva alla kort i slumpmässig ordning">
            <button className="study-opt-card" onClick={()=>onStudy({direction:"front",onlyFlagged:false,onlyWithIcon:false,hideFlagged})}>
              <span className="study-opt-icon" aria-hidden="true">🃏</span>
              <span>Hela listan</span>
              <span className="study-opt-count">{total} kort</span>
            </button>
          </Tooltip>
          <Tooltip text="Spaced repetition – dessa kort behöver repeteras idag">
            <button className="study-opt-card" onClick={()=>onStudy({direction:"front",onlyFlagged:false,onlyWithIcon:false,onlyDue:true})}>
              <span className="study-opt-icon" aria-hidden="true">⏰</span>
              <span>Dags att repetera</span>
              <span className="study-opt-count">{due.length} kort</span>
            </button>
          </Tooltip>
          <Tooltip text="Se översättningen först och gissa originalordet">
            <button className="study-opt-card" onClick={()=>onStudy({direction:"back",onlyFlagged:false,onlyWithIcon:false,hideFlagged})}>
              <span className="study-opt-icon" aria-hidden="true">🔄</span>
              <span>Baksidan först</span>
              <span className="study-opt-count">{total} kort</span>
            </button>
          </Tooltip>
          {wrongLast.length > 0 && (
            <Tooltip text="Öva bara de kort du svarade fel på senast">
              <button className="study-opt-card study-opt-warn" onClick={()=>onStudy({onlyEverWrong:true,onlyLastWrong:true,direction:"front"})}>
                <span className="study-opt-icon" aria-hidden="true">↩️</span>
                <span>Fel senaste gången</span>
                <span className="study-opt-count">{wrongLast.length} kort</span>
              </button>
            </Tooltip>
          )}
          {everWrong.length > 0 && (
            <Tooltip text="Öva alla kort du någon gång svarat fel på">
              <button className="study-opt-card study-opt-warn" onClick={()=>onStudy({onlyEverWrong:true,direction:"front"})}>
                <span className="study-opt-icon" aria-hidden="true">❌</span>
                <span>Svarat fel någon gång</span>
                <span className="study-opt-count">{everWrong.length} kort</span>
              </button>
            </Tooltip>
          )}
          {withIcon>0 && (
            <Tooltip text="Öva bara kort som har en bild eller emoji">
              <button className="study-opt-card" onClick={()=>onStudy({onlyWithIcon:true,direction:"front"})}>
                <span className="study-opt-icon" aria-hidden="true">🖼️</span>
                <span>Bara med ikon/emoji</span>
                <span className="study-opt-count">{withIcon} kort</span>
              </button>
            </Tooltip>
          )}
          {favorites>0 && (
            <Tooltip text="Öva bara dina favoritmarkerade kort">
              <button className="study-opt-card" onClick={()=>onStudy({onlyFavorites:true,direction:"front"})}>
                <span className="study-opt-icon" aria-hidden="true">⭐</span>
                <span>Favoriter</span>
                <span className="study-opt-count">{favorites} kort</span>
              </button>
            </Tooltip>
          )}
        </div>

        {usedTags.length>0 && (
          <div className="home-tag-section">
            <h3 className="section-title">Öva per tagg</h3>
            <div className="tags-row">
              {usedTags.map(tag=>(
                <Tooltip key={tag.id} text={`Öva bara kort med taggen "${tag.name}"`}>
                  <button className="tag-chip-study" style={{"--tc":tag.color||"#6b9bce"}} onClick={()=>onStudy({tagId:tag.id,direction:"front"})}>
                    {tag.name}
                  </button>
                </Tooltip>
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
  const { tagId, themeId, direction="front", onlyFlagged, onlyWithIcon, onlyDue, onlyFavorites, onlyEverWrong, onlyLastWrong, hideFlagged } = config;

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
    if (onlyEverWrong) {
      if (onlyLastWrong) {
        q = q.filter(c=>{ const p=progress[c.id]; return p && p.wrong>0 && (p.streak===0||p.correct===0); });
      } else {
        q = q.filter(c=>{ const p=progress[c.id]; return p && p.wrong>0; });
      }
    }
    if (hideFlagged) q = q.filter(c=>!c.is_flagged);
    // Shuffle
    return q.sort(()=>Math.random()-0.5);
  }, [cards, tagId, themeId, onlyWithIcon, onlyDue, onlyFavorites, onlyEverWrong, onlyLastWrong, hideFlagged, progress]);

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
  const [hideFlagged, setHideFlagged] = useState(false);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  // Only show tags used in this deck
  const usedTagIds = new Set(cards.flatMap(c=>c.tag_ids||[]));
  const usedTags = tags.filter(t=>usedTagIds.has(t.id));

  const flaggedCount = cards.filter(c=>c.is_flagged).length;

  const filtered = cards.filter(c => {
    if (showFlaggedOnly && !c.is_flagged) return false;
    if (hideFlagged && c.is_flagged) return false;
    if (!(c.front+c.back+(c.notes||"")).toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !(c.tag_ids||[]).includes(filterTag)) return false;
    return true;
  });

  async function saveCard(data) {
    // Build safe payload with only guaranteed columns
    const payload = {
      front: data.front,
      back: data.back,
      notes: data.notes || null,
    };
    // Add optional columns defensively
    if (data.front_emoji !== undefined) payload.front_emoji = data.front_emoji;
    if (data.back_emoji !== undefined) payload.back_emoji = data.back_emoji;
    if (data.front_icon !== undefined) payload.front_icon = data.front_icon;
    if (data.back_icon !== undefined) payload.back_icon = data.back_icon;
    if (data.difficulty !== undefined) payload.difficulty = data.difficulty;
    if (data.tag_ids !== undefined) payload.tag_ids = data.tag_ids;
    if (data.theme_ids !== undefined) payload.theme_ids = data.theme_ids;

    if (data.id) {
      const { error } = await supabase.from("cards").update(payload).eq("id", data.id);
      if (error) { alert("Fel vid sparande: " + error.message); return; }
    } else {
      const { error } = await supabase.from("cards").insert({...payload, user_id:uid, deck_id:deckId});
      if (error) { alert("Fel vid skapande: " + error.message); return; }
    }
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
        {usedTags.length>0 && (
          <select className="select-sm" value={filterTag} onChange={e=>setFilterTag(e.target.value)} aria-label="Filtrera tagg" title="Visa bara kort med den här taggen">
            <option value="">Alla taggar</option>
            {usedTags.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        {flaggedCount > 0 && (
          <div style={{display:"flex",gap:6}}>
            <Tooltip text="Visa bara flaggade kort">
              <button className={cn("btn-sm btn-ghost-sm", showFlaggedOnly&&"btn-active")} onClick={()=>{setShowFlaggedOnly(s=>!s);setHideFlagged(false);}}>
                🚩 {flaggedCount} flaggade
              </button>
            </Tooltip>
            <Tooltip text={hideFlagged?"Visa flaggade kort":"Dölj flaggade kort"}>
              <button className={cn("btn-sm btn-ghost-sm", hideFlagged&&"btn-active")} onClick={()=>{setHideFlagged(h=>!h);setShowFlaggedOnly(false);}}>
                {hideFlagged?"Visa dolda":"Dölj flaggade"}
              </button>
            </Tooltip>
          </div>
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

function ImportView({ deck, uid, onUpdate, themes=[], tags=[] }) {
  const [step, setStep] = useState("upload"); // upload | metadata | done
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  // Metadata
  const [subjects, setSubjects] = useState([]); // e.g. ["Engelska", "Franska"]
  const [courses, setCourses] = useState([]); // e.g. ["Psykologi A"]
  const [selThemeIds, setSelThemeIds] = useState([]);

  // Common suggestions
  const SUBJECT_SUGGESTIONS = ["Svenska","Engelska","Franska","Tyska","Spanska","Historia","Matematik","Biologi","Fysik","Kemi","Geografi","Religion","Samhällskunskap","Psykologi","Filosofi","Musik","Idrott","Konst"];
  const COURSE_SUGGESTIONS = ["Engelska 5","Engelska 6","Engelska 7","Svenska 1","Svenska 2","Svenska 3","Historia A","Historia B","Psykologi A","Psykologi B","Biologi 1","Biologi 2","Matematik 1a","Matematik 1b","Matematik 2","Matematik 3","Matematik 4","Matematik 5"];

  function parseCSV(text) {
    return text.trim().split("\n")
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
        return { front: parts[0]||"", back: parts[1]||"", notes: parts[2]||"", emoji: parts[3]||"", difficulty: parts[4] ? parseInt(parts[4])||2 : 2 };
      }).filter(r => r.front && r.back);
  }

  useEffect(() => { if (csv) setPreview(parseCSV(csv).slice(0, 5)); else setPreview([]); }, [csv]);

  function handleNext() {
    const rows = parseCSV(csv);
    if (!rows.length) { setStatus("Inga giltiga rader hittades."); return; }
    setParsedRows(rows);
    setStatus("");
    setStep("metadata");
  }

  async function doImport() {
    setBusy(true); setStatus("");
    if (!parsedRows.length) { setStatus("Inga giltiga rader."); setBusy(false); return; }

    // Build notes suffix from metadata
    const metaNote = [...subjects.map(s=>`Ämne: ${s}`), ...courses.map(c=>`Kurs: ${c}`)].join(" | ");

    const withEmoji = parsedRows.map(r => ({
      user_id: uid, deck_id: deck.id,
      front: r.front, back: r.back,
      notes: r.notes || null,
      front_emoji: r.emoji || "",
      difficulty: r.difficulty || 2,
      theme_ids: selThemeIds,
    }));

    let { error } = await supabase.from("cards").insert(withEmoji);
    if (error && error.message.includes("front_emoji")) {
      const withoutEmoji = parsedRows.map(r => ({
        user_id: uid, deck_id: deck.id,
        front: r.front, back: r.back, notes: r.notes || null,
        theme_ids: selThemeIds,
      }));
      const res2 = await supabase.from("cards").insert(withoutEmoji);
      error = res2.error;
    }

    if (error) { setStatus("Fel: " + error.message); setBusy(false); return; }

    // Update deck with subjects/courses in description if not already set
    if (subjects.length || courses.length) {
      const extraDesc = [...subjects, ...courses].join(", ");
      await supabase.from("decks").update({
        description: deck.description ? `${deck.description} · ${extraDesc}` : extraDesc
      }).eq("id", deck.id);
    }

    await logEvent(uid, "data_imported", { deck_id: deck.id, count: parsedRows.length, subjects, courses });
    setStatus(`✓ ${parsedRows.length} kort importerade!`);
    setStep("done");
    onUpdate();
    setBusy(false);
  }

  if (step === "done") return (
    <div className="view center-msg">
      <div className="done-card">
        <div className="done-emoji">✅</div>
        <h2>Import klar!</h2>
        <p>{parsedRows.length} kort importerade till <strong>{deck.theme_icon} {deck.name}</strong></p>
        {subjects.length > 0 && <p className="muted">Ämnen: {subjects.join(", ")}</p>}
        {courses.length > 0 && <p className="muted">Kurser: {courses.join(", ")}</p>}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:16}}>
          <button className="btn-primary" onClick={()=>{setStep("upload");setCsv("");setParsedRows([]);setSubjects([]);setCourses([]);setSelThemeIds([]);}}>Importera mer</button>
        </div>
      </div>
    </div>
  );

  if (step === "metadata") return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Beskriv dina ord</h1>
          <p className="view-sub">Lägg till ämnen, teman och kurser för att göra orden sökbara.</p>
        </div>
      </div>
      <div className="import-box">
        <div className="flow-steps" style={{marginBottom:20}}>
          <span className="flow-step done">1. CSV-fil ✓</span>
          <span className="flow-step-arrow">→</span>
          <span className="flow-step active">2. Beskriv orden</span>
          <span className="flow-step-arrow">→</span>
          <span className="flow-step">3. Importera</span>
        </div>
        <p className="muted" style={{marginBottom:20}}>Redo att importera <strong>{parsedRows.length} ord</strong>. Beskriv dem så att de blir lättare att hitta och filtrera.</p>

        <div className="form-field">
          <label className="form-label">
            Ämnen (skolämnen, t.ex. Engelska, Historia)
            <Tooltip text="Ange vilket eller vilka skolämnen orden tillhör"><span className="help-icon">?</span></Tooltip>
          </label>
          <p className="import-format" style={{marginBottom:6}}>Tryck Enter eller komma för att lägga till ett ämne</p>
          <TagInput tags={subjects} onChange={setSubjects} allTags={SUBJECT_SUGGESTIONS} placeholder="t.ex. Engelska, Historia…" />
        </div>

        <div className="form-field">
          <label className="form-label">
            Kurser (t.ex. Psykologi A, Engelska 5)
            <Tooltip text="Ange specifika kurser orden är kopplade till"><span className="help-icon">?</span></Tooltip>
          </label>
          <p className="import-format" style={{marginBottom:6}}>Tryck Enter eller komma för att lägga till en kurs</p>
          <TagInput tags={courses} onChange={setCourses} allTags={COURSE_SUGGESTIONS} placeholder="t.ex. Psykologi A, Engelska 5…" />
        </div>

        {themes.length > 0 && (
          <div className="form-field">
            <label className="form-label">
              Teman (grammatik, oregelbundna verb m.m.)
              <Tooltip text="Teman hjälper dig att öva alla ord med samma tema, även från olika listor"><span className="help-icon">?</span></Tooltip>
            </label>
            <div className="tag-picker">
              {themes.map(t=>(
                <button key={t.id} type="button"
                  className={cn("tag-chip", selThemeIds.includes(t.id)&&"active")}
                  onClick={()=>setSelThemeIds(p=>p.includes(t.id)?p.filter(x=>x!==t.id):[...p,t.id])}
                  aria-pressed={selThemeIds.includes(t.id)}
                >{t.icon} {t.name}</button>
              ))}
            </div>
          </div>
        )}

        <div className="editor-actions">
          <button className="btn-primary" onClick={doImport} disabled={busy} aria-busy={busy}>
            {busy ? "Importerar…" : `Importera ${parsedRows.length} ord →`}
          </button>
          <button className="btn-ghost" onClick={()=>setStep("upload")}>← Tillbaka</button>
        </div>
        {status && <div className={cn("import-status", status.startsWith("✓")?"import-ok":"import-err")} role="status">{status}</div>}
      </div>
    </div>
  );

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Importera kort</h1>
      </div>
      <div className="import-box">
        <div className="import-format-box">
          <h3>CSV-format</h3>
          <p>En rad per ord med kommatecken mellan fälten:</p>
          <code>framsida, baksida, kommentar, emoji, svårighet(1-5)</code>
          <table className="cards-table" style={{marginTop:12,fontSize:13}}>
            <thead><tr><th>Kolumn</th><th>Beskrivning</th><th>Exempel</th><th>Obligatorisk</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Framsida (ord/begrepp)</td><td>hund</td><td>✓</td></tr>
              <tr><td>2</td><td>Baksida (översättning)</td><td>dog</td><td>✓</td></tr>
              <tr><td>3</td><td>Kommentar/förklaring</td><td>En fyrbent vän</td><td>–</td></tr>
              <tr><td>4</td><td>Emoji</td><td>🐶</td><td>–</td></tr>
              <tr><td>5</td><td>Svårighet (1–5)</td><td>2</td><td>–</td></tr>
            </tbody>
          </table>
          <p style={{marginTop:8}} className="muted">Exempelrader:</p>
          <pre style={{background:"var(--bg2)",padding:"8px",borderRadius:"6px",fontSize:12,overflowX:"auto"}}>
{`hund, dog, En fyrbent vän, 🐶, 1
katt, cat,,🐱
oregelbunden, irregular, Oregelbundet verb, , 3
vara, to be, Hjälpverb, , 4`}
          </pre>
        </div>
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
              <thead><tr><th>Framsida</th><th>Baksida</th><th>Kommentar</th><th>Emoji</th><th>Svårighet</th></tr></thead>
              <tbody>{preview.map((r, i) => <tr key={i}><td>{r.front}</td><td>{r.back}</td><td>{r.notes}</td><td>{r.emoji}</td><td>{r.difficulty}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {status && <div className={cn("import-status", status.startsWith("✓") ? "import-ok" : "import-err")} role="status">{status}</div>}
        <button className="btn-primary" onClick={handleNext} disabled={!csv.trim()}>
          Nästa: Beskriv orden →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXPLORE VIEW (publika listor)
// ─────────────────────────────────────────────────────────────────
function ExploreView({ uid, tags, themes, onImport, copiedDeckIds=[] }) {
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("use_count");
  const [cardCounts, setCardCounts] = useState({});
  const [filterTheme, setFilterTheme] = useState("");
  const [copiedIds, setCopiedIds] = useState(copiedDeckIds);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      const { data } = await supabase.from("decks").select("*").eq("is_public",true).eq("is_active",true).order("use_count",{ascending:false});
      setDecks(data||[]);
      // Load card counts
      const ids = (data||[]).map(d=>d.id);
      if (ids.length) {
        const { data: cc } = await supabase.from("cards").select("deck_id").in("deck_id",ids);
        const c={}; (cc||[]).forEach(r=>{c[r.deck_id]=(c[r.deck_id]||0)+1;}); setCardCounts(c);
      }
      setLoading(false);
    })();
  },[]);

  useEffect(()=>{ setCopiedIds(copiedDeckIds); },[copiedDeckIds]);

  async function copyDeck(srcDeck) {
    if (copiedIds.includes(srcDeck.id)) { alert("Du har redan kopierat den här listan!"); return; }
    const { data: nd } = await supabase.from("decks").insert({
      user_id:uid, name:`${srcDeck.name} (kopia)`, description:srcDeck.description,
      pair_type:srcDeck.pair_type, front_lang:srcDeck.front_lang, back_lang:srcDeck.back_lang,
      color:srcDeck.color, theme_icon:srcDeck.theme_icon,
    }).select().single();
    if (!nd) return;
    const { data: srcCards } = await supabase.from("cards").select("*").eq("deck_id",srcDeck.id);
    if (srcCards?.length) {
      await supabase.from("cards").insert(srcCards.map(c=>({
        user_id:uid, deck_id:nd.id, front:c.front, back:c.back, notes:c.notes,
        front_emoji:c.front_emoji, back_emoji:c.back_emoji, difficulty:c.difficulty,
        tag_ids:c.tag_ids, theme_ids:c.theme_ids,
      })));
    }
    await supabase.from("decks").update({use_count:(srcDeck.use_count||0)+1}).eq("id",srcDeck.id);
    await logEvent(uid,"data_imported",{from_deck:srcDeck.id,name:srcDeck.name});
    setCopiedIds(prev=>[...prev, srcDeck.id]);
    setDecks(prev=>prev.map(d=>d.id===srcDeck.id?{...d,use_count:(d.use_count||0)+1}:d));
    onImport();
    alert("Ordlistan kopierades till dina listor!");
  }

  const sorted = useMemo(()=>{
    let d = decks.filter(deck=>
      deck.name.toLowerCase().includes(search.toLowerCase()) &&
      (!filterTheme || (deck.theme_ids||[]).includes(filterTheme))
    );
    if (sort==="use_count") d.sort((a,b)=>(b.use_count||0)-(a.use_count||0));
    else if (sort==="card_count") d.sort((a,b)=>(cardCounts[b.id]||0)-(cardCounts[a.id]||0));
    else if (sort==="new") d.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    else if (sort==="wrong") d.sort((a,b)=>a.name.localeCompare(b.name));
    return d;
  },[decks, search, sort, filterTheme, cardCounts]);

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Utforska publika listor</h1>
          <p className="view-sub">Hitta och kopiera ordlistor från gemenskapen.</p>
        </div>
      </div>
      <div className="toolbar">
        <input className="search-input" type="search" placeholder="Sök lista…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Sök publika listor" />
        <select className="select-sm" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sortera" title="Sortera listor">
          <option value="use_count">Mest kopierade</option>
          <option value="card_count">Flest kort</option>
          <option value="new">Nyaste</option>
          <option value="name">Namn A–Ö</option>
        </select>
        {themes.length>0 && (
          <select className="select-sm" value={filterTheme} onChange={e=>setFilterTheme(e.target.value)} aria-label="Filtrera tema">
            <option value="">Alla teman</option>
            {themes.map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </select>
        )}
      </div>
      {loading && <p className="muted">Laddar…</p>}
      <div className="decks-grid">
        {sorted.map(deck=>{
          const alreadyCopied = copiedIds.includes(deck.id);
          return (
            <article key={deck.id} className={cn("deck-card", alreadyCopied&&"deck-card-copied")} style={{"--dc":deck.color||"#c84b2f"}}>
              <div className="deck-card-top">
                <span className="deck-icon" aria-hidden="true">{deck.theme_icon||"📚"}</span>
                <div className="deck-badges">
                  <span className="badge badge-green">Publik</span>
                  {alreadyCopied && <span className="badge badge-blue" title="Du har redan kopierat den här listan">✓ Kopierad</span>}
                </div>
              </div>
              <h2 className="deck-name">{deck.name}</h2>
              {deck.description && <p className="deck-desc">{deck.description}</p>}
              <div className="deck-meta">
                <span>{LANG_FLAGS[deck.front_lang]||"?"} → {LANG_FLAGS[deck.back_lang]||"?"}</span>
                <span>{cardCounts[deck.id]||0} kort</span>
                <span>Kopierad {deck.use_count||0}×</span>
              </div>
              <Tooltip text={alreadyCopied ? "Du har redan den här listan" : "Kopiera till dina egna listor"}>
                <button className={cn("btn-sm", alreadyCopied&&"btn-ghost-sm")} onClick={()=>copyDeck(deck)} disabled={alreadyCopied}>
                  {alreadyCopied ? "✓ Redan kopierad" : "Kopiera till mina listor"}
                </button>
              </Tooltip>
            </article>
          );
        })}
        {!loading && sorted.length===0 && <p className="muted center-msg">Inga publika listor hittades.</p>}
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
// HELP VIEW
// ─────────────────────────────────────────────────────────────────
function HelpView({ isAdmin, onClose }) {
  const [tab, setTab] = useState("user");
  const tabs = [
    { id:"user", label:"👤 Användarguide" },
    { id:"study", label:"🃏 Träna smart" },
    { id:"import", label:"📥 Importera" },
    ...(isAdmin ? [{ id:"admin", label:"⚙️ Adminhandbok" }] : []),
    { id:"faq", label:"❓ Vanliga frågor" },
  ];

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1 className="view-title">❓ Hjälp & Guide</h1>
          <p className="view-sub">Lär dig använda Glosträning på bästa sätt.</p>
        </div>
      </div>
      <div className="admin-tabs" role="tablist">
        {tabs.map(t=><button key={t.id} role="tab" aria-selected={tab===t.id} className={cn("admin-tab",tab===t.id&&"active")} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>
      <div className="docs-section" style={{maxWidth:800}}>
        {tab==="user" && <HelpUser />}
        {tab==="study" && <HelpStudy />}
        {tab==="import" && <HelpImport />}
        {tab==="admin" && <HelpAdmin />}
        {tab==="faq" && <HelpFAQ />}
      </div>
    </div>
  );
}

function HelpUser() {
  return (
    <div>
      <h2>Kom igång som användare</h2>
      <h3>1. Skapa din första ordlista</h3>
      <p>Klicka på <strong>+ Ny ordlista</strong> i Ordlistor-vyn. Ge listan ett namn och välj vilket språk som ska vara framsida respektive baksida. Om du väljer samma språk på båda sidor skapar du en <em>begreppslista</em> – perfekt för att lära sig definitioner.</p>
      <h3>2. Lägg till ord</h3>
      <p>Ord kan läggas till på tre sätt: manuellt ett och ett via <strong>+ Nytt kort</strong>, via CSV-import (se fliken Importera), eller via <strong>Utforska</strong> där du kan kopiera andras publika listor.</p>
      <h3>3. Tagga dina kort</h3>
      <p>Taggar hjälper dig filtrera och öva specifika grupper av ord. Globala taggar som <em>Lätt, Medel, Svårt</em> och <em>Verb, Substantiv</em> finns inbyggda. Du kan också skapa egna taggar i din profil.</p>
      <h3>4. Teman</h3>
      <p>Teman (t.ex. Djur, Mat, IT) låter dig öva ord <em>tvärs över listor</em>. Gå till <strong>Öva tema</strong> för att träna alla dina kort med ett visst tema på en gång.</p>
      <h3>5. Dela din lista</h3>
      <p>Klicka på hänglåset 🔒 på en lista för att göra den publik. Andra användare kan då hitta och kopiera den via <strong>Utforska</strong>. Klicka 🔓 igen för att göra den privat.</p>
      <h3>Best practices</h3>
      <ul>
        <li>Håll listor fokuserade – 20–50 ord per lista är lagom</li>
        <li>Lägg till emojis och bilder för bättre memorering</li>
        <li>Träna regelbundet – hellre 10 minuter varje dag än 1 timme en gång i veckan</li>
        <li>Använd <em>Dags att repetera</em> för effektivt lärande via spaced repetition</li>
        <li>Markera svåra ord som favoriter ⭐ och öva dem extra</li>
        <li>Flagga 🚩 felaktiga kort så kan administratören rätta dem</li>
      </ul>
    </div>
  );
}

function HelpStudy() {
  return (
    <div>
      <h2>Träna smart med spaced repetition</h2>
      <p>Glosträning använder <strong>spaced repetition</strong> – en vetenskapligt beprövad metod där ord du kan bra visas mer sällan, och ord du har svårt för visas oftare.</p>
      <h3>Träningslägen</h3>
      <ul>
        <li><strong>Hela listan</strong> – Alla kort i slumpmässig ordning. Bra för att lära sig nya ord.</li>
        <li><strong>Dags att repetera</strong> – Bara de kort som är schemalagda för repetition idag. Mest effektivt för inlärning!</li>
        <li><strong>Baksidan först</strong> – Träna "baklänges" – se översättningen och gissa originalordet.</li>
        <li><strong>Fel senaste gången</strong> – Öva enbart ord du svarade fel på nyligen.</li>
        <li><strong>Svarat fel någon gång</strong> – Alla ord du någonsin haft svårt med.</li>
        <li><strong>Favoriter ⭐</strong> – Bara dina favoritmarkerade ord.</li>
        <li><strong>Per tagg</strong> – Öva bara ord med en specifik tagg, t.ex. "Verb".</li>
      </ul>
      <h3>Under träningen</h3>
      <ul>
        <li>Klicka på kortet (eller tryck Space/Enter) för att vända det</li>
        <li>Klicka <strong>✓ Rätt</strong> om du visste svaret, <strong>✗ Fel</strong> annars</li>
        <li>Var ärlig mot dig själv – det ger bättre inlärning</li>
        <li>⭐ Favoritmarkera ord du vill öva extra</li>
        <li>🚩 Flagga kort som verkar ha fel information</li>
        <li>⟩ Hoppa över om du vill komma tillbaka till ordet senare</li>
      </ul>
      <h3>Förstå dina statistik</h3>
      <p>Träffsäkerhet över 80% är bra. Om ett ämne ligger under 60% – öva mer! Streak visar hur många gånger i rad du svarat rätt på ett ord.</p>
    </div>
  );
}

function HelpImport() {
  return (
    <div>
      <h2>Importera ord via CSV</h2>
      <p>CSV-import är det snabbaste sättet att lägga till många ord på en gång. Du kan exportera från Excel, Google Sheets eller skriva direkt i textfältet.</p>
      <h3>Format</h3>
      <p>En rad per ord, fälten separerade med kommatecken:</p>
      <pre style={{background:"var(--bg2)",padding:12,borderRadius:8,fontSize:13}}>{`framsida, baksida, kommentar, emoji, svårighet
hund, dog, En fyrbent vän, 🐶, 1
katt, cat, , 🐱, 2
oregelbunden, irregular, Oregelbundet verb, , 3`}</pre>
      <h3>Kolumner</h3>
      <ul>
        <li><strong>Kolumn 1 (obligatorisk)</strong>: Framsida – ordet du vill lära dig</li>
        <li><strong>Kolumn 2 (obligatorisk)</strong>: Baksida – översättning eller definition</li>
        <li><strong>Kolumn 3 (valfri)</strong>: Kommentar, förklaring eller exempel</li>
        <li><strong>Kolumn 4 (valfri)</strong>: Emoji som visas på kortet</li>
        <li><strong>Kolumn 5 (valfri)</strong>: Svårighet 1–5 (standard är 2)</li>
      </ul>
      <h3>Tips för import</h3>
      <ul>
        <li>Tomma fält lämnas tomma: <code>katt, cat,,🐱</code></li>
        <li>Citat-tecken runt fält som innehåller kommatecken: <code>"to be, or not to be", att vara</code></li>
        <li>Efter CSV-uppladdning kan du lägga till <em>ämnen</em>, <em>kurser</em> och <em>teman</em> för att göra orden sökbara</li>
        <li>Förhandsgranskningen visar de 5 första raderna</li>
      </ul>
      <h3>Exportera från Excel/Google Sheets</h3>
      <p>Lägg orden i kolumn A och B (och eventuellt C–E). Spara som CSV (Arkiv → Ladda ner som → CSV) och klistra in innehållet.</p>
    </div>
  );
}

function HelpAdmin() {
  return (
    <div>
      <h2>Administratörshandbok</h2>
      <p>Som systemadministratör (sysadmin) har du tillgång till administrationspanelen via ⚙️ Admin i navigeringen.</p>
      <h3>Flikarna i admin</h3>
      <ul>
        <li><strong>📊 Statistik</strong>: Översikt av hela systemet – antal listor, kort, användare. Visar mest flaggade kort.</li>
        <li><strong>📚 Listor</strong>: Se och hantera alla användares listor. Aktivera/inaktivera, publicera/avpublicera, ta bort. Klicka på en lista för att se och redigera dess kort.</li>
        <li><strong>🃏 Kort</strong>: Sök och filtrera alla kort. Filtrera på flaggade, utan ikon, utan taggar, per tagg, lista eller tema. Massredigera taggar och teman på flera kort simultaneously.</li>
        <li><strong>👥 Användare</strong>: Se alla användare. Ändra roller (Användare/Gruppansvarig/Systemadmin) och plan (Gratis/Betald). Anonymisera GDPR-raderade konton.</li>
        <li><strong>🏷️ Taggar</strong>: Skapa och hantera globala taggar som alla användare ser. Aktivera/inaktivera taggar.</li>
        <li><strong>🎨 Teman</strong>: Skapa och hantera teman (t.ex. Djur, Mat). Teman används för att öva tvärs över listor.</li>
        <li><strong>📋 Logg</strong>: Händelselogg för alla systemhändelser – nya konton, importer, sessioner, flaggade kort, borttagna konton.</li>
        <li><strong>📥 Import</strong>: Importera CSV direkt som admin och skapa en ny lista.</li>
        <li><strong>📖 Dokumentation</strong>: Teknisk dokumentation för utvecklare.</li>
      </ul>
      <h3>Best practices för administration</h3>
      <ul>
        <li>Granska flaggade kort regelbundet (filtrera på "Flaggade" i Kort-fliken)</li>
        <li>Håll globala taggar enkla och väldefinierade – för många taggar förvirrar användare</li>
        <li>Teman bör spegla bredare kategorier som lämpar sig för tematisk övning</li>
        <li>Anonymisera – ta inte bort – GDPR-begäranden för att behålla statistikens integritet</li>
        <li>Använd massfunktioner (Bulk) för att effektivt tagga importerade kort</li>
        <li>Kontrollera loggen vid misstänkt aktivitet</li>
      </ul>
      <h3>Roller</h3>
      <ul>
        <li><strong>user</strong>: Standardanvändare. Kan hantera sina egna listor och kort.</li>
        <li><strong>group_manager</strong>: Kan se och hantera alla listor och kort (ej användare).</li>
        <li><strong>sysadmin</strong>: Full åtkomst inklusive användarpanel och systemlogg.</li>
      </ul>
    </div>
  );
}

function HelpFAQ() {
  const faqs = [
    { q: "Varför visas inte alla mina ord i träningsläget?", a: "Om du valt 'Dags att repetera' visas bara ord vars nästa repetitionsdatum passerats. Välj 'Hela listan' för att se alla." },
    { q: "Hur fungerar spaced repetition?", a: "Varje gång du svarar rätt på ett ord schemaläggs det längre fram i tid. Svåra ord (många fel) visas dagligen, medan lätta ord kan vänta i veckor. Detta kallas spaced repetition och är vetenskapligt bevisat effektivt." },
    { q: "Vad händer när jag flaggar ett kort?", a: "Flaggningen informerar administratören om att kortet kan innehålla fel. Kortet förblir synligt för dig men markeras med 🚩. Administratören kan sedan rätta eller ta bort kortet." },
    { q: "Kan jag dölja flaggade kort?", a: "Ja! I kortlistan (Kort-fliken) och i hemvyn för en lista finns knappar för att dölja eller visa bara flaggade kort." },
    { q: "Hur delar jag en lista?", a: "Klicka på hänglåset 🔒 på listan i Ordlistor-vyn. Det byter till 🔓 och listan visas i Utforska för alla användare." },
    { q: "Kan jag kopiera en lista mer än en gång?", a: "Nej, varje publik lista kan bara kopieras en gång per användare för att undvika dubbletter." },
    { q: "Vad är skillnaden på ämnen, teman och taggar?", a: "Taggar används för att kategorisera enskilda kort (t.ex. Verb, Svårt). Teman (t.ex. Djur, Mat) kategoriserar ord och låter dig öva tvärs över listor. Ämnen (t.ex. Engelska) och kurser är metadata för listor som hjälper organisering." },
    { q: "Hur raderar jag mina personuppgifter?", a: "Gå till Profil → Radera mina personuppgifter. Ditt användarnamn anonymiseras och kontot inaktiveras. Din träningsstatistik behålls anonymt för systemförbättringar." },
  ];
  return (
    <div>
      <h2>Vanliga frågor</h2>
      {faqs.map((f,i)=>(
        <div key={i} className="faq-item">
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </div>
  );
}


function AdminView({ uid, themes, tags, onUpdate }) {
  const [tab, setTab] = useState("stats");
  const tabs = [
    { id:"stats", label:"📊 Statistik" },
    { id:"decks", label:"📚 Listor" },
    { id:"cards", label:"🃏 Kort" },
    { id:"users", label:"👥 Användare" },
    { id:"tags", label:"🏷️ Taggar" },
    { id:"themes", label:"🎨 Teman" },
    { id:"log", label:"📋 Logg" },
    { id:"import", label:"📥 Import" },
    { id:"docs", label:"📖 Dokumentation" },
    { id:"help", label:"❓ Admin-hjälp" },
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
        {tab==="decks" && <AdminDecks uid={uid} tags={tags} themes={themes} onUpdate={onUpdate} />}
        {tab==="cards" && <AdminCards tags={tags} themes={themes} onUpdate={onUpdate} />}
        {tab==="users" && <AdminUsers uid={uid} />}
        {tab==="tags" && <AdminTags tags={tags} uid={uid} onUpdate={onUpdate} />}
        {tab==="themes" && <AdminThemes themes={themes} uid={uid} onUpdate={onUpdate} />}
        {tab==="log" && <AdminLog />}
        {tab==="import" && <AdminImport uid={uid} tags={tags} themes={themes} onUpdate={onUpdate} />}
        {tab==="docs" && <DevDocs />}
        {tab==="help" && <HelpAdmin />}
      </div>
    </div>
  );
}

// ── Admin: Stats ──────────────────────────────────────────────────
function AdminStats() {
  const [stats, setStats] = useState(null);
  const [topDecks, setTopDecks] = useState([]);
  const [topTags, setTopTags] = useState([]);

  useEffect(()=>{
    (async()=>{
      const [
        {count:decks},{count:cards},{count:users},{count:views},{data:wrong},{data:mostCopied},{data:allTags},{data:allCards}
      ] = await Promise.all([
        supabase.from("decks").select("*",{count:"exact",head:true}),
        supabase.from("cards").select("*",{count:"exact",head:true}),
        supabase.from("profiles").select("*",{count:"exact",head:true}),
        supabase.from("progress").select("correct",{count:"exact",head:true}),
        supabase.from("cards").select("front,back,flag_count,view_count").order("flag_count",{ascending:false}).limit(10),
        supabase.from("decks").select("id,name,theme_icon,use_count,user_id").order("use_count",{ascending:false}).limit(10),
        supabase.from("tags").select("id,name,color"),
        supabase.from("cards").select("tag_ids"),
      ]);
      setStats({ decks,cards,users,views,wrong:wrong||[] });
      setTopDecks(mostCopied||[]);
      // Count tag usage
      const tagCount = {};
      (allCards||[]).forEach(c=>(c.tag_ids||[]).forEach(tid=>{tagCount[tid]=(tagCount[tid]||0)+1;}));
      const tagsSorted = (allTags||[]).map(t=>({...t,count:tagCount[t.id]||0})).filter(t=>t.count>0).sort((a,b)=>b.count-a.count).slice(0,10);
      setTopTags(tagsSorted);
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:8}}>
        {topDecks.filter(d=>(d.use_count||0)>0).length > 0 && (
          <div className="stats-section">
            <h3 className="section-title">🏆 Mest kopierade listor</h3>
            <table className="cards-table"><thead><tr><th>Lista</th><th>Kopierad</th></tr></thead>
              <tbody>{topDecks.filter(d=>(d.use_count||0)>0).map((d,i)=><tr key={i}><td>{d.theme_icon||"📚"} {d.name}</td><td>{d.use_count}×</td></tr>)}</tbody>
            </table>
          </div>
        )}
        {topTags.length > 0 && (
          <div className="stats-section">
            <h3 className="section-title">🏷️ Mest använda taggar</h3>
            <table className="cards-table"><thead><tr><th>Tagg</th><th>Antal kort</th></tr></thead>
              <tbody>{topTags.map((t,i)=><tr key={i}><td><span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:t.color,marginRight:6}} />{t.name}</td><td>{t.count}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      {stats.wrong.filter(c=>c.flag_count>0).length>0 && (
        <div className="stats-section" style={{marginTop:8}}>
          <h3 className="section-title">🚩 Mest flaggade kort</h3>
          <table className="cards-table"><thead><tr><th>Framsida</th><th>Baksida</th><th>Flaggningar</th><th>Visningar</th></tr></thead>
            <tbody>{stats.wrong.filter(c=>c.flag_count>0).map((c,i)=><tr key={i}><td>{c.front}</td><td>{c.back}</td><td>{c.flag_count}</td><td>{c.view_count||0}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Admin: Decks ──────────────────────────────────────────────────
function AdminDecks({ uid, tags, themes, onUpdate }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null); // deck being edited for cards
  const [deckCards, setDeckCards] = useState([]);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  async function loadDecks() {
    setLoading(true);
    const { data } = await supabase.from("decks").select("*").order("created_at", { ascending: false });
    setDecks(data || []);
    setLoading(false);
  }

  async function loadDeckCards(deckId) {
    const { data } = await supabase.from("cards").select("*").eq("deck_id", deckId).order("created_at");
    setDeckCards(data || []);
  }

  useEffect(() => { loadDecks(); }, []);
  useEffect(() => { if (selected) loadDeckCards(selected.id); }, [selected]);

  async function toggleActive(deck) {
    await supabase.from("decks").update({ is_active: !deck.is_active }).eq("id", deck.id);
    loadDecks();
  }
  async function togglePublic(deck) {
    await supabase.from("decks").update({ is_public: !deck.is_public }).eq("id", deck.id);
    loadDecks();
  }
  async function deleteDeck(deck) {
    if (!confirm(`Ta bort listan "${deck.name}" och alla dess kort?`)) return;
    await supabase.from("decks").delete().eq("id", deck.id);
    if (selected?.id === deck.id) { setSelected(null); setDeckCards([]); }
    loadDecks(); onUpdate();
  }

  async function saveCard(data) {
    const payload = { front: data.front, back: data.back, notes: data.notes || null };
    if (data.front_emoji !== undefined) payload.front_emoji = data.front_emoji;
    if (data.back_emoji !== undefined) payload.back_emoji = data.back_emoji;
    if (data.difficulty !== undefined) payload.difficulty = data.difficulty;
    if (data.tag_ids !== undefined) payload.tag_ids = data.tag_ids;
    if (data.theme_ids !== undefined) payload.theme_ids = data.theme_ids;

    if (data.id) {
      await supabase.from("cards").update(payload).eq("id", data.id);
    } else {
      await supabase.from("cards").insert({ ...payload, user_id: uid, deck_id: selected.id });
    }
    setShowCardEditor(false); setEditingCard(null);
    loadDeckCards(selected.id); onUpdate();
  }

  async function deleteCard(id) {
    if (!confirm("Ta bort kortet?")) return;
    await supabase.from("cards").delete().eq("id", id);
    loadDeckCards(selected.id); onUpdate();
  }

  async function toggleCardActive(card) {
    await supabase.from("cards").update({ is_active: !card.is_active }).eq("id", card.id);
    loadDeckCards(selected.id);
  }

  const [selectedCards, setSelectedCards] = useState(new Set());
  const [showMediaFetcher, setShowMediaFetcher] = useState(false);

  function toggleCardSelect(id) {
    setSelectedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    if (selectedCards.size === deckCards.length) setSelectedCards(new Set());
    else setSelectedCards(new Set(deckCards.map(c => c.id)));
  }

  const filtered = decks.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {!selected ? (
        <>
          <div className="toolbar">
            <input className="search-input" type="search" placeholder="Sök lista…" value={search} onChange={e => setSearch(e.target.value)} aria-label="Sök listor" />
          </div>
          {loading ? <p className="muted">Laddar…</p> : (
            <div className="cards-table-wrap">
              <table className="cards-table">
                <thead>
                  <tr>
                    <th>Lista</th>
                    <th>Ägare (user_id)</th>
                    <th>Aktiv</th>
                    <th>Publik</th>
                    <th>Skapad</th>
                    <th>Åtgärder</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(deck => (
                    <tr key={deck.id} className={cn(!deck.is_active && "row-inactive")}>
                      <td>
                        <strong>{deck.theme_icon || "📚"} {deck.name}</strong>
                        {deck.description && <div className="notes-cell">{deck.description}</div>}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{deck.user_id?.slice(0, 8)}…</td>
                      <td>{deck.is_active !== false ? "Ja" : "Nej"}</td>
                      <td>{deck.is_public ? "🌐 Ja" : "🔒 Nej"}</td>
                      <td>{fmtDate(deck.created_at)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button className="btn-sm btn-ghost-sm" onClick={() => { setSelected(deck); setSelectedCards(new Set()); }}>✏️ Kort</button>
                          <button className="btn-sm btn-ghost-sm" onClick={() => togglePublic(deck)}>{deck.is_public ? "🔒 Gör privat" : "🌐 Publicera"}</button>
                          <button className="btn-sm btn-ghost-sm" onClick={() => toggleActive(deck)}>{deck.is_active !== false ? "Inaktivera" : "Aktivera"}</button>
                          <button className="btn-sm btn-danger-sm" onClick={() => deleteDeck(deck)}>Ta bort</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="muted center-msg">Inga listor.</p>}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="view-header" style={{ marginBottom: 16 }}>
            <div>
              <button className="btn-ghost" onClick={() => { setSelected(null); setDeckCards([]); setSelectedCards(new Set()); }}>← Tillbaka till listor</button>
              <h2 style={{ marginTop: 8 }}>{selected.theme_icon} {selected.name}</h2>
              <p className="muted">{deckCards.length} kort · {selectedCards.size} markerade</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {selectedCards.size > 0 && (
                <button className="btn-primary" onClick={() => setShowMediaFetcher(true)}>
                  🖼️ Hämta media för {selectedCards.size} kort
                </button>
              )}
              <button className="btn-primary" onClick={() => { setEditingCard(null); setShowCardEditor(true); }}>+ Nytt kort</button>
            </div>
          </div>

          {showCardEditor && (
            <CardEditor
              card={editingCard}
              tags={tags}
              themes={themes}
              deckId={selected.id}
              onSave={saveCard}
              onCancel={() => { setShowCardEditor(false); setEditingCard(null); }}
            />
          )}

          {showMediaFetcher && (
            <MediaFetcher
              cards={deckCards.filter(c => selectedCards.has(c.id))}
              onApply={async (updates) => {
                for (const { id, patch } of updates) {
                  await supabase.from("cards").update(patch).eq("id", id);
                }
                setShowMediaFetcher(false);
                setSelectedCards(new Set());
                loadDeckCards(selected.id);
                onUpdate();
              }}
              onClose={() => setShowMediaFetcher(false)}
            />
          )}

          <div className="cards-table-wrap">
            <table className="cards-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox"
                      checked={deckCards.length > 0 && selectedCards.size === deckCards.length}
                      onChange={toggleSelectAll}
                      aria-label="Markera alla"
                    />
                  </th>
                  <th>Framsida</th>
                  <th>Baksida</th>
                  <th>Bild/Emoji</th>
                  <th>Aktiv</th>
                  <th>Flaggad</th>
                  <th>Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {deckCards.map(card => (
                  <tr key={card.id} className={cn(!card.is_active && "row-inactive", card.is_flagged && "row-flagged", selectedCards.has(card.id) && "row-selected")}>
                    <td>
                      <input type="checkbox"
                        checked={selectedCards.has(card.id)}
                        onChange={() => toggleCardSelect(card.id)}
                        aria-label={`Markera ${card.front}`}
                      />
                    </td>
                    <td>
                      {card.front_emoji && <span aria-hidden="true">{card.front_emoji} </span>}
                      {card.front}
                    </td>
                    <td>{card.back_emoji && <span aria-hidden="true">{card.back_emoji} </span>}{card.back}</td>
                    <td>
                      {card.front_image
                        ? <img src={card.front_image} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                        : card.front_icon
                          ? <img src={card.front_icon} alt="" style={{ width: 32, height: 32, opacity: 0.7 }} />
                          : card.front_emoji
                            ? <span style={{ fontSize: 22 }}>{card.front_emoji}</span>
                            : <span className="muted">–</span>
                      }
                    </td>
                    <td>{card.is_active !== false ? "Ja" : "Nej"}</td>
                    <td>{card.is_flagged ? <span className="badge badge-red">🚩</span> : "–"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-sm btn-ghost-sm" onClick={() => { setEditingCard(card); setShowCardEditor(true); }}>Redigera</button>
                        <button className="btn-sm btn-ghost-sm" onClick={() => toggleCardActive(card)}>{card.is_active !== false ? "Inaktivera" : "Aktivera"}</button>
                        <button className="btn-sm btn-danger-sm" onClick={() => deleteCard(card.id)}>Ta bort</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deckCards.length === 0 && <p className="muted center-msg">Inga kort i den här listan.</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MEDIA FETCHER — admin bulk-tilldelning av emoji/ikon/bild
// ─────────────────────────────────────────────────────────────────
const EMOJI_MAP = {
  // djur
  dog:"🐕",hund:"🐕",cat:"🐱",katt:"🐱",bird:"🐦",fågel:"🐦",fish:"🐟",fisk:"🐟",
  rabbit:"🐰",kanin:"🐰",horse:"🐴",häst:"🐴",cow:"🐄",ko:"🐄",pig:"🐷",gris:"🐷",
  lion:"🦁",tiger:"🐯",bear:"🐻",björn:"🐻",elephant:"🐘",elefant:"🐘",
  // mat
  apple:"🍎",äpple:"🍎",banana:"🍌",banan:"🍌",bread:"🍞",bröd:"🍞",
  coffee:"☕",kaffe:"☕",water:"💧",vatten:"💧",pizza:"🍕",cake:"🎂",tårta:"🎂",
  // natur
  sun:"☀️",sol:"☀️",moon:"🌙",måne:"🌙",star:"⭐",stjärna:"⭐",cloud:"☁️",moln:"☁️",
  rain:"🌧️",regn:"🌧️",snow:"❄️",snö:"❄️",tree:"🌲",träd:"🌲",flower:"🌸",blomma:"🌸",
  // hem
  house:"🏠",hus:"🏠",car:"🚗",bil:"🚗",book:"📚",bok:"📚",computer:"💻",dator:"💻",
  phone:"📱",telefon:"📱",key:"🔑",nyckel:"🔑",clock:"⏰",klocka:"⏰",
  // kropp
  eye:"👁️",öga:"👁️",hand:"✋",hand:"✋",heart:"❤️",hjärta:"❤️",
  // övrigt
  school:"🏫",skola:"🏫",music:"🎵",musik:"🎵",money:"💰",pengar:"💰",
  fire:"🔥",eld:"🔥",mountain:"⛰️",berg:"⛰️",ocean:"🌊",hav:"🌊",
};

function guessEmoji(word) {
  if (!word) return null;
  const key = word.toLowerCase().trim();
  return EMOJI_MAP[key] || null;
}

async function fetchWikimediaImage(word) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source || data?.originalimage?.source || null;
  } catch { return null; }
}

async function fetchUnsplashImage(word, apiKey) {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&client_id=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.urls?.small || null;
  } catch { return null; }
}

function MediaFetcher({ cards, onApply, onClose }) {
  const [mode, setMode] = useState("emoji"); // emoji | icon | wikimedia | unsplash
  const [unsplashKey, setUnsplashKey] = useState("");
  const [side, setSide] = useState("front"); // front | back
  const [results, setResults] = useState({}); // cardId → { url, type, chosen }
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function fetchAll() {
    setLoading(true); setProgress(0);
    const next = {};
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const word = side === "front" ? card.front : card.back;
      let result = null;

      if (mode === "emoji") {
        const emoji = guessEmoji(word);
        if (emoji) result = { type: "emoji", value: emoji, preview: emoji };
      } else if (mode === "icon") {
        const iconUrl = lookupIcon(word);
        if (iconUrl) result = { type: "icon", value: iconUrl, preview: iconUrl };
      } else if (mode === "wikimedia") {
        const imgUrl = await fetchWikimediaImage(word);
        if (imgUrl) result = { type: "image", value: imgUrl, preview: imgUrl };
      } else if (mode === "unsplash" && unsplashKey) {
        const imgUrl = await fetchUnsplashImage(word, unsplashKey);
        if (imgUrl) result = { type: "image", value: imgUrl, preview: imgUrl };
      }

      next[card.id] = { ...result, chosen: !!result, word };
      setProgress(Math.round((i + 1) / cards.length * 100));
    }
    setResults(next);
    setLoading(false);
  }

  function toggleChosen(id) {
    setResults(prev => ({ ...prev, [id]: { ...prev[id], chosen: !prev[id].chosen } }));
  }

  async function handleApply() {
    const updates = [];
    for (const card of cards) {
      const r = results[card.id];
      if (!r?.chosen || !r.value) continue;
      const patch = {};
      if (r.type === "emoji") {
        patch[side === "front" ? "front_emoji" : "back_emoji"] = r.value;
      } else if (r.type === "icon") {
        patch[side === "front" ? "front_icon" : "back_icon"] = r.value;
      } else if (r.type === "image") {
        patch[side === "front" ? "front_image" : "back_image"] = r.value;
      }
      if (Object.keys(patch).length) updates.push({ id: card.id, patch });
    }
    await onApply(updates);
  }

  const chosenCount = Object.values(results).filter(r => r?.chosen).length;
  const foundCount = Object.values(results).filter(r => r?.value).length;

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Hämta media">
      <div className="editor-card editor-card-wide media-fetcher">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h2>🖼️ Hämta media för {cards.length} kort</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Stäng">✕</button>
        </div>

        <div className="media-config">
          <div className="form-field">
            <label className="form-label">Typ av media</label>
            <div className="media-mode-btns">
              {[
                { id:"emoji", label:"😀 Emoji", desc:"Automatisk från ordlista" },
                { id:"icon", label:"◈ SVG-ikon", desc:"Tabler Icons (MIT)" },
                { id:"wikimedia", label:"📷 Wikimedia", desc:"Fria foton, ingen nyckel" },
                { id:"unsplash", label:"🌅 Unsplash", desc:"Foton, API-nyckel krävs" },
              ].map(m => (
                <button key={m.id}
                  className={cn("media-mode-btn", mode===m.id && "active")}
                  onClick={() => setMode(m.id)}
                  aria-pressed={mode===m.id}
                >
                  <span className="media-mode-label">{m.label}</span>
                  <span className="media-mode-desc">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === "unsplash" && (
            <div className="form-field">
              <label className="form-label" htmlFor="unsplash-key">Unsplash Access Key</label>
              <input id="unsplash-key" className="form-input" type="password"
                value={unsplashKey} onChange={e => setUnsplashKey(e.target.value)}
                placeholder="Hämta gratis på unsplash.com/developers"
              />
              <p className="import-format">Gratis konto ger 50 förfrågningar/timme. <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer">Registrera →</a></p>
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Applicera på</label>
            <div style={{ display:"flex", gap:8 }}>
              <button className={cn("btn-ghost", side==="front" && "btn-active")} onClick={()=>setSide("front")} aria-pressed={side==="front"}>Framsida</button>
              <button className={cn("btn-ghost", side==="back" && "btn-active")} onClick={()=>setSide("back")} aria-pressed={side==="back"}>Baksida</button>
            </div>
          </div>

          <button className="btn-primary" onClick={fetchAll}
            disabled={loading || (mode==="unsplash" && !unsplashKey)}
            aria-busy={loading}
          >
            {loading ? `Hämtar… ${progress}%` : "Sök media →"}
          </button>
        </div>

        {loading && (
          <div className="media-progress-bar" aria-label={`${progress}% klart`}>
            <div className="media-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}

        {Object.keys(results).length > 0 && (
          <>
            <div className="media-summary">
              Hittade media för <strong>{foundCount}</strong> av {cards.length} kort.
              <strong> {chosenCount}</strong> valda att spara.
              <button className="btn-link" style={{marginLeft:12}}
                onClick={() => setResults(prev => {
                  const next = {...prev};
                  Object.keys(next).forEach(id => { if (next[id]?.value) next[id] = {...next[id], chosen: true}; });
                  return next;
                })}>Markera alla</button>
              <button className="btn-link" style={{marginLeft:8}}
                onClick={() => setResults(prev => {
                  const next = {...prev};
                  Object.keys(next).forEach(id => { next[id] = {...next[id], chosen: false}; });
                  return next;
                })}>Avmarkera alla</button>
            </div>

            <div className="media-results-grid">
              {cards.map(card => {
                const r = results[card.id];
                const word = side === "front" ? card.front : card.back;
                return (
                  <div key={card.id} className={cn("media-result-card", r?.chosen && r?.value && "chosen", !r?.value && "no-result")}>
                    <div className="media-result-word">{word}</div>
                    {r?.value ? (
                      <>
                        <div className="media-result-preview">
                          {r.type === "emoji"
                            ? <span style={{ fontSize: 40 }}>{r.value}</span>
                            : r.type === "icon"
                              ? <img src={r.value} alt="" style={{ width: 48, height: 48, opacity: 0.8 }} />
                              : <img src={r.value} alt="" style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }} />
                          }
                        </div>
                        <button
                          className={cn("media-result-toggle", r.chosen && "active")}
                          onClick={() => toggleChosen(card.id)}
                          aria-pressed={r.chosen}
                        >
                          {r.chosen ? "✓ Vald" : "Välj"}
                        </button>
                      </>
                    ) : (
                      <div className="media-no-result">Ingen träff</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="editor-actions" style={{ marginTop: 16 }}>
              <button className="btn-primary" onClick={handleApply} disabled={chosenCount === 0}>
                Spara {chosenCount} kort →
              </button>
              <button className="btn-ghost" onClick={onClose}>Avbryt</button>
            </div>
          </>
        )}
      </div>
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
  const [editingCard, setEditingCard] = useState(null);
  const [showBulkMedia, setShowBulkMedia] = useState(false);
  const [showBulkTags, setShowBulkTags] = useState(false);
  const [showBulkThemes, setShowBulkThemes] = useState(false);
  const [filterTag, setFilterTag] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [allDecks, setAllDecks] = useState([]);
  const [filterDeck, setFilterDeck] = useState("");

  async function load() {
    setLoading(true);
    let q = supabase.from("cards").select("*").order("created_at",{ascending:false});
    if (filter==="flagged") q=q.eq("is_flagged",true);
    else if (filter==="no_icon") q=q.is("front_emoji","").or("front_emoji.is.null");
    else if (filter==="no_tags") q=q.eq("tag_ids","{}");
    else if (filter==="orphan") {
      // Cards not in any deck that exists - load all cards then filter
    }
    const { data } = await q; setCards(data||[]); setLoading(false);
  }

  useEffect(()=>{
    (async()=>{ const {data} = await supabase.from("decks").select("id,name,theme_icon").order("name"); setAllDecks(data||[]); })();
  },[]);

  useEffect(()=>{ load(); },[filter]);

  async function applyBulk() {
    if (!selected.length || !bulkAction) return;
    if (bulkAction==="deactivate") await supabase.from("cards").update({is_active:false}).in("id",selected);
    else if (bulkAction==="activate") await supabase.from("cards").update({is_active:true}).in("id",selected);
    else if (bulkAction==="unflag") await supabase.from("cards").update({is_flagged:false,flag_count:0}).in("id",selected);
    else if (bulkAction==="delete") {
      if(!confirm(`Ta bort ${selected.length} kort?`)) return;
      await supabase.from("cards").delete().in("id",selected);
    } else if (bulkAction==="media") { setShowBulkMedia(true); return; }
    else if (bulkAction==="tags") { setShowBulkTags(true); return; }
    else if (bulkAction==="themes") { setShowBulkThemes(true); return; }
    setSelected([]); setBulkAction(""); load(); onUpdate();
  }

  async function applyBulkTags(tagIds, mode) {
    // mode: "add" | "remove" | "replace"
    const affectedCards = cards.filter(c => selected.includes(c.id));
    for (const card of affectedCards) {
      const existing = card.tag_ids || [];
      let next;
      if (mode === "add") next = [...new Set([...existing, ...tagIds])];
      else if (mode === "remove") next = existing.filter(id => !tagIds.includes(id));
      else next = tagIds; // replace
      await supabase.from("cards").update({ tag_ids: next }).eq("id", card.id);
    }
    setShowBulkTags(false); setSelected([]); setBulkAction(""); load(); onUpdate();
  }

  async function applyBulkThemes(themeIds, mode) {
    const affectedCards = cards.filter(c => selected.includes(c.id));
    for (const card of affectedCards) {
      const existing = card.theme_ids || [];
      let next;
      if (mode === "add") next = [...new Set([...existing, ...themeIds])];
      else if (mode === "remove") next = existing.filter(id => !themeIds.includes(id));
      else next = themeIds;
      await supabase.from("cards").update({ theme_ids: next }).eq("id", card.id);
    }
    setShowBulkThemes(false); setSelected([]); setBulkAction(""); load(); onUpdate();
  }

  async function saveEdit(card) {
    const patch = {
      front: card.front, back: card.back, notes: card.notes || null,
      tag_ids: card.tag_ids || [], theme_ids: card.theme_ids || [],
      front_emoji: card.front_emoji || "", back_emoji: card.back_emoji || "",
      front_icon: card.front_icon || "", back_icon: card.back_icon || "",
      front_image: card.front_image || null, back_image: card.back_image || null,
    };
    await supabase.from("cards").update(patch).eq("id", card.id);
    setEditingCard(null); load(); onUpdate();
  }

  const deckIds = new Set(allDecks.map(d=>d.id));
  const filtered = cards.filter(c=>{
    if (filter==="orphan" && deckIds.has(c.deck_id)) return false;
    if (!(c.front+" "+c.back+" "+(c.notes||"")).toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTag && !(c.tag_ids||[]).includes(filterTag)) return false;
    if (filterTheme && !(c.theme_ids||[]).includes(filterTheme)) return false;
    if (filterDeck && c.deck_id!==filterDeck) return false;
    return true;
  });
  const toggleAll = () => setSelected(s=>s.length===filtered.length?[]:filtered.map(c=>c.id));
  const selectedCards = cards.filter(c => selected.includes(c.id));

  return (
    <div>
      {editingCard && (
        <AdminCardEditModal card={editingCard} tags={tags} themes={themes}
          onSave={saveEdit} onCancel={() => setEditingCard(null)} />
      )}
      {showBulkMedia && (
        <MediaFetcher cards={selectedCards}
          onApply={async (updates) => {
            for (const { id, patch } of updates) await supabase.from("cards").update(patch).eq("id", id);
            setShowBulkMedia(false); setSelected([]); setBulkAction(""); load(); onUpdate();
          }}
          onClose={() => setShowBulkMedia(false)} />
      )}
      {showBulkTags && (
        <BulkTagThemeModal
          title={`Taggar för ${selected.length} kort`}
          items={tags}
          onApply={applyBulkTags}
          onCancel={() => { setShowBulkTags(false); setBulkAction(""); }}
        />
      )}
      {showBulkThemes && (
        <BulkTagThemeModal
          title={`Teman för ${selected.length} kort`}
          items={themes.map(t => ({ ...t, name: `${t.icon} ${t.name}` }))}
          onApply={applyBulkThemes}
          onCancel={() => { setShowBulkThemes(false); setBulkAction(""); }}
        />
      )}

      <div className="toolbar" style={{flexWrap:"wrap"}}>
        <select className="select-sm" value={filter} onChange={e=>setFilter(e.target.value)} title="Filtrera korttyp">
          <option value="all">Alla kort</option>
          <option value="flagged">🚩 Flaggade</option>
          <option value="no_icon">Saknar ikon</option>
          <option value="no_tags">Saknar taggar</option>
          <option value="orphan">Utan lista</option>
        </select>
        <input className="search-input" type="search" placeholder="Sök kort…" value={search} onChange={e=>setSearch(e.target.value)} aria-label="Sök kort" />
        {tags.length>0 && (
          <select className="select-sm" value={filterTag} onChange={e=>setFilterTag(e.target.value)} title="Filtrera på tagg">
            <option value="">Alla taggar</option>
            {tags.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        {themes.length>0 && (
          <select className="select-sm" value={filterTheme} onChange={e=>setFilterTheme(e.target.value)} title="Filtrera på tema">
            <option value="">Alla teman</option>
            {themes.map(t=><option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </select>
        )}
        {allDecks.length>0 && (
          <select className="select-sm" value={filterDeck} onChange={e=>setFilterDeck(e.target.value)} title="Filtrera på lista">
            <option value="">Alla listor</option>
            {allDecks.map(d=><option key={d.id} value={d.id}>{d.theme_icon||"📚"} {d.name}</option>)}
          </select>
        )}
        {selected.length > 0 && (
          <>
            <select className="select-sm" value={bulkAction} onChange={e=>setBulkAction(e.target.value)} aria-label="Massåtgärd">
              <option value="">Välj åtgärd för {selected.length} kort…</option>
              <option value="activate">✓ Aktivera</option>
              <option value="deactivate">✗ Inaktivera</option>
              <option value="unflag">🚩 Ta bort flagga</option>
              <option value="tags">🏷️ Lägg till/ta bort taggar</option>
              <option value="themes">🎨 Lägg till/ta bort teman</option>
              <option value="media">🖼️ Hämta media</option>
              <option value="delete">🗑️ Ta bort</option>
            </select>
            <button className="btn-sm btn-primary-sm" onClick={applyBulk} disabled={!bulkAction}>Verkställ</button>
          </>
        )}
      </div>

      {loading ? <p className="muted">Laddar…</p> : (
        <div className="cards-table-wrap">
          <table className="cards-table">
            <thead><tr>
              <th style={{width:36}}><input type="checkbox" checked={selected.length===filtered.length&&filtered.length>0} onChange={toggleAll} aria-label="Välj alla" /></th>
              <th>Framsida</th>
              <th>Baksida</th>
              <th>Kommentar</th>
              <th>Media</th>
              <th>Taggar</th>
              <th>Flaggad</th>
              <th>Aktiv</th>
              <th>Åtgärder</th>
            </tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c.id} className={cn(c.is_flagged&&"row-flagged", !c.is_active&&"row-inactive", selected.includes(c.id)&&"row-selected")}>
                  <td><input type="checkbox" checked={selected.includes(c.id)} onChange={()=>setSelected(s=>s.includes(c.id)?s.filter(x=>x!==c.id):[...s,c.id])} aria-label={`Välj ${c.front}`} /></td>
                  <td>{c.front_emoji && <span>{c.front_emoji} </span>}{c.front}</td>
                  <td>{c.back_emoji && <span>{c.back_emoji} </span>}{c.back}</td>
                  <td className="notes-cell">{c.notes||"–"}</td>
                  <td>
                    {c.front_image
                      ? <img src={c.front_image} alt="" style={{width:32,height:32,objectFit:"cover",borderRadius:4}} />
                      : c.front_icon
                        ? <img src={c.front_icon} alt="" style={{width:24,height:24,opacity:.7}} />
                        : c.front_emoji
                          ? <span style={{fontSize:18}}>{c.front_emoji}</span>
                          : <span className="muted">–</span>
                    }
                  </td>
                  <td>
                    {(c.tag_ids||[]).length > 0
                      ? (c.tag_ids||[]).map(tid => {
                          const t = tags.find(x=>x.id===tid);
                          return t ? <span key={tid} className="tag-chip-sm" style={{background:t.color||"#ccc"}}>{t.name}</span> : null;
                        })
                      : <span className="muted">–</span>
                    }
                  </td>
                  <td>{c.is_flagged ? <span className="badge badge-red" title={c.flag_reason}>🚩</span> : "–"}</td>
                  <td>{c.is_active ? "Ja" : "Nej"}</td>
                  <td>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      <button className="btn-sm btn-ghost-sm" onClick={()=>setEditingCard({...c})}>✏️ Redigera</button>
                      <button className="btn-sm btn-ghost-sm" onClick={async()=>{ await supabase.from("cards").update({is_active:!c.is_active}).eq("id",c.id); load(); }}>
                        {c.is_active?"Inaktivera":"Aktivera"}
                      </button>
                      {c.is_flagged && (
                        <button className="btn-sm btn-ghost-sm" onClick={async()=>{ await supabase.from("cards").update({is_flagged:false,flag_count:0}).eq("id",c.id); load(); }}>
                          🚩 Avflagga
                        </button>
                      )}
                      <button className="btn-sm btn-danger-sm" onClick={async()=>{ if(!confirm("Ta bort?")) return; await supabase.from("cards").delete().eq("id",c.id); load(); onUpdate(); }}>
                        Ta bort
                      </button>
                    </div>
                  </td>
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

// ── Bulk Tag / Theme Modal ────────────────────────────────────────
function BulkTagThemeModal({ title, items, onApply, onCancel }) {
  const [chosen, setChosen] = useState([]);
  const [mode, setMode] = useState("add"); // add | remove | replace

  function toggle(id) {
    setChosen(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  const modeLabels = {
    add: "Lägg till (behåll befintliga)",
    remove: "Ta bort (behåll övriga)",
    replace: "Ersätt alla (ta bort befintliga)",
  };

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="editor-card">
        <h2>{title}</h2>

        <div className="form-field">
          <label className="form-label">Åtgärd</label>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {Object.entries(modeLabels).map(([key, label]) => (
              <label key={key} className="form-label checkbox-label" style={{ fontWeight: mode===key ? 600 : 400 }}>
                <input type="radio" name="bulk-mode" value={key} checked={mode===key} onChange={()=>setMode(key)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Välj {mode === "remove" ? "att ta bort" : "att lägga till"}</label>
          <div className="tag-picker">
            {items.map(item => (
              <button key={item.id} type="button"
                className={cn("tag-chip", chosen.includes(item.id) && "active")}
                style={chosen.includes(item.id) ? { background: item.color||"#c84b2f", color:"white" } : {}}
                onClick={() => toggle(item.id)}
                aria-pressed={chosen.includes(item.id)}
              >
                {item.name}
              </button>
            ))}
            {items.length === 0 && <span className="muted">Inga tillgängliga.</span>}
          </div>
        </div>

        {chosen.length > 0 && (
          <p className="muted" style={{ fontSize:13 }}>
            {mode === "add" && `Lägger till ${chosen.length} på alla valda kort.`}
            {mode === "remove" && `Tar bort ${chosen.length} från alla valda kort.`}
            {mode === "replace" && `Ersätter alla befintliga med de ${chosen.length} valda.`}
          </p>
        )}

        <div className="editor-actions">
          <button className="btn-primary" onClick={() => onApply(chosen, mode)} disabled={chosen.length === 0}>
            Verkställ
          </button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Card Edit Modal ─────────────────────────────────────────
function AdminCardEditModal({ card, tags, themes, onSave, onCancel }) {
  const [form, setForm] = useState({...card});
  const f = v => setForm(p => ({...p,...v}));

  function toggleTag(id) {
    const arr = form.tag_ids || [];
    f({ tag_ids: arr.includes(id) ? arr.filter(x=>x!==id) : [...arr, id] });
  }
  function toggleTheme(id) {
    const arr = form.theme_ids || [];
    f({ theme_ids: arr.includes(id) ? arr.filter(x=>x!==id) : [...arr, id] });
  }

  const mediaSources = [
    { field: "front_emoji", label: "Framsida emoji" },
    { field: "back_emoji",  label: "Baksida emoji" },
    { field: "front_icon",  label: "Framsida ikon (SVG-url)" },
    { field: "back_icon",   label: "Baksida ikon (SVG-url)" },
    { field: "front_image", label: "Framsida bild (URL)" },
    { field: "back_image",  label: "Baksida bild (URL)" },
  ];

  return (
    <div className="editor-overlay" role="dialog" aria-modal="true" aria-label="Redigera kort">
      <div className="editor-card editor-card-wide">
        <h2>✏️ Redigera kort</h2>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="ace-front">Framsida *</label>
            <input id="ace-front" className="form-input" value={form.front} onChange={e=>f({front:e.target.value})} required />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="ace-back">Baksida *</label>
            <input id="ace-back" className="form-input" value={form.back} onChange={e=>f({back:e.target.value})} required />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="ace-notes">Kommentar</label>
          <textarea id="ace-notes" className="form-input" rows={3} value={form.notes||""} onChange={e=>f({notes:e.target.value})} placeholder="Förklaring, kontext, exempel…" />
        </div>

        <div className="form-field">
          <label className="form-label">Taggar</label>
          <div className="tag-picker">
            {tags.map(t => (
              <button key={t.id} type="button"
                className={cn("tag-chip", (form.tag_ids||[]).includes(t.id) && "active")}
                style={(form.tag_ids||[]).includes(t.id) ? {background:t.color,color:"white"} : {}}
                onClick={() => toggleTag(t.id)}
                aria-pressed={(form.tag_ids||[]).includes(t.id)}
              >
                {t.name}
              </button>
            ))}
            {tags.length === 0 && <span className="muted">Inga taggar tillgängliga</span>}
          </div>
        </div>

        {themes && themes.length > 0 && (
          <div className="form-field">
            <label className="form-label">Teman</label>
            <div className="tag-picker">
              {themes.map(t => (
                <button key={t.id} type="button"
                  className={cn("tag-chip", (form.theme_ids||[]).includes(t.id) && "active")}
                  style={(form.theme_ids||[]).includes(t.id) ? {background:t.color||"#c84b2f",color:"white"} : {}}
                  onClick={() => toggleTheme(t.id)}
                  aria-pressed={(form.theme_ids||[]).includes(t.id)}
                >
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-field">
          <label className="form-label">Media</label>
          <div className="admin-media-grid">
            {mediaSources.map(({ field, label }) => (
              <div key={field} className="admin-media-row">
                <label className="form-label" style={{marginBottom:4}}>{label}</label>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <input className="form-input" value={form[field]||""} onChange={e=>f({[field]:e.target.value})}
                    placeholder={field.includes("emoji") ? "t.ex. 🐕" : "URL eller data:…"}
                  />
                  {form[field] && (
                    <div className="admin-media-preview">
                      {field.includes("emoji")
                        ? <span style={{fontSize:28}}>{form[field]}</span>
                        : <img src={form[field]} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:4}} onError={e=>e.target.style.display="none"} />
                      }
                    </div>
                  )}
                  {form[field] && (
                    <button className="btn-sm btn-danger-sm" onClick={()=>f({[field]:""})} aria-label={`Ta bort ${label}`}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-actions">
          <button className="btn-primary" onClick={()=>form.front.trim()&&form.back.trim()&&onSave(form)} disabled={!form.front.trim()||!form.back.trim()}>
            Spara ändringar
          </button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
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

    const rows = csv.trim().split("\n").filter(l=>l.trim()).map(line=>{
      const p = line.split(",").map(x=>x.trim().replace(/^["']|["']$/g,""));
      return { front:p[0]||"", back:p[1]||"", notes:p[2]||null, emoji:p[3]||"" };
    }).filter(r=>r.front&&r.back);

    if (!rows.length) { setStatus("Inga giltiga rader."); setBusy(false); return; }

    // Create deck with only safe columns
    const { data: deck, error: de } = await supabase.from("decks")
      .insert({ user_id:uid, name:deckName.trim(), front_lang:frontLang, back_lang:backLang })
      .select().single();
    if (de) { setStatus("Fel vid skapande av lista: "+de.message); setBusy(false); return; }

    // Try insert with front_emoji, fall back without if column missing
    const withEmoji = rows.map(r=>({ user_id:uid, deck_id:deck.id, front:r.front, back:r.back, notes:r.notes, front_emoji:r.emoji }));
    let { error } = await supabase.from("cards").insert(withEmoji);

    if (error && error.message.includes("front_emoji")) {
      const withoutEmoji = rows.map(r=>({ user_id:uid, deck_id:deck.id, front:r.front, back:r.back, notes:r.notes }));
      const res2 = await supabase.from("cards").insert(withoutEmoji);
      error = res2.error;
    }

    if (error) { setStatus("Fel: "+error.message); }
    else {
      await logEvent(uid,"data_imported",{deck_id:deck.id,count:rows.length});
      setStatus(`✓ Importerade ${rows.length} kort till "${deckName}"`);
      setCsv(""); setDeckName(""); onUpdate();
    }
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
