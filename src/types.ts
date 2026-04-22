/** Recursively widens every string leaf to `string` so alternate locales
 *  can satisfy the base shape without needing identical literal types. */
export type Mirror<T> = {
  [K in keyof T]: T[K] extends string ? string : Mirror<T[K]>;
};

/** Union of every dot-path that resolves to a string leaf.
 *  e.g. `"nav.home"` | `"nav.settings"` */
export type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? P extends ''
      ? K
      : `${P}.${K}`
    : Leaves<T[K], P extends '' ? K : `${P}.${K}`>;
}[keyof T & string];

/** The `t()` function signature, parameterized by the key union. */
export type TranslationFn<TKey extends string> = (key: TKey, vars?: Record<string, string | number>) => string;

/** Everything returned by `useTranslation()`. */
export type I18nHandle<TKey extends string, TLocale extends string> = {
  locale: TLocale;
  setLocale: (locale: TLocale) => void;
  t: TranslationFn<TKey>;
};

/** Options accepted by `createI18n`. */
export type I18nOptions<TLocale extends string> = {
  /** Locale to use when none is stored or provided. Defaults to the first key. */
  defaultLocale?: TLocale;
  /** Persist the selected locale in localStorage across page loads. */
  persist?: boolean;
  /** localStorage key to use when `persist` is true. Default: `"tlv_locale"`. */
  storageKey?: string;
  /**
   * Validate that all locales mirror the reference locale's shape at init time.
   * Logs a warning for every missing key. Default: `false`.
   */
  validate?: boolean;
};
