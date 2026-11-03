import { resolveLanguage, type LanguagePreference, type ResolvedLanguage } from '@shared/locale'
import enColors from './locales/en-US/colors.json'
import enCommon from './locales/en-US/common.json'
import enExport from './locales/en-US/export.json'
import enGlass from './locales/en-US/glass.json'
import enGlow from './locales/en-US/glow.json'
import enInspector from './locales/en-US/inspector.json'
import enMessages from './locales/en-US/messages.json'
import enNavigation from './locales/en-US/navigation.json'
import enPreview from './locales/en-US/preview.json'
import enSettings from './locales/en-US/settings.json'
import enEditor from './locales/en-US/theme-editor.json'
import enLibrary from './locales/en-US/theme-library.json'
import zhColors from './locales/zh-CN/colors.json'
import zhCommon from './locales/zh-CN/common.json'
import zhExport from './locales/zh-CN/export.json'
import zhGlass from './locales/zh-CN/glass.json'
import zhGlow from './locales/zh-CN/glow.json'
import zhInspector from './locales/zh-CN/inspector.json'
import zhMessages from './locales/zh-CN/messages.json'
import zhNavigation from './locales/zh-CN/navigation.json'
import zhPreview from './locales/zh-CN/preview.json'
import zhSettings from './locales/zh-CN/settings.json'
import zhEditor from './locales/zh-CN/theme-editor.json'
import zhLibrary from './locales/zh-CN/theme-library.json'

export const resources = {
  'en-US': {
    common: enCommon,
    navigation: enNavigation,
    'theme-library': enLibrary,
    'theme-editor': enEditor,
    colors: enColors,
    glass: enGlass,
    glow: enGlow,
    preview: enPreview,
    inspector: enInspector,
    export: enExport,
    settings: enSettings,
    messages: enMessages
  },
  'zh-CN': {
    common: zhCommon,
    navigation: zhNavigation,
    'theme-library': zhLibrary,
    'theme-editor': zhEditor,
    colors: zhColors,
    glass: zhGlass,
    glow: zhGlow,
    preview: zhPreview,
    inspector: zhInspector,
    export: zhExport,
    settings: zhSettings,
    messages: zhMessages
  }
} as const

export type AppResources = typeof resources

function lookup(source: unknown, path: string): string | undefined {
  let current: unknown = source
  for (const part of path.split('.')) {
    if (!current || typeof current !== 'object' || !(part in current)) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

/** Main-process lookup. Theme tokens and export code never go through this. */
export function translate(language: ResolvedLanguage, key: string, values?: Record<string, string | number>): string {
  const colon = key.indexOf(':')
  const namespace = colon === -1 ? 'common' : key.slice(0, colon)
  const path = colon === -1 ? key : key.slice(colon + 1)
  const primary = resources[language][namespace as keyof (typeof resources)['en-US']]
  const fallback = resources['en-US'][namespace as keyof (typeof resources)['en-US']]
  let text = lookup(primary, path) ?? lookup(fallback, path) ?? key
  if (values) {
    for (const [name, value] of Object.entries(values)) {
      text = text.replaceAll(`{{${name}}}`, String(value))
    }
  }
  return text
}

export function resolvePreference(preference: LanguagePreference, systemLocale: string): ResolvedLanguage {
  return resolveLanguage(preference, systemLocale)
}
