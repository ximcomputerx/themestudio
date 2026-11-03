import { create } from 'zustand'
import { applyResolvedLanguage, text } from '@/i18n'
import enLibrary from '@/i18n/locales/en-US/theme-library.json'
import zhLibrary from '@/i18n/locales/zh-CN/theme-library.json'
import { cloneTheme, instantiatePreset, patchToken, signature } from '@/theme-engine/core/document'
import type { RenderOptions, ThemeDocument, ThemeSection, ThemeTokens } from '@/theme-engine/core/types'
import { presetById } from '@/theme-engine/presets'
import type {
  AppSettings,
  Diagnostics,
  ExportKind,
  LanguagePreference,
  PreviewBackground,
  PreviewScene,
  ThemeSummary
} from '@shared/ipc'
import { resolveLanguage } from '@shared/locale'
import { applyShellTheme, DEFAULT_SHELL_PRESET } from '@/lib/shell-theme'
import { commitHistory, endGesture, redoHistory, undoHistory, type HistoryState } from './history'

export interface Inspection {
  name: string
  tokens: string[]
  style: Record<string, string>
}

export interface ConfirmState {
  titleKey: string
  bodyKey: string
  bodyValues?: Record<string, string | number>
  confirmKey: string
  discardKey?: string
  danger?: boolean
  onConfirm: () => void
  onDiscard?: () => void
}

export interface NoticeState {
  key?: string
  values?: Record<string, string | number>
  raw?: string
}

interface StudioStore {
  bootState: 'loading' | 'ready' | 'error'
  bootError: string | null
  theme: ThemeDocument
  saved: ThemeDocument
  baseline: ThemeDocument
  past: ThemeDocument[]
  future: ThemeDocument[]
  gesture: string | null
  dirty: boolean
  persisted: boolean
  library: ThemeSummary[]
  recentIds: string[]
  recentEnabled: boolean
  scene: PreviewScene
  background: PreviewBackground
  customBackground: string | null
  zoom: number
  previewZoom: number
  compare: boolean
  compareRatio: number
  comparePresetId: string | null
  previewPresetId: string | null
  previewFocus: boolean
  render: RenderOptions
  bottomOpen: boolean
  bottomTab: 'tokens' | 'css' | 'json' | 'tailwind' | 'shadcn' | 'readme'
  inspection: Inspection | null
  diagnostics: Diagnostics | null
  notice: NoticeState | null
  languagePreference: LanguagePreference
  systemLocale: string
  hardwareAcceleration: boolean
  shellPresetId: string
  settingsOpen: boolean
  exportOpen: boolean
  saveAsOpen: boolean
  savePurpose: 'save' | 'save-as'
  confirm: ConfirmState | null
  boot: () => Promise<void>
  refreshLibrary: () => Promise<void>
  setToken: <S extends ThemeSection>(
    section: S,
    key: keyof ThemeTokens[S] & string,
    value: ThemeTokens[S][keyof ThemeTokens[S]],
    mode?: 'push' | 'coalesce'
  ) => void
  patchTheme: (recipe: (theme: ThemeDocument) => void, mode?: 'push' | 'coalesce', key?: string) => void
  finishGesture: () => void
  undo: () => void
  redo: () => void
  loadTheme: (theme: ThemeDocument, persisted: boolean) => void
  save: () => Promise<boolean>
  saveAs: (name: string) => Promise<void>
  confirmUntitledSave: (name: string) => Promise<void>
  createTheme: (presetId?: string | null, name?: string) => void
  duplicateActive: () => Promise<void>
  renameActive: (name: string) => Promise<void>
  toggleFavorite: () => Promise<void>
  deleteTheme: (id: string) => Promise<void>
  importTheme: () => Promise<void>
  exportTheme: (kind: ExportKind) => Promise<void>
  restoreActive: () => Promise<void>
  openLibraryTheme: (id: string) => Promise<void>
  setScene: (scene: PreviewScene) => void
  setBackground: (background: PreviewBackground) => void
  setCustomBackground: (dataUrl: string | null) => void
  setZoom: (zoom: number) => Promise<void>
  setPreviewZoom: (zoom: number) => void
  setCompare: (compare: boolean) => void
  setCompareRatio: (ratio: number) => void
  setComparePreset: (id: string | null) => void
  setPreviewPreset: (id: string | null) => void
  setPreviewFocus: (value: boolean) => void
  setRender: (render: Partial<RenderOptions>) => Promise<void>
  setBottomOpen: (open: boolean) => void
  setBottomTab: (tab: StudioStore['bottomTab']) => void
  setInspection: (inspection: Inspection | null) => void
  setSettingsOpen: (open: boolean) => void
  setExportOpen: (open: boolean) => void
  setSaveAsOpen: (open: boolean) => void
  ask: (confirm: ConfirmState) => void
  clearConfirm: () => void
  notify: (notice: string | NoticeState) => void
  setLanguage: (preference: LanguagePreference) => Promise<void>
  setShellPreset: (id: string) => Promise<void>
  requestClose: () => Promise<void>
}

