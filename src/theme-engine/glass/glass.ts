import type { GlassDepth, GlassTokens, RenderOptions } from '../core/types'

const DEPTH_SCALE: Record<GlassDepth, number> = {
  low: 0.72,
  medium: 1,
  high: 1.28
}

export interface ResolvedGlass {
  enabled: boolean
  opacity: number
  blur: number
  saturation: number
  contrast: number
  borderOpacity: number
  innerHighlight: number
  backdropFilter: string
}

export function resolveGlass(glass: GlassTokens, render: RenderOptions): ResolvedGlass {
  const enabled = render.glassEnabled && !render.lowPerformance && glass.blur > 0
  const depth = DEPTH_SCALE[glass.depth]
  const blur = enabled ? Math.min(48, Math.max(0, glass.blur * depth)) : 0
  const saturation = enabled ? glass.saturation : 100
  const contrast = enabled ? glass.contrast : 1
  const highlightScale = glass.depth === 'high' ? 1.25 : glass.depth === 'low' ? 0.7 : 1
  const innerHighlight = enabled ? Math.min(1, glass.innerHighlight * highlightScale) : 0
  const backdropFilter =
    blur > 0 ? `blur(${trim(blur)}px) saturate(${trim(saturation)}%) contrast(${trim(contrast)})` : 'none'
  return {
    enabled,
    opacity: glass.opacity,
    blur,
    saturation,
    contrast,
    borderOpacity: glass.borderOpacity,
    innerHighlight,
    backdropFilter
  }
}

function trim(value: number): string {
  return String(Math.round(value * 100) / 100)
}
