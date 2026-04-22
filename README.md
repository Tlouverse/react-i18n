# @tlouverse/react-i18n

Lightweight, type-safe i18n for React. No codegen, no global type pollution — just a factory that binds your locale files to a fully-typed `t()` hook.

## Installation

```bash
npm install @tlouverse/react-i18n
```

React 18 or later is required as a peer dependency.

## Setup

### 1. Write your locale files

Locale files are plain TypeScript objects. The first one you pass to `createI18n` becomes the reference — its shape drives `t()` autocomplete and validates other locales against it.

```ts
// src/i18n/locales/en.ts
export const en = {
  nav: {
    home: 'Home',
    settings: 'Settings',
  },
  actions: {
    save: 'Save',
    cancel: 'Cancel',
  },
}
```

```ts
// src/i18n/locales/fr.ts
export const fr = {
  nav: {
    home: 'Accueil',
    settings: 'Paramètres',
  },
  actions: {
    save: 'Enregistrer',
    cancel: 'Annuler',
  },
}
```

### 2. Create your i18n instance

Call `createI18n` once. Export the result — every component in your app imports from this file.

```ts
// src/i18n/index.ts
import { createI18n } from '@tlouverse/react-i18n'
import { en } from './locales/en'
import { fr } from './locales/fr'

export const { I18nProvider, useTranslation, availableLocales } = createI18n(en, { en, fr })
```

### 3. Wrap your app

```tsx
// src/main.tsx
import { I18nProvider } from '@/i18n'

createRoot(document.getElementById('root')!).render(
  <I18nProvider defaultLocale="fr">
    <App />
  </I18nProvider>
)
```

### 4. Use in components

```tsx
import { useTranslation } from '@/i18n'

function Header() {
  const { t } = useTranslation()

  return <h1>{t('nav.home')}</h1>
}
```

`t()` is fully autocompleted — it only accepts valid dot-paths from your reference locale.

## Interpolation

Pass a `vars` object to replace `{{key}}` placeholders:

```ts
// Locale file
const en = {
  greeting: 'Hello, {{name}}!',
  results: '{{count}} result{{s}} found',
}

// Component
t('greeting', { name: 'Thomas' })         // → "Hello, Thomas!"
t('results', { count: 3, s: 's' })        // → "3 results found"
t('results', { count: 1, s: '' })         // → "1 result found"
```

## Switching locales

`useTranslation` also returns `locale` and `setLocale`:

```tsx
import { useTranslation, availableLocales } from '@/i18n'

function LanguageSelector() {
  const { locale, setLocale } = useTranslation()

  return (
    <select value={locale} onChange={e => setLocale(e.target.value as typeof locale)}>
      {availableLocales.map(code => (
        <option key={code} value={code}>{code.toUpperCase()}</option>
      ))}
    </select>
  )
}
```

## Persisting the locale

Pass `persist: true` to store the selected locale in `localStorage` and restore it on page load:

```ts
export const { I18nProvider, useTranslation } = createI18n(en, { en, fr }, {
  persist: true,
  storageKey: 'my_app_locale', // default: "tlv_locale"
})
```

## Validating locale completeness

By default, missing keys in non-reference locales fail silently — `t()` returns the key path as a string. To get console warnings for missing keys at startup, enable validation:

```ts
export const { I18nProvider, useTranslation } = createI18n(en, { en, fr }, {
  validate: true,
})
```

This is opt-in. Enable it during development or in CI; leave it off in production.

## API

### `createI18n(referenceLocale, locales, options?)`

| Parameter        | Type                              | Description                                    |
|------------------|-----------------------------------|------------------------------------------------|
| `referenceLocale`| `TBase`                           | Reference locale object — drives type inference |
| `locales`        | `Record<string, Mirror<TBase>>`   | All locale objects keyed by locale code         |
| `options`        | `I18nOptions`                     | See below                                       |

Returns `{ I18nProvider, useTranslation, availableLocales }`.

### `I18nOptions`

| Option          | Type      | Default        | Description                                      |
|-----------------|-----------|----------------|--------------------------------------------------|
| `defaultLocale` | `string`  | first key      | Locale to use when none is stored or provided    |
| `persist`       | `boolean` | `false`        | Persist selected locale in `localStorage`        |
| `storageKey`    | `string`  | `"tlv_locale"` | `localStorage` key used when `persist` is `true` |
| `validate`      | `boolean` | `false`        | Warn on missing keys at startup                  |

### `useTranslation()`

Returns `{ t, locale, setLocale }`.

| Property    | Type                        | Description                         |
|-------------|-----------------------------|-------------------------------------|
| `t`         | `(key, vars?) => string`    | Translate a key, with optional vars |
| `locale`    | `string`                    | Currently active locale code        |
| `setLocale` | `(locale: string) => void`  | Switch to another locale            |
