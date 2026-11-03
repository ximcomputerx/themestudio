import type { PresetDefinition, ThemeDocument, ThemeSection, ThemeTokens } from './types'
import { THEME_SCHEMA_VERSION } from './types'

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/

export function nowIso(): string {
  return new Date().toISOString()
}

export function isIsoDate(value: string): boolean {
  if (!ISO.test(value)) return false
  return !Number.isNaN(Date.parse(value))
}

export function cloneTheme(theme: ThemeDocument): ThemeDocument {
  return structuredClone(theme)
}

export function signature(theme: ThemeDocument): string {
  const clone = cloneTheme(theme)
  clone.meta.updatedAt = ''
  return JSON.stringify(clone)
}

export function touchTheme(theme: ThemeDocument, at = nowIso()): ThemeDocument {
  const next = cloneTheme(theme)
  next.meta.updatedAt = at
  return next
}

export function instantiatePreset(
  preset: PresetDefinition,
  options?: { id?: string; name?: string; now?: string }
): ThemeDocument {
  const now = options?.now ?? nowIso()
  const id = options?.id ?? crypto.randomUUID()
  return {
    schemaVersion: THEME_SCHEMA_VERSION,
    meta: {
      id,
      name: options?.name ?? preset.name,
      description: preset.description,
      author: 'Theme Studio',
      version: '1.0.0',
      presetId: preset.id,
      favorite: false,
      createdAt: now,
      updatedAt: now
    },
    ...structuredClone(preset.tokens)
  }
}

export function retokenFromPreset(theme: ThemeDocument, preset: PresetDefinition): ThemeDocument {
  const next = instantiatePreset(preset, {
    id: theme.meta.id,
    name: theme.meta.name,
    now: theme.meta.createdAt
  })
  next.meta.favorite = theme.meta.favorite
  next.meta.author = theme.meta.author
  next.meta.createdAt = theme.meta.createdAt
  next.meta.updatedAt = nowIso()
  next.meta.description = preset.description
  return next
}

export function duplicateTheme(theme: ThemeDocument, id = crypto.randomUUID()): ThemeDocument {
  const now = nowIso()
  const copy = cloneTheme(theme)
  copy.meta.id = id
  copy.meta.name = `${theme.meta.name} Copy`.slice(0, 80)
  copy.meta.favorite = false
  copy.meta.createdAt = now
  copy.meta.updatedAt = now
  return copy
}

export function patchToken<S extends ThemeSection>(
  theme: ThemeDocument,
  section: S,
  key: keyof ThemeTokens[S] & string,
  value: ThemeTokens[S][keyof ThemeTokens[S]]
): ThemeDocument {
  const next = cloneTheme(theme)
  const bag = next[section] as unknown as Record<string, unknown>
  bag[key] = value
  if (section === 'colors' && key === 'border') next.border.color = String(value)
  next.meta.updatedAt = nowIso()
  return next
}

export function slugify(name: string): string {
  const slug = name
    .normalize('NFKC')
    .trim()
    .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'theme'
}
