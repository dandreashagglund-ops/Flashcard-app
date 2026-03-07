import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase config ──────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function cn(...classes) { return classes.filter(Boolean).join(" "); }

// ── Language metadata ────────────────────────────────────────────
const LANG_FLAGS = {
  sv: "🇸🇪", en: "🇬🇧", de: "🇩🇪", fr: "🇫🇷", es: "🇪🇸",
  it: "🇮🇹", pt: "🇵🇹", ja: "🇯🇵", zh: "🇨🇳", ar: "🇸🇦",
  ru: "🇷🇺", nl: "🇳🇱", pl: "🇵🇱", ko: "🇰🇷", other: "📚"
};
const LANG_NAMES = {
  sv: "Svenska", en: "Engelska", de: "Tyska", fr: "Franska",
  es: "Spanska", it: "Italienska", pt: "Portugisiska", ja: "Japanska",
  zh: "Kinesiska", ar: "Arabiska", ru: "Ryska", nl: "Holländska",
  pl: "Polska", ko: "Koreanska", other: "Annat / Fackområde"
};

// ── Router ───────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);
  if (loading) return <Splash />;
  if (!session) return <AuthPage />;
  return <MainApp session={session} />;
}

function Splash() {
  return <div className="splash"><div className="splash-logo">✦</div><p>Laddar…</p></div>;
}

// ── Auth ─────────────────────────────────────────────────────────
function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Kolla din e-post för att bekräfta ditt konto!");
      }
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">✦ Glosträning</div>
        <div className="auth-tabs">
          <button className={cn("auth-tab", mode === "login" && "active")} onClick={() => setMode("login")}>Logga in</button>
          <button className={cn("auth-tab", mode === "signup" && "active")} onClick={() => setMode("signup")}>Skapa konto</button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <input className="auth-input" type="email" placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Lösenord" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}
          <button className="auth-btn" type="submit" disabled={busy}>{busy ? "…" : mode === "login" ? "Logga in" : "Skapa konto"}</button>
        </form>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────
