# Changelog

All notable changes to ByCompany will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Because ByCompany is a continuously deployed website without formal releases, entries use date-stamped sections rather than version numbers.

## [Unreleased](https://github.com/CS-Next-Prep/By-Company/compare/main...HEAD)

### Added

### Changed

### Fixed

### Removed

## [2026-10-28]

### Added

- Add `AGENTS.md` at the repository root with authoritative guidance for AI coding agents covering repo layout, absolute prohibitions (LeetCode content boundary, prohibited features, static-export constraint), coding standards, data rules, and the full commands reference ([#29](https://github.com/CS-Next-Prep/By-Company/issues/29)) @varma1221.
- Add `.github/PULL_REQUEST_TEMPLATE.md` to standardise pull request descriptions, verification steps, and review checklists across all contributors ([#30](https://github.com/CS-Next-Prep/By-Company/pull/30)) @varma1221.

### Changed

- Update `CONTRIBUTING.md` to direct contributors using AI agents to read `AGENTS.md` before making changes, and to mandate use of the pull request template for all submissions ([#29](https://github.com/CS-Next-Prep/By-Company/issues/29)) @varma1221.

## [2026-10-27]

### Added

- Add a Developers section to the About page listing project contributors ([#28](https://github.com/CS-Next-Prep/By-Company/pull/28)) @varma1221.

### Changed

- Refresh company question data to reflect the latest upstream source.

## [2026-10-17]

### Added

- Extend the header search to cover individual questions in addition to companies, and add a dedicated question detail page ([#22](https://github.com/CS-Next-Prep/By-Company/pull/22)) @varma1221.

### Fixed

- Lazy-load the questions index to resolve a Vercel build out-of-space (`ENOSPC`) failure during static export ([#22](https://github.com/CS-Next-Prep/By-Company/pull/22)) @varma1221.

## [2026-10-06]

### Changed

- Redesign the About page hierarchy and section rhythm for improved ink-on-paper readability; refine typography and layout spacing ([#20](https://github.com/CS-Next-Prep/By-Company/pull/20)) @copilot-swe-agent.

## [2026-09-21]

### Changed

- Expand the About page with a LeetCode content disclaimer, a data sources section, an accuracy note, and contact information @varma1221.

## [2026-08-31]

### Added

- Add a weighted global Surprise Me feature that selects a random question across all companies, weighted by question frequency ([#19](https://github.com/CS-Next-Prep/By-Company/pull/19)) @varma1221.

## [2026-08-30]

### Fixed

- Align the mobile header search box to correct a layout shift on narrow screens ([#17](https://github.com/CS-Next-Prep/By-Company/pull/17)) @varma1221.

## [2026-08-26]

### Added

- Add a GitHub Actions CI/CD pipeline and strict JSON data validation, including validation tests and pipeline integration ([#9](https://github.com/CS-Next-Prep/By-Company/pull/9)) @Vardhan-IMMIDI.

### Fixed

- Fix mobile question interactions, including touch activation for question rows and Surprise Me, problem-panel visibility, mobile table headers, and access to the Frequency column ([#11](https://github.com/CS-Next-Prep/By-Company/pull/11)) @varma1221.

## [2026-08-22]

### Added

- Add a Featured Companies heading to the home page and improve the related accessibility structure ([#5](https://github.com/CS-Next-Prep/By-Company/pull/5)) @Vardhan-IMMIDI.

### Fixed

- Correct the About-page GitHub Issues link to point to the repository’s actual hyphenated path ([#6](https://github.com/CS-Next-Prep/By-Company/pull/6)) @varma1221.
