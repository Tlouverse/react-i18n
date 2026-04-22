import { PKG } from './constants.js'

/** Walks a nested object by dot-path. Returns the path itself as fallback. */
export function resolve(obj: Record<string, unknown>, path: string): string {
  let current: unknown = obj

  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === 'string' ? current : path
}

/** Replaces `{{key}}` placeholders with values from `vars`. */
export function fill(template: string, vars: Record<string, string | number>): string {
  let result = template

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, String(value))
  }

  return result
}

/** Reads a stored locale from localStorage. Returns null if absent or invalid. */
export function readStorage<TLocale extends string>(storageKey: string, available: TLocale[]): TLocale | null {
  try {
    const stored = localStorage.getItem(storageKey) as TLocale | null
    return stored && available.includes(stored) ? stored : null
  } catch (err) {
    console.warn(`${PKG} Could not read locale from localStorage ("${storageKey}").`, err)
    return null
  }
}

/** Writes the current locale to localStorage. */
export function writeStorage(storageKey: string, locale: string): void {
  try {
    localStorage.setItem(storageKey, locale)
  } catch (err) {
    console.warn(`${PKG} Could not persist locale to localStorage ("${storageKey}").`, err)
  }
}

/** Dev-only: warns when a locale is missing keys present in the reference locale. */
export function validateShape(
  reference: Record<string, unknown>,
  locale: Record<string, unknown>,
  localeName: string,
  path = '',
): void {
  for (const key of Object.keys(reference)) {
    const fullPath = path ? `${path}.${key}` : key

    if (!(key in locale)) {
      console.warn(`${PKG} Missing key "${fullPath}" in locale "${localeName}".`)
      continue
    }

    const refVal = reference[key]
    if (typeof refVal === 'object' && refVal !== null) {
      validateShape(
        refVal as Record<string, unknown>,
        (locale[key] ?? {}) as Record<string, unknown>,
        localeName,
        fullPath,
      )
    }
  }
}
