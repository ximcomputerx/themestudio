import { app, BrowserWindow } from 'electron'
import { IpcChannel } from '@shared/ipc'
import { installMenu } from './menu'
import { readSettings } from './services/settings-service'

let observed = ''

export function rememberSystemLocale(): void {
  observed = app.getLocale()
}

export function publishSystemLocale(locale: string): void {
  observed = locale
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(IpcChannel.languageSystem, locale)
  }
  if (readSettings().language === 'system') installMenu()
}

/**
 * Electron has no operating-system locale event. Re-read app.getLocale()
 * when a window regains focus, which is the closest reliable signal.
 */
export function watchSystemLocale(): void {
  app.on('browser-window-focus', () => {
    const next = app.getLocale()
    if (next === observed) return
    publishSystemLocale(next)
  })
}
