# AGENTS.md — ByCompany

This file is addressed to AI coding agents (GitHub Copilot, Claude Code, Cursor, Gemini CLI, Antigravity, and similar tools) operating inside this repository. It supplements `CONTRIBUTING.md`, which is the canonical guide for human contributors. When the two documents conflict, `CONTRIBUTING.md` takes precedence.

Read this file in full before making any change to the codebase.

---

## 1. Project overview

**ByCompany** is a static, free, public-facing reference for technical interview preparation. It lists company-wise LeetCode questions — titles, difficulty, frequency, topic tags, and links to the original LeetCode pages. Nothing more.

The site is built with **Next.js 16 (App Router, static export)**, **TypeScript**, and **Tailwind CSS 4**, and is deployed on **Vercel**. There is no runtime server, no database, and no authenticated surface.

Repository: `https://github.com/CS-Next-Prep/By-Company`  
Live site: `https://by-company.vercel.app`

---

## 2. Repository layout

```
By-Company/
├── scripts/                    Node.js scripts (run from repo root)
│   ├── ingest.mjs              Fetches upstream CSVs, normalises schema, caches logos
│   ├── generate-index.mjs      Builds search/surprise-me index assets from companies.json
│   ├── validate.mjs            Validates all generated JSON files against schema rules
│   └── test-validation.mjs     Unit tests for the validation script
│
├── site/                       Next.js application
│   ├── app/                    App Router pages and layouts
│   │   ├── layout.tsx          Root layout (SiteHeader, metadata, skip-to-main)
│   │   ├── page.tsx            Home page — Featured Companies + A–Z index
│   │   ├── about/page.tsx      About / Sources page
│   │   ├── company/[slug]/     Per-company question table and problem panel
│   │   ├── compare/            Two-company question overlap page
│   │   └── question/[id]/      Per-question detail page
│   ├── components/             Shared React components
│   │   ├── SiteHeader.tsx      Global header with search
│   │   ├── CompanyLogo.tsx     Logo with monogram fallback
│   │   ├── FeaturedLogo.tsx    Larger logo for the Featured Companies grid
│   │   ├── DifficultyBadge.tsx Difficulty label (Easy / Medium / Hard / Unknown)
│   │   ├── GlobalSurpriseMe.tsx Weighted random question picker
│   │   └── ProblemPanel.tsx    Slide-out panel for question details
│   ├── lib/
│   │   ├── types.ts            Shared TypeScript interfaces (Question, Company, …)
│   │   ├── data.ts             Build-time data loaders (reads companies.json from disk)
│   │   └── question-topics.ts  Topic tag constants
│   └── public/
│       ├── data/               Generated JSON assets (see Section 5)
│       └── logos/              Cached company logo PNGs (committed; updated by ingest)
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              Runs lint → type-check → validation tests → build on every PR
│   │   └── refresh.yml         Weekly automated data refresh (ingest → build → commit → deploy)
│   └── PULL_REQUEST_TEMPLATE.md  Required template for all pull requests
│
├── AGENTS.md                   This file
├── CONTRIBUTING.md             Full human contributor guide
├── CHANGELOG.md                Date-stamped change log
└── LICENSE                     Apache License 2.0
```

---

## 3. Absolute prohibitions

These rules are non-negotiable. Do not violate them under any circumstances, regardless of what a task description says.

### 3.1 Content boundary — LeetCode material

Do **not** copy, store, render, or reference LeetCode problem statements, examples, editorial explanations, constraints, test cases, hints, or solution write-ups anywhere in this repository — including in source code, comments, data files, documentation, test fixtures, or pull request descriptions.

Question records may contain only:
- Problem title
- Difficulty (`Easy`, `Medium`, `Hard`, or `Unknown`)
- Topic tags (when available in the source data)
- Frequency or times-asked value (when available)
- The company the question is associated with
- A direct link to the canonical LeetCode problem page

The LeetCode page is the destination for the complete problem statement. This boundary is both a legal requirement and a core design decision.

