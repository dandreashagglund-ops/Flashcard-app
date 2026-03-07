# ✦ Glosträning

En flashcard-app för att träna glosor, byggd med React + Supabase.

## Funktioner
- 🔐 Inloggning med e-post & lösenord
- 🃏 Flashkort med framsida (ord/bild) och baksida (översättning/förklaring)
- 🏷️ Taggar med färger (teman, svårighet, favoriter m.m.)
- 📊 Spaced repetition – appen räknar ut när du bör repetera varje ord
- 📈 Statistik: rätt/fel, streak, träffsäkerhet per tagg
- 📥 Importera 1 000 vanligaste engelska ord med ett klick
- 📋 Importera egna ord via CSV
- 🌐 Svenska / Engelska UI

---

## Driftsättning – Gratis med Supabase + Vercel

**Kostnad: 0 kr/månad** för upp till ~50 000 kortvisningar/månad.

---

## Steg 1 – Skapa Supabase-konto (databas + auth)

1. Gå till [supabase.com](https://supabase.com) och klicka **Start your project**
2. Logga in med GitHub (gratis)
3. Klicka **New project**, välj ett namn (t.ex. `glostraning`) och ett lösenord
4. Välj region: **Frankfurt (eu-central-1)** – närmast Sverige
5. Vänta ~2 minuter tills projektet är klart

### Skapa databasen
6. Klicka på **SQL Editor** i vänstermenyn
7. Klicka **New query**
8. Öppna filen `supabase-setup.sql` (finns i denna mapp) och klistra in hela innehållet
9. Klicka **Run** – du ska se "Success"

### Hämta dina API-nycklar
10. Gå till **Project Settings** (kugghjul-ikonen) → **API**
11. Kopiera:
    - **Project URL** → detta är din `VITE_SUPABASE_URL`
    - **anon public** (under "Project API Keys") → detta är din `VITE_SUPABASE_ANON_KEY`

---

## Steg 2 – Publicera på Vercel (hosting)

1. Gå till [github.com](https://github.com) och skapa ett konto (gratis)
2. Skapa ett nytt repository, klicka **Add file** → **Upload files**
3. Ladda upp **alla filer** från den här mappen
4. Gå till [vercel.com](https://vercel.com) och logga in med GitHub
5. Klicka **Add New Project** → välj ditt GitHub-repo
6. Klicka på **Environment Variables** och lägg till:
   - `VITE_SUPABASE_URL` = din Project URL från Supabase
   - `VITE_SUPABASE_ANON_KEY` = din anon-nyckel från Supabase
7. Klicka **Deploy** – vänta ~1 minut
8. Du får en URL som `https://glostraning.vercel.app` – dela den med vem du vill!

---

## Lokal utveckling (valfritt)

```bash
# Installera Node.js från nodejs.org om du inte har det

# Installera beroenden
npm install

# Skapa .env-fil
cp .env.example .env
# Redigera .env och fyll i dina Supabase-nycklar

# Starta lokalt
npm run dev
# Öppna http://localhost:5173
```

---

## CSV-format för import

```
the,det/den,artikel
be,vara,verb
to,till/att,preposition
```

Kolumner: `framsida,baksida,anteckningar` (anteckningar är valfritt)

---

## Mappstruktur

```
flashcard-app/
├── src/
│   ├── App.jsx          # All applogik och komponenter
│   └── index.css        # Styling
├── index.html
├── package.json
├── vite.config.js
├── vercel.json          # SPA-routing för Vercel
├── supabase-setup.sql   # Kör i Supabase SQL Editor
└── .env.example         # Mall för miljövariabler
```

---

## Teknisk stack

| Del | Teknologi | Kostnad |
|-----|-----------|---------|
| Frontend | React + Vite | Gratis |
| Backend/DB | Supabase (PostgreSQL) | Gratis (500 MB, 50k req/mån) |
| Hosting | Vercel | Gratis (100 GB bandwidth/mån) |
| Auth | Supabase Auth | Gratis (50k MAU) |

**Total: 0 kr/månad** för personligt bruk eller liten grupp.
