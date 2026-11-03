import { canonicalColor, contrastText, withAlpha } from '../color/color'
import type { ThemeDocument } from '../core/types'
import { buildCssVariables } from '../tokens/css-variables'

function color(value: string): string {
  return canonicalColor(value) ?? value
}

export function exportTailwindCss(theme: ThemeDocument): string {
  const vars = buildCssVariables(theme)
  const name = theme.meta.name.replace(/\*\//g, '').replace(/\/\*/g, '').slice(0, 80)
  return `/* Theme Studio — Tailwind CSS v4
   ${name}
   Import once in the app stylesheet. @theme tokens are inlined so the file is portable.
*/
@import "tailwindcss";

@theme {
  --color-background: ${color(theme.colors.appBackground)};
  --color-foreground: ${color(theme.colors.textPrimary)};
  --color-card: ${color(theme.colors.elevatedSurface)};
  --color-card-foreground: ${color(theme.colors.textPrimary)};
  --color-popover: ${color(theme.colors.glassPopup)};
  --color-popover-foreground: ${color(theme.colors.textPrimary)};
  --color-primary: ${color(theme.colors.primary)};
  --color-primary-foreground: ${contrastText(theme.colors.primary)};
  --color-secondary: ${color(theme.colors.secondaryBackground)};
  --color-secondary-foreground: ${color(theme.colors.textPrimary)};
  --color-muted: ${color(theme.colors.workspaceBackground)};
  --color-muted-foreground: ${color(theme.colors.textMuted)};
  --color-accent: ${color(theme.colors.accent)};
  --color-accent-foreground: ${contrastText(theme.colors.accent)};
  --color-destructive: ${color(theme.colors.error)};
  --color-destructive-foreground: ${contrastText(theme.colors.error)};
  --color-border: ${withAlpha(theme.colors.border, theme.border.opacity)};
  --color-input: ${withAlpha(theme.colors.border, Math.min(1, theme.border.opacity + 0.08))};
  --color-ring: ${color(theme.colors.primary)};
  --color-success: ${color(theme.colors.success)};
  --color-warning: ${color(theme.colors.warning)};
  --color-info: ${color(theme.colors.info)};
  --radius-sm: ${theme.radius.sm}px;
  --radius-md: ${theme.radius.md}px;
  --radius-lg: ${theme.radius.lg}px;
  --radius-xl: ${theme.radius.xl}px;
  --shadow-panel: ${vars['--ts-shadow-outer']};
  --font-sans: ${theme.typography.fontFamily};
  --font-mono: ${theme.typography.monoFamily};
}

@utility glass-panel {
  background: ${vars['--ts-glass-surface']};
  border: ${theme.border.width}px solid ${vars['--ts-color-glass-border']};
  border-radius: ${theme.radius.lg}px;
  box-shadow: ${vars['--ts-shadow-outer']}, inset 0 1px 0 ${vars['--ts-inner-highlight']};
  backdrop-filter: ${vars['--ts-backdrop-filter']};
  -webkit-backdrop-filter: ${vars['--ts-backdrop-filter']};
}

@utility neon-ring {
  box-shadow: ${vars['--ts-glow-focus']};
}
`
}
