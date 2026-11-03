import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInstance } from 'i18next'
import { describe, expect, it } from 'vitest'
import { exportThemeJson } from '@engine/export/json'
import { exportVariablesCss } from '@engine/export/variables-css'
import { instantiatePreset } from '@engine/core/document'
import { presetById } from '@engine/presets'
import { describeRelative, formatDate, formatFileSize, formatNumber, formatPercent } from '../src/i18n/format'
import { describeError } from '../src/i18n/localize'
import { NAMESPACES } from '../src/i18n/config'
import { resources, translate } from '../src/i18n/resources'
import { mapSystemLocale, normalizeLanguagePreference, resolveLanguage } from '../src/shared/locale'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

describe('language resolution', () => {
  it('maps system locales and keeps a manual choice ahead of the system', () => {
    expect(mapSystemLocale('zh-CN')).toBe('zh-CN')
    expect(mapSystemLocale('zh-Hans')).toBe('zh-CN')
    expect(mapSystemLocale('zh-Hans-CN')).toBe('zh-CN')
    expect(mapSystemLocale('zh')).toBe('zh-CN')
    expect(mapSystemLocale('zh_CN')).toBe('zh-CN')
    expect(mapSystemLocale('en-US')).toBe('en-US')
    expect(mapSystemLocale('en-GB')).toBe('en-US')
    expect(mapSystemLocale('en')).toBe('en-US')
    expect(mapSystemLocale('fr-FR')).toBe('en-US')
    expect(mapSystemLocale('zh-TW')).toBe('en-US')
    expect(mapSystemLocale('zh-Hant')).toBe('en-US')
    expect(resolveLanguage('system', 'zh-CN')).toBe('zh-CN')
    expect(resolveLanguage('system', 'ja-JP')).toBe('en-US')
    expect(resolveLanguage('en-US', 'zh-CN')).toBe('en-US')
    expect(resolveLanguage('zh-CN', 'en-US')).toBe('zh-CN')
    expect(normalizeLanguagePreference('nope')).toBe('system')
    expect(normalizeLanguagePreference('zh-CN')).toBe('zh-CN')
  })
})

describe('intl formatting', () => {
  it('formats dates, relative time, percents, and file sizes without changing token numbers', () => {
    expect(formatDate('2026-10-31T12:00:00.000Z', 'zh-CN', 'UTC')).toBe('2026年10月31日')
    expect(formatDate('2026-10-31T12:00:00.000Z', 'en-US', 'UTC')).toBe('Oct 31, 2026')
    expect(describeRelative('2026-10-31T12:00:00.000Z', 'zh-CN', Date.parse('2026-10-31T12:00:10.000Z'))).toEqual({ kind: 'now' })
    expect(describeRelative('2026-10-31T12:00:00.000Z', 'en-US', Date.parse('2026-10-31T12:00:10.000Z'))).toEqual({ kind: 'now' })
    expect(formatPercent(1.5, 'zh-CN')).toBe('150%')
    expect(formatPercent(1.5, 'en-US')).toBe('150%')
    expect(formatNumber(0.68, 'zh-CN', 2)).toBe('0.68')
    expect(formatNumber(0.68, 'en-US', 2)).toBe('0.68')
    expect(formatNumber(16, 'en-US', 0)).toBe('16')
    expect(formatFileSize(4096, 'en-US')).toMatch(/4/)
    expect(formatFileSize(4096, 'zh-CN')).toMatch(/4/)
  })
})

