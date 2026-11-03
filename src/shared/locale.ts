export const LANGUAGE_PREFERENCES = ['system', 'zh-CN', 'en-US'] as const

export type LanguagePreference = (typeof LANGUAGE_PREFERENCES)[number]

export type ResolvedLanguage = 'zh-CN' | 'en-US'

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'system' || value === 'zh-CN' || value === 'en-US'
}

export function normalizeLanguagePreference(value: unknown): LanguagePreference {
  return isLanguagePreference(value) ? value : 'system'
}

/**
 * Maps an operating-system locale to a language Theme Studio ships.
 * zh-CN, zh-Hans and bare zh become zh-CN. English variants become en-US.
 * Everything else, including zh-TW and zh-Hant, falls back to en-US.
 */
export function mapSystemLocale(locale: string): ResolvedLanguage {
  const value = locale.trim().toLowerCase().replace(/_/g, '-')
  if (value === 'zh' || value.startsWith('zh-cn') || value.startsWith('zh-hans')) return 'zh-CN'
  if (value === 'en' || value.startsWith('en-')) return 'en-US'
  return 'en-US'
}

export function resolveLanguage(preference: LanguagePreference, systemLocale: string): ResolvedLanguage {
  if (preference === 'zh-CN' || preference === 'en-US') return preference
  return mapSystemLocale(systemLocale)
}
