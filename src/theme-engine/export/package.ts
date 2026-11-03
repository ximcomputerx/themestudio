import type { ThemeDocument } from '../core/types'
import { validateTheme } from '../validation/validate'
import { exportComponentsCss } from './components-css'
import { exportThemeJson } from './json'
import { exportReadme } from './readme'
import { exportShadcnCss } from './shadcn'
import { exportTailwindCss } from './tailwind'
import { exportVariablesCss } from './variables-css'

export interface ExportFile {
  path: string
  contents: string
}

export interface ThemePackage {
  files: ExportFile[]
  errors: string[]
  warnings: string[]
}

const REQUIRED = ['theme.json', 'variables.css', 'components.css', 'tailwind.css', 'shadcn.css', 'README.md'] as const

export type PackageFileName = (typeof REQUIRED)[number]

function braceError(path: string, contents: string): string | null {
  let depth = 0
  let quote: '"' | "'" | null = null
  for (let index = 0; index < contents.length; index += 1) {
    const char = contents[index]
    const previous = contents[index - 1]
    if (quote) {
      if (char === quote && previous !== '\\') quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth < 0) return `${path} has unbalanced braces`
  }
  if (quote) return `${path} has an unterminated string`
  if (depth !== 0) return `${path} has unbalanced braces`
  return null
}

export function verifyExportFile(file: ExportFile): string[] {
  const errors: string[] = []
  if (!file.contents.trim()) errors.push(`${file.path} is empty`)
  if (file.path.endsWith('.json')) {
    try {
      const parsed = JSON.parse(file.contents) as unknown
      if (!parsed || typeof parsed !== 'object') errors.push(`${file.path} must contain an object`)
    } catch {
      errors.push(`${file.path} is not valid JSON`)
    }
  }
  if (file.path.endsWith('.css')) {
    const braces = braceError(file.path, file.contents)
    if (braces) errors.push(braces)
    if (!file.contents.includes('--')) errors.push(`${file.path} is missing CSS variables`)
  }
  return errors
}

export function buildThemePackage(theme: ThemeDocument): ThemePackage {
  const validation = validateTheme(theme)
  if (!validation.ok) return { files: [], errors: validation.errors, warnings: [] }
  const files: ExportFile[] = [
    { path: 'theme.json', contents: exportThemeJson(validation.theme) },
    { path: 'variables.css', contents: exportVariablesCss(validation.theme) },
    { path: 'components.css', contents: exportComponentsCss(validation.theme) },
    { path: 'tailwind.css', contents: exportTailwindCss(validation.theme) },
    { path: 'shadcn.css', contents: exportShadcnCss(validation.theme) },
    { path: 'README.md', contents: exportReadme(validation.theme) }
  ]
  const errors = [
    ...files.flatMap(verifyExportFile),
    ...REQUIRED.filter((name) => !files.some((file) => file.path === name)).map((name) => `Missing ${name}`)
  ]
  if (!files.find((file) => file.path === 'tailwind.css')?.contents.includes('@theme')) {
    errors.push('tailwind.css is missing @theme')
  }
  const shadcn = files.find((file) => file.path === 'shadcn.css')?.contents ?? ''
  for (const token of ['--background', '--foreground', '--card', '--popover', '--primary', '--secondary', '--muted', '--accent', '--destructive', '--border', '--input', '--ring', '--glass-blur', '--neon-glow']) {
    if (!shadcn.includes(token)) errors.push(`shadcn.css is missing ${token}`)
  }
  if (!files.find((file) => file.path === 'README.md')?.contents.includes('React')) {
    errors.push('README.md does not explain React usage')
  }
  return { files, errors, warnings: validation.warnings }
}

export function exportFileByKind(theme: ThemeDocument, kind: PackageFileName): ExportFile {
  const pack = buildThemePackage(theme)
  const file = pack.files.find((item) => item.path === kind)
  if (!file || pack.errors.length > 0) {
    throw new Error(pack.errors[0] ?? `Unable to export ${kind}`)
  }
  return file
}
