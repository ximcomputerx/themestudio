import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { contrastText, parseColor, relativeLuminance, toHex, withAlpha } from '../src/theme-engine/color/color'
import { instantiatePreset, signature } from '../src/theme-engine/core/document'
import { highlightCode } from '../src/theme-engine/export/highlight'
import { buildThemePackage } from '../src/theme-engine/export/package'
import { listZipEntries, zipThemePackage } from '../src/theme-engine/export/zip'
import { translate } from '../src/i18n/resources'
import { PRESETS, presetById, presetCatalog } from '../src/theme-engine/presets'
import { buildCssVariables } from '../src/theme-engine/tokens/css-variables'
import { validateTheme } from '../src/theme-engine/validation/validate'
import { MENU_ACTIONS } from '../src/shared/ipc'
import { imageMime, themeFilePath } from '../src/shared/path-guard'
import { commitHistory, endGesture, redoHistory, undoHistory } from '../src/store/history'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function contrastRatio(foreground: string, background: string): number {
  const left = relativeLuminance(foreground)
  const right = relativeLuminance(background)
  const [hi, lo] = left > right ? [left, right] : [right, left]
  return (hi + 0.05) / (lo + 0.05)
}

describe('color', () => {
  it('parses the Neon Glass Blue defaults', () => {
    expect(toHex(parseColor('#3B82F6')!)).toBe('#3B82F6')
    expect(toHex(parseColor('rgba(16, 28, 46, 0.68)')!, true)).toBe('#101C2EAD')
    expect(parseColor('hsl(217, 91%, 60%)')?.b).toBeGreaterThan(200)
    expect(withAlpha('#3B82F6', 0.5)).toContain('0.5')
    expect(contrastText('#3B82F6')).toBe('#F8FBFF')
  })
})

