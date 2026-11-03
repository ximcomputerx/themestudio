import { app, dialog } from 'electron'
import { translate } from '@i18n/resources'
import { resolveLanguage } from '@shared/locale'
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { duplicateTheme, retokenFromPreset, slugify } from '@engine/core/document'
import type { ThemeDocument } from '@engine/core/types'
import { exportThemeJson } from '@engine/export/json'
import { presetById } from '@engine/presets'
import { validateTheme } from '@engine/validation/validate'
import type { ThemeSummary } from '@shared/ipc'
import { assertThemeId, themeFilePath } from '@shared/path-guard'
import { ensureDir, writeAtomic } from './file-service'
import { forgetTheme, readSettings, rememberTheme } from './settings-service'

function dialogTitle(key: string): string {
  return translate(resolveLanguage(readSettings().language, app.getLocale()), key)
}

const MAX_THEME_BYTES = 1_000_000

export function themesDirectory(): string {
  return ensureDir(path.join(app.getPath('userData'), 'themes'))
}

function requireTheme(input: unknown): ThemeDocument {
  const result = validateTheme(input)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.theme
}

function readThemeFile(id: string): { theme?: ThemeDocument; error?: string } {
  const file = themeFilePath(themesDirectory(), id)
  if (!existsSync(file)) throw new Error('code:themeNotFound')
  const stat = statSync(file)
  if (stat.size > MAX_THEME_BYTES) return { error: 'code:themeTooLarge' }
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
    const result = validateTheme(parsed)
    if (!result.ok) return { error: result.errors.join('\n') }
    return { theme: result.theme }
  } catch {
    return { error: 'code:themeInvalidJson' }
  }
}

function summaryFromBroken(id: string, file: string, error: string): ThemeSummary {
  let updatedAt = new Date().toISOString()
  try {
    updatedAt = statSync(file).mtime.toISOString()
  } catch {
    // Keep the fallback timestamp.
  }
  return { id, name: id, presetId: null, favorite: false, updatedAt, broken: true, error }
}

export function listThemes(): ThemeSummary[] {
  const dir = themesDirectory()
  const summaries: ThemeSummary[] = []
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json') || name.startsWith('.')) continue
    const id = name.slice(0, -5)
    try {
      assertThemeId(id)
    } catch {
      continue
    }
    const file = themeFilePath(dir, id)
    const loaded = readThemeFile(id)
    if (!loaded.theme) {
      summaries.push(summaryFromBroken(id, file, loaded.error ?? 'code:themeUnreadable'))
      continue
    }
    summaries.push({
      id: loaded.theme.meta.id,
      name: loaded.theme.meta.name,
      presetId: loaded.theme.meta.presetId,
      favorite: loaded.theme.meta.favorite,
      updatedAt: loaded.theme.meta.updatedAt,
      broken: false
    })
  }
  summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return summaries
}

export function readTheme(id: unknown): ThemeDocument {
  const safe = assertThemeId(id)
  const loaded = readThemeFile(safe)
  if (!loaded.theme) throw new Error(loaded.error ?? 'code:themeUnreadable')
  rememberTheme(loaded.theme.meta.id)
  return loaded.theme
}

export function saveTheme(input: unknown): ThemeDocument {
  const theme = requireTheme(input)
  writeAtomic(themeFilePath(themesDirectory(), theme.meta.id), exportThemeJson(theme))
  rememberTheme(theme.meta.id)
  return theme
}

export function saveThemeAs(input: unknown, name: unknown): ThemeDocument {
  if (typeof name !== 'string' || !name.trim()) throw new Error('code:themeNameRequired')
  const source = requireTheme(input)
  const copy = duplicateTheme(source)
  copy.meta.name = name.trim().slice(0, 80)
  return saveTheme(copy)
}

export function duplicateStoredTheme(id: unknown): ThemeDocument {
  const source = readTheme(id)
  return saveTheme(duplicateTheme(source))
}

export function renameTheme(id: unknown, name: unknown): ThemeDocument {
  if (typeof name !== 'string' || !name.trim()) throw new Error('code:themeNameRequired')
  const theme = readTheme(id)
  theme.meta.name = name.trim().slice(0, 80)
  theme.meta.updatedAt = new Date().toISOString()
  return saveTheme(theme)
}

export function deleteTheme(id: unknown): void {
  const safe = assertThemeId(id)
  const file = themeFilePath(themesDirectory(), safe)
  if (!existsSync(file)) throw new Error('code:themeNotFound')
  unlinkSync(file)
  forgetTheme(safe)
}

export function restoreDefaultTheme(id: unknown): ThemeDocument {
  const theme = readTheme(id)
  const preset = presetById(theme.meta.presetId)
  return saveTheme(retokenFromPreset(theme, preset))
}

export async function importTheme(): Promise<ThemeDocument> {
  const picked = await dialog.showOpenDialog({
    title: dialogTitle('export:dialogImport'),
    properties: ['openFile'],
    filters: [{ name: dialogTitle('export:dialogJson'), extensions: ['json'] }]
  })
  if (picked.canceled || !picked.filePaths[0]) throw new Error('code:importCanceled')
  const file = picked.filePaths[0]
  const stat = statSync(file)
  if (!stat.isFile()) throw new Error('code:importNotFile')
  if (stat.size > MAX_THEME_BYTES) throw new Error('code:themeTooLarge')
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    throw new Error('code:themeInvalidJson')
  }
  const result = validateTheme(parsed)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  const imported = duplicateTheme(result.theme)
  imported.meta.name = result.theme.meta.name
  imported.meta.favorite = false
  return saveTheme(imported)
}

export function safeExportName(theme: ThemeDocument, extension: string): string {
  return `${slugify(theme.meta.name)}.${extension}`
}
