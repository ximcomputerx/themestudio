export const THEME_SCHEMA_VERSION = 1 as const

export type GlassDepth = 'low' | 'medium' | 'high'
export type GlowLevel = 'off' | 'subtle' | 'medium' | 'strong' | 'extreme'

export interface ThemeMeta {
  id: string
  name: string
  description: string
  author: string
  version: string
  presetId: string | null
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export interface ColorTokens {
  appBackground: string
  secondaryBackground: string
  workspaceBackground: string
  elevatedSurface: string
  sidebarBackground: string
  panelBackground: string
  glassSurface: string
  glassHover: string
  glassPopup: string
  primary: string
  secondary: string
  accent: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  glassBorder: string
  activeBorder: string
  success: string
  warning: string
  error: string
  info: string
}

export interface GlassTokens {
  opacity: number
  blur: number
  saturation: number
  borderOpacity: number
  innerHighlight: number
  depth: GlassDepth
  contrast: number
}

export interface GlowTokens {
  color: string
  intensity: number
  radius: number
  spread: number
  opacity: number
  level: GlowLevel
  border: boolean
  button: boolean
  inputFocus: boolean
  hover: boolean
  active: boolean
}

export interface BorderTokens {
  color: string
  width: number
  opacity: number
  radius: number
  activeColor: string
  hoverColor: string
  focusColor: string
}

export interface ShadowTokens {
  color: string
  blur: number
  spread: number
  opacity: number
  offsetX: number
  offsetY: number
  inner: boolean
  outer: boolean
}

export interface TypographyTokens {
  fontFamily: string
  monoFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  textColor: string
}

export interface RadiusTokens {
  sm: number
  md: number
  lg: number
  xl: number
  pill: number
}

export interface AnimationTokens {
  transitionMs: number
  hoverMs: number
  focusMs: number
  panelMs: number
  dialogMs: number
  glowMs: number
  reducedMotion: boolean
}

export interface ThemeTokens {
  colors: ColorTokens
  glass: GlassTokens
  glow: GlowTokens
  border: BorderTokens
  shadow: ShadowTokens
  typography: TypographyTokens
  radius: RadiusTokens
  animation: AnimationTokens
}

export interface ThemeDocument extends ThemeTokens {
  schemaVersion: typeof THEME_SCHEMA_VERSION
  meta: ThemeMeta
}

export interface RenderOptions {
  glassEnabled: boolean
  lowPerformance: boolean
  reducedMotion: boolean
}

export const DEFAULT_RENDER: RenderOptions = {
  glassEnabled: true,
  lowPerformance: false,
  reducedMotion: false
}

export interface PresetDefinition {
  id: string
  name: string
  description: string
  tokens: ThemeTokens
}

export type ThemeSection = keyof ThemeTokens
