import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { I18nHandle, I18nOptions, Leaves, Mirror, TranslationFn } from './types.js';
import { PKG } from './constants.js';
import { fill, readStorage, resolve, validateShape, writeStorage } from './utils.js';

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
 *
 * @example Lazy locale loading
 * ```ts
 * export const { I18nProvider, useTranslation } = createI18n(en, { en }, {
 *   loadLocale: async (locale) => {
 *     const mod = await import(`./locales/${locale}.json`)
 *     return mod.default
 *   }
 * })
 *
 * // In a component:
 * const { t, setLocale, isLoading } = useTranslation()
 * <button onClick={() => setLocale('fr')} disabled={isLoading}>Switch language</button>
 * ```
 */
export function createI18n<TBase extends Record<string, unknown>, TLocale extends string>(
  referenceLocale: TBase,
  locales: Record<TLocale, Mirror<TBase>>,
  options: I18nOptions<TLocale> = {},
) {
  type Key = Leaves<TBase>;
  type Handle = I18nHandle<Key, TLocale>;

  const available = Object.keys(locales) as TLocale[];

  if (available.length === 0) {
    throw new Error(`${PKG} Pass at least one locale to createI18n.`);
  }

  const { persist = false, storageKey = 'tlv_locale', validate = false, loadLocale } = options;
  const defaultLocale = options.defaultLocale ?? available[0];

  if (validate) {
    for (const key of available) {
      validateShape(referenceLocale as Record<string, unknown>, locales[key] as Record<string, unknown>, key);
    }
  }

  const cache = new Map<TLocale, Mirror<TBase>>(
    Object.entries(locales).map(([k, v]) => [k as TLocale, v as Mirror<TBase>]),
  );

  const Context = createContext<Handle | null>(null);

  function I18nProvider({ children, defaultLocale: localeProp }: { children: ReactNode; defaultLocale?: TLocale }) {
    const initial = (persist ? readStorage(storageKey, available) : null) ?? localeProp ?? defaultLocale;

    const [locale, setLocale] = useState<TLocale>(initial);
    const [isLoading, setIsLoading] = useState(false);

    const applyLocale = useCallback((next: TLocale) => {
      if (!available.includes(next)) {
        console.warn(`${PKG} Unknown locale "${next}". Available: ${available.join(', ')}.`);
        return;
      }

      if (cache.has(next)) {
        if (persist) writeStorage(storageKey, next);
        setLocale(next);
        return;
      }

      if (!loadLocale) {
        console.warn(`${PKG} Locale "${next}" is not in the eager map and no loadLocale was provided.`);
        return;
      }

      setIsLoading(true);
      loadLocale(next)
        .then((translations) => {
          cache.set(next, translations as Mirror<TBase>);
          if (persist) writeStorage(storageKey, next);
          setLocale(next);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn(`${PKG} Failed to load locale "${next}".`, err);
          setIsLoading(false);
        });
    }, []);

    const t = useCallback<TranslationFn<Key>>(
      (key, vars) => {
        const raw = resolve(cache.get(locale) as Record<string, unknown>, key as string);
        return vars ? fill(raw, vars) : raw;
      },
      [locale],
    );

    const handle = useMemo<Handle>(
      () => ({ locale, setLocale: applyLocale, t, isLoading }),
      [locale, applyLocale, t, isLoading],
    );

    return <Context.Provider value={handle}>{children}</Context.Provider>;
  }

  function useTranslation(): Handle {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(`${PKG} useTranslation must be called inside <I18nProvider>.`);
    return ctx;
  }

  return {
    I18nProvider,
    useTranslation,
    /** Ordered list of available locale keys — useful for building a language selector. */
    availableLocales: available,
  };
}
