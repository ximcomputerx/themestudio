import { FONT_STACKS, MONO_STACKS } from '../validation/ranges'
import { definePreset } from './merge'

export const mistBlue = definePreset(
  'mist-blue',
  'Mist Blue',
  'Cool blue-gray canvas, white panels, and a restrained blue accent.',
  {
    colors: {
      appBackground: '#EFF5FA',
      secondaryBackground: '#F5F9FC',
      workspaceBackground: '#F3F7FB',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#EFF5FA',
      panelBackground: '#F8FBFE',
      glassSurface: '#F8FBFE',
      glassHover: '#E3EEF6',
      glassPopup: 'rgba(248, 251, 254, 0.98)',
      primary: '#4F7FB8',
      secondary: '#7FA6C9',
      accent: '#4C9A9A',
      textPrimary: '#1E3348',
      textSecondary: '#3C5368',
      textMuted: '#5E7083',
      border: '#D7E4EF',
      glassBorder: '#88A8C5',
      activeBorder: 'rgba(79, 127, 184, 0.55)',
      success: '#047857',
      warning: '#B45309',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.88, blur: 8, saturation: 110, borderOpacity: 0.42, innerHighlight: 0.08, depth: 'medium', contrast: 1 },
    glow: {
      color: '#79A9D8',
      intensity: 0.04,
      radius: 4,
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
      color: '#D7E4EF',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#4F7FB8',
      hoverColor: 'rgba(79, 127, 184, 0.35)',
      focusColor: '#4F7FB8'
    },
    shadow: { color: '#1E3348', blur: 16, spread: -4, opacity: 0.06, offsetX: 0, offsetY: 4, inner: false, outer: true },
    typography: {
      fontFamily: FONT_STACKS[0].value,
      monoFamily: MONO_STACKS[0].value,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
      textColor: '#1E3348'
    },
    radius: { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 },
    animation: { transitionMs: 160, hoverMs: 120, focusMs: 100, panelMs: 180, dialogMs: 160, glowMs: 120, reducedMotion: false }
  }
)
