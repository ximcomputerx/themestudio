import { parseColor } from '../color/color'
import { isIsoDate } from '../core/document'
import type {
  AnimationTokens,
  BorderTokens,
  ColorTokens,
  GlassTokens,
  GlowTokens,
  RadiusTokens,
  ShadowTokens,
  ThemeDocument,
  ThemeMeta,
  ThemeTokens,
  TypographyTokens
} from '../core/types'
import { THEME_SCHEMA_VERSION } from '../core/types'
import { GLASS_DEPTHS, GLOW_LEVELS, MONO_STACKS, RANGES, FONT_STACKS } from './ranges'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SEMVER = /^\d+\.\d+\.\d+$/
const FORBIDDEN = new Set(['__proto__', 'prototype', 'constructor'])

const COLOR_KEYS: (keyof ColorTokens)[] = [
  'appBackground',
  'secondaryBackground',
  'workspaceBackground',
  'elevatedSurface',
  'sidebarBackground',
  'panelBackground',
  'glassSurface',
  'glassHover',
  'glassPopup',
  'primary',
  'secondary',
  'accent',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'border',
  'glassBorder',
  'activeBorder',
  'success',
  'warning',
  'error',
  'info'
]

const ALLOWED_FONTS = new Set<string>([...FONT_STACKS.map((item) => item.value), ...MONO_STACKS.map((item) => item.value)])

export interface ValidationSuccess {
  ok: true
  theme: ThemeDocument
  warnings: string[]
}

export interface ValidationFailure {
  ok: false
  errors: string[]
}

export type ValidationResult = ValidationSuccess | ValidationFailure

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectForbidden(record: Record<string, unknown>, label: string, errors: string[]): void {
  for (const key of Object.keys(record)) {
    if (FORBIDDEN.has(key)) errors.push(`${label} contains a forbidden key`)
  }
}

