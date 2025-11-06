/**
 * i18n configuration for next-intl
 * FE-19: Internationalization setup
 */

export const locales = ['en', 'id'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
}

export function getLocaleFromNavigator(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const browserLang = navigator.language.split('-')[0]
  return locales.includes(browserLang as Locale) ? (browserLang as Locale) : defaultLocale
}