function MainApp({ session }) {
  const [view, setView] = useState("decks");
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [tags, setTags] = useState([]);
  const [progress, setProgress] = useState({});
  const [studyFilter, setStudyFilter] = useState(null);
  const [lang, setLang] = useState("sv");
  const uid = session.user.id;

  const loadDecks = useCallback(async () => {
    const { data } = await supabase.from("decks").select("*").eq("user_id", uid).order("created_at");
    setDecks(data || []);
  }, [uid]);

  const loadDeckData = useCallback(async (deckId) => {
    if (!deckId) return;
    const [{ data: c }, { data: t }, { data: p }] = await Promise.all([
      supabase.from("cards").select("*").eq("user_id", uid).eq("deck_id", deckId).order("created_at"),
      supabase.from("tags").select("*").eq("user_id", uid).eq("deck_id", deckId).order("name"),
      supabase.from("progress").select("*").eq("user_id", uid),
    ]);
    setCards(c || []);
    setTags(t || []);
    const pm = {};
    (p || []).forEach(r => pm[r.card_id] = r);
    setProgress(pm);
  }, [uid]);

  useEffect(() => { loadDecks(); }, [loadDecks]);
  useEffect(() => { if (activeDeck) loadDeckData(activeDeck.id); }, [activeDeck, loadDeckData]);

  const refreshAll = useCallback(() => {
    loadDecks();
    if (activeDeck) loadDeckData(activeDeck.id);
  }, [loadDecks, loadDeckData, activeDeck]);

  function openDeck(deck) { setActiveDeck(deck); setView("home"); }
  function goToDecks() { setActiveDeck(null); setView("decks"); loadDecks(); }
  function startStudy(tagId = null) { setStudyFilter(tagId); setView("study"); }

  const T = {
    sv: { decks: "Ordlistor", home: "Hem", study: "Träna", cards: "Kort", import: "Importera", stats: "Statistik", logout: "Logga ut" },
    en: { decks: "Decks", home: "Home", study: "Study", cards: "Cards", import: "Import", stats: "Stats", logout: "Log out" },
  }[lang];

  const insideDeck = view !== "decks" && activeDeck;
  const navItems = insideDeck ? [
    { id: "home", icon: "⌂", label: T.home },
    { id: "study", icon: "◈", label: T.study },
    { id: "cards", icon: "▦", label: T.cards },
    { id: "import", icon: "↑", label: T.import },
    { id: "stats", icon: "◉", label: T.stats },
  ] : [];

  return (
    <div className="app">
      <nav className="sidebar">
        <button className="sidebar-logo" onClick={goToDecks} title="Alla ordlistor">✦</button>
        {insideDeck && (
          <div className="sidebar-deck-badge" style={{ "--dc": activeDeck.color || "#c84b2f" }}>
            <span>{LANG_FLAGS[activeDeck.front_lang] || "📚"}</span>
            <span className="nav-label deck-label">{activeDeck.name}</span>
          </div>
        )}
        {navItems.map(n => (
          <button key={n.id} className={cn("nav-btn", view === n.id && "active")} onClick={() => setView(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
        {!insideDeck && (
          <button className={cn("nav-btn", view === "decks" && "active")} onClick={goToDecks}>
            <span className="nav-icon">◧</span>
            <span className="nav-label">{T.decks}</span>
          </button>
        )}
        <div className="sidebar-spacer" />
        <button className="nav-btn lang-btn" onClick={() => setLang(l => l === "sv" ? "en" : "sv")}>
          <span className="nav-icon">⊕</span><span className="nav-label">{lang.toUpperCase()}</span>
        </button>
        <button className="nav-btn logout-btn" onClick={() => supabase.auth.signOut()}>
          <span className="nav-icon">←</span><span className="nav-label">{T.logout}</span>
        </button>
      </nav>
      <main className="content">
        {view === "decks" && <DecksView decks={decks} uid={uid} lang={lang} onOpen={openDeck} onUpdate={loadDecks} />}
        {view === "home" && activeDeck && <HomeView deck={activeDeck} cards={cards} tags={tags} progress={progress} onStudy={startStudy} lang={lang} />}
        {view === "study" && activeDeck && <StudyView cards={cards} tags={tags} progress={progress} tagFilter={studyFilter} onProgressUpdate={refreshAll} uid={uid} lang={lang} />}
        {view === "cards" && activeDeck && <CardsView cards={cards} tags={tags} onUpdate={refreshAll} uid={uid} deckId={activeDeck.id} lang={lang} />}
        {view === "import" && activeDeck && <ImportView deck={activeDeck} cards={cards} tags={tags} onUpdate={refreshAll} uid={uid} lang={lang} />}
        {view === "stats" && activeDeck && <StatsView cards={cards} tags={tags} progress={progress} deck={activeDeck} lang={lang} />}
      </main>
    </div>
  );
}

// ── Decks View ───────────────────────────────────────────────────
function DecksView({ decks, uid, lang, onOpen, onUpdate }) {
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cardCounts, setCardCounts] = useState({});

  const labels = {
    sv: { title: "Mina ordlistor", sub: "Välj en ordlista att träna, eller skapa en ny.", newDeck: "+ Ny ordlista", noDecks: "Inga ordlistor ännu – skapa din första!", edit: "Redigera", delete: "Radera", cards: "kort", study: "Träna →", backLabel: "→" },
    en: { title: "My decks", sub: "Choose a deck to study, or create a new one.", newDeck: "+ New deck", noDecks: "No decks yet – create your first!", edit: "Edit", delete: "Delete", cards: "cards", study: "Study →", backLabel: "→" },
  }[lang];

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cards").select("deck_id").eq("user_id", uid);
      const counts = {};
      (data || []).forEach(c => { counts[c.deck_id] = (counts[c.deck_id] || 0) + 1; });
      setCardCounts(counts);
    })();
  }, [uid, decks]);

  async function saveDeck(data) {
    if (data.id) await supabase.from("decks").update(data).eq("id", data.id);
    else await supabase.from("decks").insert({ ...data, user_id: uid });
    setShowEditor(false); setEditing(null); onUpdate();
  }

  async function deleteDeck(id) {
    if (!confirm("Radera ordlistan och alla dess kort?")) return;
    await supabase.from("decks").delete().eq("id", id);
    onUpdate();
  }

  return (
    <div className="view">
      <div className="view-header">
        <div>
          <h1 className="view-title">{labels.title}</h1>
          <p className="view-sub">{labels.sub}</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowEditor(true); }}>{labels.newDeck}</button>
      </div>

      {showEditor && (
        <DeckEditor deck={editing} lang={lang} onSave={saveDeck} onCancel={() => { setShowEditor(false); setEditing(null); }} />
      )}

      {decks.length === 0 && !showEditor && <p className="muted">{labels.noDecks}</p>}

      <div className="decks-grid">
        {decks.map(deck => {
          const count = cardCounts[deck.id] || 0;
          const frontFlag = LANG_FLAGS[deck.front_lang] || "📚";
          const backFlag = LANG_FLAGS[deck.back_lang] || "📖";
          return (
            <div key={deck.id} className="deck-card" style={{ "--dc": deck.color || "#c84b2f" }}>
              <div className="deck-card-body" onClick={() => onOpen(deck)}>
                <div className="deck-lang-row">
                  <span className="deck-flag-big">{frontFlag}</span>
                  <span className="deck-arrow">→</span>
                  <span className="deck-flag-big">{backFlag}</span>
                </div>
                <h3 className="deck-name">{deck.name}</h3>
                {deck.description && <p className="deck-desc">{deck.description}</p>}
                <div className="deck-footer">
                  <span className="deck-count">{count} {labels.cards}</span>
                  {deck.subject && <span className="deck-subject-chip">{deck.subject}</span>}
                </div>
              </div>
              <div className="deck-actions">
                <button className="btn-study-deck" onClick={() => onOpen(deck)}>{labels.study}</button>
                <button className="deck-act-btn" onClick={() => { setEditing(deck); setShowEditor(true); }}>{labels.edit}</button>
                <button className="deck-act-btn danger" onClick={() => deleteDeck(deck.id)}>{labels.delete}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Deck Editor ──────────────────────────────────────────────────
function DeckEditor({ deck, lang, onSave, onCancel }) {
  const [data, setData] = useState(deck || { name: "", description: "", subject: "", front_lang: "en", back_lang: "sv", color: "#c84b2f" });
  const labels = {
    sv: { title: deck ? "Redigera ordlista" : "Ny ordlista", name: "Namn *", desc: "Beskrivning", subject: "Ämne / Fackområde (valfritt)", frontLang: "Framsida – språk", backLang: "Baksida – språk", color: "Kortfärg", save: "Spara", cancel: "Avbryt", ph_name: "t.ex. Engelska – Topp 1000", ph_desc: "t.ex. De vanligaste orden", ph_subj: "t.ex. Medicin, Juridik, Programmering…" },
    en: { title: deck ? "Edit deck" : "New deck", name: "Name *", desc: "Description", subject: "Subject / Domain (optional)", frontLang: "Front – language", backLang: "Back – language", color: "Card color", save: "Save", cancel: "Cancel", ph_name: "e.g. English – Top 1000", ph_desc: "e.g. Most common words", ph_subj: "e.g. Medicine, Law, Programming…" },
  }[lang];

  const COLORS = ["#c84b2f","#2f7dc8","#2a7a4f","#8b4fc8","#c87d2f","#c82f6b","#2fbfc8","#444"];
  const langOptions = Object.entries(LANG_NAMES).map(([k, v]) => (
    <option key={k} value={k}>{LANG_FLAGS[k]} {v}</option>
  ));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{labels.title}</h3>
        <label>{labels.name}</label>
        <input className="modal-input" value={data.name} placeholder={labels.ph_name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
        <label>{labels.desc}</label>
        <input className="modal-input" value={data.description || ""} placeholder={labels.ph_desc} onChange={e => setData(d => ({ ...d, description: e.target.value }))} />
        <label>{labels.subject}</label>
        <input className="modal-input" value={data.subject || ""} placeholder={labels.ph_subj} onChange={e => setData(d => ({ ...d, subject: e.target.value }))} />
        <div className="lang-row">
          <div className="lang-col">
            <label>{labels.frontLang}</label>
            <select className="modal-input" value={data.front_lang || "en"} onChange={e => setData(d => ({ ...d, front_lang: e.target.value }))}>{langOptions}</select>
          </div>
          <div className="lang-arrow-big">→</div>
          <div className="lang-col">
            <label>{labels.backLang}</label>
            <select className="modal-input" value={data.back_lang || "sv"} onChange={e => setData(d => ({ ...d, back_lang: e.target.value }))}>{langOptions}</select>
          </div>
        </div>
        <label>{labels.color}</label>
        <div className="color-presets">
          {COLORS.map(c => (
            <button key={c} className={cn("color-preset", data.color === c && "selected")} style={{ background: c }} onClick={() => setData(d => ({ ...d, color: c }))} />
          ))}
          <input type="color" className="color-picker" value={data.color || "#c84b2f"} onChange={e => setData(d => ({ ...d, color: e.target.value }))} />
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>{labels.cancel}</button>
          <button className="btn-primary" disabled={!data.name.trim()} onClick={() => onSave(data)}>{labels.save}</button>
        </div>
      </div>
    </div>
  );
}

// ── Home View ────────────────────────────────────────────────────
function HomeView({ deck, cards, tags, progress, onStudy, lang }) {
  const total = cards.length;
  const studied = cards.filter(c => progress[c.id]).length;
  const correct = cards.filter(c => progress[c.id]?.correct > 0).length;
  const due = cards.filter(c => {
    const p = progress[c.id];
    if (!p) return true;
    return !p.next_review || new Date(p.next_review) <= new Date();
  }).length;

  const labels = {
    sv: { subtitle: "Vad vill du träna idag?", total: "Kort totalt", studied: "Studerade", correct: "Rätt svar", due: "Att öva", studyAll: "Träna alla", studyDue: "Träna förfallna", tags: "Träna efter tagg", noTags: "Inga taggar skapade än." },
    en: { subtitle: "What do you want to study?", total: "Total", studied: "Studied", correct: "Correct", due: "Due", studyAll: "Study all", studyDue: "Study due", tags: "Study by tag", noTags: "No tags yet." },
  }[lang];

  return (
    <div className="view">
      <div className="deck-home-header" style={{ "--dc": deck.color || "#c84b2f" }}>
        <div className="deck-home-langs">
          {LANG_FLAGS[deck.front_lang] || "📚"} → {LANG_FLAGS[deck.back_lang] || "📖"}
        </div>
        <h1 className="view-title">{deck.name}</h1>
        {deck.description && <p className="view-sub">{deck.description}</p>}
        {deck.subject && <span className="deck-subject-chip">{deck.subject}</span>}
      </div>

      <div className="stats-row">
        {[
          { label: labels.total, value: total, color: "#e8d5b7" },
          { label: labels.studied, value: studied, color: "#b7d5e8" },
          { label: labels.correct, value: correct, color: "#b7e8c8" },
          { label: labels.due, value: due, color: "#e8b7b7" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ "--accent": s.color }}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="home-actions">
        <button className="btn-primary" onClick={() => onStudy(null)}>{labels.studyAll}</button>
        <button className="btn-secondary" onClick={() => onStudy("due")}>{labels.studyDue} ({due})</button>
      </div>

      <h2 className="section-title">{labels.tags}</h2>
      {tags.length === 0 ? <p className="muted">{labels.noTags}</p> : (
        <div className="tag-grid">
          {tags.map(t => (
            <button key={t.id} className="tag-study-card" onClick={() => onStudy(t.id)} style={{ "--tag-color": t.color || "#ccc" }}>
              <span className="tag-study-name">{t.name}</span>
              <span className="tag-study-count">{cards.filter(c => c.tags?.includes(t.id)).length} kort</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Study View ───────────────────────────────────────────────────
function StudyView({ cards, tags, progress, tagFilter, onProgressUpdate, uid, lang }) {
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0 });

  const labels = {
    sv: { flip: "Visa svar", correct: "Rätt", wrong: "Fel", finished: "Klart!", sessionDone: "Du har gått igenom alla kort!", correctLbl: "Rätt", wrongLbl: "Fel", restart: "Börja om", noCards: "Inga kort matchar filtret.", front: "Framsida", back: "Baksida" },
    en: { flip: "Show answer", correct: "Correct", wrong: "Wrong", finished: "Done!", sessionDone: "You finished all cards!", correctLbl: "Correct", wrongLbl: "Wrong", restart: "Restart", noCards: "No cards match filter.", front: "Front", back: "Back" },
  }[lang];

  useEffect(() => {
    let filtered = [...cards];
    if (tagFilter === "due") {
      filtered = filtered.filter(c => { const p = progress[c.id]; return !p || !p.next_review || new Date(p.next_review) <= new Date(); });
    } else if (tagFilter) {
      filtered = filtered.filter(c => c.tags?.includes(tagFilter));
    }
    setQueue(filtered.sort(() => Math.random() - 0.5));
    setIdx(0); setFlipped(false); setDone(false); setSessionStats({ correct: 0, wrong: 0 });
  }, [cards, tagFilter, progress]);

  const card = queue[idx];

  async function recordAnswer(correct) {
    if (!card) return;
    const prev = progress[card.id] || { correct: 0, wrong: 0, streak: 0 };
    const streak = correct ? (prev.streak || 0) + 1 : 0;
    const intervals = [1, 2, 4, 7, 14, 30];
    const next_review = new Date(Date.now() + intervals[Math.min(streak, 5)] * 86400000).toISOString();
    await supabase.from("progress").upsert({
      user_id: uid, card_id: card.id,
      correct: (prev.correct || 0) + (correct ? 1 : 0),
      wrong: (prev.wrong || 0) + (correct ? 0 : 1),
      streak, next_review, last_seen: new Date().toISOString(),
    }, { onConflict: "user_id,card_id" });
    setSessionStats(s => ({ ...s, [correct ? "correct" : "wrong"]: s[correct ? "correct" : "wrong"] + 1 }));
    onProgressUpdate();
    if (idx + 1 >= queue.length) setDone(true);
    else { setIdx(i => i + 1); setFlipped(false); }
  }

  if (queue.length === 0) return <div className="view"><p className="muted">{labels.noCards}</p></div>;

  if (done) return (
    <div className="view study-done">
      <div className="done-icon">✦</div>
      <h2>{labels.finished}</h2>
      <p>{labels.sessionDone}</p>
      <div className="done-stats">
        <span className="done-correct">✓ {sessionStats.correct} {labels.correctLbl}</span>
        <span className="done-wrong">✗ {sessionStats.wrong} {labels.wrongLbl}</span>
      </div>
      <button className="btn-primary" onClick={() => { setIdx(0); setDone(false); setFlipped(false); setQueue(q => [...q].sort(() => Math.random() - 0.5)); }}>{labels.restart}</button>
    </div>
  );

  const p = progress[card?.id];

  return (
    <div className="view study-view">
      <div className="study-progress-bar"><div className="study-progress-fill" style={{ width: `${(idx / queue.length) * 100}%` }} /></div>
      <div className="study-counter">{idx + 1} / {queue.length}</div>
      <div className={cn("flashcard", flipped && "flipped")} onClick={() => setFlipped(f => !f)}>
        <div className="flashcard-inner">
          <div className="flashcard-front">
            <div className="card-side-label">{labels.front}</div>
            {card?.image_url && <img src={card.image_url} alt={card.front} className="card-image" />}
            <div className="card-text">{card?.front}</div>
            {card?.tags?.length > 0 && (
              <div className="card-tags-row">
                {card.tags.map(tid => { const t = tags.find(t => t.id === tid); return t ? <span key={tid} className="card-tag-pill" style={{ background: t.color || "#666" }}>{t.name}</span> : null; })}
              </div>
            )}
          </div>
          <div className="flashcard-back">
            <div className="card-side-label">{labels.back}</div>
            <div className="card-text card-back-text">{card?.back}</div>
            {card?.notes && <div className="card-notes">{card.notes}</div>}
          </div>
        </div>
      </div>
      {!flipped
        ? <button className="btn-flip" onClick={() => setFlipped(true)}>{labels.flip}</button>
        : <div className="answer-btns">
            <button className="btn-wrong" onClick={() => recordAnswer(false)}>✗ {labels.wrong}</button>
            <button className="btn-correct" onClick={() => recordAnswer(true)}>✓ {labels.correct}</button>
          </div>
      }
      {p && <div className="card-history">✓ {p.correct || 0}  ✗ {p.wrong || 0}  🔥 {p.streak || 0}</div>}
    </div>
  );
}

// ── Cards View ───────────────────────────────────────────────────
function CardsView({ cards, tags, onUpdate, uid, deckId, lang }) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [editing, setEditing] = useState(null);
  const [showTagMgr, setShowTagMgr] = useState(false);

  const labels = {
    sv: { title: "Kort", search: "Sök…", all: "Alla taggar", newCard: "+ Nytt kort", manageTags: "Taggar", noCards: "Inga kort ännu.", front: "Framsida", back: "Baksida", notes: "Anteckningar", tags: "Taggar", save: "Spara", cancel: "Avbryt", delete: "Radera", edit: "Redigera" },
    en: { title: "Cards", search: "Search…", all: "All tags", newCard: "+ New card", manageTags: "Tags", noCards: "No cards yet.", front: "Front", back: "Back", notes: "Notes", tags: "Tags", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit" },
  }[lang];

  const filtered = cards.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)) &&
           (!filterTag || c.tags?.includes(filterTag));
  });

  async function saveCard(data) {
    if (data.id) await supabase.from("cards").update(data).eq("id", data.id);
    else await supabase.from("cards").insert({ ...data, user_id: uid, deck_id: deckId });
    setEditing(null); onUpdate();
  }

  async function deleteCard(id) {
    if (!confirm("Radera kortet?")) return;
    await supabase.from("cards").delete().eq("id", id);
    onUpdate();
  }

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">{labels.title}</h1>
        <div className="view-header-actions">
          <button className="btn-secondary" onClick={() => setShowTagMgr(true)}>{labels.manageTags}</button>
          <button className="btn-primary" onClick={() => setEditing({ front: "", back: "", notes: "", tags: [] })}>{labels.newCard}</button>
        </div>
      </div>
      <div className="filter-row">
        <input className="search-input" placeholder={labels.search} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="tag-select" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
          <option value="">{labels.all}</option>
          {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {editing && <CardEditor card={editing} tags={tags} labels={labels} onSave={saveCard} onCancel={() => setEditing(null)} />}
      {showTagMgr && <TagManager tags={tags} onUpdate={onUpdate} uid={uid} deckId={deckId} onClose={() => setShowTagMgr(false)} lang={lang} />}
      <div className="cards-grid">
        {filtered.length === 0 && <p className="muted">{labels.noCards}</p>}
        {filtered.map(c => (
          <div key={c.id} className="card-item">
            {c.image_url && <img src={c.image_url} alt="" className="card-item-img" />}
            <div className="card-item-front">{c.front}</div>
            <div className="card-item-back">{c.back}</div>
            {c.tags?.length > 0 && (
              <div className="card-tags-row">
                {c.tags.map(tid => { const t = tags.find(t => t.id === tid); return t ? <span key={tid} className="card-tag-pill" style={{ background: t.color || "#666" }}>{t.name}</span> : null; })}
              </div>
            )}
            <div className="card-item-actions">
              <button onClick={() => setEditing(c)}>{labels.edit}</button>
              <button className="del-btn" onClick={() => deleteCard(c.id)}>{labels.delete}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardEditor({ card, tags, labels, onSave, onCancel }) {
  const [data, setData] = useState({ ...card });
  function toggleTag(tid) {
    setData(d => ({ ...d, tags: d.tags?.includes(tid) ? d.tags.filter(t => t !== tid) : [...(d.tags || []), tid] }));
  }
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{data.id ? "Redigera kort" : "Nytt kort"}</h3>
        <label>{labels.front}</label>
        <input className="modal-input" value={data.front} onChange={e => setData(d => ({ ...d, front: e.target.value }))} />
        <label>Bild-URL (valfritt)</label>
        <input className="modal-input" placeholder="https://…" value={data.image_url || ""} onChange={e => setData(d => ({ ...d, image_url: e.target.value }))} />
        <label>{labels.back}</label>
        <textarea className="modal-input" rows={3} value={data.back} onChange={e => setData(d => ({ ...d, back: e.target.value }))} />
        <label>{labels.notes}</label>
        <input className="modal-input" value={data.notes || ""} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} />
        <label>{labels.tags}</label>
        <div className="tag-picker">
          {tags.map(t => (
            <button key={t.id} className={cn("tag-pill-btn", data.tags?.includes(t.id) && "selected")} style={{ "--tc": t.color || "#888" }} onClick={() => toggleTag(t.id)}>{t.name}</button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>{labels.cancel}</button>
          <button className="btn-primary" onClick={() => onSave(data)}>{labels.save}</button>
        </div>
      </div>
    </div>
  );
}

// ── Tag Manager ──────────────────────────────────────────────────
function TagManager({ tags, onUpdate, uid, deckId, onClose, lang }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6b9bce");
  const labels = { sv: { title: "Taggar", add: "Lägg till", close: "Stäng" }, en: { title: "Tags", add: "Add", close: "Close" } }[lang];

  async function addTag() {
    if (!name.trim()) return;
    await supabase.from("tags").insert({ name: name.trim(), color, user_id: uid, deck_id: deckId });
    setName(""); onUpdate();
  }
  async function deleteTag(id) { await supabase.from("tags").delete().eq("id", id); onUpdate(); }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{labels.title}</h3>
        <div className="tag-add-row">
          <input className="modal-input" placeholder="Taggnamn" value={name} onChange={e => setName(e.target.value)} />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="color-picker" />
          <button className="btn-primary" onClick={addTag}>{labels.add}</button>
        </div>
        <div className="tag-list">
          {tags.map(t => (
            <div key={t.id} className="tag-list-item">
              <span className="tag-dot" style={{ background: t.color }} />
              <span>{t.name}</span>
              <button className="tag-del" onClick={() => deleteTag(t.id)}>✕</button>
            </div>
          ))}
        </div>
        <button className="btn-secondary" onClick={onClose}>{labels.close}</button>
      </div>
    </div>
  );
}

// ── Import View ──────────────────────────────────────────────────
function ImportView({ deck, cards, tags, onUpdate, uid, lang }) {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [loadingTop1000, setLoadingTop1000] = useState(false);

  const isEnSv = ["en","sv"].includes(deck.front_lang) && ["en","sv"].includes(deck.back_lang);
  const labels = {
    sv: { title: "Importera kort", csvFormat: "Format: framsida,baksida,anteckningar", previewBtn: "Förhandsgranska", importBtn: "Importera", cancel: "Rensa", top1000: "Importera topp 1000 engelska ord", top1000Desc: "De 1000 vanligaste engelska orden med svenska översättningar (kräver EN↔SV-ordlista).", importedMsg: n => `${n} kort importerade!` },
    en: { title: "Import cards", csvFormat: "Format: front,back,notes", previewBtn: "Preview", importBtn: "Import", cancel: "Clear", top1000: "Import top 1000 English words", top1000Desc: "1000 most common English words with Swedish translations (requires EN↔SV deck).", importedMsg: n => `${n} cards imported!` },
  }[lang];

  function parseCSV(text) {
    return text.trim().split("\n").map(row => {
      const parts = row.split(",").map(p => p.trim().replace(/^"|"$/g, ""));
      return { front: parts[0] || "", back: parts[1] || "", notes: parts[2] || "" };
    }).filter(r => r.front && r.back);
  }

  async function handleImport() {
    if (!preview.length) return; setImporting(true);
    const rows = preview.map(r => ({ ...r, user_id: uid, deck_id: deck.id, tags: selectedTags }));
    for (let i = 0; i < rows.length; i += 500) await supabase.from("cards").insert(rows.slice(i, i + 500));
    setMsg(labels.importedMsg(rows.length)); setPreview([]); setCsvText(""); onUpdate(); setImporting(false);
  }

  async function importTop1000() {
    setLoadingTop1000(true); setMsg("");
    const existing = new Set(cards.map(c => c.front.toLowerCase()));
    const newCards = getTop1000().filter(r => !existing.has(r.front.toLowerCase())).map(r => ({ ...r, user_id: uid, deck_id: deck.id, tags: selectedTags }));
    if (!newCards.length) { setMsg(lang === "sv" ? "Alla ord finns redan!" : "All words already exist!"); }
    else {
      for (let i = 0; i < newCards.length; i += 500) await supabase.from("cards").insert(newCards.slice(i, i + 500));
      setMsg(labels.importedMsg(newCards.length)); onUpdate();
    }
    setLoadingTop1000(false);
  }

  function toggleTag(tid) { setSelectedTags(ts => ts.includes(tid) ? ts.filter(t => t !== tid) : [...ts, tid]); }

  return (
    <div className="view">
      <h1 className="view-title">{labels.title}</h1>
      {isEnSv && (
        <div className="import-section">
          <h2 className="section-title">{labels.top1000}</h2>
          <p className="muted">{labels.top1000Desc}</p>
          <div className="tag-picker" style={{ marginBottom: 12 }}>
            {tags.map(t => <button key={t.id} className={cn("tag-pill-btn", selectedTags.includes(t.id) && "selected")} style={{ "--tc": t.color || "#888" }} onClick={() => toggleTag(t.id)}>{t.name}</button>)}
          </div>
          <button className="btn-primary" onClick={importTop1000} disabled={loadingTop1000}>{loadingTop1000 ? "Importerar…" : labels.top1000}</button>
        </div>
      )}
      <div className="import-section">
        <h2 className="section-title">CSV</h2>
        <p className="muted">{labels.csvFormat}</p>
        <textarea className="csv-input" rows={10} placeholder="the,det,artikel&#10;be,vara,verb" value={csvText} onChange={e => setCsvText(e.target.value)} />
        <div className="tag-picker">
          {tags.map(t => <button key={t.id} className={cn("tag-pill-btn", selectedTags.includes(t.id) && "selected")} style={{ "--tc": t.color || "#888" }} onClick={() => toggleTag(t.id)}>{t.name}</button>)}
        </div>
        <div className="import-actions">
          <button className="btn-secondary" onClick={() => { setCsvText(""); setPreview([]); }}>{labels.cancel}</button>
          <button className="btn-secondary" onClick={() => { setPreview(parseCSV(csvText)); setMsg(""); }}>{labels.previewBtn}</button>
          <button className="btn-primary" disabled={!preview.length || importing} onClick={handleImport}>{labels.importBtn} ({preview.length})</button>
        </div>
        {preview.length > 0 && (
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead><tr><th>Framsida</th><th>Baksida</th><th>Anteckningar</th></tr></thead>
              <tbody>{preview.slice(0, 20).map((r, i) => <tr key={i}><td>{r.front}</td><td>{r.back}</td><td>{r.notes}</td></tr>)}</tbody>
            </table>
            {preview.length > 20 && <p className="muted">…och {preview.length - 20} till</p>}
          </div>
        )}
      </div>
      {msg && <div className="import-msg">{msg}</div>}
    </div>
  );
}

// ── Stats View ───────────────────────────────────────────────────
function StatsView({ cards, tags, progress, deck, lang }) {
  const labels = {
    sv: { title: "Statistik", total: "Totalt", studied: "Studerade", totalCorrect: "Rätt", totalWrong: "Fel", accuracy: "Träffsäkerhet", streak: "Bästa streak", byTag: "Per tagg", cards: "Kort", correct: "Rätt", wrong: "Fel" },
    en: { title: "Statistics", total: "Total", studied: "Studied", totalCorrect: "Correct", totalWrong: "Wrong", accuracy: "Accuracy", streak: "Best streak", byTag: "By tag", cards: "Cards", correct: "Correct", wrong: "Wrong" },
  }[lang];

  const progValues = cards.map(c => progress[c.id]).filter(Boolean);
  const totalCorrect = progValues.reduce((a, p) => a + (p.correct || 0), 0);
  const totalWrong = progValues.reduce((a, p) => a + (p.wrong || 0), 0);
  const accuracy = totalCorrect + totalWrong > 0 ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) : 0;

  const tagStats = tags.map(t => {
    const tc = cards.filter(c => c.tags?.includes(t.id));
    const tp = tc.map(c => progress[c.id]).filter(Boolean);
    const c = tp.reduce((a, p) => a + (p.correct || 0), 0);
    const w = tp.reduce((a, p) => a + (p.wrong || 0), 0);
    return { ...t, count: tc.length, correct: c, wrong: w };
  });

  return (
    <div className="view">
      <h1 className="view-title">{labels.title}</h1>
      <p className="view-sub">{deck.name}</p>
      <div className="stats-row">
        {[
          { label: labels.total, value: cards.length },
          { label: labels.studied, value: progValues.length },
          { label: labels.totalCorrect, value: totalCorrect },
          { label: labels.totalWrong, value: totalWrong },
          { label: labels.accuracy, value: accuracy + "%" },
          { label: labels.streak, value: progValues.reduce((a, p) => Math.max(a, p.streak || 0), 0) + " 🔥" },
        ].map(s => (
          <div key={s.label} className="stat-card"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <h2 className="section-title">{labels.byTag}</h2>
      <table className="stats-table">
        <thead><tr><th>Tagg</th><th>{labels.cards}</th><th>{labels.correct}</th><th>{labels.wrong}</th><th>{labels.accuracy}</th></tr></thead>
        <tbody>
          {tagStats.map(t => {
            const acc = t.correct + t.wrong > 0 ? Math.round((t.correct / (t.correct + t.wrong)) * 100) : "-";
            return <tr key={t.id}><td><span className="tag-dot" style={{ background: t.color }} />{t.name}</td><td>{t.count}</td><td>{t.correct}</td><td>{t.wrong}</td><td>{acc}{acc !== "-" ? "%" : ""}</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Top 1000 EN→SV ───────────────────────────────────────────────
function getTop1000() {
  return [{front:"the",back:"det/den/de",notes:"artikel"},{front:"be",back:"vara",notes:"verb"},{front:"to",back:"till/att",notes:"prep/inf"},{front:"of",back:"av/om",notes:"preposition"},{front:"and",back:"och",notes:"konjunktion"},{front:"a",back:"en/ett",notes:"artikel"},{front:"in",back:"i/in",notes:"preposition"},{front:"that",back:"att/det/som",notes:"konj/pron"},{front:"have",back:"ha",notes:"verb"},{front:"it",back:"det",notes:"pronomen"},{front:"for",back:"för",notes:"preposition"},{front:"not",back:"inte",notes:"adverb"},{front:"on",back:"på",notes:"preposition"},{front:"with",back:"med",notes:"preposition"},{front:"he",back:"han",notes:"pronomen"},{front:"as",back:"som/när",notes:"konjunktion"},{front:"you",back:"du/ni",notes:"pronomen"},{front:"do",back:"göra",notes:"verb"},{front:"at",back:"vid/på",notes:"preposition"},{front:"this",back:"detta",notes:"pronomen"},{front:"but",back:"men",notes:"konjunktion"},{front:"his",back:"hans",notes:"pronomen"},{front:"by",back:"av/med",notes:"preposition"},{front:"from",back:"från",notes:"preposition"},{front:"they",back:"de",notes:"pronomen"},{front:"we",back:"vi",notes:"pronomen"},{front:"say",back:"säga",notes:"verb"},{front:"her",back:"henne/hennes",notes:"pronomen"},{front:"she",back:"hon",notes:"pronomen"},{front:"or",back:"eller",notes:"konjunktion"},{front:"an",back:"en/ett",notes:"artikel"},{front:"will",back:"kommer att",notes:"hjälpverb"},{front:"my",back:"min/mitt",notes:"pronomen"},{front:"one",back:"en/man",notes:"räkneord"},{front:"all",back:"alla/allt",notes:"pronomen"},{front:"would",back:"skulle",notes:"hjälpverb"},{front:"there",back:"där/det",notes:"adverb"},{front:"their",back:"deras",notes:"pronomen"},{front:"what",back:"vad",notes:"pronomen"},{front:"so",back:"så",notes:"adverb"},{front:"up",back:"upp",notes:"adverb"},{front:"out",back:"ut",notes:"adverb"},{front:"if",back:"om",notes:"konjunktion"},{front:"about",back:"om/ungefär",notes:"preposition"},{front:"who",back:"vem/som",notes:"pronomen"},{front:"get",back:"få/skaffa",notes:"verb"},{front:"which",back:"vilket/som",notes:"pronomen"},{front:"go",back:"gå/åka",notes:"verb"},{front:"me",back:"mig",notes:"pronomen"},{front:"when",back:"när",notes:"konjunktion"},{front:"make",back:"göra/tillverka",notes:"verb"},{front:"can",back:"kan",notes:"hjälpverb"},{front:"like",back:"gilla/som",notes:"verb/prep"},{front:"time",back:"tid/gång",notes:"substantiv"},{front:"no",back:"nej/ingen",notes:"adverb"},{front:"just",back:"bara/just",notes:"adverb"},{front:"him",back:"honom",notes:"pronomen"},{front:"know",back:"veta/känna",notes:"verb"},{front:"take",back:"ta",notes:"verb"},{front:"people",back:"folk/människor",notes:"substantiv"},{front:"into",back:"in i",notes:"preposition"},{front:"year",back:"år",notes:"substantiv"},{front:"your",back:"din/ditt",notes:"pronomen"},{front:"good",back:"bra/god",notes:"adjektiv"},{front:"some",back:"några/lite",notes:"pronomen"},{front:"could",back:"kunde",notes:"hjälpverb"},{front:"them",back:"dem",notes:"pronomen"},{front:"see",back:"se",notes:"verb"},{front:"other",back:"annan/andra",notes:"adjektiv"},{front:"than",back:"än",notes:"konjunktion"},{front:"then",back:"sedan/då",notes:"adverb"},{front:"now",back:"nu",notes:"adverb"},{front:"look",back:"titta/se ut",notes:"verb"},{front:"only",back:"bara/enda",notes:"adverb"},{front:"come",back:"komma",notes:"verb"},{front:"its",back:"dess",notes:"pronomen"},{front:"over",back:"över",notes:"preposition"},{front:"think",back:"tänka/tro",notes:"verb"},{front:"also",back:"också",notes:"adverb"},{front:"back",back:"tillbaka/rygg",notes:"adverb/subst"},{front:"after",back:"efter",notes:"preposition"},{front:"use",back:"använda",notes:"verb"},{front:"two",back:"två",notes:"räkneord"},{front:"how",back:"hur",notes:"adverb"},{front:"our",back:"vår/våra",notes:"pronomen"},{front:"work",back:"arbeta/arbete",notes:"verb/subst"},{front:"first",back:"första",notes:"ordningstal"},{front:"well",back:"bra/brunn",notes:"adverb/subst"},{front:"way",back:"väg/sätt",notes:"substantiv"},{front:"even",back:"till och med/jämn",notes:"adverb"},{front:"new",back:"ny",notes:"adjektiv"},{front:"want",back:"vilja",notes:"verb"},{front:"because",back:"för att/eftersom",notes:"konjunktion"},{front:"any",back:"någon/något",notes:"pronomen"},{front:"these",back:"dessa",notes:"pronomen"},{front:"give",back:"ge",notes:"verb"},{front:"day",back:"dag",notes:"substantiv"},{front:"most",back:"mest/flest",notes:"adverb"},{front:"us",back:"oss",notes:"pronomen"},{front:"between",back:"mellan",notes:"preposition"},{front:"need",back:"behöva",notes:"verb"},{front:"large",back:"stor",notes:"adjektiv"},{front:"often",back:"ofta",notes:"adverb"},{front:"hand",back:"hand",notes:"substantiv"},{front:"high",back:"hög",notes:"adjektiv"},{front:"place",back:"plats",notes:"substantiv"},{front:"hold",back:"hålla",notes:"verb"},{front:"free",back:"fri/gratis",notes:"adjektiv"},{front:"real",back:"verklig",notes:"adjektiv"},{front:"life",back:"liv",notes:"substantiv"},{front:"few",back:"få",notes:"adjektiv"},{front:"north",back:"norr",notes:"substantiv"},{front:"open",back:"öppna/öppen",notes:"verb/adj"},{front:"seem",back:"verka/tyckas",notes:"verb"},{front:"together",back:"tillsammans",notes:"adverb"},{front:"next",back:"nästa",notes:"adjektiv"},{front:"white",back:"vit",notes:"adjektiv"},{front:"children",back:"barn",notes:"subst (pl)"},{front:"begin",back:"börja",notes:"verb"},{front:"walk",back:"gå/promenad",notes:"verb/subst"},{front:"example",back:"exempel",notes:"substantiv"},{front:"always",back:"alltid",notes:"adverb"},{front:"music",back:"musik",notes:"substantiv"},{front:"those",back:"de/dem",notes:"pronomen"},{front:"both",back:"båda",notes:"pronomen"},{front:"book",back:"bok",notes:"substantiv"},{front:"letter",back:"brev/bokstav",notes:"substantiv"},{front:"until",back:"tills/till",notes:"konjunktion"},{front:"river",back:"flod",notes:"substantiv"},{front:"car",back:"bil",notes:"substantiv"},{front:"care",back:"bry sig om",notes:"verb"},{front:"second",back:"andra/sekund",notes:"ordningstal/subst"},{front:"enough",back:"tillräckligt",notes:"adverb"},{front:"girl",back:"flicka/tjej",notes:"substantiv"},{front:"young",back:"ung",notes:"adjektiv"},{front:"ready",back:"redo",notes:"adjektiv"},{front:"above",back:"ovanför",notes:"preposition"},{front:"ever",back:"någonsin",notes:"adverb"},{front:"red",back:"röd",notes:"adjektiv"},{front:"though",back:"fast/trots att",notes:"konjunktion"},{front:"feel",back:"känna sig",notes:"verb"},{front:"talk",back:"prata",notes:"verb"},{front:"bird",back:"fågel",notes:"substantiv"},{front:"soon",back:"snart",notes:"adverb"},{front:"body",back:"kropp",notes:"substantiv"},{front:"dog",back:"hund",notes:"substantiv"},{front:"family",back:"familj",notes:"substantiv"},{front:"leave",back:"lämna",notes:"verb"},{front:"song",back:"sång/låt",notes:"substantiv"},{front:"door",back:"dörr",notes:"substantiv"},{front:"black",back:"svart",notes:"adjektiv"},{front:"short",back:"kort/låg",notes:"adjektiv"},{front:"question",back:"fråga",notes:"substantiv"},{front:"happen",back:"hända",notes:"verb"},{front:"ship",back:"fartyg",notes:"substantiv"},{front:"area",back:"område",notes:"substantiv"},{front:"half",back:"halv/hälften",notes:"adj/subst"},{front:"rock",back:"sten/klippa",notes:"substantiv"},{front:"fire",back:"eld",notes:"substantiv"},{front:"south",back:"söder",notes:"substantiv"},{front:"problem",back:"problem",notes:"substantiv"},{front:"piece",back:"bit/stycke",notes:"substantiv"},{front:"since",back:"sedan/eftersom",notes:"prep/konj"},{front:"top",back:"topp",notes:"substantiv"},{front:"whole",back:"hel",notes:"adjektiv"},{front:"king",back:"kung",notes:"substantiv"},{front:"space",back:"rymd/utrymme",notes:"substantiv"},{front:"best",back:"bäst",notes:"superlativ"},{front:"hour",back:"timme",notes:"substantiv"},{front:"better",back:"bättre",notes:"komparativ"},{front:"true",back:"sann",notes:"adjektiv"},{front:"during",back:"under (tid)",notes:"preposition"},{front:"hundred",back:"hundra",notes:"räkneord"},{front:"five",back:"fem",notes:"räkneord"},{front:"remember",back:"komma ihåg",notes:"verb"},{front:"step",back:"steg",notes:"substantiv"},{front:"early",back:"tidig",notes:"adjektiv"},{front:"west",back:"väster",notes:"substantiv"},{front:"ground",back:"mark/grund",notes:"substantiv"},{front:"interest",back:"intresse",notes:"substantiv"},{front:"reach",back:"nå",notes:"verb"},{front:"fast",back:"snabb",notes:"adjektiv"},{front:"sing",back:"sjunga",notes:"verb"},{front:"listen",back:"lyssna",notes:"verb"},{front:"six",back:"sex",notes:"räkneord"},{front:"table",back:"bord",notes:"substantiv"},{front:"travel",back:"resa",notes:"verb/subst"},{front:"less",back:"mindre",notes:"adverb"},{front:"morning",back:"morgon",notes:"substantiv"},{front:"ten",back:"tio",notes:"räkneord"},{front:"simple",back:"enkel",notes:"adjektiv"},{front:"several",back:"flera",notes:"adjektiv"},{front:"war",back:"krig",notes:"substantiv"},{front:"against",back:"mot/emot",notes:"preposition"},{front:"pattern",back:"mönster",notes:"substantiv"},{front:"slow",back:"långsam",notes:"adjektiv"},{front:"center",back:"centrum",notes:"substantiv"},{front:"love",back:"kärlek/älska",notes:"subst/verb"},{front:"person",back:"person",notes:"substantiv"},{front:"money",back:"pengar",notes:"substantiv"},{front:"appear",back:"dyka upp",notes:"verb"},{front:"road",back:"väg",notes:"substantiv"},{front:"map",back:"karta",notes:"substantiv"},{front:"rain",back:"regn/regna",notes:"subst/verb"},{front:"rule",back:"regel/regera",notes:"subst/verb"},{front:"cold",back:"kall/förkylning",notes:"adj/subst"},{front:"voice",back:"röst",notes:"substantiv"},{front:"energy",back:"energi",notes:"substantiv"},{front:"bed",back:"säng",notes:"substantiv"},{front:"brother",back:"bror",notes:"substantiv"},{front:"egg",back:"ägg",notes:"substantiv"},{front:"ride",back:"rida/åka",notes:"verb"},{front:"believe",back:"tro/tycka",notes:"verb"},{front:"forest",back:"skog",notes:"substantiv"},{front:"sit",back:"sitta",notes:"verb"},{front:"window",back:"fönster",notes:"substantiv"},{front:"store",back:"affär/lagra",notes:"subst/verb"},{front:"summer",back:"sommar",notes:"substantiv"},{front:"train",back:"träna/tåg",notes:"verb/subst"},{front:"sleep",back:"sova",notes:"verb"},{front:"leg",back:"ben",notes:"substantiv"},{front:"wall",back:"vägg",notes:"substantiv"},{front:"catch",back:"fånga",notes:"verb"},{front:"wish",back:"önska",notes:"verb"},{front:"sky",back:"himmel",notes:"substantiv"},{front:"joy",back:"glädje",notes:"substantiv"},{front:"winter",back:"vinter",notes:"substantiv"},{front:"wild",back:"vild",notes:"adjektiv"},{front:"glass",back:"glas",notes:"substantiv"},{front:"grass",back:"gräs",notes:"substantiv"},{front:"cow",back:"ko",notes:"substantiv"},{front:"job",back:"jobb",notes:"substantiv"},{front:"sign",back:"tecken/skylt",notes:"substantiv"},{front:"visit",back:"besöka",notes:"verb"},{front:"past",back:"förfluten/förbi",notes:"adj/adv"},{front:"soft",back:"mjuk",notes:"adjektiv"},{front:"fun",back:"roligt",notes:"adjektiv"},{front:"bright",back:"ljus/intelligent",notes:"adjektiv"},{front:"weather",back:"väder",notes:"substantiv"},{front:"month",back:"månad",notes:"substantiv"},{front:"million",back:"miljon",notes:"räkneord"},{front:"bear",back:"björn/bära",notes:"subst/verb"},{front:"finish",back:"avsluta",notes:"verb"},{front:"happy",back:"glad/lycklig",notes:"adjektiv"},{front:"hope",back:"hoppas/hopp",notes:"verb/subst"},{front:"flower",back:"blomma",notes:"substantiv"},{front:"strange",back:"konstig",notes:"adjektiv"},{front:"jump",back:"hoppa",notes:"verb"},{front:"baby",back:"baby/bebis",notes:"substantiv"},{front:"eight",back:"åtta",notes:"räkneord"},{front:"village",back:"by",notes:"substantiv"},{front:"meet",back:"möta",notes:"verb"},{front:"root",back:"rot",notes:"substantiv"},{front:"buy",back:"köpa",notes:"verb"},{front:"raise",back:"höja/uppfostra",notes:"verb"},{front:"solve",back:"lösa",notes:"verb"},{front:"metal",back:"metall",notes:"substantiv"},{front:"whether",back:"om/huruvida",notes:"konjunktion"},{front:"push",back:"trycka",notes:"verb"},{front:"seven",back:"sju",notes:"räkneord"},{front:"third",back:"tredje",notes:"ordningstal"},{front:"hair",back:"hår",notes:"substantiv"},{front:"describe",back:"beskriva",notes:"verb"},{front:"cook",back:"laga mat/kock",notes:"verb/subst"},{front:"floor",back:"golv/våning",notes:"substantiv"},{front:"result",back:"resultat",notes:"substantiv"},{front:"burn",back:"bränna/brinna",notes:"verb"},{front:"hill",back:"kulle",notes:"substantiv"},{front:"safe",back:"säker",notes:"adjektiv"},{front:"cat",back:"katt",notes:"substantiv"},{front:"century",back:"sekel",notes:"substantiv"},{front:"type",back:"typ/skriva",notes:"subst/verb"},{front:"law",back:"lag",notes:"substantiv"},{front:"coast",back:"kust",notes:"substantiv"},{front:"silent",back:"tyst",notes:"adjektiv"},{front:"tall",back:"lång (person)",notes:"adjektiv"},{front:"sand",back:"sand",notes:"substantiv"},{front:"soil",back:"jord",notes:"substantiv"},{front:"roll",back:"rulla",notes:"verb"},{front:"temperature",back:"temperatur",notes:"substantiv"},{front:"finger",back:"finger",notes:"substantiv"},{front:"industry",back:"industri",notes:"substantiv"},{front:"value",back:"värde",notes:"substantiv"},{front:"fight",back:"slåss/kamp",notes:"verb/subst"},{front:"natural",back:"naturlig",notes:"adjektiv"},{front:"view",back:"utsikt/se",notes:"subst/verb"},{front:"sense",back:"känsla/sinne",notes:"substantiv"},{front:"ear",back:"öra",notes:"substantiv"},{front:"quite",back:"ganska",notes:"adverb"},{front:"case",back:"fall/väska",notes:"substantiv"},{front:"middle",back:"mitten",notes:"substantiv"},{front:"kill",back:"döda",notes:"verb"},{front:"son",back:"son",notes:"substantiv"},{front:"lake",back:"sjö",notes:"substantiv"},{front:"moment",back:"ögonblick",notes:"substantiv"},{front:"scale",back:"skala",notes:"substantiv"},{front:"loud",back:"hög/högljudd",notes:"adjektiv"},{front:"spring",back:"vår/fjäder",notes:"substantiv"},{front:"child",back:"barn",notes:"substantiv"},{front:"straight",back:"rak",notes:"adjektiv"},{front:"nation",back:"nation",notes:"substantiv"},{front:"milk",back:"mjölk",notes:"substantiv"},{front:"speed",back:"hastighet",notes:"substantiv"},{front:"method",back:"metod",notes:"substantiv"},{front:"pay",back:"betala",notes:"verb"},{front:"age",back:"ålder",notes:"substantiv"},{front:"dress",back:"klänning/klä",notes:"subst/verb"},{front:"cloud",back:"moln",notes:"substantiv"},{front:"quiet",back:"tyst/lugn",notes:"adjektiv"},{front:"stone",back:"sten",notes:"substantiv"},{front:"tiny",back:"pytteliten",notes:"adjektiv"},{front:"climb",back:"klättra",notes:"verb"},{front:"cool",back:"sval/cool",notes:"adjektiv"},{front:"design",back:"design",notes:"substantiv"},{front:"poor",back:"fattig/dålig",notes:"adjektiv"},{front:"experiment",back:"experiment",notes:"substantiv"},{front:"bottom",back:"botten",notes:"substantiv"},{front:"key",back:"nyckel",notes:"substantiv"},{front:"iron",back:"järn",notes:"substantiv"},{front:"single",back:"enstaka",notes:"adjektiv"},{front:"flat",back:"platt/lägenhet",notes:"adj/subst"},{front:"twenty",back:"tjugo",notes:"räkneord"},{front:"skin",back:"hud",notes:"substantiv"},{front:"smile",back:"le/leende",notes:"verb/subst"},{front:"trade",back:"handel",notes:"substantiv"},{front:"melody",back:"melodi",notes:"substantiv"},{front:"trip",back:"resa",notes:"substantiv"},{front:"office",back:"kontor",notes:"substantiv"},{front:"receive",back:"ta emot",notes:"verb"},{front:"mouth",back:"mun",notes:"substantiv"},{front:"symbol",back:"symbol",notes:"substantiv"},{front:"die",back:"dö",notes:"verb"},{front:"least",back:"minst",notes:"adverb"},{front:"trouble",back:"problem/besvär",notes:"substantiv"},{front:"shout",back:"ropa/skrika",notes:"verb"},{front:"except",back:"utom",notes:"preposition"},{front:"seed",back:"frö",notes:"substantiv"},{front:"join",back:"gå med i",notes:"verb"},{front:"suggest",back:"föreslå",notes:"verb"},{front:"clean",back:"ren/städa",notes:"adj/verb"},{front:"break",back:"bryta/paus",notes:"verb/subst"},{front:"yard",back:"gård",notes:"substantiv"},{front:"rise",back:"stiga",notes:"verb"},{front:"bad",back:"dålig",notes:"adjektiv"},{front:"blow",back:"blåsa",notes:"verb"},{front:"oil",back:"olja",notes:"substantiv"},{front:"blood",back:"blod",notes:"substantiv"},{front:"touch",back:"röra/beröring",notes:"verb/subst"},{front:"mix",back:"blanda",notes:"verb"},{front:"team",back:"lag/team",notes:"substantiv"},{front:"cost",back:"kosta/kostnad",notes:"verb/subst"},{front:"brown",back:"brun",notes:"adjektiv"},{front:"wear",back:"bära/ha på sig",notes:"verb"},{front:"garden",back:"trädgård",notes:"substantiv"},{front:"equal",back:"lika",notes:"adjektiv"},{front:"choose",back:"välja",notes:"verb"},{front:"fit",back:"passa",notes:"verb"},{front:"flow",back:"flöda",notes:"verb"},{front:"fair",back:"rättvis",notes:"adjektiv"},{front:"bank",back:"bank",notes:"substantiv"},{front:"collect",back:"samla",notes:"verb"},{front:"save",back:"spara/rädda",notes:"verb"},{front:"control",back:"kontrollera",notes:"verb"},{front:"gentle",back:"mild/varsam",notes:"adjektiv"},{front:"woman",back:"kvinna",notes:"substantiv"},{front:"captain",back:"kapten",notes:"substantiv"},{front:"practice",back:"träna/öva",notes:"verb"},{front:"separate",back:"separat",notes:"adjektiv"},{front:"difficult",back:"svår",notes:"adjektiv"},{front:"doctor",back:"läkare",notes:"substantiv"},{front:"protect",back:"skydda",notes:"verb"},{front:"ring",back:"ring/ringa",notes:"subst/verb"},{front:"character",back:"karaktär",notes:"substantiv"},{front:"insect",back:"insekt",notes:"substantiv"},{front:"period",back:"period",notes:"substantiv"},{front:"radio",back:"radio",notes:"substantiv"},{front:"atom",back:"atom",notes:"substantiv"},{front:"human",back:"människa",notes:"substantiv"},{front:"history",back:"historia",notes:"substantiv"},{front:"effect",back:"effekt",notes:"substantiv"},{front:"electric",back:"elektrisk",notes:"adjektiv"},{front:"expect",back:"förvänta sig",notes:"verb"},{front:"modern",back:"modern",notes:"adjektiv"},{front:"element",back:"element",notes:"substantiv"},{front:"hit",back:"slå/träffa",notes:"verb"},{front:"student",back:"student",notes:"substantiv"},{front:"corner",back:"hörn",notes:"substantiv"},{front:"supply",back:"leverera",notes:"verb"},{front:"bone",back:"ben (skelett)",notes:"substantiv"},{front:"imagine",back:"föreställa sig",notes:"verb"},{front:"provide",back:"tillhandahålla",notes:"verb"},{front:"agree",back:"hålla med",notes:"verb"},{front:"capital",back:"kapital/huvudstad",notes:"substantiv"},{front:"chair",back:"stol",notes:"substantiv"},{front:"danger",back:"fara",notes:"substantiv"},{front:"fruit",back:"frukt",notes:"substantiv"},{front:"rich",back:"rik",notes:"adjektiv"},{front:"thick",back:"tjock",notes:"adjektiv"},{front:"soldier",back:"soldat",notes:"substantiv"},{front:"process",back:"process",notes:"substantiv"},{front:"guess",back:"gissa",notes:"verb"},{front:"necessary",back:"nödvändig",notes:"adjektiv"},{front:"sharp",back:"skarp",notes:"adjektiv"},{front:"wing",back:"vinge",notes:"substantiv"},{front:"create",back:"skapa",notes:"verb"},{front:"neighbor",back:"granne",notes:"substantiv"},{front:"wash",back:"tvätta",notes:"verb"},{front:"crowd",back:"folkmassa",notes:"substantiv"},{front:"compare",back:"jämföra",notes:"verb"},{front:"poem",back:"dikt",notes:"substantiv"},{front:"bell",back:"klocka/ringklocka",notes:"substantiv"},{front:"depend",back:"bero på",notes:"verb"},{front:"meat",back:"kött",notes:"substantiv"},{front:"tube",back:"rör",notes:"substantiv"},{front:"famous",back:"berömd",notes:"adjektiv"},{front:"dollar",back:"dollar",notes:"substantiv"},{front:"stream",back:"ström/bäck",notes:"substantiv"},{front:"fear",back:"rädsla/frukta",notes:"subst/verb"},{front:"sight",back:"syn",notes:"substantiv"},{front:"thin",back:"tunn/smal",notes:"adjektiv"},{front:"planet",back:"planet",notes:"substantiv"},{front:"hurry",back:"skynda",notes:"verb"},{front:"chief",back:"chef/hövding",notes:"substantiv"},{front:"clock",back:"klocka",notes:"substantiv"},{front:"enter",back:"gå in",notes:"verb"},{front:"major",back:"viktig",notes:"adjektiv"},{front:"fresh",back:"fräsch/färsk",notes:"adjektiv"},{front:"search",back:"söka",notes:"verb"},{front:"send",back:"skicka",notes:"verb"},{front:"yellow",back:"gul",notes:"adjektiv"},{front:"allow",back:"tillåta",notes:"verb"},{front:"print",back:"skriva ut",notes:"verb"},{front:"dead",back:"död",notes:"adjektiv"},{front:"spot",back:"fläck/plats",notes:"substantiv"},{front:"suit",back:"kostym/passa",notes:"subst/verb"},{front:"current",back:"ström/nuvarande",notes:"subst/adj"},{front:"lift",back:"lyfta/hiss",notes:"verb/subst"},{front:"arrive",back:"anlända",notes:"verb"},{front:"master",back:"bemästra",notes:"verb"},{front:"track",back:"spår",notes:"substantiv"},{front:"parent",back:"förälder",notes:"substantiv"},{front:"shore",back:"strand",notes:"substantiv"},{front:"sheet",back:"lakan/blad",notes:"substantiv"},{front:"connect",back:"ansluta",notes:"verb"},{front:"spend",back:"spendera",notes:"verb"},{front:"fat",back:"fett/tjock",notes:"subst/adj"},{front:"glad",back:"glad",notes:"adjektiv"},{front:"original",back:"ursprunglig",notes:"adjektiv"},{front:"share",back:"dela",notes:"verb"},{front:"station",back:"station",notes:"substantiv"},{front:"bread",back:"bröd",notes:"substantiv"},{front:"charge",back:"ladda/avgift",notes:"verb/subst"},{front:"proper",back:"riktig",notes:"adjektiv"},{front:"bar",back:"bar/stång",notes:"substantiv"},{front:"offer",back:"erbjuda",notes:"verb"},{front:"dream",back:"dröm/drömma",notes:"subst/verb"},{front:"evening",back:"kväll",notes:"substantiv"},{front:"condition",back:"tillstånd/villkor",notes:"substantiv"},{front:"feed",back:"mata",notes:"verb"},{front:"tool",back:"verktyg",notes:"substantiv"},{front:"total",back:"total",notes:"adjektiv"},{front:"basic",back:"grundläggande",notes:"adjektiv"},{front:"smell",back:"lukta/lukt",notes:"verb/subst"},{front:"valley",back:"dal",notes:"substantiv"},{front:"double",back:"dubbel",notes:"adjektiv"},{front:"seat",back:"plats/säte",notes:"substantiv"},{front:"wood",back:"trä/skog",notes:"substantiv"},{front:"light",back:"ljus/lätt",notes:"subst/adj"},{front:"power",back:"kraft/makt",notes:"substantiv"},{front:"town",back:"stad/by",notes:"substantiv"},{front:"fine",back:"bra/fin",notes:"adjektiv"},{front:"drive",back:"köra/driva",notes:"verb"},{front:"watch",back:"titta på/klocka",notes:"verb/subst"},{front:"color",back:"färg",notes:"substantiv"},{front:"face",back:"ansikte",notes:"substantiv"},{front:"main",back:"huvud-/viktigast",notes:"adjektiv"},{front:"land",back:"land/landa",notes:"subst/verb"},{front:"home",back:"hem",notes:"substantiv"},{front:"hand",back:"hand",notes:"substantiv"},{front:"large",back:"stor",notes:"adjektiv"},{front:"turn",back:"svänga/tur",notes:"verb/subst"},{front:"move",back:"flytta/röra",notes:"verb"},{front:"live",back:"leva/bo",notes:"verb"},{front:"every",back:"varje",notes:"adjektiv"},{front:"might",back:"kanske/makt",notes:"hjälpverb/subst"},{front:"still",back:"fortfarande/stilla",notes:"adverb/adj"},{front:"try",back:"försöka",notes:"verb"},{front:"ask",back:"fråga",notes:"verb"},{front:"need",back:"behöva/behov",notes:"verb/subst"},{front:"too",back:"också/för",notes:"adverb"},{front:"nice",back:"trevlig/fin",notes:"adjektiv"},{front:"should",back:"borde/ska",notes:"hjälpverb"},{front:"around",back:"runt/ungefär",notes:"prep/adv"},{front:"own",back:"äga/egen",notes:"verb/adjektiv"},{front:"long",back:"lång",notes:"adjektiv"},{front:"put",back:"lägga/ställa",notes:"verb"},{front:"part",back:"del",notes:"substantiv"},{front:"old",back:"gammal",notes:"adjektiv"},{front:"big",back:"stor",notes:"adjektiv"},{front:"real",back:"riktig/verklig",notes:"adjektiv"},{front:"same",back:"samma",notes:"adjektiv"},{front:"another",back:"en annan",notes:"adjektiv"},{front:"right",back:"rätt/höger",notes:"adj/subst"},{front:"little",back:"liten/lite",notes:"adj/adv"},{front:"last",back:"sista/hålla",notes:"adj/verb"},{front:"never",back:"aldrig",notes:"adverb"},{front:"small",back:"liten",notes:"adjektiv"},{front:"start",back:"börja/start",notes:"verb/subst"},{front:"show",back:"visa/show",notes:"verb/subst"},{front:"keep",back:"behålla/hålla",notes:"verb"},{front:"hand",back:"hand",notes:"substantiv"},{front:"stop",back:"sluta/stopp",notes:"verb/subst"},{front:"course",back:"kurs/naturligtvis",notes:"substantiv"},{front:"cut",back:"skära/snitt",notes:"verb/subst"},{front:"play",back:"spela/leka",notes:"verb"},{front:"run",back:"springa/köra",notes:"verb"},{front:"let",back:"låta",notes:"verb"},{front:"tell",back:"berätta/säga",notes:"verb"},{front:"help",back:"hjälpa/hjälp",notes:"verb/subst"},{front:"grow",back:"växa/odla",notes:"verb"},{front:"open",back:"öppna/öppen",notes:"verb/adj"},{front:"walk",back:"gå/promenad",notes:"verb/subst"},{front:"become",back:"bli",notes:"verb"},{front:"leave",back:"lämna/ledighet",notes:"verb/subst"},{front:"show",back:"visa",notes:"verb"},{front:"bring",back:"ta med/hämta",notes:"verb"},{front:"watch",back:"titta/klocka",notes:"verb/subst"},{front:"move",back:"flytta/röra sig",notes:"verb"},{front:"live",back:"leva/bo",notes:"verb"},{front:"change",back:"ändra/förändring",notes:"verb/subst"},{front:"hear",back:"höra",notes:"verb"},{front:"play",back:"spela",notes:"verb"},{front:"lead",back:"leda/bly",notes:"verb/subst"},{front:"stand",back:"stå",notes:"verb"},{front:"own",back:"äga",notes:"verb"},{front:"read",back:"läsa",notes:"verb"},{front:"spend",back:"spendera",notes:"verb"},{front:"write",back:"skriva",notes:"verb"},{front:"lose",back:"förlora",notes:"verb"},{front:"pay",back:"betala",notes:"verb"},{front:"meet",back:"möta",notes:"verb"},{front:"include",back:"inkludera",notes:"verb"},{front:"continue",back:"fortsätta",notes:"verb"},{front:"set",back:"sätta/uppsättning",notes:"verb/subst"},{front:"learn",back:"lära sig",notes:"verb"},{front:"add",back:"lägga till",notes:"verb"},{front:"build",back:"bygga",notes:"verb"},{front:"fall",back:"falla/höst",notes:"verb/subst"},{front:"happen",back:"hända",notes:"verb"},{front:"plan",back:"planera/plan",notes:"verb/subst"},{front:"form",back:"form/bilda",notes:"subst/verb"},{front:"strong",back:"stark",notes:"adjektiv"},{front:"dark",back:"mörk",notes:"adjektiv"},{front:"hard",back:"hård/svår",notes:"adjektiv"},{front:"warm",back:"varm",notes:"adjektiv"},{front:"clean",back:"ren",notes:"adjektiv"},{front:"clear",back:"tydlig/klar",notes:"adjektiv"},{front:"late",back:"sen/försenad",notes:"adjektiv"},{front:"deep",back:"djup",notes:"adjektiv"},{front:"heavy",back:"tung",notes:"adjektiv"},{front:"dry",back:"torr",notes:"adjektiv"},{front:"sweet",back:"söt",notes:"adjektiv"},{front:"hot",back:"varm/het",notes:"adjektiv"},{front:"wrong",back:"fel",notes:"adjektiv"},{front:"full",back:"full",notes:"adjektiv"},{front:"far",back:"långt/fjärran",notes:"adverb/adj"},{front:"sure",back:"säker",notes:"adjektiv"},{front:"close",back:"nära/stänga",notes:"adj/verb"},{front:"wide",back:"bred/vid",notes:"adjektiv"},{front:"green",back:"grön",notes:"adjektiv"},{front:"blue",back:"blå",notes:"adjektiv"},{front:"sea",back:"hav",notes:"substantiv"},{front:"sun",back:"sol",notes:"substantiv"},{front:"moon",back:"måne",notes:"substantiv"},{front:"star",back:"stjärna",notes:"substantiv"},{front:"tree",back:"träd",notes:"substantiv"},{front:"water",back:"vatten",notes:"substantiv"},{front:"food",back:"mat",notes:"substantiv"},{front:"word",back:"ord",notes:"substantiv"},{front:"number",back:"nummer/antal",notes:"substantiv"},{front:"name",back:"namn",notes:"substantiv"},{front:"world",back:"värld",notes:"substantiv"},{front:"country",back:"land",notes:"substantiv"},{front:"city",back:"stad",notes:"substantiv"},{front:"house",back:"hus",notes:"substantiv"},{front:"school",back:"skola",notes:"substantiv"},{front:"street",back:"gata",notes:"substantiv"},{front:"father",back:"far/pappa",notes:"substantiv"},{front:"mother",back:"mor/mamma",notes:"substantiv"},{front:"sister",back:"syster",notes:"substantiv"},{front:"friend",back:"vän",notes:"substantiv"},{front:"head",back:"huvud",notes:"substantiv"},{front:"heart",back:"hjärta",notes:"substantiv"},{front:"eye",back:"öga",notes:"substantiv"},{front:"nose",back:"näsa",notes:"substantiv"},{front:"arm",back:"arm",notes:"substantiv"},{front:"foot",back:"fot",notes:"substantiv"},{front:"mind",back:"sinne/tänka",notes:"subst/verb"},{front:"idea",back:"idé",notes:"substantiv"},{front:"point",back:"poäng/punkt",notes:"substantiv"},{front:"fact",back:"faktum",notes:"substantiv"},{front:"thing",back:"sak/grej",notes:"substantiv"},{front:"part",back:"del",notes:"substantiv"},{front:"side",back:"sida",notes:"substantiv"},{front:"end",back:"slut/avsluta",notes:"subst/verb"},{front:"line",back:"linje/rad",notes:"substantiv"},{front:"word",back:"ord",notes:"substantiv"},{front:"game",back:"spel",notes:"substantiv"},{front:"story",back:"berättelse",notes:"substantiv"},{front:"question",back:"fråga",notes:"substantiv"},{front:"answer",back:"svar/svara",notes:"subst/verb"},{front:"week",back:"vecka",notes:"substantiv"},{front:"night",back:"natt",notes:"substantiv"},{front:"afternoon",back:"eftermiddag",notes:"substantiv"},{front:"today",back:"idag",notes:"adverb"},{front:"yesterday",back:"igår",notes:"adverb"},{front:"tomorrow",back:"imorgon",notes:"adverb"},{front:"here",back:"här",notes:"adverb"},{front:"there",back:"där",notes:"adverb"},{front:"where",back:"var/vart",notes:"adverb"},{front:"why",back:"varför",notes:"adverb"},{front:"again",back:"igen",notes:"adverb"},{front:"maybe",back:"kanske",notes:"adverb"},{front:"almost",back:"nästan",notes:"adverb"},{front:"already",back:"redan",notes:"adverb"},{front:"still",back:"fortfarande",notes:"adverb"},{front:"yet",back:"ännu/redan",notes:"adverb"},{front:"very",back:"mycket/väldigt",notes:"adverb"},{front:"really",back:"verkligen/riktigt",notes:"adverb"},{front:"especially",back:"speciellt",notes:"adverb"},{front:"however",back:"däremot/dock",notes:"adverb"},{front:"therefore",back:"därför",notes:"adverb"},{front:"actually",back:"faktiskt/egentligen",notes:"adverb"},{front:"maybe",back:"kanske",notes:"adverb"},{front:"suddenly",back:"plötsligt",notes:"adverb"},{front:"probably",back:"troligtvis",notes:"adverb"},{front:"usually",back:"vanligtvis",notes:"adverb"},{front:"finally",back:"till slut/äntligen",notes:"adverb"},{front:"quickly",back:"snabbt",notes:"adverb"},{front:"slowly",back:"sakta/långsamt",notes:"adverb"},{front:"together",back:"tillsammans",notes:"adverb"},{front:"above",back:"ovanför",notes:"adverb"},{front:"below",back:"nedanför",notes:"adverb"},{front:"inside",back:"inuti/inne",notes:"adverb/prep"},{front:"outside",back:"utanför/ute",notes:"adverb/prep"},{front:"behind",back:"bakom",notes:"preposition"},{front:"before",back:"innan/före",notes:"prep/konj"},{front:"across",back:"tvärs över",notes:"preposition"},{front:"through",back:"genom",notes:"preposition"},{front:"around",back:"runt",notes:"preposition"},{front:"without",back:"utan",notes:"preposition"},{front:"within",back:"inom",notes:"preposition"},{front:"toward",back:"mot",notes:"preposition"},{front:"among",back:"bland",notes:"preposition"},{front:"along",back:"längs",notes:"preposition"},{front:"upon",back:"på/över",notes:"preposition"},{front:"despite",back:"trots",notes:"preposition"},{front:"except",back:"utom",notes:"preposition"},{front:"beyond",back:"bortom",notes:"preposition"},{front:"throughout",back:"genom hela",notes:"preposition"},{front:"although",back:"även om/fastän",notes:"konjunktion"},{front:"while",back:"medan",notes:"konjunktion"},{front:"unless",back:"om inte/såvida inte",notes:"konjunktion"},{front:"therefore",back:"därför",notes:"konjunktion"},{front:"however",back:"men/dock",notes:"konjunktion"},{front:"moreover",back:"dessutom",notes:"adverb"},{front:"furthermore",back:"vidare/dessutom",notes:"adverb"},{front:"otherwise",back:"annars",notes:"adverb"}];
}
