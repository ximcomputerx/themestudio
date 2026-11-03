import { canonicalColor, contrastText, mixColors, withAlpha } from '../color/color'
import type { RenderOptions, ThemeDocument } from '../core/types'
import { DEFAULT_RENDER } from '../core/types'
import { resolveGlass } from '../glass/glass'
import { glowShadow } from '../glow/glow'

export interface TokenEntry {
  name: string
  value: string
  group: string
}

function cssColor(value: string): string {
  return canonicalColor(value) ?? value
}

function px(value: number): string {
  return `${Math.round(value * 100) / 100}px`
}

function ms(value: number, scale: number): string {
  return `${Math.max(0, Math.round(value * scale))}ms`
}

function shadowLayer(
  offsetX: number,
  offsetY: number,
  blur: number,
  spread: number,
  color: string,
  inset: boolean
): string {
  return `${inset ? 'inset ' : ''}${px(offsetX)} ${px(offsetY)} ${px(blur)} ${px(spread)} ${color}`
}

export function buildCssVariables(theme: ThemeDocument, render: RenderOptions = DEFAULT_RENDER): Record<string, string> {
  const glass = resolveGlass(theme.glass, render)
  const motionOff = render.reducedMotion || render.lowPerformance || theme.animation.reducedMotion
  const motion = motionOff ? 0 : 1
  const surface = withAlpha(theme.colors.glassSurface, glass.opacity)
  const baseBorder = withAlpha(theme.border.color, theme.border.opacity)
  const glassBorder = withAlpha(theme.colors.glassBorder, glass.borderOpacity)
  const shadowColor = withAlpha(theme.shadow.color, render.lowPerformance ? theme.shadow.opacity * 0.45 : theme.shadow.opacity)
  const outer = theme.shadow.outer
    ? shadowLayer(theme.shadow.offsetX, theme.shadow.offsetY, theme.shadow.blur, theme.shadow.spread, shadowColor, false)
    : 'none'
  const inner = theme.shadow.inner
    ? shadowLayer(theme.shadow.offsetX, theme.shadow.offsetY, Math.max(2, theme.shadow.blur * 0.45), theme.shadow.spread, shadowColor, true)
    : 'none'
  const primary = cssColor(theme.colors.primary)
  return {
    '--ts-color-app-background': cssColor(theme.colors.appBackground),
    '--ts-color-secondary-background': cssColor(theme.colors.secondaryBackground),
    '--ts-color-workspace-background': cssColor(theme.colors.workspaceBackground),
    '--ts-color-elevated-surface': cssColor(theme.colors.elevatedSurface),
    '--ts-color-sidebar-background': cssColor(theme.colors.sidebarBackground),
    '--ts-color-panel-background': cssColor(theme.colors.panelBackground),
    '--ts-color-glass-hover': cssColor(theme.colors.glassHover),
    '--ts-color-glass-popup': cssColor(theme.colors.glassPopup),
    '--ts-color-primary': primary,
    '--ts-color-primary-hover': mixColors(primary, '#FFFFFF', 0.14),
    '--ts-color-primary-active': mixColors(primary, '#000000', 0.16),
    '--ts-color-secondary': cssColor(theme.colors.secondary),
    '--ts-color-accent': cssColor(theme.colors.accent),
    '--ts-color-text-primary': cssColor(theme.colors.textPrimary),
    '--ts-color-text-secondary': cssColor(theme.colors.textSecondary),
    '--ts-color-text-muted': cssColor(theme.colors.textMuted),
    '--ts-color-text': cssColor(theme.typography.textColor),
    '--ts-color-border': baseBorder,
    '--ts-color-glass-border': glassBorder,
    '--ts-color-active-border': cssColor(theme.border.activeColor),
    '--ts-color-hover-border': cssColor(theme.border.hoverColor),
    '--ts-color-focus-border': cssColor(theme.border.focusColor),
    '--ts-color-success': cssColor(theme.colors.success),
    '--ts-color-warning': cssColor(theme.colors.warning),
    '--ts-color-error': cssColor(theme.colors.error),
    '--ts-color-info': cssColor(theme.colors.info),
    '--ts-color-on-primary': contrastText(theme.colors.primary),
    '--ts-color-on-error': contrastText(theme.colors.error),
    '--ts-glass-surface': surface,
    '--ts-glass-opacity': String(glass.opacity),
    '--ts-glass-blur': px(glass.blur),
    '--ts-glass-saturation': `${glass.saturation}%`,
    '--ts-glass-contrast': String(glass.contrast),
    '--ts-backdrop-filter': glass.backdropFilter,
    '--ts-inner-highlight': `rgba(255, 255, 255, ${Math.round(glass.innerHighlight * 1000) / 1000})`,
    '--ts-border-width': px(theme.border.width),
    '--ts-radius-control': px(theme.border.radius),
    '--ts-radius-sm': px(theme.radius.sm),
    '--ts-radius-md': px(theme.radius.md),
    '--ts-radius-lg': px(theme.radius.lg),
    '--ts-radius-xl': px(theme.radius.xl),
    '--ts-radius-pill': px(theme.radius.pill),
    '--ts-shadow-outer': outer,
    '--ts-shadow-inner': inner,
    '--ts-glow-color': cssColor(theme.glow.color),
    '--ts-glow-border': glowShadow(theme.glow, render, 'border', 0.8),
    '--ts-glow-button': glowShadow(theme.glow, render, 'button', 1),
    '--ts-glow-hover': glowShadow(theme.glow, render, 'hover', 0.9),
    '--ts-glow-active': glowShadow(theme.glow, render, 'active', 1.15),
    '--ts-glow-focus': glowShadow(theme.glow, render, 'inputFocus', 1),
    '--ts-font-family': theme.typography.fontFamily,
    '--ts-font-mono': theme.typography.monoFamily,
    '--ts-font-size': px(theme.typography.fontSize),
    '--ts-font-weight': String(theme.typography.fontWeight),
    '--ts-line-height': String(theme.typography.lineHeight),
    '--ts-letter-spacing': `${theme.typography.letterSpacing}em`,
    '--ts-duration': ms(theme.animation.transitionMs, motion),
    '--ts-duration-hover': ms(theme.animation.hoverMs, motion),
    '--ts-duration-focus': ms(theme.animation.focusMs, motion),
    '--ts-duration-panel': ms(theme.animation.panelMs, motion),
    '--ts-duration-dialog': ms(theme.animation.dialogMs, motion),
    '--ts-duration-glow': ms(theme.animation.glowMs, motion)
  }
}

