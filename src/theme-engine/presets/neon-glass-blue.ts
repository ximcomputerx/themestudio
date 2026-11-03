import type { PresetDefinition, ThemeTokens } from '../core/types'
import { FONT_STACKS, MONO_STACKS } from '../validation/ranges'

export const neonGlassBlueTokens: ThemeTokens = {
  colors: {
    appBackground: '#070B12',
    secondaryBackground: '#0B1220',
    workspaceBackground: '#0E1624',
    elevatedSurface: '#121D2E',
    sidebarBackground: '#0B1220',
    panelBackground: '#121D2E',
    glassSurface: '#101C2E',
    glassHover: 'rgba(25, 43, 68, 0.78)',
    glassPopup: 'rgba(13, 25, 43, 0.88)',
    primary: '#3B82F6',
    secondary: '#2563EB',
    accent: '#38BDF8',
    textPrimary: '#E8EEF8',
    textSecondary: '#A8B6C9',
    textMuted: '#718198',
    border: '#7E9CC4',
    glassBorder: '#74B7FF',
    activeBorder: 'rgba(59, 130, 246, 0.75)',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA'
  },
  glass: {
    opacity: 0.68,
    blur: 16,
    saturation: 125,
    borderOpacity: 0.24,
    innerHighlight: 0.12,
    depth: 'medium',
    contrast: 1
  },
  glow: {
    color: '#38BDF8',
    intensity: 0.85,
    radius: 18,
    spread: 0,
    opacity: 0.55,
    level: 'medium',
    border: true,
    button: true,
    inputFocus: true,
    hover: true,
    active: true
  },
  border: {
    color: '#7E9CC4',
    width: 1,
    opacity: 0.18,
    radius: 8,
    activeColor: 'rgba(59, 130, 246, 0.75)',
    hoverColor: 'rgba(116, 183, 255, 0.55)',
    focusColor: '#38BDF8'
  },
  shadow: {
    color: '#020617',
    blur: 28,
    spread: -2,
    opacity: 0.45,
    offsetX: 0,
    offsetY: 12,
    inner: false,
    outer: true
  },
  typography: {
    fontFamily: FONT_STACKS[0].value,
    monoFamily: MONO_STACKS[0].value,
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    textColor: '#E8EEF8'
  },
  radius: {
    sm: 8,
    md: 10,
    lg: 14,
    xl: 18,
    pill: 999
  },
  animation: {
    transitionMs: 180,
    hoverMs: 140,
    focusMs: 120,
    panelMs: 240,
    dialogMs: 200,
    glowMs: 200,
    reducedMotion: false
  }
}

export const neonGlassBlue: PresetDefinition = {
  id: 'neon-glass-blue',
  name: 'Neon Glass Blue',
  description: 'Deep navy glass, electric blue edges, and a soft cyan glow.',
  tokens: neonGlassBlueTokens
}
