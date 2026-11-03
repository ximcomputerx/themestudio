import type { ThemeDocument } from '../core/types'

export function exportThemeJson(theme: ThemeDocument): string {
  return `${JSON.stringify(theme, null, 2)}\n`
}