describe('presets and validation', () => {
  it('accepts every preset and keeps the Neon Glass Blue palette', () => {
    for (const preset of PRESETS) {
      const theme = instantiatePreset(preset, { id: '11111111-1111-4111-8111-111111111111', now: '2026-01-01T00:00:00.000Z' })
      const result = validateTheme(theme)
      expect(result.ok).toBe(true)
    }
    const neon = instantiatePreset(presetById('neon-glass-blue'), {
      id: '11111111-1111-4111-8111-111111111111',
      now: '2026-01-01T00:00:00.000Z'
    })
    expect(neon.colors.primary).toBe('#3B82F6')
    expect(neon.colors.appBackground).toBe('#070B12')
    expect(neon.glass.opacity).toBe(0.68)
    expect(neon.glass.blur).toBe(16)
    expect(neon.glow.color).toBe('#38BDF8')
    expect(presetById('missing-preset').id).toBe('neon-glass-blue')
    expect(PRESETS.map((preset) => preset.id)).toEqual([
      'neon-glass-blue',
      'futuristic-electric-blue',
      'cyan-holographic',
      'dark-glass-professional',
      'minimal-dark-blue',
      'aurora-glass',
      'cyberpunk-violet',
      'arctic-frost',
      'obsidian-mono',
      'emerald-matrix',
      'amber-industrial',
      'nordic-light',
      'pure-white',
      'soft-gray',
      'warm-sand',
      'mist-blue',
      'sage-calm'
    ])
    for (const preset of PRESETS) {
      expect(MENU_ACTIONS).toContain(`preset:${preset.id}`)
      expect(translate('en-US', `theme-library:presets.${preset.id}.name`)).toBe(preset.name)
      expect(translate('en-US', `theme-library:presets.${preset.id}.description`)).toBe(preset.description)
      expect(presetCatalog(preset.id).mode === 'light' || presetCatalog(preset.id).mode === 'dark').toBe(true)
    }
    expect(presetById('futuristic-electric-blue').tokens.colors.primary).toBe('#2563EB')
    expect(presetById('cyan-holographic').tokens.colors.primary).toBe('#22D3EE')
    expect(presetById('dark-glass-professional').tokens.glass.opacity).toBe(0.82)
    expect(presetById('minimal-dark-blue').tokens.glow.level).toBe('off')
  })

  it('keeps the seven added presets on their own palettes', () => {
    const spec = {
      'aurora-glass': ['#071316', '#0C2024', '#14B8A6', '#22D3EE', '#A3E635', '#E6F4F1', '#28504D', '#2DD4BF', 0.62, 18, 0.24],
      'cyberpunk-violet': ['#0D0A18', '#171128', '#8B5CF6', '#EC4899', '#22D3EE', '#F1EDFF', '#49336D', '#A78BFA', 0.65, 18, 0.42],
      'arctic-frost': ['#EAF3FA', '#F6FAFE', '#2563EB', '#38BDF8', '#0EA5E9', '#132238', '#B8D2E8', '#60A5FA', 0.72, 14, 0.16],
      'obsidian-mono': ['#090A0C', '#131519', '#E5E7EB', '#9CA3AF', '#FFFFFF', '#F3F4F6', '#343A40', '#D1D5DB', 0.82, 8, 0.04],
      'emerald-matrix': ['#06110B', '#0B1B12', '#10B981', '#34D399', '#A3E635', '#E5F5EA', '#24533B', '#10B981', 0.58, 14, 0.85],
      'amber-industrial': ['#15120C', '#211B11', '#F59E0B', '#FBBF24', '#F97316', '#F5EBDD', '#5B4726', '#F59E0B', 0.65, 12, 0.85],
      'nordic-light': ['#F4F6F8', '#FFFFFF', '#3B82F6', '#64748B', '#0F766E', '#172033', '#D8E0EA', '#60A5FA', 0.78, 12, 0.08]
    } as const
    for (const [id, values] of Object.entries(spec)) {
      const tokens = presetById(id).tokens
      expect(tokens.colors.appBackground).toBe(values[0])
      expect(tokens.colors.panelBackground).toBe(values[1])
      expect(tokens.colors.primary).toBe(values[2])
      expect(tokens.colors.secondary).toBe(values[3])
      expect(tokens.colors.accent).toBe(values[4])
      expect(tokens.colors.textPrimary).toBe(values[5])
      expect(tokens.typography.textColor).toBe(values[5])
      expect(tokens.colors.border).toBe(values[6])
      expect(tokens.glow.color).toBe(values[7])
      expect(tokens.glass.opacity).toBe(values[8])
      expect(tokens.glass.blur).toBe(values[9])
      expect(tokens.glow.intensity).toBe(values[10])
      expect(tokens).not.toBe(presetById('neon-glass-blue').tokens)
    }
    expect(presetById('neon-glass-blue').tokens.colors.primary).toBe('#3B82F6')
    expect(presetById('cyberpunk-violet').tokens.colors.secondary).not.toBe(presetById('aurora-glass').tokens.colors.secondary)

    const stamp = { id: '11111111-1111-4111-8111-111111111111', now: '2026-01-01T00:00:00.000Z' }
    const arcticVars = buildCssVariables(instantiatePreset(presetById('arctic-frost'), stamp))
    expect(arcticVars['--ts-glass-opacity']).toBe('0.72')
    expect(arcticVars['--ts-glass-blur']).toBe('14px')
    expect(arcticVars['--ts-color-text']).toBe('#132238')
    expect(arcticVars['--ts-color-primary']).toBe('#2563EB')
    const arcticPack = buildThemePackage(instantiatePreset(presetById('arctic-frost'), stamp))
    expect(arcticPack.files[0]?.contents).toContain('"primary": "#2563EB"')
    expect(arcticPack.files[0]?.contents).not.toContain('玻璃')
    expect(buildCssVariables(instantiatePreset(presetById('obsidian-mono'), stamp))['--ts-glow-border']).toBe('none')
    expect(buildCssVariables(instantiatePreset(presetById('cyberpunk-violet'), stamp))['--ts-color-primary']).toBe('#8B5CF6')
    expect(presetById('pure-white').tokens.colors.primary).not.toBe(presetById('neon-glass-blue').tokens.colors.primary)

    const addedIds = Object.keys(spec)
    const lightIds = ['arctic-frost', 'nordic-light']
    for (const preset of PRESETS) {
      const colors = preset.tokens.colors
      const textFloor = lightIds.includes(preset.id) ? 7 : 4.5
      expect(contrastRatio(colors.textPrimary, colors.appBackground), `${preset.id} text on background`).toBeGreaterThanOrEqual(textFloor)
      expect(contrastRatio(colors.textPrimary, colors.panelBackground), `${preset.id} text on surface`).toBeGreaterThanOrEqual(textFloor)
      if (!addedIds.includes(preset.id)) continue
      expect(contrastRatio(colors.textSecondary, colors.panelBackground), `${preset.id} secondary text`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(colors.textMuted, colors.panelBackground), `${preset.id} muted text`).toBeGreaterThanOrEqual(4.5)
      if (lightIds.includes(preset.id)) {
        for (const status of [colors.success, colors.warning, colors.error, colors.info]) {
          expect(contrastRatio(status, colors.panelBackground), `${preset.id} status`).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  })

  it('keeps the five lightweight presets distinct, readable, and off the neon path', () => {
    const spec = {
      'pure-white': ['#F7F9FC', '#FFFFFF', '#FFFFFF', '#2563EB', '#64748B', '#0EA5E9', '#172033', '#64748B', '#E5EAF1', '#60A5FA', 0.92, 4, 105, 0.5, 0.08, 0.02, 3],
      'soft-gray': ['#F1F3F5', '#F8F9FA', '#FFFFFF', '#475569', '#64748B', '#0F766E', '#202833', '#636E7D', '#DCE1E7', '#94A3B8', 0.9, 6, 100, 0.45, 0.04, 0.02, 3],
      'warm-sand': ['#F6F1E8', '#FFFCF6', '#FFFFFF', '#9A6B45', '#B08968', '#7C8A63', '#382F27', '#776B5E', '#E7DCCB', '#C49A6C', 0.9, 5, 105, 0.42, 0.06, 0.03, 3],
      'mist-blue': ['#EFF5FA', '#F8FBFE', '#FFFFFF', '#4F7FB8', '#7FA6C9', '#4C9A9A', '#1E3348', '#5E7083', '#D7E4EF', '#79A9D8', 0.88, 8, 110, 0.42, 0.08, 0.04, 4],
      'sage-calm': ['#F1F5EF', '#FAFCF8', '#FFFFFF', '#66856D', '#8FAE93', '#A18A62', '#26362B', '#657267', '#DCE6DA', '#8FB69A', 0.9, 6, 105, 0.4, 0.06, 0.025, 3]
    } as const
    const signatures = new Set<string>()
    const stamp = { id: '11111111-1111-4111-8111-111111111111', now: '2026-01-01T00:00:00.000Z' }
    for (const [id, values] of Object.entries(spec)) {
      const preset = presetById(id)
      const tokens = preset.tokens
      expect(preset.name).toBe(translate('en-US', `theme-library:presets.${id}.name`))
      expect(preset.description).toBe(translate('en-US', `theme-library:presets.${id}.description`))
      expect(translate('zh-CN', `theme-library:presets.${id}.name`)).not.toBe(preset.name)
      expect(tokens.colors.appBackground).toBe(values[0])
      expect(tokens.colors.panelBackground).toBe(values[1])
      expect(tokens.colors.elevatedSurface).toBe(values[2])
      expect(tokens.colors.primary).toBe(values[3])
      expect(tokens.colors.secondary).toBe(values[4])
      expect(tokens.colors.accent).toBe(values[5])
      expect(tokens.colors.textPrimary).toBe(values[6])
      expect(tokens.typography.textColor).toBe(values[6])
      expect(tokens.colors.textMuted).toBe(values[7])
      expect(tokens.colors.border).toBe(values[8])
      expect(tokens.border.color).toBe(values[8])
      expect(tokens.glow.color).toBe(values[9])
      expect(tokens.glass.opacity).toBe(values[10])
      expect(tokens.glass.blur).toBe(values[11])
      expect(tokens.glass.saturation).toBe(values[12])
      expect(tokens.glass.borderOpacity).toBe(values[13])
      expect(tokens.glass.innerHighlight).toBe(values[14])
      expect(tokens.glow.intensity).toBe(values[15])
      expect(tokens.glow.radius).toBe(values[16])
      expect(tokens.glow.border).toBe(false)
      expect(tokens.glow.button).toBe(false)
      expect(presetCatalog(id).styles).toEqual(['lightweight'])
      expect(presetCatalog(id).mode).toBe('light')
      const theme = instantiatePreset(preset, stamp)
      expect(validateTheme(theme).ok).toBe(true)
      const variables = buildCssVariables(theme)
      expect(variables['--ts-glass-opacity']).toBe(String(values[10]))
      expect(variables['--ts-glass-blur']).toBe(`${values[11]}px`)
      expect(variables['--ts-color-text']).toBe(values[6])
      expect(variables['--ts-glow-border']).toBe('none')
      expect(variables['--ts-glow-button']).toBe('none')
      const pack = buildThemePackage(theme)
      expect(pack.errors).toEqual([])
      expect(pack.files.map((file) => file.path)).toEqual(['theme.json', 'variables.css', 'components.css', 'tailwind.css', 'shadcn.css', 'README.md'])
      expect(pack.files.find((file) => file.path === 'theme.json')?.contents).toContain(`"primary": "${values[3]}"`)
      expect(pack.files.find((file) => file.path === 'theme.json')?.contents).not.toContain('纯白')
      expect(pack.files.find((file) => file.path === 'variables.css')?.contents).toContain('--ts-color-primary')
      expect(pack.files.find((file) => file.path === 'tailwind.css')?.contents).toContain('@theme')
      expect(pack.files.find((file) => file.path === 'shadcn.css')?.contents).toContain('--primary')
      const surfaces = [tokens.colors.appBackground, tokens.colors.panelBackground, tokens.colors.elevatedSurface, tokens.colors.sidebarBackground]
      for (const surface of surfaces) {
        expect(contrastRatio(tokens.colors.textPrimary, surface), `${id} text`).toBeGreaterThanOrEqual(4.5)
        expect(contrastRatio(tokens.colors.textSecondary, surface), `${id} secondary`).toBeGreaterThanOrEqual(4.5)
        expect(contrastRatio(tokens.colors.textMuted, surface), `${id} muted`).toBeGreaterThanOrEqual(4.5)
        for (const status of [tokens.colors.success, tokens.colors.warning, tokens.colors.error, tokens.colors.info]) {
          expect(contrastRatio(status, surface), `${id} status`).toBeGreaterThanOrEqual(4.5)
        }
      }
      signatures.add(JSON.stringify(tokens))
      expect(tokens).not.toBe(presetById('neon-glass-blue').tokens)
    }
    expect(signatures.size).toBe(5)
    expect(presetById('neon-glass-blue').tokens.colors.primary).toBe('#3B82F6')
    expect(presetById('nordic-light').tokens.colors.appBackground).toBe('#F4F6F8')
  })

  it('rejects a bad version, a bad type, and an out-of-range value without repairing them', () => {
    const theme = instantiatePreset(presetById('neon-glass-blue'), {
      id: '11111111-1111-4111-8111-111111111111',
      now: '2026-01-01T00:00:00.000Z'
    })
    expect(validateTheme({ ...theme, schemaVersion: 9 }).ok).toBe(false)
    expect(validateTheme({ ...theme, glass: { ...theme.glass, blur: 80 } }).ok).toBe(false)
    expect(validateTheme({ ...theme, colors: { ...theme.colors, primary: 'blue' } }).ok).toBe(false)
    expect(validateTheme('{').ok).toBe(false)
  })
})

describe('css variables and export', () => {
  it('updates variables when a token changes and builds a valid package', async () => {
    const theme = instantiatePreset(presetById('neon-glass-blue'), {
      id: '11111111-1111-4111-8111-111111111111',
      now: '2026-01-01T00:00:00.000Z'
    })
    const before = buildCssVariables(theme)
    const edited = { ...theme, colors: { ...theme.colors, primary: '#FF00AA' }, glass: { ...theme.glass, blur: 4, opacity: 0.4 } }
    const after = buildCssVariables(edited)
    expect(before['--ts-color-primary']).toBe('#3B82F6')
    expect(after['--ts-color-primary']).toBe('#FF00AA')
    expect(after['--ts-glass-blur']).toBe('4px')
    expect(after['--ts-backdrop-filter']).toContain('blur(4px)')
    const flat = buildCssVariables({ ...edited, glass: { ...edited.glass, blur: 0 } }, { glassEnabled: false, lowPerformance: true, reducedMotion: true })
    expect(flat['--ts-backdrop-filter']).toBe('none')
    expect(flat['--ts-duration']).toBe('0ms')

    const pack = buildThemePackage(theme)
    expect(pack.errors).toEqual([])
    expect(pack.files.map((file) => file.path)).toEqual(['theme.json', 'variables.css', 'components.css', 'tailwind.css', 'shadcn.css', 'README.md'])
    expect(pack.files[0]?.contents).toContain('"schemaVersion": 1')
    expect(pack.files.find((file) => file.path === 'tailwind.css')?.contents).toContain('@theme')
    expect(pack.files.find((file) => file.path === 'shadcn.css')?.contents).toContain('--primary')
    expect(pack.files.find((file) => file.path === 'shadcn.css')?.contents).toContain('--neon-glow')
    expect(pack.files.find((file) => file.path === 'README.md')?.contents).toContain('React')

    const zip = await zipThemePackage(pack.files)
    expect(await listZipEntries(zip)).toEqual([
      'theme-package/README.md',
      'theme-package/components.css',
      'theme-package/shadcn.css',
      'theme-package/tailwind.css',
      'theme-package/theme.json',
      'theme-package/variables.css'
    ])
    expect(highlightCode('<script>', 'json')).not.toContain('<script>')
  })
})

describe('history and paths', () => {
  it('coalesces a slider gesture into one undo step', () => {
    let state = { past: [] as number[], present: 1, future: [] as number[], gesture: null as string | null }
    state = commitHistory(state, 2, 'coalesce', 'glass.blur', (a, b) => a === b)
    state = commitHistory(state, 3, 'coalesce', 'glass.blur', (a, b) => a === b)
    state = commitHistory(state, 3, 'coalesce', 'glass.blur', (a, b) => a === b)
    expect(state.past).toEqual([1])
    expect(state.present).toBe(3)
    state = endGesture(state)
    state = commitHistory(state, 4, 'coalesce', 'glass.blur', (a, b) => a === b)
    expect(state.past).toEqual([1, 3])
    state = undoHistory(state)
    expect(state.present).toBe(3)
    state = redoHistory(state)
    expect(state.present).toBe(4)
  })

  it('rejects path escape and non-images', () => {
    const dir = path.join(root, 'tmp-themes')
    expect(themeFilePath(dir, '11111111-1111-4111-8111-111111111111')).toContain('11111111-1111-4111-8111-111111111111.json')
    expect(() => themeFilePath(dir, '../secret')).toThrow(/Invalid theme id/)
    expect(() => themeFilePath(dir, 'not-a-uuid')).toThrow(/Invalid theme id/)
    expect(imageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]))).toBe('image/png')
    expect(imageMime(Uint8Array.from([1, 2, 3, 4]))).toBeNull()
    expect(signature(instantiatePreset(presetById('minimal-dark-blue'), { id: '11111111-1111-4111-8111-111111111111', now: '2026-01-01T00:00:00.000Z' }))).toContain('minimal-dark-blue')
  })
})