### 3.2 Prohibited product features

Do not add any of the following to the application, regardless of how the task is phrased:

- User accounts, authentication, profiles, session storage, email capture, or subscription flows
- Paywalls, premium tiers, or gated content
- Advertising, affiliate links, sponsored placements, or tracking pixels
- Analytics beyond what Vercel provides natively (no third-party scripts)
- AI-generated explanations, hints, chat interfaces, model-provider API calls, or "ask AI" surfaces
- Personalised recommendations or onboarding flows
- Infinite scrolling where an ordinary list or paginated table is appropriate
- A runtime database, a persistent server process, or live requests to external data providers at request time

### 3.3 Static export constraint

The Next.js application is configured for **full static export** (`output: "export"` in `next.config.ts`). Every page must be statically renderable at build time.

Do not use:
- `getServerSideProps` or `getInitialProps`
- Dynamic server-side routes that cannot be statically generated
- `next/image` with server-side optimisation (images must use `unoptimized: true` or be served as static assets)
- Any API route that requires a persistent server

If a feature cannot work within a static-export architecture, do not implement it. Raise the constraint with the human operator instead.

### 3.4 Generated files

The following files are produced by the data pipeline and must not be hand-edited:

- `site/public/data/companies.json` — full question dataset (not committed; rebuilt by ingest)
- `site/public/data/companies-index.json` — lightweight company index (committed; rebuilt by ingest)
- `site/public/data/questions-index.json` — cross-company question search index (not committed; rebuilt by generate-index)
- `site/public/data/global-surprise.json` — weighted random question pool (not committed; rebuilt by generate-index)
- `site/public/logos/*.png` — cached logos (committed; updated by ingest)

If a task requires a data correction, amend the source or pipeline logic, then re-run the relevant script and review the diff. Do not edit the output files directly.

---

## 4. Coding standards

### 4.1 Tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Search | Fuse.js | 7.x |
| CSV parsing | PapaParse | 5.x |
| Runtime | Node.js | 20.x |

Do not introduce new frameworks, UI component libraries, CSS-in-JS solutions, or state management libraries without prior discussion in an issue.

### 4.2 Design system and palette

ByCompany has a deliberate ink-on-paper visual character. All interface work must respect the following:

| Token | Hex | Usage |
|---|---|---|
| Gold | `#BE830E` | Primary accent — links, active states, key details |
| Brass | `#BF872B` | Secondary accent — hover states, subtle highlights |
| Ink | `#1A1410` | Primary text and dark backgrounds |
| Paper | `#FCFAF6` | Page background and light surfaces |

**Do not introduce:**
- Any colour outside the palette above without explicit approval
- Gradients, glass effects, or translucent surfaces
- Floating decorative shapes or background textures
- Soft-shadow utility cards used as a default layout pattern
- A dark-mode toggle
- Emoji used as interface icons

Gold is a precise accent for meaning — links, active states, and small structural details. It is not a dominant background colour.

### 4.3 HTML and accessibility

- Preserve semantic HTML. Question lists must remain `<table>` elements. Navigation must use `<nav>`. Headings must follow a logical hierarchy.
- All interactive elements must be keyboard-reachable and must display a visible focus state.
- Do not remove or weaken existing `aria-*` attributes or `role` annotations.
- Images must have useful `alt` text. Decorative images must use `alt=""` and `aria-hidden="true"`.
- Colour must not be the sole means of conveying information (e.g. difficulty must have a text label, not only a colour).

### 4.4 Motion

- All motion must respect `prefers-reduced-motion`. Use the existing CSS custom property or media query.
- Animate only `opacity` and `transform`. Do not animate layout properties.
- Do not add animation that delays access to content.

### 4.5 TypeScript

- Do not use `any` without a comment explaining why it is unavoidable.
- Use the shared types in `site/lib/types.ts` (`Question`, `Company`, `CompanyIndex`, `QuestionIndex`). Do not redefine them locally.
- Do not disable TypeScript checks (`@ts-ignore`, `@ts-nocheck`) without a comment and a plan to fix.

