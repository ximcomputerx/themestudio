import { FONT_STACKS, MONO_STACKS } from '../validation/ranges'
import { definePreset } from './merge'

export const softGray = definePreset(
  'soft-gray',
  'Soft Gray',
  'Neutral gray workspace, white panels, and a teal accent.',
  {
    colors: {
      appBackground: '#F1F3F5',
      secondaryBackground: '#F6F7F8',
      workspaceBackground: '#F4F5F6',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#F1F3F5',
      panelBackground: '#F8F9FA',
      glassSurface: '#F8F9FA',
      glassHover: '#E6EAEE',
      glassPopup: 'rgba(255, 255, 255, 0.98)',
      primary: '#475569',
      secondary: '#64748B',
      accent: '#0F766E',
      textPrimary: '#202833',
      textSecondary: '#3C4856',
      textMuted: '#636E7D',
      border: '#DCE1E7',
      glassBorder: '#97A4B6',
      activeBorder: 'rgba(71, 85, 105, 0.55)',
      success: '#047857',
      warning: '#B45309',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.9, blur: 6, saturation: 100, borderOpacity: 0.45, innerHighlight: 0.04, depth: 'medium', contrast: 1 },
    glow: {
      color: '#94A3B8',
      intensity: 0.02,
      radius: 3,
      spread: 0,
      opacity: 0.35,
      level: 'subtle',
      border: false,
      button: false,
      inputFocus: false,
      hover: false,
      active: false
    },
    border: {
      color: '#DCE1E7',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#475569',
      hoverColor: 'rgba(15, 118, 110, 0.35)',
      focusColor: '#475569'
    },
    shadow: { color: '#202833', blur: 12, spread: -3, opacity: 0.07, offsetX: 0, offsetY: 3, inner: false, outer: true },
    typography: {
      fontFamily: FONT_STACKS[0].value,
      monoFamily: MONO_STACKS[0].value,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
      textColor: '#202833'
    },
    radius: { sm: 8, md: 10, lg: 14, xl: 10, pill: 999 },
    animation: { transitionMs: 150, hoverMs: 110, focusMs: 100, panelMs: 170, dialogMs: 150, glowMs: 120, reducedMotion: false }
  }
)
