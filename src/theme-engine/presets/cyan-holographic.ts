import { definePreset } from './merge'

export const cyanHolographic = definePreset(
  'cyan-holographic',
  'Cyan Holographic',
  'Translucent cyan glass with a holographic highlight and cooler text.',
  {
    colors: {
      appBackground: '#061016',
      secondaryBackground: '#08202A',
      workspaceBackground: '#0A2834',
      elevatedSurface: '#0E3040',
      sidebarBackground: '#071920',
      panelBackground: '#0E3040',
      glassSurface: '#0C2C38',
      glassHover: 'rgba(18, 78, 96, 0.7)',
      glassPopup: 'rgba(6, 28, 38, 0.9)',
      primary: '#22D3EE',
      secondary: '#06B6D4',
      accent: '#A5F3FC',
      textPrimary: '#E7FBFF',
      textSecondary: '#B7E4EE',
      textMuted: '#7F9AA8',
      border: '#8FD6E4',
      glassBorder: '#67E8F9',
      activeBorder: 'rgba(34, 211, 238, 0.85)',
      info: '#67E8F9',
      success: '#5EEAD4'
    },
    glass: { opacity: 0.5, blur: 20, saturation: 180, borderOpacity: 0.42, innerHighlight: 0.22, depth: 'high', contrast: 1.12 },
    glow: { color: '#67E8F9', intensity: 0.95, radius: 22, spread: 1, opacity: 0.62, level: 'strong' },
    border: { opacity: 0.3, radius: 8, activeColor: '#A5F3FC', hoverColor: 'rgba(103, 232, 249, 0.65)', focusColor: '#CFFAFE' },
    radius: { sm: 8, md: 10, lg: 14, xl: 24, pill: 999 }
  }
)
