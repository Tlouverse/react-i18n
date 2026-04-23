# Changelog

All notable changes to `@tlouverse/react-i18n` will be documented here.

## [Unreleased]

### Added

- `CHANGELOG.md` to track changes for npm consumers
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) — runs `typecheck` on every push to `main` and on PRs

### Fixed

- SSR hydration mismatch: `localStorage` is no longer accessed during server-side rendering (`typeof window === 'undefined'` guard added to `readStorage` and `writeStorage`)

## [0.1.0] — 2025-04-23

Initial release.

### Added

- `createI18n` factory — binds locale data to a type-safe `I18nProvider` + `useTranslation` pair
- `t(key, vars?)` — dot-path translation lookup with `{{placeholder}}` interpolation
- `persist` option — stores the active locale in `localStorage`
- `validate` option — dev-time warning when a locale is missing keys from the reference locale
- `availableLocales` — ordered list of locale keys for building a language selector
- MIT license
