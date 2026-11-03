import { resolveLanguage, type LanguagePreference, type ResolvedLanguage } from '@shared/locale'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { NAMESPACES } from './config'
import { resources } from './resources'
import './types'

export async function initI18n(): Promise<{ preference: LanguagePreference; systemLocale: string; resolved: ResolvedLanguage }> {
  let preference: LanguagePreference = 'system'
  let systemLocale = typeof navigator === 'undefined' ? 'en-US' : navigator.language
  if (window.themeStudio) {
    ;[preference, systemLocale] = await Promise.all([
      window.themeStudio.language.getPreference(),
      window.themeStudio.language.getSystemLocale()
    ])
  }
  const resolved = resolveLanguage(preference, systemLocale)
  await i18n.use(initReactI18next).init({
    resources,
    lng: resolved,
    fallbackLng: 'en-US',
    supportedLngs: ['zh-CN', 'en-US'],
    ns: [...NAMESPACES],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    react: { useSuspense: false }
  })
  document.documentElement.lang = resolved
  return { preference, systemLocale, resolved }
}

export async function applyResolvedLanguage(resolved: ResolvedLanguage): Promise<void> {
  if (i18n.language !== resolved) await i18n.changeLanguage(resolved)
  document.documentElement.lang = resolved
}

export function text(key: string, values?: Record<string, unknown>): string {
  return (i18n.t as (nextKey: string, options?: object) => string)(key, values)
}

export { describeError } from './localize'
export { i18n }
