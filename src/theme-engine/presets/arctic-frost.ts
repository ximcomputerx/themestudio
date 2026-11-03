import { definePreset } from './merge'

export const arcticFrost = definePreset(
  'arctic-frost',
  'Arctic Frost',
  'Ice-white glass, blue edges, and a soft blue shadow.',
  {
    colors: {
      appBackground: '#EAF3FA',
      secondaryBackground: '#F3F8FC',
      workspaceBackground: '#F7FBFE',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#E4EEF7',
      panelBackground: '#F6FAFE',
      glassSurface: '#F7FBFF',
      glassHover: '#E3EEF8',
      glassPopup: 'rgba(255, 255, 255, 0.96)',
      primary: '#2563EB',
      secondary: '#38BDF8',
      accent: '#0EA5E9',
      textPrimary: '#132238',
      textSecondary: '#31465F',
      textMuted: '#4E657C',
      border: '#B8D2E8',
      glassBorder: '#60A5FA',
      activeBorder: 'rgba(37, 99, 235, 0.72)',
      success: '#047857',
      warning: '#B45309',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.72, blur: 14, saturation: 118, borderOpacity: 0.55, innerHighlight: 0.2, depth: 'medium', contrast: 1.02 },
    glow: {
      color: '#60A5FA',
      intensity: 0.16,
      radius: 14,
      spread: 0,
      opacity: 0.45,
      level: 'subtle',
      border: true,
      button: true,
      inputFocus: true,
      hover: true,
      active: true
    },
    border: {
      color: '#B8D2E8',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#2563EB',
      hoverColor: 'rgba(37, 99, 235, 0.45)',
      focusColor: '#2563EB'
    },
    shadow: { color: '#1E4B86', blur: 22, spread: -4, opacity: 0.14, offsetX: 0, offsetY: 10, inner: false, outer: true },
    typography: { textColor: '#132238' },
    radius: { sm: 8, md: 10, lg: 14, xl: 20, pill: 999 }
  }
)
