import { FONT_STACKS, MONO_STACKS } from '../validation/ranges'
import { definePreset } from './merge'

export const pureWhite = definePreset(
  'pure-white',
  'Pure White',
  'Quiet white surfaces, a fine gray edge, and a blue accent.',
  {
    colors: {
      appBackground: '#F7F9FC',
      secondaryBackground: '#F8FAFD',
      workspaceBackground: '#F5F8FC',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#F7F9FC',
      panelBackground: '#FFFFFF',
      glassSurface: '#FFFFFF',
      glassHover: '#E7EEF6',
      glassPopup: 'rgba(255, 255, 255, 0.98)',
      primary: '#2563EB',
      secondary: '#64748B',
      accent: '#0EA5E9',
      textPrimary: '#172033',
      textSecondary: '#3A4962',
      textMuted: '#64748B',
      border: '#E5EAF1',
      glassBorder: '#ABBDD1',
      activeBorder: 'rgba(37, 99, 235, 0.55)',
      success: '#047857',
      warning: '#B45309',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.92, blur: 4, saturation: 105, borderOpacity: 0.5, innerHighlight: 0.08, depth: 'medium', contrast: 1 },
    glow: {
      color: '#60A5FA',
      intensity: 0.02,
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
      color: '#E5EAF1',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#2563EB',
      hoverColor: 'rgba(37, 99, 235, 0.35)',
      focusColor: '#2563EB'
    },
    shadow: { color: '#172033', blur: 14, spread: -4, opacity: 0.06, offsetX: 0, offsetY: 4, inner: false, outer: true },
    typography: {
      fontFamily: FONT_STACKS[0].value,
      monoFamily: MONO_STACKS[0].value,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
      textColor: '#172033'
    },
    radius: { sm: 8, md: 10, lg: 14, xl: 12, pill: 999 },
    animation: { transitionMs: 160, hoverMs: 120, focusMs: 100, panelMs: 180, dialogMs: 160, glowMs: 120, reducedMotion: false }
  }
)
