import { definePreset } from './merge'

export const futuristicElectricBlue = definePreset(
  'futuristic-electric-blue',
  'Futuristic Electric Blue',
  'Sharper panels, stronger electric blue, and a heavier neon rim.',
  {
    colors: {
      appBackground: '#04060C',
      secondaryBackground: '#070C18',
      workspaceBackground: '#0A1222',
      elevatedSurface: '#0E1830',
      sidebarBackground: '#070C18',
      panelBackground: '#0E1830',
      glassSurface: '#0C1830',
      glassHover: 'rgba(20, 48, 96, 0.72)',
      glassPopup: 'rgba(8, 18, 40, 0.9)',
      primary: '#2563EB',
      secondary: '#1D4ED8',
      accent: '#60A5FA',
      textPrimary: '#E7F0FF',
      textSecondary: '#A9BBE0',
      textMuted: '#6E82A8',
      border: '#7EA2E0',
      glassBorder: '#60A5FA',
      activeBorder: 'rgba(37, 99, 235, 0.9)',
      info: '#60A5FA'
    },
    glass: { opacity: 0.55, blur: 22, saturation: 150, borderOpacity: 0.4, innerHighlight: 0.16, depth: 'high', contrast: 1.08 },
    glow: { color: '#3B82F6', intensity: 1, radius: 24, spread: 1, opacity: 0.7, level: 'strong' },
    border: { width: 1, opacity: 0.28, radius: 8, activeColor: '#60A5FA', hoverColor: 'rgba(96, 165, 250, 0.7)', focusColor: '#93C5FD' },
    shadow: { blur: 36, spread: 0, opacity: 0.55, offsetY: 16 },
    radius: { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 }
  }
)
