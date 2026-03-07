export type LocalizedField = Record<string, string>;

const DEFAULT_LOCALE = 'en';

export function localize(field: unknown, locale: string): string | null {
  if (!field || typeof field !== 'object') return null;
  const map = field as LocalizedField;
  return map[locale] ?? map[DEFAULT_LOCALE] ?? null;
}
