import { applyCssVariables } from '@/lib/apply-css-variables'
import { instantiatePreset } from '@/theme-engine/core/document'
import { DEFAULT_RENDER } from '@/theme-engine/core/types'
import { PRESETS, presetById } from '@/theme-engine/presets'

export const DEFAULT_SHELL_PRESET = 'neon-glass-blue'

export function isShellPresetId(id: string): boolean {
  return PRESETS.some((preset) => preset.id === id)
}

export function applyShellTheme(id: string): string {
  const preset = isShellPresetId(id) ? presetById(id) : presetById(DEFAULT_SHELL_PRESET)
  const root = document.documentElement
  applyCssVariables(root, instantiatePreset(preset), DEFAULT_RENDER)
  root.dataset.shellPreset = preset.id
  return preset.id
}
