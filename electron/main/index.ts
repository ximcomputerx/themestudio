import { app, BrowserWindow } from 'electron'
import { registerIpc } from './ipc/register'
import { installMenu } from './menu'
import { denyExtraPermissions, installContentSecurityPolicy } from './security'
import { readSettings } from './services/settings-service'
import { createMainWindow } from './window'
import { rememberSystemLocale, watchSystemLocale } from './locale-watch'

try {
  if (!readSettings().hardwareAcceleration) app.disableHardwareAcceleration()
} catch {
  // Keep Chromium's default acceleration when settings are not readable yet.
}

app.setAppUserModelId('com.themestudio.desktop')

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  app.whenReady().then(() => {
    denyExtraPermissions()
    installContentSecurityPolicy(!app.isPackaged)
    registerIpc()
    rememberSystemLocale()
    watchSystemLocale()
    installMenu()
    createMainWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
