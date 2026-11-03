import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  AppSettings,
  Diagnostics,
  ExportKind,
  ExportResult,
  ImagePickResult,
  LanguagePreference,
  MenuAction,
  ThemeStudioApi,
  ThemeSummary
} from '@shared/ipc'
import { isLanguagePreference } from '@shared/locale'
import { IpcChannel, isMenuAction } from '@shared/ipc'
import type { ThemeDocument } from '@engine/core/types'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function invoke<T>(channel: string, payload?: unknown): Promise<T> {
  const result = (await ipcRenderer.invoke(channel, payload)) as Result<T>
  if (!result || typeof result !== 'object' || !('ok' in result)) throw new Error('Invalid IPC response')
  if (!result.ok) throw new Error(result.error || 'Request failed')
  return result.data
}

const api: ThemeStudioApi = {
  platform: process.platform,
  themes: {
    list: () => invoke<ThemeSummary[]>(IpcChannel.themesList),
    read: (id) => invoke<ThemeDocument>(IpcChannel.themesRead, id),
    save: (theme) => invoke<ThemeDocument>(IpcChannel.themesSave, theme),
    saveAs: (theme, name) => invoke<ThemeDocument>(IpcChannel.themesSaveAs, { theme, name }),
    duplicate: (id) => invoke<ThemeDocument>(IpcChannel.themesDuplicate, id),
    rename: (id, name) => invoke<ThemeDocument>(IpcChannel.themesRename, { id, name }),
    delete: (id) => invoke<void>(IpcChannel.themesDelete, id),
    importTheme: () => invoke<ThemeDocument>(IpcChannel.themesImport),
    exportTheme: (theme, kind: ExportKind) => invoke<ExportResult>(IpcChannel.themesExport, { theme, kind }),
    restoreDefault: (id) => invoke<ThemeDocument>(IpcChannel.themesRestore, id)
  },
  settings: {
    get: () => invoke<AppSettings>(IpcChannel.settingsGet),
    set: (settings) => invoke<AppSettings>(IpcChannel.settingsSet, settings)
  },
  app: {
    diagnostics: () => invoke<Diagnostics>(IpcChannel.appDiagnostics),
    openThemesDir: () => invoke<void>(IpcChannel.appOpenThemesDir),
    pickImage: () => invoke<ImagePickResult>(IpcChannel.appPickImage)
  },
  window: {
    setZoom: (zoom) => invoke<number>(IpcChannel.windowZoom, zoom),
    confirmClose: () => invoke<void>(IpcChannel.windowClose)
  },
  language: {
    getPreference: () => invoke<LanguagePreference>(IpcChannel.languageGet),
    getSystemLocale: () => invoke<string>(IpcChannel.languageSystemGet),
    setPreference: (language) => {
      if (!isLanguagePreference(language)) throw new Error('code:invalidLanguage')
      return invoke<LanguagePreference>(IpcChannel.languageSet, language)
    },
    onSystemLocaleChanged: (callback) => {
      const listener = (_event: IpcRendererEvent, locale: unknown): void => {
        if (typeof locale === 'string') callback(locale)
      }
      ipcRenderer.on(IpcChannel.languageSystem, listener)
      return () => ipcRenderer.removeListener(IpcChannel.languageSystem, listener)
    }
  },
  onMenuAction: (callback) => {
    const listener = (_event: IpcRendererEvent, action: unknown): void => {
      if (isMenuAction(action)) callback(action as MenuAction)
    }
    ipcRenderer.on(IpcChannel.menuAction, listener)
    return () => ipcRenderer.removeListener(IpcChannel.menuAction, listener)
  }
}

contextBridge.exposeInMainWorld('themeStudio', api)
