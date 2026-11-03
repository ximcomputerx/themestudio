import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button, DropdownContent, DropdownItem, DropdownMenu, DropdownTrigger } from '@/components/ui/primitives'
import { translate } from '@/i18n/resources'
import { useLabel } from '@/i18n/use-label'
import { applyCssVariables } from '@/lib/apply-css-variables'
import { useStudioStore } from '@/store/studio-store'
import { instantiatePreset } from '@/theme-engine/core/document'
import { DEFAULT_RENDER, type PresetDefinition } from '@/theme-engine/core/types'
import { PRESETS, presetCatalog, type PresetMode, type PresetStyle } from '@/theme-engine/presets'
import type { ExportKind } from '@shared/ipc'
import type { ResolvedLanguage } from '@shared/locale'

const THUMB_STAMP = { id: '00000000-0000-4000-8000-0000000000cc', now: '2026-01-01T00:00:00.000Z' }

const STYLE_FILTERS = ['all', 'glass', 'neon', 'lightweight'] as const
const MODE_FILTERS = ['all', 'dark', 'light'] as const
const MODE_LABEL: Record<ModeFilter, string> = {
  all: 'theme-library:filters.modeAll',
  dark: 'theme-library:filters.dark',
  light: 'theme-library:filters.light'
}

type StyleFilter = (typeof STYLE_FILTERS)[number]
type ModeFilter = (typeof MODE_FILTERS)[number]

function otherLanguage(language: ResolvedLanguage): ResolvedLanguage {
  return language === 'zh-CN' ? 'en-US' : 'zh-CN'
}

function presetText(id: string, language: ResolvedLanguage, field: 'name' | 'description'): string {
  return translate(language, `theme-library:presets.${id}.${field}`)
}

function matchesQuery(preset: PresetDefinition, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    preset.id,
    preset.name,
    preset.description,
    presetText(preset.id, 'zh-CN', 'name'),
    presetText(preset.id, 'en-US', 'name'),
    presetText(preset.id, 'zh-CN', 'description'),
    presetText(preset.id, 'en-US', 'description')
  ]
  return haystack.some((value) => value.toLowerCase().includes(needle))
}

function matchesFilters(preset: PresetDefinition, style: StyleFilter, mode: ModeFilter): boolean {
  const catalog = presetCatalog(preset.id)
  const styleOk = style === 'all' || catalog.styles.includes(style)
  const modeOk = mode === 'all' || catalog.mode === mode
  return styleOk && modeOk
}

