import { definePreset } from './merge'

export const amberIndustrial = definePreset(
  'amber-industrial',
  'Amber Industrial',
  'Charcoal glass, amber edges, and a steady console glow.',
  {
    colors: {
      appBackground: '#15120C',
      secondaryBackground: '#1B170F',
      workspaceBackground: '#221C12',
      elevatedSurface: '#2A2316',
      sidebarBackground: '#18140E',
      panelBackground: '#211B11',
      glassSurface: '#2A2316',
      glassHover: 'rgba(92, 68, 28, 0.64)',
      glassPopup: 'rgba(22, 18, 12, 0.94)',
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#F97316',
      textPrimary: '#F5EBDD',
      textSecondary: '#D9C7A8',
      textMuted: '#B09778',
      border: '#5B4726',
      glassBorder: '#F59E0B',
      activeBorder: 'rgba(245, 158, 11, 0.75)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#93C5FD'
    },
    glass: { opacity: 0.65, blur: 12, saturation: 120, borderOpacity: 0.4, innerHighlight: 0.08, depth: 'medium', contrast: 1.04 },
    glow: {
      color: '#F59E0B',
      intensity: 0.85,
      radius: 18,
      spread: 0,
      opacity: 0.5,
      level: 'medium',
      border: true,
      button: true,
      inputFocus: true,
      hover: true,
      active: true
    },
    border: {
      color: '#5B4726',
      width: 1,
      opacity: 0.75,
      radius: 8,
      activeColor: '#FBBF24',
      hoverColor: 'rgba(245, 158, 11, 0.5)',
      focusColor: '#FBBF24'
    },
    shadow: { color: '#0A0805', blur: 20, spread: -2, opacity: 0.46, offsetX: 0, offsetY: 8, inner: false, outer: true },
    typography: { textColor: '#F5EBDD' },
    radius: { sm: 8, md: 10, lg: 14, xl: 14, pill: 999 }
  }
)
