import { FONT_STACKS, MONO_STACKS } from '../validation/ranges'
import { definePreset } from './merge'

export const warmSand = definePreset(
  'warm-sand',
  'Warm Sand',
  'Warm cream surfaces, brown emphasis, and a muted olive accent.',
  {
    colors: {
      appBackground: '#F6F1E8',
      secondaryBackground: '#FBF7F1',
      workspaceBackground: '#F8F3EA',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#F6F1E8',
      panelBackground: '#FFFCF6',
      glassSurface: '#FFFCF6',
      glassHover: '#F0E6D6',
      glassPopup: 'rgba(255, 252, 246, 0.98)',
      primary: '#9A6B45',
      secondary: '#B08968',
      accent: '#7C8A63',
      textPrimary: '#382F27',
      textSecondary: '#5A4C40',
      textMuted: '#776B5E',
      border: '#E7DCCB',
      glassBorder: '#A58C62',
      activeBorder: 'rgba(154, 107, 69, 0.55)',
      success: '#047857',
      warning: '#B05109',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.9, blur: 5, saturation: 105, borderOpacity: 0.42, innerHighlight: 0.06, depth: 'medium', contrast: 1 },
    glow: {
      color: '#C49A6C',
      intensity: 0.03,
      radius: 3,
      spread: 0,
      opacity: 0.35,
      level: 'subtle',
      border: false,
      button: false,
      inputFocus: false,
      hover: false,
      active: false
    },
    border: {
      color: '#E7DCCB',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#9A6B45',
      hoverColor: 'rgba(124, 138, 99, 0.4)',
      focusColor: '#9A6B45'
    },
    shadow: { color: '#382F27', blur: 14, spread: -4, opacity: 0.07, offsetX: 0, offsetY: 4, inner: false, outer: true },
    typography: {
      fontFamily: FONT_STACKS[0].value,
      monoFamily: MONO_STACKS[0].value,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
      textColor: '#382F27'
    },
    radius: { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 },
    animation: { transitionMs: 170, hoverMs: 130, focusMs: 110, panelMs: 190, dialogMs: 170, glowMs: 120, reducedMotion: false }
  }
)
