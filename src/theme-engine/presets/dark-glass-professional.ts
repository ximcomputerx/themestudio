import { definePreset } from './merge'

export const darkGlassProfessional = definePreset(
  'dark-glass-professional',
  'Dark Glass Professional',
  'Denser glass, quieter borders, and a restrained blue accent.',
  {
    colors: {
      appBackground: '#0A0C10',
      secondaryBackground: '#10141A',
      workspaceBackground: '#141A22',
      elevatedSurface: '#1A212C',
      sidebarBackground: '#10141A',
      panelBackground: '#1A212C',
      glassSurface: '#1A212C',
      glassHover: 'rgba(36, 46, 62, 0.88)',
      glassPopup: 'rgba(16, 20, 28, 0.94)',
      primary: '#4C82D6',
      secondary: '#3B6FB5',
      accent: '#8FB4E8',
      textPrimary: '#E6EAF0',
      textSecondary: '#B4BCC8',
      textMuted: '#7E8794',
      border: '#9AA6B8',
      glassBorder: '#A8B6C8',
      activeBorder: 'rgba(76, 130, 214, 0.7)',
      info: '#7CA8E6'
    },
    glass: { opacity: 0.82, blur: 10, saturation: 110, borderOpacity: 0.16, innerHighlight: 0.06, depth: 'low', contrast: 1 },
    glow: { color: '#8FB4E8', intensity: 0.4, radius: 10, spread: 0, opacity: 0.28, level: 'subtle', border: false, button: true, hover: true },
    border: { width: 1, opacity: 0.16, radius: 8, hoverColor: 'rgba(168, 182, 200, 0.4)', focusColor: '#8FB4E8' },
    shadow: { blur: 18, spread: -4, opacity: 0.35, offsetY: 8 },
    radius: { sm: 8, md: 10, lg: 14, xl: 16, pill: 999 },
    animation: { transitionMs: 140, hoverMs: 100, glowMs: 120 }
  }
)
