import { app } from 'electron'
import { existsSync, readFileSync, renameSync } from 'node:fs'
import path from 'node:path'
import { PRESETS } from '@engine/presets'
import type { AppSettings, PreviewBackground, PreviewScene } from '@shared/ipc'
import { normalizeLanguagePreference } from '@shared/locale'
import { assertThemeId } from '@shared/path-guard'
import { DEFAULT_RENDER, type RenderOptions } from '@engine/core/types'
import { writeAtomic } from './file-service'

const SCENES: readonly PreviewScene[] = ['desktop', 'components', 'dialog', 'data', 'workspace']
const BACKGROUNDS: readonly PreviewBackground[] = ['solid', 'gradient', 'ambient', 'grid', 'custom']
const SHELL_PRESETS = new Set(PRESETS.map((preset) => preset.id))
const DEFAULT_SHELL_PRESET = 'neon-glass-blue'

export const DEFAULT_SETTINGS: AppSettings = {
  lastThemeId: null,
  recentIds: [],
  recentEnabled: true,
  render: { ...DEFAULT_RENDER },
  zoom: 1,
  scene: 'desktop',
  background: 'ambient',
  bottomOpen: true,
  language: 'system',
  hardwareAcceleration: true,
  shellPresetId: DEFAULT_SHELL_PRESET
}

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function renderOf(value: unknown): RenderOptions {
  const source = isRecord(value) ? value : {}
  return {
    glassEnabled: source.glassEnabled !== false,
    lowPerformance: source.lowPerformance === true,
    reducedMotion: source.reducedMotion === true
  }
}

export function normalizeSettings(input: unknown): AppSettings {
  const source = isRecord(input) ? input : {}
  const recentIds: string[] = []
  if (Array.isArray(source.recentIds)) {
    for (const id of source.recentIds) {
      try {
        const safe = assertThemeId(id)
        if (!recentIds.includes(safe)) recentIds.push(safe)
      } catch {
        // Drop malformed ids. They are not paths.
      }
    }
  }
  let lastThemeId: string | null = null
  if (typeof source.lastThemeId === 'string' && source.lastThemeId) {
    try {
      lastThemeId = assertThemeId(source.lastThemeId)
    } catch {
      lastThemeId = null
    }
  }
  const zoom = typeof source.zoom === 'number' && source.zoom >= 0.8 && source.zoom <= 1.5 ? source.zoom : 1
  const scene = SCENES.includes(source.scene as PreviewScene) ? (source.scene as PreviewScene) : 'desktop'
  const background = BACKGROUNDS.includes(source.background as PreviewBackground)
    ? (source.background as PreviewBackground)
    : 'ambient'
  return {
    lastThemeId,
    recentIds: recentIds.slice(0, 8),
    recentEnabled: source.recentEnabled !== false,
    render: renderOf(source.render),
    zoom,
    scene,
    background,
    bottomOpen: source.bottomOpen !== false,
    language: normalizeLanguagePreference(source.language),
    hardwareAcceleration: source.hardwareAcceleration !== false,
    shellPresetId: typeof source.shellPresetId === 'string' && SHELL_PRESETS.has(source.shellPresetId) ? source.shellPresetId : DEFAULT_SHELL_PRESET
  }
}

export function readSettings(): AppSettings {
  const file = settingsPath()
  if (!existsSync(file)) return { ...DEFAULT_SETTINGS, render: { ...DEFAULT_RENDER } }
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
    return normalizeSettings(parsed)
  } catch {
    const broken = path.join(app.getPath('userData'), 'settings.broken.json')
    try {
      renameSync(file, broken)
    } catch {
      // Keep going with defaults when the broken file cannot be moved.
    }
    return { ...DEFAULT_SETTINGS, render: { ...DEFAULT_RENDER } }
  }
}

export function writeSettings(input: unknown): AppSettings {
  const settings = normalizeSettings(input)
  writeAtomic(settingsPath(), `${JSON.stringify(settings, null, 2)}\n`)
  return settings
}

export function rememberTheme(id: string): AppSettings {
  const safe = assertThemeId(id)
  const current = readSettings()
  return writeSettings({
    ...current,
    lastThemeId: safe,
    recentIds: current.recentEnabled ? [safe, ...current.recentIds.filter((item) => item !== safe)].slice(0, 8) : current.recentIds
  })
}

export function forgetTheme(id: string): void {
  const safe = assertThemeId(id)
  const current = readSettings()
  writeSettings({
    ...current,
    lastThemeId: current.lastThemeId === safe ? null : current.lastThemeId,
    recentIds: current.recentIds.filter((item) => item !== safe)
  })
}
