import { buildCssVariables } from '@/theme-engine/tokens/css-variables'
import type { RenderOptions, ThemeDocument } from '@/theme-engine/core/types'

export function applyCssVariables(element: HTMLElement, theme: ThemeDocument, render: RenderOptions): void {
  const variables = buildCssVariables(theme, render)
  for (const [name, value] of Object.entries(variables)) element.style.setProperty(name, value)
  const glassOn = render.glassEnabled && !render.lowPerformance
  const reduced = render.reducedMotion || render.lowPerformance || theme.animation.reducedMotion
  element.dataset.glass = glassOn ? 'on' : 'off'
  element.dataset.reducedMotion = reduced ? 'true' : 'false'
  element.dataset.performance = render.lowPerformance ? 'low' : 'full'
}