describe('translation resources', () => {
  const locales = path.join(root, 'src/i18n/locales')

  it('keeps zh-CN and en-US key trees, interpolation, and plural forms aligned', () => {
    const zhFiles = readdirSync(path.join(locales, 'zh-CN')).sort()
    const enFiles = readdirSync(path.join(locales, 'en-US')).sort()
    expect(zhFiles).toEqual(enFiles)
    expect(zhFiles.map((file) => file.replace(/\.json$/, ''))).toEqual([...NAMESPACES].sort())
    for (const file of zhFiles) {
      const zh = readFileSync(path.join(locales, 'zh-CN', file), 'utf8')
      const en = readFileSync(path.join(locales, 'en-US', file), 'utf8')
      expect(duplicateKeys(zh), file).toEqual([])
      expect(duplicateKeys(en), file).toEqual([])
      const zhTree = flatten(JSON.parse(zh) as unknown)
      const enTree = flatten(JSON.parse(en) as unknown)
      expect(Object.keys(zhTree).sort(), file).toEqual(Object.keys(enTree).sort())
      for (const key of Object.keys(zhTree)) {
        expect(zhTree[key]?.trim().length, `${file} zh ${key}`).toBeGreaterThan(0)
        expect(enTree[key]?.trim().length, `${file} en ${key}`).toBeGreaterThan(0)
        expect(placeholders(zhTree[key] ?? ''), `${file} ${key}`).toEqual(placeholders(enTree[key] ?? ''))
      }
    }
  })

  it('pluralizes export counts and translates menu labels without touching theme tokens', async () => {
    expect(translate('zh-CN', 'navigation:menu.file')).toBe('文件')
    expect(translate('en-US', 'navigation:menu.file')).toBe('File')
    expect(translate('zh-CN', 'messages:aboutDetail', { version: '1.0.0' })).toContain('1.0.0')
    const instance = createInstance()
    await instance.init({
      resources,
      lng: 'en-US',
      fallbackLng: 'en-US',
      ns: [...NAMESPACES],
      defaultNS: 'common',
      interpolation: { escapeValue: false }
    })
    expect(instance.t('messages:exportSuccess', { count: 1 })).toBe('Exported 1 file successfully.')
    expect(instance.t('messages:exportSuccess', { count: 2 })).toBe('Exported 2 files successfully.')
    await instance.changeLanguage('zh-CN')
    expect(instance.t('messages:exportSuccess', { count: 2 })).toBe('成功导出 2 个文件。')
    expect(instance.t('glass:opacity')).toBe('玻璃透明度')
  })

  it('localizes known errors and leaves token names intact', () => {
    const t = (key: string, values?: Record<string, string>) => translate('zh-CN', key, values)
    expect(describeError('code:themeNotFound', t)).toBe('找不到主题')
    expect(describeError('glass.blur must be between 0 and 40', t)).toContain('glass.blur')
    expect(describeError('glass.blur must be between 0 and 40', t)).toContain('0')
    expect(describeError('glass.blur must be between 0 and 40', t)).not.toContain('must be between')
    expect(describeError('Unsupported schemaVersion. Expected 1', t)).toContain('1')
  })

  it('keeps theme export independent from the interface language', () => {
    const theme = instantiatePreset(presetById('neon-glass-blue'), {
      id: '11111111-1111-4111-8111-111111111111',
      now: '2026-01-01T00:00:00.000Z'
    })
    const json = exportThemeJson(theme)
    const css = exportVariablesCss(theme)
    expect(json).toContain('"opacity": 0.68')
    expect(json).not.toContain('玻璃')
    expect(json).not.toContain('Glass Opacity')
    expect(css).toContain('--ts-glass-opacity: 0.68')
    expect(css).not.toContain('玻璃透明度')
    const engineRoot = path.join(root, 'src/theme-engine')
    for (const file of walk(engineRoot)) {
      if (!file.endsWith('.ts')) continue
      const source = readFileSync(file, 'utf8')
      expect(source).not.toContain('i18next')
      expect(source).not.toContain('react-i18next')
    }
  })
})

function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const result: Record<string, string> = {}
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}.${key}` : key
    Object.assign(result, flatten(child, next))
  }
  return result
}

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{\{\s*([\w.]+)\s*\}\}/g)].map((match) => match[1] ?? '').sort()
}

function duplicateKeys(source: string): string[] {
  const duplicates: string[] = []
  const stack: Array<Map<string, number>> = []
  const token = /"(?:\\.|[^"\\])*"|[[\]{}]/g
  let match: RegExpExecArray | null
  while ((match = token.exec(source))) {
    const current = match[0]
    if (current === '{') stack.push(new Map())
    else if (current === '}') stack.pop()
    else if (current === '[' || current === ']') continue
    else if (current.startsWith('"') && stack.length > 0 && /^\s*:/.test(source.slice(token.lastIndex))) {
      const key = JSON.parse(current) as string
      const level = stack[stack.length - 1]
      if (!level) continue
      const count = (level.get(key) ?? 0) + 1
      level.set(key, count)
      if (count > 1) duplicates.push(key)
    }
  }
  return duplicates
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return [full]
  })
}