const initial = instantiatePreset(presetById('neon-glass-blue'), {
  id: '00000000-0000-4000-8000-000000000001',
  now: '2026-01-01T00:00:00.000Z'
})

let noticeTimer = 0
let untitledSaveTask: Promise<boolean> | null = null
let finishUntitledSave: ((saved: boolean) => void) | null = null

const UNTITLED_NAMES = new Set([zhLibrary.untitled, enLibrary.untitled])

function isUntitledDraft(persisted: boolean, name: string): boolean {
  return !persisted && UNTITLED_NAMES.has(name)
}

function settleUntitledSave(saved: boolean): void {
  const finish = finishUntitledSave
  finishUntitledSave = null
  untitledSaveTask = null
  finish?.(saved)
}

function historyOf(state: StudioStore): HistoryState<ThemeDocument> {
  return { past: state.past, present: state.theme, future: state.future, gesture: state.gesture }
}

function withHistory(state: StudioStore, next: HistoryState<ThemeDocument>): Partial<StudioStore> {
  return {
    theme: next.present,
    past: next.past,
    future: next.future,
    gesture: next.gesture,
    dirty: signature(next.present) !== signature(state.saved)
  }
}

async function syncUi(partial?: Partial<AppSettings>): Promise<void> {
  const state = useStudioStore.getState()
  const current = await window.themeStudio.settings.get()
  await window.themeStudio.settings.set({ ...current, ...partial, render: partial?.render ?? state.render, zoom: partial?.zoom ?? state.zoom, scene: partial?.scene ?? state.scene, background: partial?.background ?? state.background, bottomOpen: partial?.bottomOpen ?? state.bottomOpen })
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  bootState: 'loading',
  bootError: null,
  theme: initial,
  saved: cloneTheme(initial),
  baseline: cloneTheme(initial),
  past: [],
  future: [],
  gesture: null,
  dirty: false,
  persisted: false,
  library: [],
  recentIds: [],
  recentEnabled: true,
  scene: 'desktop',
  background: 'ambient',
  customBackground: null,
  zoom: 1,
  previewZoom: 1,
  compare: false,
  compareRatio: 0.5,
  comparePresetId: null,
  previewPresetId: null,
  previewFocus: false,
  render: { glassEnabled: true, lowPerformance: false, reducedMotion: false },
  bottomOpen: true,
  bottomTab: 'tokens',
  inspection: null,
  diagnostics: null,
  notice: null,
  languagePreference: 'system',
  systemLocale: 'en-US',
  hardwareAcceleration: true,
  shellPresetId: DEFAULT_SHELL_PRESET,
  settingsOpen: false,
  exportOpen: false,
  saveAsOpen: false,
  savePurpose: 'save-as',
  confirm: null,

  boot: async () => {
    try {
      const [settings, library, diagnostics, systemLocale] = await Promise.all([
        window.themeStudio.settings.get(),
        window.themeStudio.themes.list(),
        window.themeStudio.app.diagnostics(),
        window.themeStudio.language.getSystemLocale()
      ])
      set({
        library,
        recentIds: settings.recentIds,
        recentEnabled: settings.recentEnabled,
        render: settings.render,
        zoom: settings.zoom,
        scene: settings.scene,
        background: settings.background,
        bottomOpen: settings.bottomOpen,
        diagnostics,
        languagePreference: settings.language,
        systemLocale,
        hardwareAcceleration: settings.hardwareAcceleration,
        shellPresetId: applyShellTheme(settings.shellPresetId)
      })
      const preferred = library.find((item) => item.id === settings.lastThemeId && !item.broken) ?? library.find((item) => !item.broken)
      if (preferred) {
        const theme = await window.themeStudio.themes.read(preferred.id)
        get().loadTheme(theme, true)
      } else {
        const created = instantiatePreset(presetById('neon-glass-blue'))
        const saved = await window.themeStudio.themes.save(created)
        get().loadTheme(saved, true)
        await get().refreshLibrary()
      }
      set({ bootState: 'ready' })
    } catch (error) {
      set({ bootState: 'error', bootError: error instanceof Error ? error.message : text('messages:bootFailed') })
    }
  },

  refreshLibrary: async () => {
    const [library, settings] = await Promise.all([window.themeStudio.themes.list(), window.themeStudio.settings.get()])
    set({ library, recentIds: settings.recentIds })
  },

  loadTheme: (theme, persisted) => {
    const copy = cloneTheme(theme)
    set({
      theme: copy,
      saved: cloneTheme(copy),
      baseline: cloneTheme(copy),
      past: [],
      future: [],
      gesture: null,
      dirty: false,
      persisted,
      inspection: null,
      previewPresetId: null,
      comparePresetId: null
    })
  },

  setToken: (section, key, value, mode = 'push') => {
    get().patchTheme((theme) => {
      const patched = patchToken(theme, section, key, value)
      Object.assign(theme, patched)
    }, mode, `${section}.${key}`)
  },

  patchTheme: (recipe, mode = 'push', key = 'theme') => {
    const state = get()
    const draft = cloneTheme(state.theme)
    recipe(draft)
    draft.meta.updatedAt = new Date().toISOString()
    const next = commitHistory(historyOf(state), draft, mode, key, (left, right) => signature(left) === signature(right))
    set({ ...withHistory(state, next), previewPresetId: null })
  },

  finishGesture: () => set((state) => endGesture(historyOf(state))),

  undo: () => {
    const state = get()
    set(withHistory(state, undoHistory(historyOf(state))))
  },

  redo: () => {
    const state = get()
    set(withHistory(state, redoHistory(historyOf(state))))
  },

  save: async () => {
    const state = get()
    if (isUntitledDraft(state.persisted, state.theme.meta.name)) {
      if (untitledSaveTask) return untitledSaveTask
      if (state.saveAsOpen) return false
      untitledSaveTask = new Promise<boolean>((resolve) => {
        finishUntitledSave = resolve
      })
      set({ saveAsOpen: true, savePurpose: 'save' })
      return untitledSaveTask
    }
    const saved = await window.themeStudio.themes.save(get().theme)
    get().loadTheme(saved, true)
    await get().refreshLibrary()
    get().notify('messages:themeSaved')
    return true
  },

  saveAs: async (name) => {
    const saved = await window.themeStudio.themes.saveAs(get().theme, name)
    get().loadTheme(saved, true)
    await get().refreshLibrary()
    set({ saveAsOpen: false })
    get().notify('messages:themeSaved')
  },

  confirmUntitledSave: async (name) => {
    const trimmed = name.trim().slice(0, 80)
    if (!trimmed) {
      get().notify('messages:themeNameRequired')
      return
    }
    try {
      const theme = cloneTheme(get().theme)
      theme.meta.name = trimmed
      theme.meta.updatedAt = new Date().toISOString()
      const saved = await window.themeStudio.themes.save(theme)
      get().loadTheme(saved, true)
      await get().refreshLibrary()
      settleUntitledSave(true)
      set({ saveAsOpen: false })
      get().notify('messages:themeSaved')
    } catch (error) {
      get().notify({ raw: error instanceof Error ? error.message : 'code:saveFailed' })
    }
  },

  createTheme: (presetId = 'neon-glass-blue', name) => {
    const run = () => {
      const theme = instantiatePreset(presetById(presetId), name ? { name } : undefined)
      get().loadTheme(theme, false)
      get().notify({ key: 'messages:editing', values: { name: theme.meta.name } })
    }
    if (!get().dirty) {
      run()
      return
    }
    get().ask({
      titleKey: 'messages:unsavedTitle',
      bodyKey: 'messages:unsavedCreate',
      confirmKey: 'messages:saveAndContinue',
      discardKey: 'common:discard',
      onConfirm: () => {
        void get().save().then((saved) => {
          if (saved) run()
        }).catch(() => undefined)
      },
      onDiscard: run
    })
  },

  duplicateActive: async () => {
    if (!get().persisted) {
      const copy = cloneTheme(get().theme)
      const now = new Date().toISOString()
      copy.meta.id = crypto.randomUUID()
      copy.meta.name = `${copy.meta.name} Copy`.slice(0, 80)
      copy.meta.favorite = false
      copy.meta.createdAt = now
      copy.meta.updatedAt = now
      get().loadTheme(copy, false)
      return
    }
    const copy = await window.themeStudio.themes.duplicate(get().theme.meta.id)
    await get().refreshLibrary()
    get().loadTheme(copy, true)
    get().notify('messages:themeDuplicated')
  },

  renameActive: async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    if (!get().persisted) {
      get().patchTheme((theme) => {
        theme.meta.name = trimmed.slice(0, 80)
      })
      return
    }
    const renamed = await window.themeStudio.themes.rename(get().theme.meta.id, trimmed)
    get().loadTheme(renamed, true)
    await get().refreshLibrary()
  },

  toggleFavorite: async () => {
    const next = !get().theme.meta.favorite
    if (!get().persisted) {
      get().patchTheme((theme) => {
        theme.meta.favorite = next
      })
      return
    }
    const theme = cloneTheme(get().theme)
    theme.meta.favorite = next
    const saved = await window.themeStudio.themes.save(theme)
    get().loadTheme(saved, true)
    await get().refreshLibrary()
  },

  deleteTheme: async (id) => {
    await window.themeStudio.themes.delete(id)
    await get().refreshLibrary()
    if (get().theme.meta.id === id) {
      const fallback = get().library.find((item) => !item.broken)
      if (fallback) get().loadTheme(await window.themeStudio.themes.read(fallback.id), true)
      else get().loadTheme(instantiatePreset(presetById('neon-glass-blue'), { name: text('theme-library:untitled') }), false)
    }
    get().notify('messages:themeDeleted')
  },

  importTheme: async () => {
    try {
      const theme = await window.themeStudio.themes.importTheme()
      await get().refreshLibrary()
      get().loadTheme(theme, true)
      get().notify('messages:themeImported')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'code:importFailed'
      if (message !== 'code:importCanceled' && message !== 'Import canceled') get().notify({ raw: message })
    }
  },

  exportTheme: async (kind) => {
    try {
      const result = await window.themeStudio.themes.exportTheme(get().theme, kind)
      if (!result.canceled) get().notify({ key: 'messages:exportSuccess', values: { count: 1 } })
    } catch (error) {
      get().notify({ raw: error instanceof Error ? error.message : 'code:exportFailed' })
    }
  },

  restoreActive: async () => {
    if (!get().persisted) {
      const restored = instantiatePreset(presetById(get().theme.meta.presetId), {
        id: get().theme.meta.id,
        name: get().theme.meta.name
      })
      get().patchTheme((theme) => {
        Object.assign(theme, restored, { meta: { ...theme.meta, updatedAt: restored.meta.updatedAt } })
      })
      return
    }
    const theme = await window.themeStudio.themes.restoreDefault(get().theme.meta.id)
    get().loadTheme(theme, true)
    get().notify('messages:presetRestored')
  },

  openLibraryTheme: async (id) => {
    const open = async () => {
      const theme = await window.themeStudio.themes.read(id)
      get().loadTheme(theme, true)
    }
    if (!get().dirty) {
      await open()
      return
    }
    get().ask({
      titleKey: 'messages:unsavedTitle',
      bodyKey: 'messages:unsavedSwitch',
      confirmKey: 'messages:saveAndSwitch',
      discardKey: 'common:discard',
      onConfirm: () => {
        void get().save().then((saved) => {
          if (saved) void open()
        }).catch(() => undefined)
      },
      onDiscard: () => {
        void open()
      }
    })
  },

  setShellPreset: async (id) => {
    const presetId = applyShellTheme(id)
    set({ shellPresetId: presetId })
    await syncUi({ shellPresetId: presetId })
  },
  setScene: (scene) => {
    set({ scene })
    void syncUi({ scene })
  },
  setBackground: (background) => {
    set({ background })
    void syncUi({ background })
  },
  setCustomBackground: (dataUrl) => set({ customBackground: dataUrl, background: dataUrl ? 'custom' : get().background }),
  setZoom: async (zoom) => {
    const next = await window.themeStudio.window.setZoom(zoom)
    set({ zoom: next })
  },
  setPreviewZoom: (zoom) => set({ previewZoom: Math.min(1.5, Math.max(0.5, zoom)) }),
  setCompare: (compare) => set({ compare, comparePresetId: null }),
  setCompareRatio: (ratio) => set({ compareRatio: Math.min(0.8, Math.max(0.2, ratio)) }),
  setComparePreset: (id) => set({ comparePresetId: id, compare: id !== null, previewPresetId: null }),
  setPreviewPreset: (id) =>
    set({
      previewPresetId: id,
      compare: id ? false : get().compare,
      comparePresetId: id ? null : get().comparePresetId
    }),
  setPreviewFocus: (previewFocus) => set({ previewFocus }),
  setRender: async (partial) => {
    const render = { ...get().render, ...partial }
    set({ render })
    await syncUi({ render })
  },
  setBottomOpen: (bottomOpen) => {
    set({ bottomOpen })
    void syncUi({ bottomOpen })
  },
  setBottomTab: (bottomTab) => set({ bottomTab }),
  setInspection: (inspection) => set({ inspection }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setExportOpen: (exportOpen) => set({ exportOpen }),
  setSaveAsOpen: (open) => {
    if (open) {
      if (untitledSaveTask) return
      set({ saveAsOpen: true, savePurpose: 'save-as' })
      return
    }
    set({ saveAsOpen: false })
    settleUntitledSave(false)
  },
  ask: (confirm) => set({ confirm }),
  clearConfirm: () => set({ confirm: null }),
  notify: (notice) => {
    window.clearTimeout(noticeTimer)
    set({ notice: typeof notice === 'string' ? { key: notice } : notice })
    noticeTimer = window.setTimeout(() => set({ notice: null }), 3600)
  },
  setLanguage: async (preference) => {
    const saved = await window.themeStudio.language.setPreference(preference)
    const systemLocale = await window.themeStudio.language.getSystemLocale()
    await applyResolvedLanguage(resolveLanguage(saved, systemLocale))
    set({ languagePreference: saved, systemLocale })
  },
  requestClose: async () => {
    if (!get().dirty) {
      await window.themeStudio.window.confirmClose()
      return
    }
    get().ask({
      titleKey: 'messages:quitTitle',
      bodyKey: 'messages:quitBody',
      confirmKey: 'messages:saveAndQuit',
      discardKey: 'messages:quitWithoutSaving',
      onConfirm: () => {
        void get()
          .save()
          .then((saved) => {
            if (saved) return window.themeStudio.window.confirmClose()
          })
          .catch(() => undefined)
      },
      onDiscard: () => {
        void window.themeStudio.window.confirmClose()
      }
    })
  }
}))
