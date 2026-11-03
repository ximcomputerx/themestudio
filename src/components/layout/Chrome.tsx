import { Fragment, useEffect, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { highlightCode } from '@/theme-engine/export/highlight'
import { buildThemePackage } from '@/theme-engine/export/package'
import { PresetGallery } from '@/components/library/PresetGallery'
import { Button, Dialog, DialogContent, DropdownContent, DropdownItem, DropdownMenu, DropdownSeparator, DropdownTrigger, Slider, StudioSelect, Switch, Tooltip } from '@/components/ui/primitives'
import { applyResolvedLanguage, text } from '@/i18n'
import { describeRelative, formatPercent } from '@/i18n/format'
import { describeError } from '@/i18n/localize'
import { useLabel } from '@/i18n/use-label'
import { copyText } from '@/lib/utils'
import { useStudioStore, type NoticeState } from '@/store/studio-store'
import type { ExportKind, ThemeSummary } from '@shared/ipc'
import { resolveLanguage } from '@shared/locale'
import { DEFAULT_RENDER } from '@/theme-engine/core/types'
import { PRESETS } from '@/theme-engine/presets'
import appIcon from '../../../app.png'

function showError(message: string, label: (key: string, values?: Record<string, unknown>) => string): string {
  return describeError(message, (key, values) => label(key, values))
}

function Logo() {
  return <img src={appIcon} width={18} height={18} alt="" />
}

function NoticeText({ notice }: { notice: NoticeState }) {
  const { label } = useLabel()
  if (notice.raw) return <>{showError(notice.raw, label)}</>
  if (!notice.key) return null
  return <>{label(notice.key, notice.values)}</>
}

function ShellThemeSwitch() {
  const { label } = useLabel()
  const shellPresetId = useStudioStore((state) => state.shellPresetId)
  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <button type="button" className="shell-theme-switch" data-testid="shell-theme-switch" aria-label={label('navigation:appTheme')}>
          <span>{label(`theme-library:presets.${shellPresetId}.name`)}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </DropdownTrigger>
      <DropdownContent className="shell-theme-menu" align="start">
        {PRESETS.map((preset) => (
          <Fragment key={preset.id}>
            {preset.id === 'pure-white' ? <DropdownSeparator /> : null}
            <DropdownItem
              data-testid={`shell-preset-${preset.id}`}
              className={preset.id === shellPresetId ? 'is-active' : undefined}
              onSelect={() => void useStudioStore.getState().setShellPreset(preset.id)}
            >
              {label(`theme-library:presets.${preset.id}.name`)}
            </DropdownItem>
          </Fragment>
        ))}
      </DropdownContent>
    </DropdownMenu>
  )
}

export function Toolbar() {
  const { label } = useLabel()
  const name = useStudioStore((state) => state.theme.meta.name)
  const dirty = useStudioStore((state) => state.dirty)
  const canUndo = useStudioStore((state) => state.past.length > 0)
  const canRedo = useStudioStore((state) => state.future.length > 0)
  const compare = useStudioStore((state) => state.compare)
  const store = useStudioStore
  const fail = (fallback: string) => (error: unknown) => store.getState().notify({ raw: error instanceof Error ? error.message : fallback })
  return (
    <header className="toolbar">
      <div className="brand">
        <Logo />
        Theme Studio
      </div>
      <div className="theme-title" data-testid="theme-name">
        {name}
      </div>
      {dirty ? (
        <Tooltip label={label('messages:unsavedTitle')}>
          <span className="dirty-dot" />
        </Tooltip>
      ) : null}
      <ShellThemeSwitch />
      <div className="spacer" />
      <div className="tool-group">
        <Button onClick={() => store.getState().createTheme('neon-glass-blue', text('theme-library:untitled'))}>{label('theme-library:newTheme')}</Button>
        <Button data-testid="save-theme" variant="primary" onClick={() => void store.getState().save().catch(fail('code:saveFailed'))}>
          {label('common:save')}
        </Button>
        <Button onClick={() => void store.getState().duplicateActive().catch(fail('code:duplicateFailed'))}>{label('common:duplicate')}</Button>
        <Button onClick={() => store.getState().setSaveAsOpen(true)}>{label('common:saveAs')}</Button>
        <Tooltip label={label('common:undo')}>
          <span className="tip-host">
            <button type="button" className="icon-btn" data-testid="undo" disabled={!canUndo} onClick={() => store.getState().undo()} aria-label={label('common:undo')}>↶</button>
          </span>
        </Tooltip>
        <Tooltip label={label('common:redo')}>
          <span className="tip-host">
            <button type="button" className="icon-btn" data-testid="redo" disabled={!canRedo} onClick={() => store.getState().redo()} aria-label={label('common:redo')}>↷</button>
          </span>
        </Tooltip>
        <Tooltip label={label('common:compare')}>
          <button type="button" className={compare ? 'icon-btn active' : 'icon-btn'} onClick={() => store.getState().setCompare(!compare)} aria-label={label('common:compare')}>↔</button>
        </Tooltip>
        <DropdownMenu>
          <DropdownTrigger asChild>
            <Button>{label('common:export')}</Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem onSelect={() => store.getState().setExportOpen(true)}>{label('export:previewPackage')}</DropdownItem>
            <DropdownItem onSelect={() => void store.getState().exportTheme('zip')}>{label('export:zip')}</DropdownItem>
            <DropdownItem onSelect={() => void store.getState().exportTheme('json')}>{label('export:json')}</DropdownItem>
            <DropdownItem onSelect={() => void store.getState().exportTheme('variables')}>{label('export:cssVariables')}</DropdownItem>
            <DropdownItem onSelect={() => void store.getState().exportTheme('tailwind')}>{label('export:tailwind')}</DropdownItem>
            <DropdownItem onSelect={() => void store.getState().exportTheme('shadcn')}>{label('export:shadcn')}</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
        <Button data-testid="open-settings" onClick={() => store.getState().setSettingsOpen(true)}>{label('common:settings')}</Button>
      </div>
    </header>
  )
}

