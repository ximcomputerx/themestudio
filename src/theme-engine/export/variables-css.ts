import type { ThemeDocument } from '../core/types'
import { DEFAULT_RENDER } from '../core/types'
import { buildCssVariables, variablesToCss } from '../tokens/css-variables'

function safeName(value: string): string {
  return value.replace(/\*\//g, '').replace(/\/\*/g, '').slice(0, 80)
}

export function exportVariablesCss(theme: ThemeDocument): string {
  const header = `/* Theme Studio variables — ${safeName(theme.meta.name)}\n   Schema ${theme.schemaVersion}. Import this file before components.css.\n*/\n`
  return header + variablesToCss(':root', buildCssVariables(theme, DEFAULT_RENDER))
}