describe('electron security surface', () => {
  it('keeps the renderer off Node and the preload off a raw ipcRenderer bridge', () => {
    const windowSource = readFileSync(path.join(root, 'electron/main/window.ts'), 'utf8')
    const preloadSource = readFileSync(path.join(root, 'electron/preload/index.ts'), 'utf8')
    const registerSource = readFileSync(path.join(root, 'electron/main/ipc/register.ts'), 'utf8')
    expect(windowSource).toContain('contextIsolation: true')
    expect(windowSource).toContain('nodeIntegration: false')
    expect(windowSource).toContain('sandbox: true')
    expect(windowSource).toContain('webSecurity: true')
    expect(preloadSource).toContain('contextBridge.exposeInMainWorld')
    expect(preloadSource).not.toContain("exposeInMainWorld('ipcRenderer'")
    expect(preloadSource).not.toContain('exposeInMainWorld("ipcRenderer"')
    expect(registerSource).not.toContain('ipcMain.on(')
    const files = walk(path.join(root, 'src')).filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    for (const file of files) {
      if (file.endsWith('path-guard.ts')) continue
      const source = readFileSync(file, 'utf8')
      expect(source).not.toMatch(/from ['"]node:fs['"]/)
      expect(source).not.toMatch(/from ['"]fs['"]/)
      expect(source).not.toMatch(/require\(['"]electron['"]\)/)
    }
  })
})

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return [full]
  })
}
