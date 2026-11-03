import { app, dialog, Menu, BrowserWindow } from 'electron'
import { translate } from '@i18n/resources'
import { PRESETS } from '@engine/presets'
import type { MenuAction } from '@shared/ipc'
import { IpcChannel, isMenuAction } from '@shared/ipc'
import { resolveLanguage } from '@shared/locale'
import { readSettings } from './services/settings-service'

function send(action: MenuAction): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(IpcChannel.menuAction, action)
  }
}

export function installMenu(): void {
  const language = resolveLanguage(readSettings().language, app.getLocale())
  const t = (key: string, values?: Record<string, string | number>) => translate(language, key, values)
  const view: Electron.MenuItemConstructorOptions[] = [
    { label: t('navigation:menu.desktopPreview'), click: () => send('scene:desktop') },
    { label: t('navigation:menu.componentsPreview'), click: () => send('scene:components') },
    { label: t('navigation:menu.dialogPreview'), click: () => send('scene:dialog') },
    { label: t('navigation:menu.dataPreview'), click: () => send('scene:data') },
    { label: t('navigation:menu.workspacePreview'), click: () => send('scene:workspace') },
    { type: 'separator' },
    { label: t('navigation:menu.compare'), click: () => send('compare') },
    { label: t('navigation:menu.focusPreview'), click: () => send('toggle-preview-fullscreen') },
    { type: 'separator' },
    { label: t('navigation:menu.resetZoom'), role: 'resetZoom' },
    { label: t('navigation:menu.zoomIn'), role: 'zoomIn' },
    { label: t('navigation:menu.zoomOut'), role: 'zoomOut' },
    { label: t('navigation:menu.toggleFullscreen'), role: 'togglefullscreen' }
  ]
  if (!app.isPackaged) {
    view.push(
      { type: 'separator' },
      { label: t('navigation:menu.reload'), role: 'reload' },
      { label: t('navigation:menu.forceReload'), role: 'forceReload' },
      { label: t('navigation:menu.toggleDevTools'), role: 'toggleDevTools' }
    )
  }

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: t('navigation:menu.file'),
      submenu: [
        { label: t('navigation:menu.newTheme'), click: () => send('new') },
        { label: t('navigation:menu.save'), click: () => send('save') },
        { label: t('navigation:menu.saveAs'), click: () => send('save-as') },
        { type: 'separator' },
        { label: t('navigation:menu.importTheme'), click: () => send('import') },
        { label: t('navigation:menu.exportPackage'), click: () => send('export') },
        { type: 'separator' },
        { label: t('navigation:menu.preferences'), click: () => send('settings') },
        { type: 'separator' },
        { label: t('navigation:menu.quit'), role: 'quit' }
      ]
    },
    {
      label: t('navigation:menu.edit'),
      submenu: [
        { label: t('navigation:menu.undo'), click: () => send('undo') },
        { label: t('navigation:menu.redo'), click: () => send('redo') },
        { type: 'separator' },
        { label: t('navigation:menu.cut'), role: 'cut' },
        { label: t('navigation:menu.copy'), role: 'copy' },
        { label: t('navigation:menu.paste'), role: 'paste' },
        { label: t('navigation:menu.selectAll'), role: 'selectAll' }
      ]
    },
    { label: t('navigation:menu.view'), submenu: view },
    {
      label: t('navigation:menu.window'),
      submenu: [
        { label: t('navigation:menu.minimize'), role: 'minimize' },
        { label: t('navigation:menu.toggleFullscreen'), role: 'togglefullscreen' },
        { label: t('navigation:menu.close'), role: 'close' }
      ]
    },
    {
      label: t('navigation:menu.theme'),
      submenu: PRESETS.flatMap((preset) => {
        const action = `preset:${preset.id}`
        if (!isMenuAction(action)) return []
        const item = { label: t(`theme-library:presets.${preset.id}.name`), click: () => send(action) }
        return preset.id === 'pure-white' ? [{ type: 'separator' as const }, item] : [item]
      })
    },
    {
      label: t('navigation:menu.help'),
      submenu: [
        { label: t('navigation:menu.settings'), click: () => send('settings') },
        {
          label: t('navigation:menu.about'),
          click: () => {
            const settings = readSettings()
            const language = resolveLanguage(settings.language, app.getLocale())
            void dialog.showMessageBox({
              type: 'info',
              title: 'Theme Studio',
              message: 'Theme Studio',
              detail: translate(language, 'messages:aboutDetail', { version: app.getVersion() })
            })
          }
        }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
