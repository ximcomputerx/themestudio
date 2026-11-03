import { existsSync } from 'node:fs'
import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { IpcChannel } from '@shared/ipc'
import { shellChromeColors } from './shell-chrome'
import { readSettings } from './services/settings-service'
import { hardenWindow } from './security'

let allowClose = false

export function allowWindowClose(): void {
  allowClose = true
  for (const win of BrowserWindow.getAllWindows()) win.close()
}

export function createMainWindow(): BrowserWindow {
  const settings = readSettings()
  const chrome = shellChromeColors(settings.shellPresetId)
  const devUrl = process.env.ELECTRON_RENDERER_URL
  const iconPath = join(app.getAppPath(), 'app.png')
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    backgroundColor: chrome.color,
    title: 'Theme Studio',
    ...(existsSync(iconPath) ? { icon: iconPath } : {}),
    autoHideMenuBar: false,
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
    ...(process.platform === 'win32'
      ? { titleBarOverlay: { color: chrome.color, symbolColor: chrome.symbolColor, height: 40 } }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      experimentalFeatures: false
    }
  })

  win.webContents.setZoomFactor(settings.zoom)
  hardenWindow(win, app.isPackaged ? undefined : devUrl)

  let ready = false
  win.on('ready-to-show', () => {
    ready = true
    win.show()
  })
  win.on('close', (event) => {
    if (allowClose || !ready) return
    event.preventDefault()
    if (!win.isDestroyed()) win.webContents.send(IpcChannel.menuAction, 'request-close')
  })

  if (!app.isPackaged && devUrl) void win.loadURL(devUrl)
  else void win.loadFile(join(__dirname, '../renderer/index.html'))
  return win
}
