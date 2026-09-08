export const locales = ['tr', 'en', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';
export const localeCookie = 'app_locale';
export const localeTags: Record<Locale, string> = {tr: 'tr-TR', en: 'en-US', fr: 'fr-FR'};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.includes(value as Locale);
}

export function negotiateLocale(saved: unknown, acceptLanguage: string | null): Locale {
  if (isLocale(saved)) return saved;
  const preferences = (acceptLanguage || '').split(',').map((entry, index) => {
    const [tag, ...params] = entry.trim().split(';');
    const quality = params.find((param) => param.trim().startsWith('q='));
    return {locale: tag.toLowerCase().split('-')[0], quality: quality ? Number(quality.trim().slice(2)) : 1, index};
  }).filter(({quality}) => Number.isFinite(quality) && quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return preferences.find(({locale}) => isLocale(locale))?.locale as Locale || defaultLocale;
}
