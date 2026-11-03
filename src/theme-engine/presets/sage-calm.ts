import { FONT_STACKS, MONO_STACKS } from '../validation/ranges'
import { definePreset } from './merge'

export const sageCalm = definePreset(
  'sage-calm',
  'Sage Calm',
  'Soft green-gray canvas, white panels, and a calm olive accent.',
  {
    colors: {
      appBackground: '#F1F5EF',
      secondaryBackground: '#F7FAF5',
      workspaceBackground: '#F4F7F2',
      elevatedSurface: '#FFFFFF',
      sidebarBackground: '#F1F5EF',
      panelBackground: '#FAFCF8',
      glassSurface: '#FAFCF8',
      glassHover: '#E5EDE3',
      glassPopup: 'rgba(250, 252, 248, 0.98)',
      primary: '#66856D',
      secondary: '#8FAE93',
      accent: '#A18A62',
      textPrimary: '#26362B',
      textSecondary: '#3F5348',
      textMuted: '#657267',
      border: '#DCE6DA',
      glassBorder: '#91AC8F',
      activeBorder: 'rgba(102, 133, 109, 0.5)',
      success: '#047857',
      warning: '#B45309',
      error: '#B91C1C',
      info: '#1D4ED8'
    },
    glass: { opacity: 0.9, blur: 6, saturation: 105, borderOpacity: 0.4, innerHighlight: 0.06, depth: 'medium', contrast: 1 },
    glow: {
      color: '#8FB69A',
      intensity: 0.025,
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
      color: '#DCE6DA',
      width: 1,
      opacity: 1,
      radius: 8,
      activeColor: '#66856D',
      hoverColor: 'rgba(161, 138, 98, 0.4)',
      focusColor: '#66856D'
    },
    shadow: { color: '#26362B', blur: 14, spread: -4, opacity: 0.06, offsetX: 0, offsetY: 4, inner: false, outer: true },
    typography: {
      fontFamily: FONT_STACKS[0].value,
      monoFamily: MONO_STACKS[0].value,
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.55,
      letterSpacing: 0,
      textColor: '#26362B'
    },
    radius: { sm: 8, md: 10, lg: 14, xl: 14, pill: 999 },
    animation: { transitionMs: 180, hoverMs: 130, focusMs: 110, panelMs: 200, dialogMs: 170, glowMs: 120, reducedMotion: false }
  }
)
