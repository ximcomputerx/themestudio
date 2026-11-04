import type { BrowserWindow } from 'electron'
import { session } from 'electron'

const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'",
  "form-action 'none'"
].join('; ')

const DEV_CSP = [
  "default-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",
  "script-src 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:*",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-src 'none'"
].join('; ')

export function installContentSecurityPolicy(dev: boolean): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders ?? {}
    callback({
      responseHeaders: {
        ...headers,
        'Content-Security-Policy': [dev ? DEV_CSP : PROD_CSP]
      }
    })
  })
}

export function denyExtraPermissions(): void {
  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) => {
    // Copy Token / Copy CSS use navigator.clipboard.writeText. A blanket deny rejects that write.
    callback(permission === 'clipboard-sanitized-write')
  })
}

export function hardenWindow(win: BrowserWindow, devUrl: string | undefined): void {
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  win.webContents.on('will-navigate', (event, url) => {
    if (devUrl && (url === devUrl || url.startsWith(`${devUrl}/`))) return
    if (!devUrl && url.startsWith('file:')) return
    event.preventDefault()
  })
  win.webContents.on('will-attach-webview', (event) => {
    event.preventDefault()
  })
}
