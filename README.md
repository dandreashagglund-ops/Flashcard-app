# ✦ Glosträning v3.1

En flashcard-app för att träna glosor, byggd med React + Supabase.

## Nyheter i v3.1

### UI-förbättringar
- 🔧 **Bugfix**: Hänglåsikonen uppdateras nu korrekt direkt när du delar/avdelar en lista
- 💬 **Tooltips** på alla viktiga knappar och interaktiva element
- 🔍 **Autocomplete** på textinmatningar för ämnen och kurser
- 📱 **Mobil**: Utloggningsknappen är nu alltid synlig

### Användarfunktioner
- ❓ **Hjälpsida** med guide, träningtips, importinstruktioner och FAQ
- 📚 **Ämnen & kurser** kan nu kopplas till listor och importerade ord
- 👁️ **Visa/dölj flaggade kort** i kortlistan och träningsläget
- 🚩 **Flaggade kort** visas med banner i listans hemvy
- ↩️ **Träna fel ord**: Öva bara ord du svarade fel på senaste gången
- ❌ **Svarat fel någon gång**: Öva alla ord du haft svårt med
- 🏷️ **Taggfiltrering**: Bara taggar som finns i din lista visas
- 🔁 **Kopieringsskydd**: Kan inte kopiera en publik lista mer än en gång
- ✓ **Kopierad-markering**: Se tydligt vilka publika listor du redan kopierat
- 🔍 **Sortering i Utforska**: Mest kopierade, flest kort, nyaste

### Importförbättringar
- 📝 **Metadata-steg** efter CSV-uppladdning: lägg till ämnen, kurser och teman
- 📖 **Förbättrad CSV-dokumentation** med tabell över kolumner och exempelrader
- 📊 **Svårighet** som valfri kolumn 5 i CSV-formatet

### Administratör
- 📊 **Admin-statistik**: Mest kopierade listor och mest använda taggar visas
- 🔍 **Kortfiltrering**: Filtrera på tagg, lista, tema och "Utan lista" (föräldralösa kort)
- ❓ **Admin-hjälp**: Inbyggd handbok för administratörer i Admin-panelen

---

## Funktioner

- 🔐 Inloggning med e-post & lösenord
- 🃏 Flashkort med framsida (ord/bild) och baksida (översättning/förklaring)
- 🏷️ Taggar med färger (teman, svårighet, favoriter m.m.)
- 📊 Spaced repetition – appen räknar ut när du bör repetera varje ord
- 📈 Statistik: rätt/fel, streak, träffsäkerhet per tagg
- 📥 Importera 1 000 vanligaste engelska ord med ett klick
- 📋 Importera egna ord via CSV med ämnen och kursinformation
- 🌐 Utforska och kopiera publika ordlistor
- 🎯 Öva ett tema tvärs över alla dina listor
- ❓ Inbyggd hjälpsida för användare och administratörer

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
8. Öppna filen `supabase-setup.sql` och klistra in hela innehållet
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

---

## Lokal utveckling (valfritt)

```bash
npm install
cp .env.example .env
# Redigera .env och fyll i dina Supabase-nycklar
npm run dev
# Öppna http://localhost:5173
```

---

## CSV-format för import

```
framsida, baksida, kommentar, emoji, svårighet
hund, dog, En fyrbent vän, 🐶, 1
katt, cat,,🐱, 2
oregelbunden, irregular, Oregelbundet verb,, 3
```

| Kolumn | Innehåll | Obligatorisk |
|--------|----------|-------------|
| 1 | Framsida (ord/begrepp) | Ja |
| 2 | Baksida (översättning) | Ja |
| 3 | Kommentar/förklaring | Nej |
| 4 | Emoji | Nej |
| 5 | Svårighet 1–5 | Nej |

Efter CSV-uppladdning kan du koppla **ämnen** (t.ex. Engelska, Historia), **kurser** (t.ex. Psykologi A) och **teman** (t.ex. Grammatik) till de importerade orden.

---

## Mappstruktur

```
flashcard-app/
├── src/
│   ├── App.jsx          # All applogik och komponenter (v3.1)
│   └── index.css        # Styling
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── supabase-setup.sql
└── .env.example
```

---

## Teknisk stack

| Del | Teknologi | Kostnad |
|-----|-----------|---------|
| Frontend | React 18 + Vite | Gratis |
| Backend/DB | Supabase (PostgreSQL) | Gratis (500 MB, 50k req/mån) |
| Hosting | Vercel | Gratis (100 GB bandwidth/mån) |
| Auth | Supabase Auth | Gratis (50k MAU) |

**Total: 0 kr/månad** för personligt bruk eller liten grupp.