function readNumber(
  source: Record<string, unknown>,
  key: string,
  range: { min: number; max: number },
  label: string,
  errors: string[]
): number {
  const value = source[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${label} must be a finite number`)
    return range.min
  }
  if (value < range.min || value > range.max) {
    errors.push(`${label} must be between ${range.min} and ${range.max}`)
  }
  return value
}

function readBoolean(source: Record<string, unknown>, key: string, label: string, errors: string[]): boolean {
  const value = source[key]
  if (typeof value !== 'boolean') {
    errors.push(`${label} must be true or false`)
    return false
  }
  return value
}

function readColor(source: Record<string, unknown>, key: string, label: string, errors: string[]): string {
  const value = source[key]
  if (typeof value !== 'string' || !parseColor(value)) {
    errors.push(`${label} must be a HEX, RGB, or HSL color`)
    return '#000000'
  }
  return value.trim()
}

function readString(
  source: Record<string, unknown>,
  key: string,
  label: string,
  min: number,
  max: number,
  errors: string[]
): string {
  const value = source[key]
  if (typeof value !== 'string') {
    errors.push(`${label} must be a string`)
    return ''
  }
  const trimmed = value.trim()
  if (trimmed.length < min || trimmed.length > max) {
    errors.push(`${label} must be ${min}-${max} characters`)
  }
  return trimmed
}

export function validateTheme(input: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  if (!isRecord(input)) return { ok: false, errors: ['Theme must be a JSON object'] }
  rejectForbidden(input, 'Theme', errors)
  if (input.schemaVersion !== THEME_SCHEMA_VERSION) {
    errors.push(`Unsupported schemaVersion. Expected ${THEME_SCHEMA_VERSION}`)
  }

  const meta = readMeta(input.meta, errors)
  const tokens = readTokens(input, errors, warnings)
  if (errors.length > 0 || !meta || !tokens) return { ok: false, errors }
  return {
    ok: true,
    warnings,
    theme: {
      schemaVersion: THEME_SCHEMA_VERSION,
      meta,
      ...tokens
    }
  }
}

function readMeta(input: unknown, errors: string[]): ThemeMeta | null {
  if (!isRecord(input)) {
    errors.push('meta must be an object')
    return null
  }
  rejectForbidden(input, 'meta', errors)
  const id = typeof input.id === 'string' ? input.id : ''
  if (!UUID.test(id)) errors.push('meta.id must be a UUID')
  const name = readString(input, 'name', 'meta.name', 1, 80, errors)
  const description = readString(input, 'description', 'meta.description', 0, 500, errors)
  const author = readString(input, 'author', 'meta.author', 0, 80, errors)
  const version = typeof input.version === 'string' ? input.version.trim() : ''
  if (!SEMVER.test(version)) errors.push('meta.version must use major.minor.patch')
  let presetId: string | null = null
  if (input.presetId !== null && input.presetId !== undefined) {
    if (typeof input.presetId !== 'string' || input.presetId.length > 80) {
      errors.push('meta.presetId must be a string or null')
    } else {
      presetId = input.presetId
    }
  }
  if (typeof input.favorite !== 'boolean') errors.push('meta.favorite must be true or false')
  const createdAt = typeof input.createdAt === 'string' ? input.createdAt : ''
  const updatedAt = typeof input.updatedAt === 'string' ? input.updatedAt : ''
  if (!isIsoDate(createdAt)) errors.push('meta.createdAt must be an ISO timestamp')
  if (!isIsoDate(updatedAt)) errors.push('meta.updatedAt must be an ISO timestamp')
  return {
    id,
    name,
    description,
    author,
    version,
    presetId,
    favorite: input.favorite === true,
    createdAt,
    updatedAt
  }
}

function readTokens(input: Record<string, unknown>, errors: string[], warnings: string[]): ThemeTokens | null {
  const known = new Set(['schemaVersion', 'meta', 'colors', 'glass', 'glow', 'border', 'shadow', 'typography', 'radius', 'animation'])
  for (const key of Object.keys(input)) {
    if (!known.has(key)) warnings.push(`Ignored unknown field "${key}"`)
  }
  return {
    colors: readColors(input.colors, errors),
    glass: readGlass(input.glass, errors),
    glow: readGlow(input.glow, errors),
    border: readBorder(input.border, errors),
    shadow: readShadow(input.shadow, errors),
    typography: readTypography(input.typography, errors),
    radius: readRadius(input.radius, errors),
    animation: readAnimation(input.animation, errors)
  }
}

function section(input: unknown, name: string, errors: string[]): Record<string, unknown> | null {
  if (!isRecord(input)) {
    errors.push(`${name} must be an object`)
    return null
  }
  rejectForbidden(input, name, errors)
  return input
}

function readColors(input: unknown, errors: string[]): ColorTokens {
  const source = section(input, 'colors', errors) ?? {}
  const colors = {} as ColorTokens
  for (const key of COLOR_KEYS) colors[key] = readColor(source, key, `colors.${key}`, errors)
  return colors
}

function readGlass(input: unknown, errors: string[]): GlassTokens {
  const source = section(input, 'glass', errors) ?? {}
  const depth = source.depth
  if (depth !== 'low' && depth !== 'medium' && depth !== 'high') {
    errors.push(`glass.depth must be one of ${GLASS_DEPTHS.join(', ')}`)
  }
  return {
    opacity: readNumber(source, 'opacity', RANGES.glass.opacity, 'glass.opacity', errors),
    blur: readNumber(source, 'blur', RANGES.glass.blur, 'glass.blur', errors),
    saturation: readNumber(source, 'saturation', RANGES.glass.saturation, 'glass.saturation', errors),
    borderOpacity: readNumber(source, 'borderOpacity', RANGES.glass.borderOpacity, 'glass.borderOpacity', errors),
    innerHighlight: readNumber(source, 'innerHighlight', RANGES.glass.innerHighlight, 'glass.innerHighlight', errors),
    depth: depth === 'low' || depth === 'high' ? depth : 'medium',
    contrast: readNumber(source, 'contrast', RANGES.glass.contrast, 'glass.contrast', errors)
  }
}

function readGlow(input: unknown, errors: string[]): GlowTokens {
  const source = section(input, 'glow', errors) ?? {}
  const level = source.level
  if (level !== 'off' && level !== 'subtle' && level !== 'medium' && level !== 'strong' && level !== 'extreme') {
    errors.push(`glow.level must be one of ${GLOW_LEVELS.join(', ')}`)
  }
  return {
    color: readColor(source, 'color', 'glow.color', errors),
    intensity: readNumber(source, 'intensity', RANGES.glow.intensity, 'glow.intensity', errors),
    radius: readNumber(source, 'radius', RANGES.glow.radius, 'glow.radius', errors),
    spread: readNumber(source, 'spread', RANGES.glow.spread, 'glow.spread', errors),
    opacity: readNumber(source, 'opacity', RANGES.glow.opacity, 'glow.opacity', errors),
    level: level === 'off' || level === 'subtle' || level === 'strong' || level === 'extreme' ? level : 'medium',
    border: readBoolean(source, 'border', 'glow.border', errors),
    button: readBoolean(source, 'button', 'glow.button', errors),
    inputFocus: readBoolean(source, 'inputFocus', 'glow.inputFocus', errors),
    hover: readBoolean(source, 'hover', 'glow.hover', errors),
    active: readBoolean(source, 'active', 'glow.active', errors)
  }
}

function readBorder(input: unknown, errors: string[]): BorderTokens {
  const source = section(input, 'border', errors) ?? {}
  return {
    color: readColor(source, 'color', 'border.color', errors),
    width: readNumber(source, 'width', RANGES.border.width, 'border.width', errors),
    opacity: readNumber(source, 'opacity', RANGES.border.opacity, 'border.opacity', errors),
    radius: readNumber(source, 'radius', RANGES.border.radius, 'border.radius', errors),
    activeColor: readColor(source, 'activeColor', 'border.activeColor', errors),
    hoverColor: readColor(source, 'hoverColor', 'border.hoverColor', errors),
    focusColor: readColor(source, 'focusColor', 'border.focusColor', errors)
  }
}

function readShadow(input: unknown, errors: string[]): ShadowTokens {
  const source = section(input, 'shadow', errors) ?? {}
  return {
    color: readColor(source, 'color', 'shadow.color', errors),
    blur: readNumber(source, 'blur', RANGES.shadow.blur, 'shadow.blur', errors),
    spread: readNumber(source, 'spread', RANGES.shadow.spread, 'shadow.spread', errors),
    opacity: readNumber(source, 'opacity', RANGES.shadow.opacity, 'shadow.opacity', errors),
    offsetX: readNumber(source, 'offsetX', RANGES.shadow.offsetX, 'shadow.offsetX', errors),
    offsetY: readNumber(source, 'offsetY', RANGES.shadow.offsetY, 'shadow.offsetY', errors),
    inner: readBoolean(source, 'inner', 'shadow.inner', errors),
    outer: readBoolean(source, 'outer', 'shadow.outer', errors)
  }
}

function readTypography(input: unknown, errors: string[]): TypographyTokens {
  const source = section(input, 'typography', errors) ?? {}
  const fontFamily = readString(source, 'fontFamily', 'typography.fontFamily', 1, 180, errors)
  const monoFamily = readString(source, 'monoFamily', 'typography.monoFamily', 1, 180, errors)
  if (fontFamily && !ALLOWED_FONTS.has(fontFamily)) errors.push('typography.fontFamily is not a supported font stack')
  if (monoFamily && !ALLOWED_FONTS.has(monoFamily)) errors.push('typography.monoFamily is not a supported font stack')
  return {
    fontFamily,
    monoFamily,
    fontSize: readNumber(source, 'fontSize', RANGES.typography.fontSize, 'typography.fontSize', errors),
    fontWeight: readNumber(source, 'fontWeight', RANGES.typography.fontWeight, 'typography.fontWeight', errors),
    lineHeight: readNumber(source, 'lineHeight', RANGES.typography.lineHeight, 'typography.lineHeight', errors),
    letterSpacing: readNumber(source, 'letterSpacing', RANGES.typography.letterSpacing, 'typography.letterSpacing', errors),
    textColor: readColor(source, 'textColor', 'typography.textColor', errors)
  }
}

function readRadius(input: unknown, errors: string[]): RadiusTokens {
  const source = section(input, 'radius', errors) ?? {}
  return {
    sm: readNumber(source, 'sm', RANGES.radius.sm, 'radius.sm', errors),
    md: readNumber(source, 'md', RANGES.radius.md, 'radius.md', errors),
    lg: readNumber(source, 'lg', RANGES.radius.lg, 'radius.lg', errors),
    xl: readNumber(source, 'xl', RANGES.radius.xl, 'radius.xl', errors),
    pill: readNumber(source, 'pill', RANGES.radius.pill, 'radius.pill', errors)
  }
}

function readAnimation(input: unknown, errors: string[]): AnimationTokens {
  const source = section(input, 'animation', errors) ?? {}
  return {
    transitionMs: readNumber(source, 'transitionMs', RANGES.animation.transitionMs, 'animation.transitionMs', errors),
    hoverMs: readNumber(source, 'hoverMs', RANGES.animation.hoverMs, 'animation.hoverMs', errors),
    focusMs: readNumber(source, 'focusMs', RANGES.animation.focusMs, 'animation.focusMs', errors),
    panelMs: readNumber(source, 'panelMs', RANGES.animation.panelMs, 'animation.panelMs', errors),
    dialogMs: readNumber(source, 'dialogMs', RANGES.animation.dialogMs, 'animation.dialogMs', errors),
    glowMs: readNumber(source, 'glowMs', RANGES.animation.glowMs, 'animation.glowMs', errors),
    reducedMotion: readBoolean(source, 'reducedMotion', 'animation.reducedMotion', errors)
  }
}
