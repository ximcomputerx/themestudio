import { parseColor } from '@/theme-engine/color/color'
import { buildCssVariables } from '@/theme-engine/tokens/css-variables'
import type { RenderOptions, ThemeDocument } from '@/theme-engine/core/types'

const STACKABLE_NONE = '0 0 0 0 transparent'
const STACKABLE_SHADOWS = ['--ts-glow-border', '--ts-glow-button', '--ts-glow-hover', '--ts-glow-active', '--ts-glow-focus', '--ts-shadow-inner']

function lightSurface(color: string): boolean {
  const parsed = parseColor(color)
  if (!parsed) return false
  const channel = (value: number) => {
    const s = value / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(parsed.r) + 0.7152 * channel(parsed.g) + 0.0722 * channel(parsed.b)
  return luminance > 0.55
}

export function applyCssVariables(element: HTMLElement, theme: ThemeDocument, render: RenderOptions): void {
  element.dataset.themePreset = theme.meta.presetId ?? ''
  element.dataset.colorScheme = lightSurface(theme.colors.workspaceBackground) ? 'light' : 'dark'
  const variables = buildCssVariables(theme, render)
  for (const [name, value] of Object.entries(variables)) element.style.setProperty(name, value)
  for (const name of STACKABLE_SHADOWS) {
    if (element.style.getPropertyValue(name).trim() === 'none') element.style.setProperty(name, STACKABLE_NONE)
  }
  const glassOn = render.glassEnabled && !render.lowPerformance
  const reduced = render.reducedMotion || render.lowPerformance || theme.animation.reducedMotion
  element.dataset.glass = glassOn ? 'on' : 'off'
  element.dataset.reducedMotion = reduced ? 'true' : 'false'
  element.dataset.performance = render.lowPerformance ? 'low' : 'full'
}