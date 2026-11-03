import { app, BrowserWindow, ipcMain, screen, shell } from 'electron'
import type { IpcResult } from './result'
import { IpcChannel } from '@shared/ipc'
import { isLanguagePreference } from '@shared/locale'
import { exportTheme, pickImage } from '../services/export-service'
import { installMenu } from '../menu'
import { readSettings, writeSettings } from '../services/settings-service'
import {
  deleteTheme,
  duplicateStoredTheme,
  importTheme,
  listThemes,
  readTheme,
  renameTheme,
  restoreDefaultTheme,
  saveTheme,
  saveThemeAs,
  themesDirectory
} from '../services/theme-service'
import { applyShellOverlay } from '../shell-chrome'
import { allowWindowClose } from '../window'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('code:invalidRequest')
  return value
}

function handle(channel: string, fn: (payload: unknown) => unknown): void {
  ipcMain.handle(channel, async (_event, payload: unknown): Promise<IpcResult<unknown>> => {
    try {
      return { ok: true, data: await fn(payload) }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'code:unknownError' }
    }
  })
}

export function registerIpc(): void {
  handle(IpcChannel.themesList, () => listThemes())
  handle(IpcChannel.themesRead, (payload) => readTheme(payload))
  handle(IpcChannel.themesSave, (payload) => saveTheme(payload))
  handle(IpcChannel.themesSaveAs, (payload) => {
    const body = record(payload)
    return saveThemeAs(body.theme, body.name)
  })
  handle(IpcChannel.themesDuplicate, (payload) => duplicateStoredTheme(payload))
  handle(IpcChannel.themesRename, (payload) => {
    const body = record(payload)
    return renameTheme(body.id, body.name)
  })
  handle(IpcChannel.themesDelete, (payload) => {
    deleteTheme(payload)
  })
  handle(IpcChannel.themesImport, () => importTheme())
  handle(IpcChannel.themesExport, (payload) => {
    const body = record(payload)
    return exportTheme(body.theme, body.kind)
  })
  handle(IpcChannel.themesRestore, (payload) => restoreDefaultTheme(payload))
  handle(IpcChannel.settingsGet, () => readSettings())
  handle(IpcChannel.settingsSet, (payload) => {
    const settings = writeSettings(payload)
    applyShellOverlay(settings.shellPresetId)
    return settings
  })
  handle(IpcChannel.appDiagnostics, () => ({
    version: app.getVersion(),
    electron: process.versions.electron ?? '',
    chrome: process.versions.chrome ?? '',
    platform: process.platform,
    scaleFactor: screen.getPrimaryDisplay().scaleFactor,
    themesDir: themesDirectory(),
    userData: app.getPath('userData'),
    packaged: app.isPackaged
  }))
  handle(IpcChannel.appOpenThemesDir, async () => {
    const error = await shell.openPath(themesDirectory())
    if (error) throw new Error(`code:openFolderFailed|${error}`)
  })
  handle(IpcChannel.appPickImage, () => pickImage())
  handle(IpcChannel.languageGet, () => readSettings().language)
  handle(IpcChannel.languageSystemGet, () => app.getLocale())
  handle(IpcChannel.languageSet, (payload) => {
    if (!isLanguagePreference(payload)) throw new Error('code:invalidLanguage')
    const settings = readSettings()
    writeSettings({ ...settings, language: payload })
    installMenu()
    return payload
  })
  handle(IpcChannel.windowZoom, (payload) => {
    if (typeof payload !== 'number' || Number.isNaN(payload) || payload < 0.8 || payload > 1.5) {
      throw new Error('code:zoomRange')
    }
    const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
    win?.webContents.setZoomFactor(payload)
    const settings = readSettings()
    writeSettings({ ...settings, zoom: payload })
    return payload
  })
  handle(IpcChannel.windowClose, () => {
    allowWindowClose()
  })
}
