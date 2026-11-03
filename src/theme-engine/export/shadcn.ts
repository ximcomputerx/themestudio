import { canonicalColor, contrastText, withAlpha } from '../color/color'
import type { ThemeDocument } from '../core/types'
import { buildCssVariables } from '../tokens/css-variables'

function color(value: string): string {
  return canonicalColor(value) ?? value
}

export function exportShadcnCss(theme: ThemeDocument): string {
  const vars = buildCssVariables(theme)
  const border = withAlpha(theme.colors.border, theme.border.opacity)
  const name = theme.meta.name.replace(/\*\//g, '').replace(/\/\*/g, '').slice(0, 80)
  return `/* Theme Studio — shadcn/ui theme
   ${name}
   Paste the :root block into your global stylesheet.
   Glass and neon extensions stay beside the shadcn names.
*/
:root {
  --background: ${color(theme.colors.appBackground)};
  --foreground: ${color(theme.colors.textPrimary)};
  --card: ${color(theme.colors.elevatedSurface)};
  --card-foreground: ${color(theme.colors.textPrimary)};
  --popover: ${color(theme.colors.glassPopup)};
  --popover-foreground: ${color(theme.colors.textPrimary)};
  --primary: ${color(theme.colors.primary)};
  --primary-foreground: ${contrastText(theme.colors.primary)};
  --secondary: ${color(theme.colors.secondaryBackground)};
  --secondary-foreground: ${color(theme.colors.textPrimary)};
  --muted: ${color(theme.colors.workspaceBackground)};
  --muted-foreground: ${color(theme.colors.textMuted)};
  --accent: ${color(theme.colors.accent)};
  --accent-foreground: ${contrastText(theme.colors.accent)};
  --destructive: ${color(theme.colors.error)};
  --destructive-foreground: ${contrastText(theme.colors.error)};
  --border: ${border};
  --input: ${border};
  --ring: ${color(theme.colors.primary)};
  --radius: ${theme.radius.md}px;
  --glass-blur: ${vars['--ts-glass-blur']};
  --glass-opacity: ${vars['--ts-glass-opacity']};
  --glass-surface: ${vars['--ts-glass-surface']};
  --glass-border: ${vars['--ts-color-glass-border']};
  --neon-color: ${vars['--ts-glow-color']};
  --neon-glow: ${vars['--ts-glow-button']};
  --neon-focus: ${vars['--ts-glow-focus']};
}
`
}
