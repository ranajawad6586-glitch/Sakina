# Sakīna · سَكِينَة

> An Islamic reader for the Qur'an and the authentic Sunnah. Built for stillness, not engagement.

A static, dark-mode reader for all 114 surahs of the Qur'an (Uthmānī Arabic + Sahih International + transliteration) and a curated set of 100 authentic narrations from the canonical hadith collections. No accounts, no analytics, no notifications. Bookmarks live in `localStorage` and nowhere else.

The full spec is in [CLAUDE.md](CLAUDE.md); the visual source-of-truth is [sakina.html](sakina.html).

---

## Local development

```bash
npm install
npm run dev    # http://localhost:3000
```

Routes:

| Path                  | What's there                                              |
| --------------------- | --------------------------------------------------------- |
| `/`                   | Hero, daily verse + daily hadith (day-of-year rotation)   |
| `/quran`              | All 114 surahs · search by name/meaning/number · filter   |
| `/quran/[1–114]`      | Surah reader: Arabic + transliteration + translation      |
| `/hadith`             | Collection grid + all 100 narrations                      |
| `/hadith/[id]`        | bukhari · muslim · nawawi40 · tirmidhi · abudawud · nasai · ibnmajah |
| `/bookmarks`          | Saved verses + hadith (device-only, `localStorage`)       |
| `/about`              | Authenticity · Typography · How to use                    |

## Refreshing the data

The Qur'an and hadith data sit under `data/` and only need re-fetching if a source updates. Both scripts have acceptance checks that fail loud if the totals don't match.

```bash
npx tsx scripts/fetch-quran.ts      # → data/quran/{001..114}.json + data/surahs.json
npx tsx scripts/fetch-hadith.ts     # → data/hadiths/{collection}.json
```

The Qur'an pipeline pulls Tanzil Uthmānī + Sahih International + transliteration from alquran.cloud, derives the canonical bismillah from the API itself (the Tanzil source uses shadda-before-fatha ordering that a freshly-typed bismillah doesn't match — CLAUDE.md §4.8 forbids normalising), and strips the bismillah from verse 1 of surahs 2–114 except At-Tawbah.

The hadith pipeline pulls from `fawazahmed0/hadith-api`. Bukhārī, Muslim, and Nawawī 40 are trusted by collection; the four sunan are filtered against Al-Albānī's gradings (anything ḍaʿīf or weaker is dropped). Records that fail narrator extraction are also dropped — we never ship an under-attributed hadith.

## Building for production

```bash
npm run build         # produces ./out/  (Next.js static export)
```

Every route in the table above is prerendered to a static `index.html` — 129 HTML files in total, plus the hashed JS/CSS/woff2 bundles under `_next/static/`. The deployed site needs no server logic.

## Deploy

### Render.com (recommended)

A [`render.yaml`](render.yaml) blueprint is committed at the repo root, so deploying is three steps:

1. Push this repo to GitHub.
2. In Render → **New + → Blueprint** → connect the repo. Render reads `render.yaml` and auto-configures a static site (build command `npm ci && npm run build`, publish dir `out/`, Node 22).
3. Click **Apply**.

That's it. Subsequent pushes to the default branch auto-deploy. Render handles HTTPS, the global CDN, custom domains, and PR previews. The free tier covers a personal site comfortably; build takes about a minute.

The blueprint mirrors the cache headers from [`deploy/nginx.conf`](deploy/nginx.conf) — hashed `_next/static/*` and woff2 fonts cached for a year, HTML revalidated on every request.

### Hetzner VPS · nginx (alternate path)

For self-hosted setups, the repo also ships a Docker config matching CLAUDE.md §10. Expected layout on the VPS:

```
/opt/sakina/
├── docker-compose.yml      ← from this repo
├── deploy/
│   └── nginx.conf          ← from this repo
└── out/                    ← rsync target
```

Initial setup (one-off):

```bash
ssh root@<VPS_IP> 'mkdir -p /opt/sakina/deploy'
rsync -avz docker-compose.yml deploy/ root@<VPS_IP>:/opt/sakina/
ssh root@<VPS_IP> 'cd /opt/sakina && docker compose up -d'
```

Every subsequent deploy:

```bash
npm run build
rsync -avz --delete out/ root@<VPS_IP>:/opt/sakina/out/
ssh root@<VPS_IP> 'cd /opt/sakina && docker compose restart sakina'
```

The container listens on host port `8080`. Front it with a system-level nginx (or Caddy) reverse proxy that adds TLS for the public domain.

#### Local Docker test

```bash
npm run build
docker compose up -d         # http://localhost:8080
```

## Project structure

```
sakina/
├── app/                    Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── quran/{page,[surah]/page}.tsx
│   ├── hadith/{page,[collection]/page}.tsx
│   ├── bookmarks/page.tsx
│   └── about/page.tsx
├── components/             Nav, Footer, Ornament, Surah/Verse/Hadith renderers, BookmarkButton, DailyCards, BookmarksList
├── lib/                    quran.ts · hadith.ts · daily.ts (server) · bookmarks.ts (client) · types.ts
├── data/                   Bundled JSON (Qur'an + hadith + daily verses)
├── scripts/                fetch-quran.ts · fetch-hadith.ts
├── deploy/nginx.conf       nginx config (mounted by docker-compose)
├── docker-compose.yml
├── Dockerfile              (optional bake-everything image)
├── sakina.html             Visual source-of-truth prototype
└── CLAUDE.md               Full spec
```

## Non-negotiable rules

CLAUDE.md §4 is the operating contract. The short version:

1. **No fabricated Arabic.** Every glyph comes from the fetched data.
2. **No fabricated hadith attribution.** Every record has collection, number, narrator, and grade. Nothing ḍaʿīf or weaker is shown.
3. **Translation source declared.** Qur'an translation is Sahih International, labelled on every verse.
4. **No streaks, no notifications, no analytics.** Anywhere.
