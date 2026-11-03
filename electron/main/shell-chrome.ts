import { BrowserWindow } from 'electron'
import { contrastText } from '@engine/color/color'
import { instantiatePreset } from '@engine/core/document'
import { presetById } from '@engine/presets'

export function shellChromeColors(presetId: string): { color: string; symbolColor: string } {
  const theme = instantiatePreset(presetById(presetId))
  const color = theme.colors.appBackground
  return { color, symbolColor: contrastText(color) }
}

export function applyShellOverlay(presetId: string): void {
  if (process.platform !== 'win32') return
  const { color, symbolColor } = shellChromeColors(presetId)
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.setTitleBarOverlay({ color, symbolColor, height: 40 })
  }
}
