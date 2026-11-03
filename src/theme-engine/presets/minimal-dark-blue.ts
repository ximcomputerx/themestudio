import { definePreset } from './merge'

export const minimalDarkBlue = definePreset(
  'minimal-dark-blue',
  'Minimal Dark Blue',
  'Nearly solid surfaces, no glow, and compact professional geometry.',
  {
    colors: {
      appBackground: '#0D1117',
      secondaryBackground: '#11161D',
      workspaceBackground: '#161B22',
      elevatedSurface: '#1C232E',
      sidebarBackground: '#11161D',
      panelBackground: '#1C232E',
      glassSurface: '#1C232E',
      glassHover: 'rgba(33, 41, 54, 0.96)',
      glassPopup: 'rgba(18, 23, 31, 0.98)',
      primary: '#3B82F6',
      secondary: '#334155',
      accent: '#93C5FD',
      textPrimary: '#E6EDF3',
      textSecondary: '#9AA8B8',
      textMuted: '#6E7C8C',
      border: '#8B9CB0',
      glassBorder: '#8B9CB0',
      activeBorder: '#3B82F6',
      info: '#60A5FA'
    },
    glass: { opacity: 0.94, blur: 0, saturation: 100, borderOpacity: 0.2, innerHighlight: 0, depth: 'low', contrast: 1 },
    glow: {
      color: '#3B82F6',
      intensity: 0,
      radius: 0,
      spread: 0,
      opacity: 0,
      level: 'off',
      border: false,
      button: false,
      inputFocus: true,
      hover: false,
      active: false
    },
    border: { width: 1, opacity: 0.22, radius: 8, hoverColor: 'rgba(139, 156, 176, 0.45)', focusColor: '#3B82F6', activeColor: '#3B82F6' },
    shadow: { blur: 8, spread: 0, opacity: 0.28, offsetY: 2, outer: true, inner: false },
    radius: { sm: 8, md: 10, lg: 14, xl: 10, pill: 999 },
    animation: { transitionMs: 120, hoverMs: 80, focusMs: 80, panelMs: 140, dialogMs: 140, glowMs: 80 }
  }
)
