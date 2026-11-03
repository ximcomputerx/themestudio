import { definePreset } from './merge'

export const obsidianMono = definePreset(
  'obsidian-mono',
  'Obsidian Mono',
  'Black glass, white highlights, and almost no glow.',
  {
    colors: {
      appBackground: '#090A0C',
      secondaryBackground: '#0E1013',
      workspaceBackground: '#101216',
      elevatedSurface: '#181B20',
      sidebarBackground: '#0C0E11',
      panelBackground: '#131519',
      glassSurface: '#16191E',
      glassHover: 'rgba(38, 42, 50, 0.92)',
      glassPopup: 'rgba(12, 14, 17, 0.96)',
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
      accent: '#FFFFFF',
      textPrimary: '#F3F4F6',
      textSecondary: '#C5CAD1',
      textMuted: '#9AA1AB',
      border: '#343A40',
      glassBorder: '#4B5563',
      activeBorder: 'rgba(229, 231, 235, 0.72)',
      success: '#86C5A6',
      warning: '#D6B56A',
      error: '#E0A0A0',
      info: '#C5CAD3'
    },
    glass: { opacity: 0.82, blur: 8, saturation: 100, borderOpacity: 0.34, innerHighlight: 0.04, depth: 'medium', contrast: 1.02 },
    glow: {
      color: '#D1D5DB',
      intensity: 0.04,
      radius: 8,
      spread: 0,
      opacity: 0.25,
      level: 'subtle',
      border: false,
      button: false,
      inputFocus: true,
      hover: false,
      active: false
    },
    border: {
      color: '#343A40',
      width: 1,
      opacity: 0.95,
      radius: 8,
      activeColor: '#E5E7EB',
      hoverColor: 'rgba(209, 213, 219, 0.35)',
      focusColor: '#E5E7EB'
    },
    shadow: { color: '#000000', blur: 16, spread: -6, opacity: 0.4, offsetX: 0, offsetY: 8, inner: false, outer: true },
    typography: { textColor: '#F3F4F6' },
    radius: { sm: 8, md: 10, lg: 14, xl: 10, pill: 999 },
    animation: { transitionMs: 120, hoverMs: 80, focusMs: 80, panelMs: 160, dialogMs: 160, glowMs: 80 }
  }
)
