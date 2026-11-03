import { definePreset } from './merge'

export const nordicLight = definePreset(
  'nordic-light',
  'Nordic Light',
  'Soft gray-white glass, blue emphasis, and a teal accent.',
  {
    colors: {
      appBackground: '#F4F6F8',
      secondaryBackground: '#EEF2F6',
      workspaceBackground: '#F8FAFB',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#E8EDF2',
      panelBackground: '#FFFFFF',
      glassSurface: '#FFFFFF',
      glassHover: '#E7EDF3',
      glassPopup: 'rgba(255, 255, 255, 0.97)',
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#0F766E',
      textPrimary: '#172033',
      textSecondary: '#334155',
      textMuted: '#4A596E',
      border: '#D8E0EA',
      glassBorder: '#B7C5D4',
      activeBorder: 'rgba(59, 130, 246, 0.55)',
      success: '#047857',
      warning: '#B45309',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.78, blur: 12, saturation: 108, borderOpacity: 0.8, innerHighlight: 0.12, depth: 'medium', contrast: 1.02 },
    glow: {
      color: '#60A5FA',
      intensity: 0.08,
      radius: 12,
      spread: 0,
      opacity: 0.4,
      level: 'subtle',
      border: true,
      button: false,
      inputFocus: true,
      hover: false,
      active: false
    },
    border: {
      color: '#D8E0EA',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#3B82F6',
      hoverColor: 'rgba(15, 118, 110, 0.4)',
      focusColor: '#3B82F6'
    },
    shadow: { color: '#172033', blur: 18, spread: -6, opacity: 0.08, offsetX: 0, offsetY: 8, inner: false, outer: true },
    typography: { textColor: '#172033' },
    radius: { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 }
  }
)
