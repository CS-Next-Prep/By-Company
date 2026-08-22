# Contributing to ByCompany

Thank you for helping improve ByCompany.

ByCompany is a CS-Next project for focused technical interview preparation. Its purpose is deliberately narrow: someone should be able to choose a company, find the relevant interview-question list, and get on with preparing. Contributions are welcome when they make that experience more accurate, clearer, faster, or more accessible.

This guide explains what belongs in the project, how to make a contribution, and the checks expected before opening a pull request.

## Before you begin

Please read the [README](README.md) and look through existing [issues](https://github.com/CS-Next-Prep/ByCompany/issues) before starting work. There may already be an active report, a discussion, or a pull request covering the same change.

For a substantial change—such as a new browsing flow, a dataset change, or a visual redesign—open an issue first. A short description of the problem, the proposed approach, and any relevant examples is enough. This keeps effort focused and avoids two people solving the same problem in different ways.

Small, well-contained fixes do not need prior discussion. Examples include a broken external link, an incorrect company name, a spelling correction, or an obvious accessibility improvement.

## What makes a good contribution

The most useful contributions improve one of the following areas:

- Incorrect, missing, duplicated, or stale company-question records
- Incorrect LeetCode links, difficulty labels, topic tags, or frequency values
- Missing, distorted, or low-quality company logos
- Broken company pages, navigation, search, comparison, or static-export routes
- Accessibility problems, including keyboard navigation and semantic markup
- Mobile and small-screen layout problems
- Documentation that helps a contributor or maintainer work safely
- Focused performance improvements that preserve the simple lookup experience

When in doubt, ask a practical question: **does this help someone choose a company and review its questions with less friction?** If the answer is no, it may not belong in ByCompany.

## Project boundaries

ByCompany is intentionally a static, free reference. Please preserve these boundaries in every contribution.

### Keep the product focused

Do not add features that turn the site into a general-purpose interview platform. In particular, contributions must not add:

- Accounts, authentication, profiles, email capture, subscriptions, or paywalls
- Advertising, affiliate placements, sponsored content, or tracking pixels
- Personalised recommendations or onboarding flows
- Infinite scrolling where an ordinary list or page is clearer
- A runtime database, a server-side scraping service, or a live search endpoint

### No AI features in the product

ByCompany does not include AI-generated explanations, hints, chat interfaces, model-provider calls, or “ask AI” features. Please do not propose or submit them.

### Respect the content boundary

Do **not** copy, store, or render LeetCode problem statements, examples, editorial explanations, test cases, or solution write-ups.

Question records may contain only the information needed to identify and reach the original problem:

- Problem title
- Difficulty
- Topic tags, when available
- Frequency or times-asked information, when available
- The relevant company
- A link to the canonical LeetCode problem page

The original problem page is the destination for the complete statement. This boundary applies to application code, generated data, documentation, screenshots, fixtures, and pull-request descriptions.

### Keep data static

The published site uses data prepared before deployment. Do not add browser-side requests to third-party data sources, and do not scrape LeetCode at runtime or during ingestion. If a source needs refreshing, use the repository’s ingestion workflow and commit the resulting static assets that the site needs.

## Ways to contribute

### Report a bug

Open an issue when something does not work as expected. A useful report includes:

1. A short, specific title
2. The page URL or company name involved
3. What you expected to happen
4. What actually happened
5. Clear steps to reproduce the issue
6. Your browser and device, when the problem is visual or interaction-related
7. A screenshot or screen recording if it clarifies the problem

Please remove private information from screenshots before posting them.

### Correct question data

Data accuracy is more valuable than volume. Before reporting or proposing a correction, check that the company name, question title, LeetCode URL, and other details refer to the same problem.

For a data issue, include:

- The company and page URL
- The current value shown by ByCompany
- The corrected value
- A public, verifiable source for the correction
- A brief explanation if the title or URL has changed rather than simply being wrong

Do not paste a problem statement as evidence. Link to the original problem page or another public source instead.

If you are proposing a larger data refresh, describe the source, its licensing or stated terms, its date or revision, and the expected effect on the dataset. A refresh should be reproducible and should not silently replace unrelated records.

### Fix or add a company logo

Company logos are trademarks and must be handled carefully. A logo contribution should use a legitimate, high-quality official asset or an established logo source. Do not draw a replacement logo, recolour a mark, add effects, stretch it, or submit a generic icon in its place.

Before opening a logo pull request, check the logo at the sizes used on the company index and company page. It should be legible, proportionate, and contained within the existing logo bounds. If a suitable asset cannot be found, retain the project’s typographic monogram fallback rather than shipping a poor substitute.

Include the source of the logo asset in the pull request description. This helps reviewers verify that it is an appropriate asset and lets future maintainers refresh it responsibly.

### Improve the interface or accessibility

Design contributions should make the reference easier to scan and use. Good examples include clearer table headings, better focus states, improved keyboard behaviour, more useful empty states, or a layout correction that makes company information easier to read.

ByCompany has a deliberate visual character. It is an ink-on-paper reference tool, not a startup landing page. Keep these standards in mind:

- Use the existing CS-Next palette: Gold `#BE830E`, Brass `#BF872B`, Ink `#1A1410`, and warm Paper `#FCFAF6`.
- Use gold as a precise accent for meaning, links, active states, and small details—not as a dominant page background.
- Prefer dense, readable tables and lists over decorative cards.
- Preserve real semantic HTML. Question lists should remain tables where a table is the right structure.
- Preserve a visible keyboard focus state and a logical tab order.
- Ensure the core browse flow remains usable without JavaScript where possible.
- Respect `prefers-reduced-motion` for any motion you introduce.

Do not introduce gradients, glass effects, floating shapes, ubiquitous soft-shadow cards, emoji interface icons, decorative loading shimmers, or a bolted-on dark-mode toggle. If a visual element does not clarify data or a state change, it probably does not need to be there.

### Improve documentation

Documentation contributions are welcome when they make the project easier to understand, maintain, or contribute to. Keep prose direct and specific. Avoid marketing language, implementation speculation, and instructions that no longer match the repository.

## Local setup

The application lives in the `site` directory. You will need a supported Node.js installation and npm.

1. Fork the repository on GitHub.
2. Clone your fork and enter the project directory.
3. Install the site dependencies.

```bash
git clone https://github.com/YOUR-USERNAME/ByCompany.git
cd ByCompany/site
npm ci
```

Start the local development server:

```bash
npm run dev
```

Then open the local address printed in your terminal. Use the site as a contributor would: browse the company index, open several company pages, try search, and test any affected paths directly.

### Useful commands

Run these commands from the `site` directory unless a command says otherwise.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development | 
| `npm run lint` | Run the project lint checks |
| `npm run build` | Create and validate the production static export |
| `npm run ingest` | Refresh source data through the ingestion script |
| `npm run generate-index` | Regenerate the smaller search/index assets |
| `npm run pipeline` | Run ingestion, regenerate indexes, and build |

The ingestion command retrieves public source data and may update generated data files and cached logos. Review all resulting changes before committing them. Do not run it merely to make a cosmetic change unrelated to data.

## Working with data

Data changes deserve the same care as code changes because they are visible to every visitor.

### Before changing data

- Verify that a problem title matches its canonical LeetCode URL.
- Check whether the record already exists under a different spelling or company name.
- Preserve the project’s established company slug when one already exists.
- Use the project’s normalised difficulty values: `Easy`, `Medium`, `Hard`, or `Unknown`.
- Keep frequency values within their expected range when a source provides them.
- Prefer a missing field over a guessed field.

### Data refresh expectations

When refreshing data, explain the source and scope of the refresh in the pull request. Review the generated diff for unexpected removals, duplicate questions, broken links, company-name regressions, and logo changes.

Do not add a new data source without first discussing it in an issue. A source must be public, reasonably maintained, compatible with the project’s content boundary, and suitable for attribution on the site’s Sources page.

### Generated files

Some data and logo assets are generated by the repository workflow but are committed so the static site can be built and deployed consistently. Treat generated changes as reviewable output, not as opaque files to accept blindly.

If a generated file changes, confirm that the change is expected and related to your work. Do not hand-edit generated output unless the change is a small, intentional correction that cannot be made safely at the source or in the pipeline; explain that exception in the pull request.

## Development standards

### Keep changes small and purposeful

One pull request should solve one coherent problem. Avoid mixing a visual redesign, unrelated cleanup, data refresh, dependency upgrade, and documentation rewrite in the same change. Small changes are easier to test, review, and safely revert.

### Preserve static delivery

The application is designed to be deployed as static content. New work must not require a persistent server, a live database, or runtime calls to external data providers. If a feature cannot work within those constraints, discuss it before writing code.

### Accessibility is part of done

For an interface change, verify at least the following:

- Every interactive control can be reached and used with a keyboard.
- Focus remains visible.
- Links and buttons have meaningful labels.
- Images have useful alternative text, while decorative images are hidden from assistive technology.
- Headings follow a sensible hierarchy.
- Colour is not the sole way to convey information.
- The page remains readable at normal browser zoom and on smaller screens.

### Be careful with motion

The crest introduction and any future motion should be subtle, skippable, and purposeful. Avoid animation that delays access to the page. Only animate opacity and transforms for visual transitions, and always provide an appropriate reduced-motion experience.

## Pull request process

### 1. Create a branch

Create a descriptive branch in your fork. Examples:

```text
fix/google-logo-aspect-ratio
fix/airbnb-question-url
docs/contribution-guidance
```

### 2. Make and review your changes

Keep formatting consistent with the surrounding files. Remove unused imports, dead code, debug logging, and accidental generated artifacts before committing.

For visual changes, review both the desktop and narrow-screen layouts. For data changes, inspect a few affected company pages and make sure direct LeetCode links still work.

### 3. Run the required checks

Before opening a pull request, run:

```bash
cd site
npm run lint
npm run build
```

The production build is important: it confirms that the static export can generate the company pages successfully. If you changed data, also run the relevant ingestion or index-generation command and inspect the diff.

If a check cannot be run, say why in the pull request. Do not describe an unchecked change as verified.

### 4. Write a clear pull request

Use a concise title that describes the outcome. These formats work well:

```text
fix: correct CompanyName question link
feat: add keyboard support to company comparison
docs: clarify data correction process
data: refresh company question records
```

In the description, include:

1. **What changed** — a short explanation in plain language.
2. **Why it changed** — the bug, request, or data correction behind it.
3. **How it was checked** — commands run and any manual checks.
4. **Visual evidence** — screenshots for visible interface changes.
5. **Data or logo source** — required when applicable.

Link the related issue with `Fixes #123` when the pull request resolves it.

### Pull request checklist

Before requesting review, confirm the following:

- [ ] The change has a clear, focused purpose.
- [ ] The change supports the company-to-question lookup flow.
- [ ] No LeetCode problem statement or solution content has been added.
- [ ] No AI feature, account feature, paywall, ad, or tracking feature has been added.
- [ ] No runtime external data request or scraper has been introduced.
- [ ] Company logos are official or use the existing monogram fallback.
- [ ] The visual design follows the CS-Next palette and avoids decorative template patterns.
- [ ] Keyboard navigation and semantic HTML remain intact.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Generated data or logo changes were reviewed, if applicable.
- [ ] The pull request description includes enough context for a reviewer.

## Reviews and follow-up

Maintainers may ask for a smaller scope, additional verification, a source for a data correction, or a design revision. That is normal, especially for changes that affect the dataset, logos, or the company-question browsing flow.

Please keep review discussions constructive and focused on the work. If a contribution is not a fit for the project’s scope, it may be declined even when the implementation is sound. This keeps ByCompany useful, fast, and maintainable for its intended audience.

## Licensing and trademarks

By contributing, you agree that your contribution may be distributed under the repository’s [Apache License 2.0](LICENSE).

Company names and logos belong to their respective trademark owners. Do not imply endorsement by a company, alter a company’s mark, or add branding assets without a legitimate source and a clear reason for their use.

## Thank you

Thoughtful reports, accurate corrections, and focused pull requests make ByCompany more useful for everyone preparing for technical interviews. Thank you for contributing to a CS-Next project built for the pursuit of excellence.
