import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { I18nHandle, I18nOptions, Leaves, Mirror, TranslationFn } from './types.js';
import { fill, resolve, validateShape } from './utils.js';

function readStorage<TLocale extends string>(storageKey: string, available: TLocale[]): TLocale | null {
  try {
    const stored = localStorage.getItem(storageKey) as TLocale | null;
    return stored && available.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStorage(storageKey: string, locale: string): void {
  try {
    localStorage.setItem(storageKey, locale);
  } catch {
    /* quota or SSR — silently ignore */
  }
}

/**
 * Binds locale data to a type-safe React provider + hook pair.
 *
 * The first argument is the **reference locale** — its shape drives
 * `TranslationKey` inference and optional validation.
 * All other locales must mirror that shape.
 *
 * @example
 * ```ts
 * // src/i18n/index.ts
 * import { createI18n } from '@tlouverse/react-i18n'
 *
 * const en = { nav: { home: 'Home', settings: 'Settings' } }
 * const fr = { nav: { home: 'Accueil', settings: 'Paramètres' } }
 *
 * export const { I18nProvider, useTranslation, availableLocales } = createI18n(en, { en, fr })
 *
 * // In a component:
 * const { t, locale, setLocale } = useTranslation()
 * t('nav.home') // → 'Home' or 'Accueil'
 * ```
 */
export function createI18n<TBase extends Record<string, unknown>, TLocale extends string>(
  referenceLocale: TBase,
  locales: Record<TLocale, Mirror<TBase>>,
  options: I18nOptions<TLocale> = {},
) {
  const available = Object.keys(locales) as TLocale[];

  if (available.length === 0) {
    throw new Error('[@tlouverse/react-i18n] Pass at least one locale to createI18n.');
  }

  const { persist = false, storageKey = 'tlv_locale', validate = false } = options;
  const defaultLocale = (options.defaultLocale ?? available[0]) as TLocale;

  if (validate) {
    for (const key of available) {
      validateShape(referenceLocale as Record<string, unknown>, locales[key] as Record<string, unknown>, key);
    }
  }

  type Key = Leaves<TBase>;
  type Handle = I18nHandle<Key, TLocale>;

  const Context = createContext<Handle | null>(null);

  function I18nProvider({ children, defaultLocale: localeProp }: { children: ReactNode; defaultLocale?: TLocale }) {
    const initial = (persist ? readStorage(storageKey, available) : null) ?? localeProp ?? defaultLocale;

    const [locale, _setLocale] = useState<TLocale>(initial);

    const setLocale = useCallback((next: TLocale) => {
      if (!available.includes(next)) {
        console.warn(`[@tlouverse/react-i18n] Unknown locale "${next}". Available: ${available.join(', ')}.`);
        return;
      }
      if (persist) writeStorage(storageKey, next);
      _setLocale(next);
    }, []);

    const t = useCallback<TranslationFn<Key>>(
      (key, vars) => {
        const raw = resolve(locales[locale] as Record<string, unknown>, key as string);
        return vars ? fill(raw, vars) : raw;
      },
      [locale],
    );

    const handle = useMemo<Handle>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return <Context.Provider value={handle}>{children}</Context.Provider>;
  }

  function useTranslation(): Handle {
    const ctx = useContext(Context);
    if (!ctx) throw new Error('[@tlouverse/react-i18n] useTranslation must be called inside <I18nProvider>.');
    return ctx;
  }

  return {
    I18nProvider,
    useTranslation,
    /** Ordered list of available locale keys — useful for building a language selector. */
    availableLocales: available,
  };
}
