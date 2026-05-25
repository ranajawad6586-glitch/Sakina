# CLAUDE.md — Sakīna · سَكِينَة

> **An Islamic reader for the Qur'an and the authentic Sunnah.** Built for stillness, not engagement.

**Owner:** Nayyer
**Status:** Greenfield · Spec v1 · target first deployable build in 5 sessions
**Aesthetic source-of-truth:** `sakina.html` (Claude artifact prototype) — visual decisions are locked; this build re-implements that design in Next.js with real data and real routing.

---

## 0. Read this first

You are building a reverence app, not an engagement app. There are **no streaks, no notifications, no gamification, no "share your iman score."** Two things matter:

1. **The Arabic text must be correct, character-perfect, in the Uthmānī script.** No transcription. No re-typing. Pull from a verified source (see §6) and ship the bytes unchanged.
2. **Every hadith must be authentic and properly attributed.** Source collection, hadith number, narrator, and grade (Ṣaḥīḥ / Ḥasan) shown on every card. **No weak (ḍaʿīf) or fabricated (mawḍūʿ) narrations.** When in doubt, omit.

If you are about to write Arabic from your own model output, **stop**. Use the data pipeline in §6.

---

## 1. Stack

| Layer       | Choice                                          | Why                                                                 |
| ----------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| Framework   | **Next.js 15 (App Router)** + TypeScript        | File-based routing for `/quran/[surah]`, static export possible     |
| Styling     | **Tailwind CSS v4** + CSS variables             | Design tokens map cleanly from prototype                            |
| Fonts       | **Amiri**, **Cinzel**, **Cormorant Garamond** (next/font/google) | Already validated visually in prototype           |
| Data        | **Bundled JSON** (no runtime API)               | Qur'an + hadith are static. Offline-first. No rate limits.          |
| State       | React Server Components + minimal `useState`    | No Redux/Zustand. Bookmarks via `localStorage`.                     |
| Deploy      | Static export → Hetzner VPS via nginx           | Pattern matches Nayyer's existing infra (`/opt/sakina/`)            |
| Lint/Format | Biome (or ESLint + Prettier if preferred)       | One config, fast                                                    |

**Forbidden:** Redux, MobX, styled-components, CSS-in-JS runtime, any AI/LLM dependency at runtime, any analytics, any third-party tracker.

---

## 2. File structure (target)

```
sakina/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, nav
│   ├── page.tsx                # Home: hero + daily verse + daily hadith
│   ├── quran/
│   │   ├── page.tsx            # Surah list (114 cards, search, Meccan/Medinan filter)
│   │   └── [surah]/page.tsx    # Surah reader (Arabic + transliteration + translation)
│   ├── hadith/
│   │   ├── page.tsx            # Collection grid + full hadith list
│   │   └── [collection]/page.tsx  # Filtered by collection
│   ├── about/page.tsx
│   └── globals.css             # CSS variables, base layer, pattern overlay
├── components/
│   ├── Nav.tsx
│   ├── DailyCard.tsx           # Verse-of-day + hadith-of-day card
│   ├── SurahCard.tsx
│   ├── VerseBlock.tsx          # Arabic + transliteration + translation
│   ├── HadithItem.tsx
│   ├── CollectionCard.tsx
│   ├── Ornament.tsx            # Reusable gold divider with star
│   └── ui/                     # Primitives: Button, SearchInput, FilterTab
├── lib/
│   ├── quran.ts                # Typed loaders for quran data
│   ├── hadith.ts               # Typed loaders for hadith data
│   ├── daily.ts                # Day-of-year rotation for daily picks
│   └── types.ts
├── data/
│   ├── surahs.json             # 114 surahs: metadata only
│   ├── quran/
│   │   ├── 001.json            # One file per surah, full text
│   │   ├── 002.json
│   │   └── ... (114 files)
│   ├── hadiths/
│   │   ├── bukhari.json
│   │   ├── muslim.json
│   │   ├── nawawi40.json
│   │   ├── tirmidhi.json
│   │   ├── abudawud.json
│   │   ├── nasai.json
│   │   └── ibnmajah.json
│   └── daily-verses.json
├── scripts/
│   ├── fetch-quran.ts          # One-shot: pull Qur'an from source, write data/quran/*
│   └── fetch-hadith.ts         # One-shot: pull hadith from source, curate, write data/hadiths/*
├── public/
│   └── pattern.svg             # Eight-point-star overlay
├── tailwind.config.ts
├── biome.json
├── package.json
└── README.md
```

