import { definePreset } from './merge'

export const auroraGlass = definePreset(
  'aurora-glass',
  'Aurora Glass',
  'Deep ink-green glass, teal edges, and a soft aurora glow.',
  {
    colors: {
      appBackground: '#071316',
      secondaryBackground: '#0A1C20',
      workspaceBackground: '#0E262B',
      elevatedSurface: '#123036',
      sidebarBackground: '#08191D',
      panelBackground: '#0C2024',
      glassSurface: '#12343A',
      glassHover: 'rgba(24, 78, 76, 0.74)',
      glassPopup: 'rgba(7, 24, 28, 0.92)',
      primary: '#14B8A6',
      secondary: '#22D3EE',
      accent: '#A3E635',
      textPrimary: '#E6F4F1',
      textSecondary: '#B7D4CC',
      textMuted: '#8EAAA4',
      border: '#28504D',
      glassBorder: '#2DD4BF',
      activeBorder: 'rgba(20, 184, 166, 0.8)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#22D3EE'
    },
    glass: { opacity: 0.62, blur: 18, saturation: 145, borderOpacity: 0.38, innerHighlight: 0.16, depth: 'medium', contrast: 1.06 },
    glow: {
      color: '#2DD4BF',
      intensity: 0.24,
      radius: 20,
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
      color: '#28504D',
      width: 1,
      opacity: 0.62,
      radius: 8,
      activeColor: 'rgba(20, 184, 166, 0.8)',
      hoverColor: 'rgba(45, 212, 191, 0.55)',
      focusColor: '#2DD4BF'
    },
    shadow: { color: '#02110F', blur: 28, spread: -2, opacity: 0.42, offsetX: 0, offsetY: 12, inner: false, outer: true },
    typography: { textColor: '#E6F4F1' },
    radius: { sm: 8, md: 10, lg: 14, xl: 22, pill: 999 }
  }
)