function PresetThumbnail({ preset }: { preset: PresetDefinition }) {
  const ref = useRef<HTMLDivElement>(null)
  const theme = useMemo(() => instantiatePreset(preset, THUMB_STAMP), [preset])
  useLayoutEffect(() => {
    if (ref.current) applyCssVariables(ref.current, theme, DEFAULT_RENDER)
  }, [theme])
  return (
    <div className="preset-thumb" aria-hidden="true">
      <div ref={ref} className="preset-thumb-theme">
        <div className="preset-thumb-side" />
        <div className="preset-thumb-main">
          <div className="preset-thumb-bar" />
          <div className="preset-thumb-panel">
            <span className="preset-thumb-title" />
            <span className="preset-thumb-muted" />
            <span className="preset-thumb-btn" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Tag({ kind }: { kind: PresetStyle | PresetMode }) {
  const { label } = useLabel()
  return <span className={`preset-tag preset-tag-${kind}`}>{label(`theme-library:tags.${kind}`)}</span>
}

function PresetCard({ preset }: { preset: PresetDefinition }) {
  const { label, language } = useLabel()
  const presetId = useStudioStore((state) => state.theme.meta.presetId)
  const persisted = useStudioStore((state) => state.persisted)
  const previewPresetId = useStudioStore((state) => state.previewPresetId)
  const comparePresetId = useStudioStore((state) => state.comparePresetId)
  const catalog = presetCatalog(preset.id)
  const applied = !persisted && presetId === preset.id
  const title = presetText(preset.id, language, 'name')
  const alternate = presetText(preset.id, otherLanguage(language), 'name')
  const description = presetText(preset.id, language, 'description')
  const exportPreset = (kind: ExportKind) => {
    const theme = instantiatePreset(preset)
    void window.themeStudio.themes.exportTheme(theme, kind).catch((error: unknown) => {
      useStudioStore.getState().notify({ raw: error instanceof Error ? error.message : 'code:exportFailed' })
    })
  }
  const saveAs = () => {
    const state = useStudioStore.getState()
    if (state.theme.meta.presetId === preset.id) {
      state.setSaveAsOpen(true)
      return
    }
    if (state.dirty) {
      state.createTheme(preset.id)
      return
    }
    state.createTheme(preset.id)
    state.setSaveAsOpen(true)
  }
  return (
    <article
      className={applied || previewPresetId === preset.id || comparePresetId === preset.id ? 'preset-card active' : 'preset-card'}
      data-testid={`preset-card-${preset.id}`}
    >
      <PresetThumbnail preset={preset} />
      <div className="preset-copy">
        <strong>{title}</strong>
        <small>{alternate}</small>
        <p>{description}</p>
        <div className="preset-tags">
          <Tag kind={catalog.mode} />
          {catalog.styles.map((style) => (
            <Tag key={style} kind={style} />
          ))}
        </div>
      </div>
      <div className="preset-actions">
        <Button variant={applied ? 'primary' : 'default'} data-testid={`preset-apply-${preset.id}`} onClick={() => useStudioStore.getState().createTheme(preset.id)}>
          {label('theme-library:actions.apply')}
        </Button>
        <button type="button" className="text-btn" data-testid={`preset-preview-${preset.id}`} onClick={() => useStudioStore.getState().setPreviewPreset(preset.id)}>
          {label('theme-library:actions.preview')}
        </button>
        <button type="button" className="text-btn" data-testid={`preset-compare-${preset.id}`} onClick={() => useStudioStore.getState().setComparePreset(preset.id)}>
          {label('theme-library:actions.compare')}
        </button>
        <DropdownMenu modal={false}>
          <DropdownTrigger asChild>
            <button type="button" className="text-btn" data-testid={`preset-more-${preset.id}`}>
              {label('theme-library:actions.more')}
            </button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem onSelect={saveAs}>{label('common:saveAs')}</DropdownItem>
            <DropdownItem onSelect={() => exportPreset('json')}>{label('export:json')}</DropdownItem>
            <DropdownItem onSelect={() => exportPreset('variables')}>{label('export:cssVariables')}</DropdownItem>
            <DropdownItem onSelect={() => exportPreset('tailwind')}>{label('export:tailwind')}</DropdownItem>
            <DropdownItem onSelect={() => exportPreset('shadcn')}>{label('export:shadcn')}</DropdownItem>
            <DropdownItem onSelect={() => exportPreset('zip')}>{label('export:zip')}</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </div>
    </article>
  )
}

export function PresetGallery({ query }: { query: string }) {
  const { label } = useLabel()
  const [style, setStyle] = useState<StyleFilter>('all')
  const [mode, setMode] = useState<ModeFilter>('all')
  const visible = PRESETS.filter((preset) => matchesFilters(preset, style, mode) && matchesQuery(preset, query))
  return (
    <div className="preset-gallery">
      <div className="filter-block">
        <span className="filter-label">{label('theme-library:filters.style')}</span>
        <div className="filter-row" role="group" aria-label={label('theme-library:filters.style')}>
          {STYLE_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className={style === value ? 'filter-chip active' : 'filter-chip'}
              aria-pressed={style === value}
              data-testid={`filter-style-${value}`}
              onClick={() => setStyle(value)}
            >
              {label(`theme-library:filters.${value}`)}
            </button>
          ))}
        </div>
        <span className="filter-label">{label('theme-library:filters.mode')}</span>
        <div className="filter-row" role="group" aria-label={label('theme-library:filters.mode')}>
          {MODE_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              className={mode === value ? 'filter-chip active' : 'filter-chip'}
              aria-pressed={mode === value}
              data-testid={`filter-mode-${value}`}
              onClick={() => setMode(value)}
            >
              {label(MODE_LABEL[value])}
            </button>
          ))}
        </div>
      </div>
      <div className="group-label">{label('navigation:presets')}</div>
      {visible.length === 0 ? <div className="hint">{label('theme-library:noThemesFound')}</div> : null}
      {visible.map((preset) => (
        <PresetCard key={preset.id} preset={preset} />
      ))}
    </div>
  )
}