---

## 3. Design tokens (locked — do not invent new colours)

Defined in `app/globals.css` as CSS variables; Tailwind reads them via `theme.extend.colors`.

```css
:root {
  --bg-deep:       #0a0e1a;
  --bg-mid:        #131a2e;
  --bg-surface:    #1a2138;
  --bg-elevated:   #232b45;
  --cream:         #f4ecd8;
  --cream-soft:    #e8dec5;
  --muted:         #8a93ad;
  --gold:          #d4a574;
  --gold-bright:   #e8c08a;
  --gold-deep:     #b8895a;
  --emerald:       #4a8770;
  --crimson:       #c97064;
  --border:        #2d3550;
  --border-soft:   #232b45;
}
```

**Typography rules:**

- Arabic (verses, hadith Arabic, bismillah, decorative): `font-amiri` — `'Amiri', serif`
- Display headings (section titles, brand, nav): `font-cinzel` — `'Cinzel', serif`, letter-spacing 0.04–0.2em
- Body / translation / narrator: `font-cormorant` — `'Cormorant Garamond', serif`
- **Never** use Inter, Roboto, Arial, or any system sans-serif. **Never** introduce a fourth font.

**Layout:**

- Max content width: `1200px`
- Body padding: `60px 32px 120px` desktop, `32px 20px 80px` mobile
- Cards: 8px radius, 1px border `--border`, subtle gradient `linear-gradient(135deg, --bg-surface, --bg-elevated)`
- Verse numbers: octagonal cartouche (SVG, gold stroke)
- Page transition: 0.6s fade + 12px translate-up

**Pattern overlay** (already in prototype as inline SVG data URI): keep at `opacity: 0.025`, gold stroke, 80×80 tile, fixed-position, `z-index: 0`. Move to `public/pattern.svg` and reference via CSS `background-image: url(/pattern.svg)`.

---

## 4. Non-negotiable rules (the agentic loop guardrails)

1. **No fabricated Arabic.** Every Arabic glyph must originate from the source data in §6 or from the existing prototype's text. If a surah/hadith is missing, ship without it — do not generate it.
2. **No fabricated hadith attribution.** Collection name, book number, hadith number, narrator, and grade must come from the source. If grading is disputed, prefer the more conservative grade.
3. **Translation source declared.** Qur'an uses **Sahih International** (default). If you ship additional translations later, label each one. Never present an unlabeled translation.
4. **Honorifics rendered consistently.**
   - Prophet Muhammad: `Muḥammad ﷺ` (with the U+FDFA glyph or " (peace be upon him)" — pick one, stay consistent).
   - Other prophets: `(peace be upon him)` on first mention per page.
   - Companions: `(may Allah be pleased with him/her)` on first mention per card is acceptable; omit on subsequent for readability.
5. **No autoplay audio, no notifications, no popups, no modals, no cookie banners.** Static, quiet, dignified.
6. **No localStorage for anything except bookmarks** (Milestone 4). No analytics, no fingerprinting, no third-party scripts in `<head>`.
7. **Right-to-left correctness.** All Arabic text in elements with `dir="rtl"`. Mixed inline RTL/LTR (e.g. a verse number inside an Arabic line) must be tested visually on mobile Safari and Chrome.
8. **Diacritics preserved.** The source data ships with full Uthmānī ḥarakāt. Don't strip them. Don't normalize Unicode. Pass them through.

---

## 5. Build order (5 sessions, each with acceptance criteria)

Each session ends with a working `npm run build` and a git commit. Do not start session N+1 until session N's acceptance criteria are met.

