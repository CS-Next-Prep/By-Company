## Summary

<!-- One or two sentences describing what this pull request does and why. -->

Fixes # <!-- issue number, if applicable -->

---

## Type of change

<!-- Mark the one type that best describes this pull request. -->

- [ ] Bug fix
- [ ] Data correction or data refresh
- [ ] Interface or accessibility improvement
- [ ] Logo addition or correction
- [ ] Documentation
- [ ] Dependency update
- [ ] Other: <!-- describe -->

---

## What changed

<!-- Describe the specific changes made. Be precise about which files, components, or data records were modified. Avoid vague language such as "various improvements." -->

---

## Why it changed

<!-- Describe the problem this pull request solves or the gap it fills. Reference the relevant issue, user report, or data discrepancy. -->

---

## How it was checked

<!-- List the commands you ran and any manual steps you took to verify the change. Do not mark this section as verified if checks were not completed. -->

- [ ] `npm run lint` — passed
- [ ] `npm run build` — passed (static export generated without errors)
- [ ] Affected pages reviewed in the local development server
- [ ] Direct LeetCode links checked and functional (if data was changed)
- [ ] Desktop and narrow-screen layouts reviewed (if interface was changed)
- [ ] Keyboard navigation verified (if interface was changed)

Additional steps taken:

<!-- Describe any other verification performed, or state "None beyond the above." -->

---

## Data or logo source

<!-- Required when this pull request adds or modifies question data or company logos.

     For data: state the source name, URL, date or revision, and any relevant licensing information.
     For logos: state where the asset was obtained and confirm it is an official mark.

     If not applicable, write "Not applicable." -->

---

## Checklist — before requesting review

> Complete this section as the pull request author. Remove items that genuinely do not apply and state why in the description above.

**Scope and content**
- [ ] This pull request has a single, coherent purpose.
- [ ] The change supports the company-to-question lookup flow.
- [ ] No LeetCode problem statement, example, editorial explanation, test case, or solution write-up has been added anywhere in this pull request.
- [ ] No AI-generated content, chat interface, or model-provider call has been added to the product.
- [ ] No account, authentication, paywall, advertising, affiliate, or tracking feature has been added.
- [ ] No runtime external data request or scraper has been introduced.

**Pull request hygiene**
- [ ] The branch name follows the `type/short-description` convention (e.g. `fix/google-logo`, `docs/agents-md`).
- [ ] The pull request title follows conventional commit format (e.g. `fix:`, `feat:`, `docs:`, `data:`).
- [ ] The related issue is linked above with `Fixes #N` or `Relates to #N`.
- [ ] The pull request description contains enough context for a reviewer unfamiliar with the issue.

---

## Checklist — for maintainers

**Review**
- [ ] The stated purpose of the pull request matches the actual diff.
- [ ] The change does not introduce scope beyond what the linked issue describes.
- [ ] No prohibited content, feature, or external dependency has been added (see scope checklist above).

**Verification**
- [ ] CI passes (lint, type-check, validation, build).
- [ ] The affected pages were reviewed in a local or preview environment.
- [ ] For data changes: source, date, and licensing were verified and are acceptable.
- [ ] For logo changes: the asset is an official mark from a verifiable source.
- [ ] For interface changes: keyboard navigation and focus states were confirmed.

**Merge readiness**
- [ ] Generated file changes (if any) are expected and scoped to this pull request.
- [ ] The pull request is rebased or up to date with `main`.
- [ ] The commit history is clean and the commit messages are meaningful.
- [ ] Post-merge actions noted (e.g. close linked issue, update documentation, trigger deploy).
