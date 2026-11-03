import { clamp01, withAlpha } from '../color/color'
import type { GlowLevel, GlowTokens, RenderOptions } from '../core/types'

const LEVEL_SCALE: Record<GlowLevel, number> = {
  off: 0,
  subtle: 0.35,
  medium: 0.65,
  strong: 0.9,
  extreme: 1.15
}

export type GlowTarget = 'border' | 'button' | 'inputFocus' | 'hover' | 'active'

export function glowScale(glow: GlowTokens, render: RenderOptions): number {
  const performance = render.lowPerformance ? 0.2 : 1
  return performance * LEVEL_SCALE[glow.level] * glow.intensity
}

export function glowShadow(glow: GlowTokens, render: RenderOptions, target: GlowTarget, emphasis = 1): string {
  if (!glow[target]) return 'none'
  const scale = glowScale(glow, render) * emphasis
  const alpha = clamp01(glow.opacity * scale)
  if (alpha <= 0.01 || glow.radius <= 0) return 'none'
  const soft = withAlpha(glow.color, alpha)
  const wide = withAlpha(glow.color, alpha * 0.62)
  const innerRadius = Math.max(1, glow.radius * 0.45)
  return `0 0 ${trim(innerRadius)}px ${trim(glow.spread * 0.25)}px ${soft}, 0 0 ${trim(glow.radius)}px ${trim(glow.spread)}px ${wide}`
}

function trim(value: number): string {
  return String(Math.round(value * 100) / 100)
}