### Session 1 — Skeleton + design tokens
**Tasks:**
- `npx create-next-app@latest sakina --typescript --tailwind --app --eslint --no-src-dir`
- Configure `next/font/google` for Amiri, Cinzel, Cormorant Garamond (weights matching prototype `<link>` tag)
- Port CSS variables to `globals.css`, wire into `tailwind.config.ts`
- Build `Nav`, `Ornament`, base layout
- Home page with hero (bismillah + title + tagline + ornament) — **no daily card yet**, no data

**Done when:**
- `npm run build && npm start` shows home page identical to prototype hero
- Lighthouse: 100/100/100/100 on home
- All four nav links visible, active state matches prototype

### Session 2 — Qur'an data + reader
**Tasks:**
- Run `scripts/fetch-quran.ts` (see §6) to populate `data/quran/*` and `data/surahs.json`
- `app/quran/page.tsx`: surah grid (114 cards), search input, Meccan/Medinan filter — match prototype card design exactly
- `app/quran/[surah]/page.tsx`: reader view with bismillah header, verse blocks (Arabic + transliteration + translation + verse number cartouche)
- Generate static params for all 114 surahs (`generateStaticParams`)

**Done when:**
- `/quran` shows all 114 surahs, search and filter work
- `/quran/1` through `/quran/114` all render without errors
- Random spot-checks: `/quran/1` matches the printed Muṣḥaf, `/quran/112` matches, `/quran/2` (verse 255 = Ayat al-Kursī) renders correctly
- Mobile Safari: Arabic renders with correct ligatures, no missing glyphs