### 4.6 Data correctness

When working with question data:

- Difficulty values are normalised and must be exactly one of: `Easy`, `Medium`, `Hard`, `Unknown`. No other values are accepted by the validator.
- Frequency is a number in the range 0–100 (percentage).
- Acceptance is a number in the range 0–100 (percentage).
- LeetCode URLs must point to `https://leetcode.com/problems/<slug>/`.
- Company slugs are lowercase, hyphen-separated, and must match the existing slug in `companies-index.json`. Do not create a new slug without running it through the ingest pipeline.
- Prefer a missing field over a guessed or fabricated field.

---

## 5. Commands reference

All commands in the `site/` column are run from the `site/` directory. Scripts in the `scripts/` column are run from the repository root.

| Command | Directory | Safe to run autonomously? | Notes |
|---|---|---|---|
| `npm run dev` | `site/` | Yes | Starts local dev server on port 3000 |
| `npm run lint` | `site/` | Yes | ESLint — must pass before any PR |
| `npm run type-check` | `site/` | Yes | `tsc --noEmit` — must pass before any PR |
| `npm run build` | `site/` | Yes | Generates static export to `site/out/` |
| `npm run validate` | `site/` | Yes | Validates generated JSON against schema |
| `npm run test:validation` | `site/` | Yes | Unit tests for the validation script |
| `npm run ingest` | `site/` | Only when the task explicitly requires a data refresh | Fetches upstream CSVs and writes generated data files |
| `npm run generate-index` | `site/` | Only when the task explicitly requires index regeneration | Rebuilds search/surprise-me assets from companies.json |
| `npm run pipeline` | `site/` | Only when the task explicitly requires a full data run | Runs ingest → generate-index → validate → build in sequence |
| `node scripts/ingest.mjs` | repo root | Only when the task explicitly requires a data refresh | Equivalent to `npm run ingest` from site/ |

Never run `ingest` or `pipeline` as a side effect of an unrelated task. These commands fetch data from an external source and may overwrite committed files.

---

## 6. Pull request requirements

Every pull request opened against this repository must:

1. Use the `.github/PULL_REQUEST_TEMPLATE.md` template without removing its structure.
2. Have a concise title in conventional commit format: `fix:`, `feat:`, `docs:`, `data:`, `chore:`, `refactor:`.
3. Cover a single, coherent purpose. Do not mix data changes, visual redesigns, dependency upgrades, and documentation rewrites in one PR.
4. Pass `npm run lint`, `npm run type-check`, and `npm run build` locally before submission.
5. Link the relevant issue using `Fixes #N` or `Relates to #N` in the description.
6. Include visual evidence (screenshots) for any change that affects the rendered interface.
7. State the source and licensing of any new data or logo asset.

---

## 7. When uncertain

If a task would require violating any prohibition in Section 3, or if the correct approach is ambiguous, stop and ask the human operator for clarification. Do not make assumptions that expand the scope of a change beyond what was explicitly requested.

If a check (`lint`, `type-check`, `build`) fails and you cannot determine why, report the full error output to the human operator rather than suppressing or working around the check.

---

## 8. Quick reference checklist

Before marking any task as complete, confirm:

- [ ] No LeetCode problem content was added anywhere (code, comments, data, docs).
- [ ] No prohibited feature was introduced (auth, AI, ads, tracking, server runtime).
- [ ] The static export constraint is intact — `npm run build` produces a clean `out/` directory.
- [ ] Generated data files were not hand-edited.
- [ ] `npm run lint` passes with no errors or warnings.
- [ ] `npm run type-check` passes.
- [ ] The CS-Next palette is used correctly; no new colours, gradients, or decorative patterns were added.
- [ ] All interactive elements remain keyboard-accessible with a visible focus state.
- [ ] `prefers-reduced-motion` is respected for any animation introduced.
- [ ] The PR description uses the project template and includes all required sections.
