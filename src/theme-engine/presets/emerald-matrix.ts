import { definePreset } from './merge'

export const emeraldMatrix = definePreset(
  'emerald-matrix',
  'Emerald Matrix',
  'Deep green glass with emerald edges and a quiet terminal glow.',
  {
    colors: {
      appBackground: '#06110B',
      secondaryBackground: '#08160F',
      workspaceBackground: '#0A1C12',
      elevatedSurface: '#10281A',
      sidebarBackground: '#07140E',
      panelBackground: '#0B1B12',
      glassSurface: '#0E2418',
      glassHover: 'rgba(16, 70, 46, 0.72)',
      glassPopup: 'rgba(5, 16, 10, 0.92)',
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#A3E635',
      textPrimary: '#E5F5EA',
      textSecondary: '#B7D7C2',
      textMuted: '#84A690',
      border: '#24533B',
      glassBorder: '#10B981',
      activeBorder: 'rgba(16, 185, 129, 0.8)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#6EE7B7'
    },
    glass: { opacity: 0.58, blur: 14, saturation: 140, borderOpacity: 0.4, innerHighlight: 0.1, depth: 'medium', contrast: 1.06 },
    glow: {
      color: '#10B981',
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
      color: '#24533B',
      width: 1,
      opacity: 0.7,
      radius: 8,
      activeColor: '#34D399',
      hoverColor: 'rgba(16, 185, 129, 0.55)',
      focusColor: '#34D399'
    },
    shadow: { color: '#020805', blur: 24, spread: -2, opacity: 0.45, offsetX: 0, offsetY: 10, inner: false, outer: true },
    typography: { textColor: '#E5F5EA' },
    radius: { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 }
  }
)