const GROUPS: Record<string, string> = {
  '--ts-color-app-background': 'Color',
  '--ts-color-secondary-background': 'Color',
  '--ts-color-workspace-background': 'Color',
  '--ts-color-elevated-surface': 'Color',
  '--ts-color-sidebar-background': 'Color',
  '--ts-color-panel-background': 'Color',
  '--ts-color-glass-hover': 'Color',
  '--ts-color-glass-popup': 'Color',
  '--ts-color-primary': 'Color',
  '--ts-color-primary-hover': 'Color',
  '--ts-color-primary-active': 'Color',
  '--ts-color-secondary': 'Color',
  '--ts-color-accent': 'Color',
  '--ts-color-text-primary': 'Color',
  '--ts-color-text-secondary': 'Color',
  '--ts-color-text-muted': 'Color',
  '--ts-color-text': 'Typography',
  '--ts-color-border': 'Border',
  '--ts-color-glass-border': 'Border',
  '--ts-color-active-border': 'Border',
  '--ts-color-hover-border': 'Border',
  '--ts-color-focus-border': 'Border',
  '--ts-color-success': 'Color',
  '--ts-color-warning': 'Color',
  '--ts-color-error': 'Color',
  '--ts-color-info': 'Color',
  '--ts-color-on-primary': 'Color',
  '--ts-color-on-error': 'Color',
  '--ts-glass-surface': 'Glass',
  '--ts-glass-opacity': 'Glass',
  '--ts-glass-blur': 'Glass',
  '--ts-glass-saturation': 'Glass',
  '--ts-glass-contrast': 'Glass',
  '--ts-backdrop-filter': 'Glass',
  '--ts-inner-highlight': 'Glass',
  '--ts-border-width': 'Border',
  '--ts-radius-control': 'Radius',
  '--ts-radius-sm': 'Radius',
  '--ts-radius-md': 'Radius',
  '--ts-radius-lg': 'Radius',
  '--ts-radius-xl': 'Radius',
  '--ts-radius-pill': 'Radius',
  '--ts-shadow-outer': 'Shadow',
  '--ts-shadow-inner': 'Shadow',
  '--ts-glow-color': 'Glow',
  '--ts-glow-border': 'Glow',
  '--ts-glow-button': 'Glow',
  '--ts-glow-hover': 'Glow',
  '--ts-glow-active': 'Glow',
  '--ts-glow-focus': 'Glow',
  '--ts-font-family': 'Typography',
  '--ts-font-mono': 'Typography',
  '--ts-font-size': 'Typography',
  '--ts-font-weight': 'Typography',
  '--ts-line-height': 'Typography',
  '--ts-letter-spacing': 'Typography',
  '--ts-duration': 'Animation',
  '--ts-duration-hover': 'Animation',
  '--ts-duration-focus': 'Animation',
  '--ts-duration-panel': 'Animation',
  '--ts-duration-dialog': 'Animation',
  '--ts-duration-glow': 'Animation'
}

export function listTokens(theme: ThemeDocument, render: RenderOptions = DEFAULT_RENDER): TokenEntry[] {
  return Object.entries(buildCssVariables(theme, render)).map(([name, value]) => ({
    name,
    value,
    group: GROUPS[name] ?? 'Other'
  }))
}

export function variablesToCss(selector: string, variables: Record<string, string>): string {
  const body = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
  return `${selector} {\n${body}\n}\n`
}
