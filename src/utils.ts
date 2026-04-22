/** Walks a nested object by dot-path. Returns the path itself as fallback. */
export function resolve(obj: Record<string, unknown>, path: string): string {
  let current: unknown = obj;

  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : path;
}

/** Replaces `{{key}}` placeholders with values from `vars`. */
export function fill(template: string, vars: Record<string, string | number>): string {
  let result = template;

  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, String(value));
  }

  return result;
}

/** Dev-only: warns when a locale is missing keys present in the reference locale. */
export function validateShape(
  reference: Record<string, unknown>,
  locale: Record<string, unknown>,
  localeName: string,
  path = '',
): void {
  for (const key of Object.keys(reference)) {
    const fullPath = path ? `${path}.${key}` : key;

    if (!(key in locale)) {
      console.warn(`[@tlouverse/react-i18n] Missing key "${fullPath}" in locale "${localeName}".`);
      continue;
    }

    const refVal = reference[key];
    if (typeof refVal === 'object' && refVal !== null) {
      validateShape(
        refVal as Record<string, unknown>,
        (locale[key] ?? {}) as Record<string, unknown>,
        localeName,
        fullPath,
      );
    }
  }
}