### Session 3 — Hadith data + reader
**Tasks:**
- Run `scripts/fetch-hadith.ts` (see §6) to populate `data/hadiths/*`
- `app/hadith/page.tsx`: collection grid (6 collections + an-Nawawī's 40 + "All"), filtered list below
- `HadithItem` component: number badge, grade pill, Arabic, English translation (with drop-cap), narrator + source line
- `app/hadith/[collection]/page.tsx`: pre-filtered view; `generateStaticParams` over the collection IDs

**Done when:**
- At least 50 hadiths total across collections (curated, not bulk-imported)
- Every hadith has: Arabic + English + narrator + source ref + grade
- Filter by collection works; "All" shows everything
- No ungraded hadiths visible

### Session 4 — Daily rotation + bookmarks
**Tasks:**
- `lib/daily.ts`: deterministic day-of-year picker for verse and hadith (matches prototype's `Math.floor((Date.now() - new Date(year, 0, 0)) / 86400000)`)
- Wire `DailyCard` on home page with today's verse and today's hadith
- Add bookmark toggle (star icon, gold) on `VerseBlock` and `HadithItem`
- Bookmarks page at `/bookmarks` — reads from `localStorage`, list of bookmarked verses + hadiths with links back to their reader pages
- Empty state: Arabic + English explaining what bookmarks do

**Done when:**
- Refreshing the home page on the same day shows the same daily verse + hadith; the next day rotates
- Bookmarking persists across reloads
- Bookmarks page lists items grouped by type (Verse / Hadith), each linkable
- No bookmark UI on hover-only states (must be visible on mobile)

### Session 5 — Polish + deploy
**Tasks:**
- About page with the three sections from prototype (Authenticity, Typography, How to use)
- Footer with Yūsuf 12:64 verse
- Metadata: `<title>`, OpenGraph, favicon (octagonal star, gold on midnight)
- `next.config.ts`: `output: 'export'` for static build
- Dockerfile + `docker-compose.yml` matching the `/opt/sakina/` pattern
- nginx config snippet in `deploy/nginx.conf`
- README with `npm run build && rsync …` deployment steps

**Done when:**
- `npm run build` produces `out/` directory deployable as static site
- `docker compose up -d` serves the app locally
- Lighthouse: 100/100/100/100 on all four routes
- Page weight: home < 200KB transferred (excluding fonts), surah page < 250KB
- Total cold-start interactive < 1.2s on simulated 4G

---

## 6. Data acquisition (this is the part you cannot wing)

### 6.1 Qur'an text

**Source:** Tanzil.net's Uthmānī text + Sahih International translation, both in the public domain / freely licensed for redistribution.

Implementation (`scripts/fetch-quran.ts`):

1. Fetch `https://api.alquran.cloud/v1/quran/quran-uthmani` → Arabic Uthmānī text, all 114 surahs, all 6,236 verses.
2. Fetch `https://api.alquran.cloud/v1/quran/en.sahih` → Sahih International translation.
3. Fetch `https://api.alquran.cloud/v1/quran/en.transliteration` → transliteration.
4. Merge by surah/ayah number into per-surah JSON files: `data/quran/{nnn}.json` (zero-padded).
5. Also produce `data/surahs.json` with metadata: number, Arabic name, English name, meaning, verse count, revelation type (Meccan/Medinan).

Schema (`data/quran/001.json`):
```json
{
  "number": 1,
  "name_ar": "ٱلْفَاتِحَة",
  "name_en": "Al-Fātiḥah",
  "meaning": "The Opening",
  "verses": 7,
  "type": "meccan",
  "bismillah_inline": true,
  "ayahs": [
    {
      "number": 1,
      "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      "tl": "Bismillāhi r-raḥmāni r-raḥīm",
      "en": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    }
  ]
}
```

**Acceptance check after `fetch-quran.ts`:** all 114 files exist, total ayah count across files = 6,236, file `001.json` has 7 ayahs, file `002.json` has 286 ayahs, file `114.json` has 6 ayahs. If the totals are off, abort — do not start using the data.

### 6.2 Hadith text

**Sources (in priority order):**
1. **fawazahmed0/hadith-api** (GitHub) — JSON dumps of all six canonical collections + Nawawī 40, with Arabic + multiple English translations, free and re-distributable. URL: `https://github.com/fawazahmed0/hadith-api`
2. **sunnah.com API** (requires free API key) — authoritative but rate-limited. Use as cross-check.

Implementation (`scripts/fetch-hadith.ts`):

1. Download the relevant collection JSONs from fawazahmed0/hadith-api (raw GitHub URLs).
2. For each collection, **curate** — do not bulk import. Filter to a target set:
   - Bukhārī: 15 hadiths
   - Muslim: 15 hadiths
   - Nawawī 40: all 42 (the canonical 40 + the two appended by Ibn Rajab)
   - Tirmidhī: 10 hadiths (only those graded Ṣaḥīḥ or Ḥasan by al-Albānī or Dār us-Salām edition)
   - Abū Dāwūd: 8 hadiths
   - Nasāʾī: 5 hadiths
   - Ibn Mājah: 5 hadiths
3. For each curated hadith, write a record with all required fields (see schema below).
4. **Grade verification:** Every Tirmidhī, Abū Dāwūd, Nasāʾī, Ibn Mājah hadith ships with the al-Albānī grading from the source. Drop anything graded ḍaʿīf or below.

Schema (`data/hadiths/bukhari.json`):
```json
[
  {
    "id": "bukhari-1",
    "collection": "bukhari",
    "collection_ar": "ٱلْبُخَارِيّ",
    "collection_en": "Ṣaḥīḥ al-Bukhārī",
    "number": "1",
    "book": "Book of Revelation",
    "ar": "إِنَّمَا ٱلْأَعْمَالُ بِٱلنِّيَّاتِ ...",
    "en": "Actions are but by intentions ...",
    "narrator_en": "ʿUmar ibn al-Khaṭṭāb",
    "narrator_ar": "عُمَر بْن ٱلْخَطَّاب",
    "grade": "sahih",
    "cross_refs": ["muslim-1907"]
  }
]
```

**Acceptance check after `fetch-hadith.ts`:**
- No record has `grade: "daif"` or `grade: "mawdu"` or empty grade
- Every record has non-empty `ar`, `en`, `narrator_en`, `collection`, `number`
- Total curated count between 50 and 100

### 6.3 Daily verses pool

Hand-curated list in `data/daily-verses.json` of ~30 short, comfort-themed verses (patience, mercy, hope, tawakkul). Start with the 7 already in the prototype and expand.

---

## 7. Routing & data loading patterns

- **All pages are RSC (React Server Components) by default.** Client components only where interactivity is required (search input, filter tabs, bookmark toggle).
- **Data loaders in `lib/`** are server-only — read JSON from disk via `fs/promises`, cached at build time:

```ts
// lib/quran.ts
import 'server-only';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function getSurah(n: number): Promise<Surah> {
  const padded = String(n).padStart(3, '0');
  const raw = await readFile(join(process.cwd(), 'data/quran', `${padded}.json`), 'utf-8');
  return JSON.parse(raw);
}

export async function getAllSurahsMeta(): Promise<SurahMeta[]> {
  const raw = await readFile(join(process.cwd(), 'data/surahs.json'), 'utf-8');
  return JSON.parse(raw);
}
```

- `generateStaticParams` in `[surah]/page.tsx` and `[collection]/page.tsx` returns all valid IDs so static export bakes every route.

---

## 8. Testing

Minimal but non-negotiable:

```
tests/
├── data-integrity.test.ts     # Run after every data fetch
│   ├── Qur'an: 114 surahs, 6236 ayahs total, ayah counts match canonical
│   ├── Hadith: no ungraded, no daʿīf, every record has required fields
│   └── Honorifics: hadith text doesn't contain "Mohammed" (use "Muḥammad")
├── render.test.tsx            # Surah and hadith pages render without throwing
└── a11y.test.ts               # Critical pages pass axe-core
```

Run with `vitest`. CI: GitHub Actions on push to `main` — build + test.

---

## 9. Out of scope (v1)

Do not build these in v1, even if asked mid-session:

- Audio recitation / Qārī selection
- Prayer times / qibla compass
- Tasbīḥ counter
- Multi-language UI (Urdu, Indonesian, etc.)
- User accounts, server-side bookmarks, sync
- Tafsīr (Qur'anic commentary)
- Search across full Qur'an text or hadith corpus (planned for v2 with Lunr/MiniSearch)
- PWA / offline manifest (planned for v2)
- Dark/light theme toggle — the app is dark-only by design

Each of these is a legitimate v2 ticket. Note them in a `BACKLOG.md`, don't build them now.

---

## 10. Deployment (Hetzner VPS)

Reuse the existing Hetzner pattern:

```
/opt/sakina/
├── docker-compose.yml
├── nginx/
│   └── conf.d/sakina.conf
├── out/                # static export from Next.js, rsync'd from local
└── .env                # empty for v1 — no secrets needed
```

`docker-compose.yml` runs an nginx container serving `out/` with proper cache headers (Arabic fonts cached forever, HTML cached short).

Deployment command from local Mac:
```bash
npm run build
rsync -avz --delete out/ root@<VPS_IP>:/opt/sakina/out/
ssh root@<VPS_IP> 'cd /opt/sakina && docker compose restart nginx'
```

Domain: TBD (suggest `sakina.nayyershah.mooo.com` initially or buy a dedicated domain).

---

## 11. Commit discipline

- Branch per session: `session-1-skeleton`, `session-2-quran`, etc.
- Commit at every passing acceptance check, not just session-end
- Commit messages: imperative mood, ≤ 72 char subject
  - Good: `Add surah reader route with static params`
  - Bad: `Fixed stuff`
- Never commit `node_modules/`, `.next/`, `out/`, or any `data/quran/*.json` that hasn't passed the integrity check

---

## 12. When in doubt

- If the design decision is ambiguous, **open `sakina.html` and match it**. The prototype is authoritative for visuals.
- If the data decision is ambiguous, **prefer the more conservative path**. Drop a hadith rather than ship it under-attributed. Drop an unverified Arabic glyph rather than guess.
- If a feature is tempting but in §9 (Out of scope), **add it to BACKLOG.md and move on**.

The app is finished when a Muslim opens it before Fajr, reads a verse and a hadith, and closes it without ever feeling sold to.

---

*Wa-billāhi at-tawfīq.*