export function ThemeLibrary() {
  const { label, language } = useLabel()
  const library = useStudioStore((state) => state.library)
  const recentIds = useStudioStore((state) => state.recentIds)
  const recentEnabled = useStudioStore((state) => state.recentEnabled)
  const activeId = useStudioStore((state) => state.theme.meta.id)
  const [query, setQuery] = useState('')
  const [renaming, setRenaming] = useState<string | null>(null)
  const filtered = library.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
  const favorites = filtered.filter((item) => item.favorite && !item.broken)
  const recent = recentIds.map((id) => filtered.find((item) => item.id === id)).filter((item): item is ThemeSummary => Boolean(item))
  return (
    <aside className="library">
      <div className="pane-head">
        <h2>{label('theme-library:themes')}</h2>
        <Tooltip label={label('theme-library:import')}>
          <button type="button" className="icon-btn" aria-label={label('theme-library:import')} onClick={() => void useStudioStore.getState().importTheme()}>↓</button>
        </Tooltip>
      </div>
      <div style={{ padding: '0 12px 8px' }}>
        <input className="num" aria-label={label('theme-library:searchPlaceholder')} placeholder={label('theme-library:searchPlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="scroll">
        <PresetGallery query={query} />
        <div className="group-label">{label('navigation:favorites')}</div>
        {favorites.length === 0 ? <div className="hint library-empty">{label('theme-library:noFavorites')}</div> : favorites.map((item) => (
          <ThemeRow key={item.id} item={item} active={item.id === activeId} renaming={renaming} setRenaming={setRenaming} language={language} />
        ))}
        {recentEnabled ? (
          <>
            <div className="group-label">{label('navigation:recentThemes')}</div>
            {recent.length === 0 ? <div className="hint library-empty">{label('theme-library:noRecent')}</div> : recent.map((item) => (
              <ThemeRow key={`recent-${item.id}`} item={item} active={item.id === activeId} renaming={renaming} setRenaming={setRenaming} language={language} />
            ))}
          </>
        ) : null}
        <div className="group-label">{label('navigation:myThemes')}</div>
        {query.trim() && filtered.length === 0 ? <div className="hint library-empty">{label('theme-library:noThemesFound')}</div> : null}
        {filtered.map((item) => (
          <ThemeRow key={item.id} item={item} active={item.id === activeId} renaming={renaming} setRenaming={setRenaming} language={language} />
        ))}
      </div>
    </aside>
  )
}

function ThemeRow({
  item,
  active,
  renaming,
  setRenaming,
  language
}: {
  item: ThemeSummary
  active: boolean
  renaming: string | null
  setRenaming: (id: string | null) => void
  language: 'zh-CN' | 'en-US'
}) {
  const { label } = useLabel()
  const [name, setName] = useState(item.name)
  const relative = describeRelative(item.updatedAt, language)
  const when = relative.kind === 'now' ? label('common:modifiedJustNow') : relative.text
  const badge = item.broken ? label('theme-library:broken') : item.favorite ? `${label('theme-library:favoriteBadge')} · ${when}` : when
  return (
    <div className={item.broken ? 'theme-row broken' : active ? 'theme-row active' : 'theme-row'} style={{ width: '100%' }}>
      <span className="swatch" />
      {renaming === item.id ? (
        <input
          className="num"
          aria-label={label('theme-library:rename')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => {
            const state = useStudioStore.getState()
            if (state.theme.meta.id === item.id) void state.renameActive(name)
            else void window.themeStudio.themes.rename(item.id, name).then(() => state.refreshLibrary())
            setRenaming(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') (event.target as HTMLInputElement).blur()
          }}
        />
      ) : (
        <button
          type="button"
          style={{ all: 'unset', minWidth: 0, cursor: 'pointer' }}
          onClick={() => {
            if (!item.broken) void useStudioStore.getState().openLibraryTheme(item.id)
          }}
        >
          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
          <Tooltip label={item.error ? showError(item.error, label) : label('theme-library:lastModified')}>
            <small>{badge}</small>
          </Tooltip>
        </button>
      )}
      <span className="row-actions">
        {!item.broken ? (
          <Tooltip label={label('theme-library:rename')}>
            <button type="button" className="icon-btn" aria-label={label('theme-library:rename')} onClick={() => setRenaming(item.id)}>✎</button>
          </Tooltip>
        ) : null}
        {!item.broken ? (
          <Tooltip label={label('common:favorite')}>
            <button
              type="button"
              className="icon-btn"
              aria-label={label('common:favorite')}
              onClick={() => {
                const state = useStudioStore.getState()
                if (active) {
                  void state.toggleFavorite()
                  return
                }
                void window.themeStudio.themes.read(item.id).then(async (theme) => {
                  theme.meta.favorite = !theme.meta.favorite
                  await window.themeStudio.themes.save(theme)
                  await state.refreshLibrary()
                })
              }}
            >
              {item.favorite ? '★' : '☆'}
            </button>
          </Tooltip>
        ) : null}
        <Tooltip label={label('common:delete')}>
          <button
            type="button"
            className="icon-btn"
            aria-label={label('common:delete')}
            onClick={() => {
              useStudioStore.getState().ask({
                titleKey: 'theme-library:deleteTitle',
                bodyKey: 'theme-library:deleteBody',
                bodyValues: { name: item.name },
                confirmKey: 'common:delete',
                danger: true,
                onConfirm: () => {
                  void useStudioStore.getState().deleteTheme(item.id)
                }
              })
            }}
          >
            ⌫
          </button>
        </Tooltip>
      </span>
    </div>
  )
}

const TABS = [
  ['tokens', 'export:tabVariables'],
  ['css', 'export:tabComponents'],
  ['json', 'export:tabJson'],
  ['tailwind', 'export:tabTailwind'],
  ['shadcn', 'export:tabShadcn'],
  ['readme', 'export:tabExport']
] as const

export function TokenPanel() {
  const { label } = useLabel()
  const theme = useStudioStore((state) => state.theme)
  const tab = useStudioStore((state) => state.bottomTab)
  const open = useStudioStore((state) => state.bottomOpen)
  const [delayed, setDelayed] = useState(theme)
  useEffect(() => {
    const timer = window.setTimeout(() => setDelayed(theme), 48)
    return () => window.clearTimeout(timer)
  }, [theme])
  const pack = useMemo(() => buildThemePackage(delayed), [delayed])
  const file = pack.files.find((item) => {
    if (tab === 'tokens') return item.path === 'variables.css'
    if (tab === 'css') return item.path === 'components.css'
    if (tab === 'json') return item.path === 'theme.json'
    if (tab === 'tailwind') return item.path === 'tailwind.css'
    if (tab === 'shadcn') return item.path === 'shadcn.css'
    return item.path === 'README.md'
  })
  const language = file?.path.endsWith('.json') ? 'json' : file?.path.endsWith('.md') ? 'markdown' : 'css'
  const kind: ExportKind = tab === 'tokens' ? 'variables' : tab === 'css' ? 'components' : tab === 'json' ? 'json' : tab === 'tailwind' ? 'tailwind' : tab === 'shadcn' ? 'shadcn' : 'readme'
  return (
    <section className="token-panel">
      <div className="token-tabs">
        {TABS.map(([id, key]) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => useStudioStore.getState().setBottomTab(id)}>
            {label(key)}
          </button>
        ))}
        <div className="spacer" />
        <button type="button" className="ui-btn" onClick={() => useStudioStore.getState().setBottomOpen(!open)}>{open ? label('common:hide') : label('common:show')}</button>
        <button type="button" className="ui-btn" disabled={!file} onClick={() => file && void copyText(file.contents)}>{label('export:copyCode')}</button>
        <button type="button" className="ui-btn" onClick={() => void useStudioStore.getState().exportTheme(kind)}>{label('export:download')}</button>
      </div>
      {open ? (
        <pre className="token-body" dangerouslySetInnerHTML={{ __html: file ? highlightCode(file.contents, language) : pack.errors.map((error) => showError(error, label)).join('\n') }} />
      ) : null}
    </section>
  )
}

const SCENE_KEY = {
  desktop: 'preview:desktop',
  components: 'preview:components',
  dialog: 'preview:dialog',
  data: 'preview:data',
  workspace: 'preview:workspace'
} as const

export function StatusBar() {
  const { label, language } = useLabel()
  const diagnostics = useStudioStore((state) => state.diagnostics)
  const dirty = useStudioStore((state) => state.dirty)
  const scene = useStudioStore((state) => state.scene)
  const render = useStudioStore((state) => state.render)
  const notice = useStudioStore((state) => state.notice)
  return (
    <footer className="status">
      <span>{dirty ? label('common:unsaved') : label('common:saved')}</span>
      <span>{label('navigation:preview')} <b>{label(SCENE_KEY[scene])}</b></span>
      <span>{label('settings:glassEffects')} <b>{render.lowPerformance ? label('settings:lowPerformance') : render.glassEnabled ? label('preview:enabled') : label('glow:off')}</b></span>
      <span>DPI <b>{diagnostics ? formatPercent(diagnostics.scaleFactor, language) : '—'}</b></span>
      <span className="spacer" />
      <span>{notice ? <NoticeText notice={notice} /> : 'Theme Studio'}</span>
    </footer>
  )
}

const EXPORT_KINDS: Array<{ kind: ExportKind; key: string }> = [
  { kind: 'json', key: 'export:json' },
  { kind: 'variables', key: 'export:cssVariables' },
  { kind: 'components', key: 'export:components' },
  { kind: 'tailwind', key: 'export:tailwind' },
  { kind: 'shadcn', key: 'export:shadcn' },
  { kind: 'readme', key: 'export:readme' },
  { kind: 'zip', key: 'export:zip' }
]

export function StudioDialogs() {
  const { label, language } = useLabel()
  const confirm = useStudioStore((state) => state.confirm)
  const settingsOpen = useStudioStore((state) => state.settingsOpen)
  const exportOpen = useStudioStore((state) => state.exportOpen)
  const saveAsOpen = useStudioStore((state) => state.saveAsOpen)
  const savePurpose = useStudioStore((state) => state.savePurpose)
  const theme = useStudioStore((state) => state.theme)
  const render = useStudioStore((state) => state.render)
  const zoom = useStudioStore((state) => state.zoom)
  const diagnostics = useStudioStore((state) => state.diagnostics)
  const preference = useStudioStore((state) => state.languagePreference)
  const systemLocale = useStudioStore((state) => state.systemLocale)
  const hardwareAcceleration = useStudioStore((state) => state.hardwareAcceleration)
  const recentEnabled = useStudioStore((state) => state.recentEnabled)
  const bottomOpen = useStudioStore((state) => state.bottomOpen)
  const [saveName, setSaveName] = useState(theme.meta.name)
  const [saveSession, setSaveSession] = useState({ open: saveAsOpen, purpose: savePurpose })
  if (saveAsOpen !== saveSession.open || savePurpose !== saveSession.purpose) {
    setSaveSession({ open: saveAsOpen, purpose: savePurpose })
    if (saveAsOpen) setSaveName(theme.meta.name)
  }
  const pack = useMemo(() => (exportOpen ? buildThemePackage(theme) : null), [exportOpen, theme])
  const resolvedName = resolveLanguage(preference, systemLocale) === 'zh-CN' ? label('settings:simplifiedChinese') : label('settings:english')
  const scale = diagnostics ? formatPercent(diagnostics.scaleFactor, language) : ''

  const resetSettings = () => {
    useStudioStore.getState().ask({
      titleKey: 'settings:resetTitle',
      bodyKey: 'settings:resetBody',
      confirmKey: 'settings:resetConfirm',
      danger: true,
      onConfirm: () => {
        void (async () => {
          const current = await window.themeStudio.settings.get()
          const locale = await window.themeStudio.language.getSystemLocale()
          await window.themeStudio.settings.set({
            ...current,
            language: 'system',
            render: { ...DEFAULT_RENDER },
            zoom: 1,
            scene: 'desktop',
            background: 'ambient',
            bottomOpen: true,
            hardwareAcceleration: true,
            recentEnabled: true
          })
          await window.themeStudio.language.setPreference('system')
          await window.themeStudio.window.setZoom(1)
          await applyResolvedLanguage(resolveLanguage('system', locale))
          useStudioStore.setState({
            languagePreference: 'system',
            systemLocale: locale,
            render: { ...DEFAULT_RENDER },
            zoom: 1,
            scene: 'desktop',
            background: 'ambient',
            bottomOpen: true,
            hardwareAcceleration: true,
            recentEnabled: true
          })
          useStudioStore.getState().notify('messages:settingsReset')
        })()
      }
    })
  }

  return (
    <>
      {confirm ? (
        <div className="modal-back">
          <div className="modal narrow" role="dialog" aria-modal="true">
            <h2>{label(confirm.titleKey)}</h2>
            <p>{label(confirm.bodyKey, confirm.bodyValues)}</p>
            <div className="tool-group">
              <Button variant={confirm.danger ? 'danger' : 'primary'} onClick={() => { confirm.onConfirm(); useStudioStore.getState().clearConfirm() }}>{label(confirm.confirmKey)}</Button>
              {confirm.onDiscard ? (
                <Button onClick={() => { confirm.onDiscard?.(); useStudioStore.getState().clearConfirm() }}>{label(confirm.discardKey ?? 'common:discard')}</Button>
              ) : null}
              <Button onClick={() => useStudioStore.getState().clearConfirm()}>{label('common:cancel')}</Button>
            </div>
          </div>
        </div>
      ) : null}
      <Dialog open={settingsOpen} onOpenChange={(open) => useStudioStore.getState().setSettingsOpen(open)}>
        <DialogContent title={label('settings:title')}>
          <section className="settings-section">
            <h3>{label('settings:general')}</h3>
            <div className="field">
              <span>{label('settings:languageLabel')}</span>
              <StudioSelect
                testId="language-select"
                ariaLabel={label('settings:language')}
                value={preference}
                options={[
                  { value: 'system', label: label('settings:systemDefault') },
                  { value: 'zh-CN', label: label('settings:simplifiedChinese') },
                  { value: 'en-US', label: label('settings:english') }
                ]}
                onChange={(next) => void useStudioStore.getState().setLanguage(next)}
              />
            </div>
            {preference === 'system' ? <p className="hint">{label('settings:systemResolved', { language: resolvedName })}</p> : null}
            <div className="toggle-row">
              <span>{label('settings:recentThemes')}</span>
              <Switch
                data-testid="recent-enabled"
                checked={recentEnabled}
                onCheckedChange={(checked) => {
                  void window.themeStudio.settings.get().then((current) => window.themeStudio.settings.set({ ...current, recentEnabled: checked })).then(() => {
                    useStudioStore.setState({ recentEnabled: checked })
                  })
                }}
              />
            </div>
            <p className="hint">{label('settings:recentThemesHint')}</p>
          </section>
          <section className="settings-section">
            <h3>{label('settings:appearance')}</h3>
            <p className="hint">{label('settings:fixedChrome')}</p>
            <label className="field">
              <div className="field-head"><span>{label('settings:interfaceZoom')}</span><span>{formatPercent(zoom, language)}</span></div>
              <Slider min={0.8} max={1.5} step={0.05} value={[zoom]} onValueChange={([value]) => { if (typeof value === 'number') void useStudioStore.getState().setZoom(value) }} />
            </label>
          </section>
          <section className="settings-section">
            <h3>{label('settings:editor')}</h3>
            <div className="toggle-row">
              <span>{label('settings:tokenPanel')}</span>
              <Switch checked={bottomOpen} onCheckedChange={(checked) => useStudioStore.getState().setBottomOpen(checked)} />
            </div>
          </section>
          <section className="settings-section">
            <h3>{label('settings:preview')}</h3>
            <div className="toggle-row"><span>{label('settings:glassEffects')}</span><Switch checked={render.glassEnabled} onCheckedChange={(checked) => void useStudioStore.getState().setRender({ glassEnabled: checked })} /></div>
          </section>
          <section className="settings-section">
            <h3>{label('settings:performance')}</h3>
            <div className="toggle-row"><span>{label('settings:lowPerformance')}</span><Switch checked={render.lowPerformance} onCheckedChange={(checked) => void useStudioStore.getState().setRender({ lowPerformance: checked })} /></div>
            <div className="toggle-row"><span>{label('settings:reducedMotion')}</span><Switch checked={render.reducedMotion} onCheckedChange={(checked) => void useStudioStore.getState().setRender({ reducedMotion: checked })} /></div>
            <div className="toggle-row">
              <span>{label('settings:hardwareAcceleration')}</span>
              <Switch
                checked={hardwareAcceleration}
                onCheckedChange={(checked) => {
                  void window.themeStudio.settings.get().then((current) => window.themeStudio.settings.set({ ...current, hardwareAcceleration: checked })).then(() => {
                    useStudioStore.setState({ hardwareAcceleration: checked })
                  })
                }}
              />
            </div>
            <p className="hint">{label('settings:hardwareAccelerationHint')}</p>
          </section>
          <section className="settings-section">
            <h3>{label('settings:theme')}</h3>
            <p className="hint">{theme.meta.name}</p>
            <div className="tool-group">
              <Tooltip label={label('settings:restorePreset')}>
                <Button onClick={() => void useStudioStore.getState().restoreActive()}>{label('theme-editor:restoreDefault')}</Button>
              </Tooltip>
            </div>
          </section>
          <section className="settings-section">
            <h3>{label('settings:about')}</h3>
            <p className="hint">{label('settings:versionLine', { version: diagnostics?.version ?? '' })}</p>
            <p className="hint">{label('settings:themesFolder')}: {diagnostics?.themesDir ?? '...'}</p>
            <p className="hint">
              <Trans i18nKey={'settings:dpiHint' as 'appName'} values={{ scale }} components={{ strong: <strong /> }} />
            </p>
            <div className="tool-group">
              <Button onClick={() => void window.themeStudio.app.openThemesDir().catch((error: unknown) => useStudioStore.getState().notify({ raw: error instanceof Error ? error.message : 'code:openFolderFailed' }))}>{label('settings:openFolder')}</Button>
              <Button onClick={resetSettings}>{label('settings:resetSettings')}</Button>
              <Button data-testid="close-settings" onClick={() => useStudioStore.getState().setSettingsOpen(false)}>{label('common:close')}</Button>
            </div>
          </section>
        </DialogContent>
      </Dialog>
      <Dialog open={saveAsOpen} onOpenChange={(open) => { if (!open) useStudioStore.getState().setSaveAsOpen(false) }}>
        <DialogContent title={label(savePurpose === 'save' ? 'common:saveTheme' : 'common:saveAs')} narrow>
          <input className="num" aria-label={label('theme-library:newTheme')} value={saveName} onChange={(event) => setSaveName(event.target.value)} />
          <div className="tool-group" style={{ marginTop: 12 }}>
            <Button variant="primary" onClick={() => {
              const name = saveName.trim()
              if (!name) {
                useStudioStore.getState().notify('messages:themeNameRequired')
                return
              }
              const store = useStudioStore.getState()
              if (savePurpose === 'save') {
                void store.confirmUntitledSave(name)
                return
              }
              void store.saveAs(name).catch((error: unknown) => store.notify({ raw: error instanceof Error ? error.message : 'code:saveFailed' }))
            }}>{label('common:save')}</Button>
            <Button onClick={() => useStudioStore.getState().setSaveAsOpen(false)}>{label('common:cancel')}</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={exportOpen} onOpenChange={(open) => useStudioStore.getState().setExportOpen(open)}>
        <DialogContent title={label('export:exportTheme')}>
          {pack && pack.errors.length > 0 ? (
            <p>{label('export:invalidTheme')} {pack.errors.map((error) => showError(error, label)).join(' ')}</p>
          ) : (
            <p>{label('export:packageReady')}</p>
          )}
          <div className="tool-group">
            {EXPORT_KINDS.map((item) => (
              <Button key={item.kind} variant={item.kind === 'zip' ? 'primary' : 'default'} onClick={() => void useStudioStore.getState().exportTheme(item.kind)}>{label(item.key)}</Button>
            ))}
          </div>
          <pre className="token-body" dangerouslySetInnerHTML={{ __html: highlightCode(pack?.files.find((file) => file.path === 'README.md')?.contents ?? '', 'markdown') }} />
        </DialogContent>
      </Dialog>
    </>
  )
}
