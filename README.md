# @tlouverse/react-i18n

**[English](#english) · [Français](#français)**

---

## English

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
t('greeting', { name: 'Thomas' })       // → "Hello, Thomas!"
t('results', { count: 3, s: 's' })      // → "3 results found"
t('results', { count: 1, s: '' })       // → "1 result found"
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

This also warns on extra keys in non-reference locales (stale translations). Enable it during development or in CI; leave it off in production.

## Lazy locale loading

Bundle only the default locale upfront and load others on demand via `loadLocale`. The fetched locale is cached — it is only loaded once per session.

```ts
// src/i18n/index.ts
export const { I18nProvider, useTranslation } = createI18n(en, { en }, {
  loadLocale: async (locale) => {
    const mod = await import(`./locales/${locale}.json`)
    return mod.default
  },
})
```

Use `isLoading` from `useTranslation()` to reflect the loading state in your UI:

```tsx
function LanguageSelector() {
  const { locale, setLocale, isLoading } = useTranslation()

  return (
    <select
      value={locale}
      disabled={isLoading}
      onChange={e => setLocale(e.target.value as typeof locale)}
    >
      {availableLocales.map(code => (
        <option key={code} value={code}>{code.toUpperCase()}</option>
      ))}
    </select>
  )
}
```

While a locale is loading, `t()` continues to return translations from the previous locale.

## API

### `createI18n(referenceLocale, locales, options?)`

| Parameter         | Type                            | Description                                     |
|-------------------|---------------------------------|-------------------------------------------------|
| `referenceLocale` | `TBase`                         | Reference locale object — drives type inference |
| `locales`         | `Record<string, Mirror<TBase>>` | All locale objects keyed by locale code         |
| `options`         | `I18nOptions`                   | See below                                       |

Returns `{ I18nProvider, useTranslation, availableLocales }`.

### `I18nOptions`

| Option          | Type                                       | Default        | Description                                          |
|-----------------|--------------------------------------------|----------------|------------------------------------------------------|
| `defaultLocale` | `string`                                   | first key      | Locale to use when none is stored or provided        |
| `persist`       | `boolean`                                  | `false`        | Persist selected locale in `localStorage`            |
| `storageKey`    | `string`                                   | `"tlv_locale"` | `localStorage` key used when `persist` is `true`     |
| `validate`      | `boolean`                                  | `false`        | Warn on missing or extra keys at startup             |
| `loadLocale`    | `(locale: string) => Promise<translations>` | —              | Fetch a locale on demand; result is cached           |

### `useTranslation()`

Returns `{ t, locale, setLocale, isLoading }`.

| Property    | Type                       | Description                                                  |
|-------------|----------------------------|--------------------------------------------------------------|
| `t`         | `(key, vars?) => string`   | Translate a key, with optional vars                          |
| `locale`    | `string`                   | Currently active locale code                                 |
| `setLocale` | `(locale: string) => void` | Switch to another locale                                     |
| `isLoading` | `boolean`                  | `true` while a lazy locale is being fetched; otherwise `false` |

---

## Français

i18n léger et typé pour React. Pas de génération de code, pas de pollution des types globaux — juste une factory qui lie vos fichiers de traduction à un hook `t()` entièrement typé.

## Installation

```bash
npm install @tlouverse/react-i18n
```

React 18 ou supérieur est requis comme dépendance pair.

## Mise en place

### 1. Écrire vos fichiers de traduction

Les fichiers de traduction sont de simples objets TypeScript. Le premier passé à `createI18n` devient la référence — sa structure pilote l'autocomplétion de `t()` et valide les autres locales.

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

### 2. Créer l'instance i18n

Appelez `createI18n` une seule fois. Exportez le résultat — chaque composant de l'app importe depuis ce fichier.

```ts
// src/i18n/index.ts
import { createI18n } from '@tlouverse/react-i18n'
import { fr } from './locales/fr'
import { en } from './locales/en'

export const { I18nProvider, useTranslation, availableLocales } = createI18n(fr, { fr, en })
```

### 3. Encapsuler l'application

```tsx
// src/main.tsx
import { I18nProvider } from '@/i18n'

createRoot(document.getElementById('root')!).render(
  <I18nProvider defaultLocale="fr">
    <App />
  </I18nProvider>
)
```

### 4. Utiliser dans les composants

```tsx
import { useTranslation } from '@/i18n'

function Header() {
  const { t } = useTranslation()

  return <h1>{t('nav.home')}</h1>
}
```

`t()` est entièrement autocomplété — il n'accepte que les chemins en notation pointée valides depuis la locale de référence.

## Interpolation

Passez un objet `vars` pour remplacer les espaces réservés `{{clé}}` :

```ts
// Fichier de traduction
const fr = {
  greeting: 'Bonjour, {{name}} !',
  results: '{{count}} résultat{{s}} trouvé{{s}}',
}

// Composant
t('greeting', { name: 'Thomas' })      // → "Bonjour, Thomas !"
t('results', { count: 3, s: 's' })     // → "3 résultats trouvés"
t('results', { count: 1, s: '' })      // → "1 résultat trouvé"
```

## Changer de langue

`useTranslation` retourne aussi `locale` et `setLocale` :

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

## Persistance de la langue

Passez `persist: true` pour stocker la locale choisie dans `localStorage` et la restaurer au rechargement :

```ts
export const { I18nProvider, useTranslation } = createI18n(fr, { fr, en }, {
  persist: true,
  storageKey: 'my_app_locale', // défaut : "tlv_locale"
})
```

## Valider la complétude des traductions

Par défaut, les clés manquantes échouent silencieusement — `t()` retourne le chemin de la clé tel quel. Pour obtenir des avertissements console au démarrage, activez la validation :

```ts
export const { I18nProvider, useTranslation } = createI18n(fr, { fr, en }, {
  validate: true,
})
```

Cela avertit également en cas de clés supplémentaires dans les locales non-référence (traductions obsolètes). Activez-la en développement ou en CI ; laissez-la désactivée en production.

## Chargement différé des locales

Bundlez uniquement la locale par défaut et chargez les autres à la demande via `loadLocale`. La locale récupérée est mise en cache — elle n'est chargée qu'une seule fois par session.

```ts
// src/i18n/index.ts
export const { I18nProvider, useTranslation } = createI18n(fr, { fr }, {
  loadLocale: async (locale) => {
    const mod = await import(`./locales/${locale}.json`)
    return mod.default
  },
})
```

Utilisez `isLoading` depuis `useTranslation()` pour refléter l'état de chargement dans l'interface :

```tsx
function LanguageSelector() {
  const { locale, setLocale, isLoading } = useTranslation()

  return (
    <select
      value={locale}
      disabled={isLoading}
      onChange={e => setLocale(e.target.value as typeof locale)}
    >
      {availableLocales.map(code => (
        <option key={code} value={code}>{code.toUpperCase()}</option>
      ))}
    </select>
  )
}
```

Pendant le chargement, `t()` continue de retourner les traductions de la locale précédente.

## API

### `createI18n(referenceLocale, locales, options?)`

| Paramètre         | Type                            | Description                                           |
|-------------------|---------------------------------|-------------------------------------------------------|
| `referenceLocale` | `TBase`                         | Locale de référence — pilote l'inférence de types     |
| `locales`         | `Record<string, Mirror<TBase>>` | Toutes les locales indexées par leur code             |
| `options`         | `I18nOptions`                   | Voir ci-dessous                                       |

Retourne `{ I18nProvider, useTranslation, availableLocales }`.

### `I18nOptions`

| Option          | Type                                        | Défaut         | Description                                              |
|-----------------|---------------------------------------------|----------------|----------------------------------------------------------|
| `defaultLocale` | `string`                                    | première clé   | Locale utilisée si aucune n'est stockée ou fournie       |
| `persist`       | `boolean`                                   | `false`        | Persiste la locale dans `localStorage`                   |
| `storageKey`    | `string`                                    | `"tlv_locale"` | Clé `localStorage` utilisée quand `persist` est `true`   |
| `validate`      | `boolean`                                   | `false`        | Avertit en cas de clés manquantes ou obsolètes           |
| `loadLocale`    | `(locale: string) => Promise<translations>` | —              | Charge une locale à la demande ; résultat mis en cache   |

### `useTranslation()`

Retourne `{ t, locale, setLocale, isLoading }`.

| Propriété   | Type                       | Description                                                        |
|-------------|----------------------------|--------------------------------------------------------------------|
| `t`         | `(key, vars?) => string`   | Traduit une clé, avec variables optionnelles                       |
| `locale`    | `string`                   | Code de la locale active                                           |
| `setLocale` | `(locale: string) => void` | Passer à une autre locale                                          |
| `isLoading` | `boolean`                  | `true` pendant le chargement d'une locale différée, sinon `false`  |
