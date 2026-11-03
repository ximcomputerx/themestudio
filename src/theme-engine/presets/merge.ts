import type { PresetDefinition, ThemeTokens } from '../core/types'
import { neonGlassBlueTokens } from './neon-glass-blue'

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeValue(base: unknown, override: unknown): unknown {
  if (isPlainObject(base) && isPlainObject(override)) {
    const next: Record<string, unknown> = { ...base }
    for (const [key, value] of Object.entries(override)) next[key] = mergeValue(base[key], value)
    return next
  }
  return override
}

export function definePreset(id: string, name: string, description: string, overrides: DeepPartial<ThemeTokens>): PresetDefinition {
  return {
    id,
    name,
    description,
    tokens: mergeValue(structuredClone(neonGlassBlueTokens), overrides) as ThemeTokens
  }
}
