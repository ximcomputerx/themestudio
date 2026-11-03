import { applyCssVariables } from '@/lib/apply-css-variables'
import { instantiatePreset } from '@/theme-engine/core/document'
import { DEFAULT_RENDER } from '@/theme-engine/core/types'
import { PRESETS, presetById } from '@/theme-engine/presets'

export const DEFAULT_SHELL_PRESET = 'neon-glass-blue'

export function isShellPresetId(id: string): boolean {
  return PRESETS.some((preset) => preset.id === id)
}

const STACKABLE_NONE = '0 0 0 0 transparent'
const STACKABLE_SHADOWS = ['--ts-glow-border', '--ts-glow-button', '--ts-glow-hover', '--ts-glow-active', '--ts-glow-focus', '--ts-shadow-inner']

export function applyShellTheme(id: string): string {
  const preset = isShellPresetId(id) ? presetById(id) : presetById(DEFAULT_SHELL_PRESET)
  const root = document.documentElement
  applyCssVariables(root, instantiatePreset(preset), DEFAULT_RENDER)
  for (const name of STACKABLE_SHADOWS) {
    if (root.style.getPropertyValue(name).trim() === 'none') root.style.setProperty(name, STACKABLE_NONE)
  }
  return preset.id
}
