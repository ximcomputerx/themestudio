import { buildCssVariables } from '@/theme-engine/tokens/css-variables'
import type { RenderOptions, ThemeDocument } from '@/theme-engine/core/types'

const STACKABLE_NONE = '0 0 0 0 transparent'
const STACKABLE_SHADOWS = ['--ts-glow-border', '--ts-glow-button', '--ts-glow-hover', '--ts-glow-active', '--ts-glow-focus', '--ts-shadow-inner']

export function applyCssVariables(element: HTMLElement, theme: ThemeDocument, render: RenderOptions): void {
  element.dataset.themePreset = theme.meta.presetId ?? ''
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