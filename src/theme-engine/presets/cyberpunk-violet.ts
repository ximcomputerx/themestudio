import { definePreset } from './merge'

export const cyberpunkViolet = definePreset(
  'cyberpunk-violet',
  'Cyberpunk Violet',
  'Violet neon glass with magenta highlights and a cyan accent.',
  {
    colors: {
      appBackground: '#0D0A18',
      secondaryBackground: '#120E22',
      workspaceBackground: '#161028',
      elevatedSurface: '#1E1534',
      sidebarBackground: '#100C1C',
      panelBackground: '#171128',
      glassSurface: '#1C1433',
      glassHover: 'rgba(76, 42, 130, 0.72)',
      glassPopup: 'rgba(14, 10, 28, 0.92)',
      primary: '#8B5CF6',
      secondary: '#EC4899',
      accent: '#22D3EE',
      textPrimary: '#F1EDFF',
      textSecondary: '#C9BFE4',
      textMuted: '#9084A8',
      border: '#49336D',
      glassBorder: '#A78BFA',
      activeBorder: 'rgba(139, 92, 246, 0.85)',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#22D3EE'
    },
    glass: { opacity: 0.65, blur: 18, saturation: 160, borderOpacity: 0.42, innerHighlight: 0.14, depth: 'medium', contrast: 1.08 },
    glow: {
      color: '#A78BFA',
      intensity: 0.42,
      radius: 22,
      spread: 1,
      opacity: 0.68,
      level: 'strong',
      border: true,
      button: true,
      inputFocus: true,
      hover: true,
      active: true
    },
    border: {
      color: '#49336D',
      width: 1,
      opacity: 0.72,
      radius: 8,
      activeColor: '#A78BFA',
      hoverColor: 'rgba(236, 72, 153, 0.55)',
      focusColor: '#C4B5FD'
    },
    shadow: { color: '#070412', blur: 32, spread: 0, opacity: 0.5, offsetX: 0, offsetY: 14, inner: false, outer: true },
    typography: { textColor: '#F1EDFF' },
    radius: { sm: 8, md: 10, lg: 14, xl: 18, pill: 999 }
  }
)
