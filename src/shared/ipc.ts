import type { RenderOptions, ThemeDocument } from '../theme-engine/core/types'
import type { LanguagePreference } from './locale'

export type { LanguagePreference }

export const IpcChannel = {
  themesList: 'themes:list',
  themesRead: 'themes:read',
  themesSave: 'themes:save',
  themesSaveAs: 'themes:save-as',
  themesDuplicate: 'themes:duplicate',
  themesRename: 'themes:rename',
  themesDelete: 'themes:delete',
  themesImport: 'themes:import',
  themesExport: 'themes:export',
  themesRestore: 'themes:restore-default',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  appDiagnostics: 'app:diagnostics',
  appOpenThemesDir: 'app:open-themes-dir',
  appPickImage: 'app:pick-image',
  windowZoom: 'window:zoom',
  windowClose: 'window:close',
  menuAction: 'menu:action',
  languageGet: 'language:get',
  languageSet: 'language:set',
  languageSystemGet: 'language:system-get',
  languageSystem: 'language:system-locale'
} as const

export type IpcChannelName = (typeof IpcChannel)[keyof typeof IpcChannel]

export interface ThemeSummary {
  id: string
  name: string
  presetId: string | null
  favorite: boolean
  updatedAt: string
  broken: boolean
  error?: string
}

export type PreviewScene = 'desktop' | 'components' | 'dialog' | 'data' | 'workspace'
export type PreviewBackground = 'solid' | 'gradient' | 'ambient' | 'grid' | 'custom'
export type ExportKind = 'json' | 'variables' | 'components' | 'tailwind' | 'shadcn' | 'readme' | 'zip'

export interface AppSettings {
  lastThemeId: string | null
  recentIds: string[]
  recentEnabled: boolean
  render: RenderOptions
  zoom: number
  scene: PreviewScene
  background: PreviewBackground
  bottomOpen: boolean
  language: LanguagePreference
  hardwareAcceleration: boolean
  shellPresetId: string
}

export interface Diagnostics {
  version: string
  electron: string
  chrome: string
  platform: string
  scaleFactor: number
  themesDir: string
  userData: string
  packaged: boolean
}

export interface ExportResult {
  canceled: boolean
  filePath?: string
}

export interface ImagePickResult {
  canceled: boolean
  dataUrl?: string
}

export const MENU_ACTIONS = [
  'new',
  'save',
  'save-as',
  'import',
  'export',
  'undo',
  'redo',
  'compare',
  'toggle-preview-fullscreen',
  'settings',
  'scene:desktop',
  'scene:components',
  'scene:dialog',
  'scene:data',
  'scene:workspace',
  'preset:neon-glass-blue',
  'preset:futuristic-electric-blue',
  'preset:cyan-holographic',
  'preset:dark-glass-professional',
  'preset:minimal-dark-blue',
  'preset:aurora-glass',
  'preset:cyberpunk-violet',
  'preset:arctic-frost',
  'preset:obsidian-mono',
  'preset:emerald-matrix',
  'preset:amber-industrial',
  'preset:nordic-light',
  'preset:pure-white',
  'preset:soft-gray',
  'preset:warm-sand',
  'preset:mist-blue',
  'preset:sage-calm',
  'request-close'
] as const

export type MenuAction = (typeof MENU_ACTIONS)[number]

export function isMenuAction(value: unknown): value is MenuAction {
  return typeof value === 'string' && (MENU_ACTIONS as readonly string[]).includes(value)
}

export interface ThemeStudioApi {
  platform: string
  themes: {
    list: () => Promise<ThemeSummary[]>
    read: (id: string) => Promise<ThemeDocument>
    save: (theme: ThemeDocument) => Promise<ThemeDocument>
    saveAs: (theme: ThemeDocument, name: string) => Promise<ThemeDocument>
    duplicate: (id: string) => Promise<ThemeDocument>
    rename: (id: string, name: string) => Promise<ThemeDocument>
    delete: (id: string) => Promise<void>
    importTheme: () => Promise<ThemeDocument>
    exportTheme: (theme: ThemeDocument, kind: ExportKind) => Promise<ExportResult>
    restoreDefault: (id: string) => Promise<ThemeDocument>
  }
  settings: {
    get: () => Promise<AppSettings>
    set: (settings: AppSettings) => Promise<AppSettings>
  }
  app: {
    diagnostics: () => Promise<Diagnostics>
    openThemesDir: () => Promise<void>
    pickImage: () => Promise<ImagePickResult>
  }
  window: {
    setZoom: (zoom: number) => Promise<number>
    confirmClose: () => Promise<void>
  }
  language: {
    getPreference: () => Promise<LanguagePreference>
    getSystemLocale: () => Promise<string>
    setPreference: (language: LanguagePreference) => Promise<LanguagePreference>
    onSystemLocaleChanged: (callback: (locale: string) => void) => () => void
  }
  onMenuAction: (callback: (action: MenuAction) => void) => () => void
}
