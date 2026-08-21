# ByCompany — CS-Next

Company-wise LeetCode interview questions. Pick a company, see what they've asked. Free, static, no login.

**For the pursuit of excellence.**

## What this is

A static lookup tool built by CS-Next. 656 companies · sourced from public community data (snehasishroy/leetcode-companywise-interview-questions, July 2026 snapshot).

No account. No paywall. No AI features. No ads.

## Structure

```
scripts/
  ingest.mjs          — one-time data pipeline (fetches CSVs + logos, writes companies.json)
  generate-index.mjs  — extracts compact 57KB index for search from 4.6MB full data

site/
  app/                — Next.js App Router pages
    page.tsx          — Home: A–Z company index
    company/[slug]/   — Company page: question table (sortable)
    about/            — About & Sources page
  components/         — CompanyLogo, DifficultyBadge, SiteHeader, IntroAnimation
  lib/                — data.ts (build-time loader), types.ts
  public/
    data/             — companies.json (full, build-time), companies-index.json (compact, 57KB)
    logos/            — 553 company logos cached from Clearbit at ingest time
    Logo.png          — CS-Next crest
  out/                — static HTML output (deploy this folder)
```

## Run / build

```bash
# 1. Ingest fresh data + logos (takes ~5 min for 660 companies)
node scripts/ingest.mjs

# 2. Generate compact search index
node scripts/generate-index.mjs

# 3. Build static site
cd site && npm run build

# The static site is in site/out/ — deploy to Cloudflare Pages, GitHub Pages, Netlify, etc.
```

Or run the whole pipeline in one step (from site/):
```bash
npm run pipeline
```

## Tech

- **Framework:** Next.js 16 with `output: "export"` (pure static HTML)
- **Search:** Fuse.js client-side fuzzy search over the 57KB company index
- **Styling:** Hand-written CSS with exact CS-Next brand tokens (no Tailwind defaults)
- **Typography:** IBM Plex Serif (headings) + IBM Plex Mono (data) + IBM Plex Sans (UI)
- **Hosting:** Any static host (Cloudflare Pages, GitHub Pages, Netlify, Vercel static)

## Data sources

- [snehasishroy/leetcode-companywise-interview-questions](https://github.com/snehasishroy/leetcode-companywise-interview-questions) (July 2026)

This site is not affiliated with LeetCode. No problem statements are reproduced — title, difficulty, frequency, and link only.

## License

MIT. Company logos remain property of their respective companies.