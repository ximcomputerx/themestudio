import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Tooltip } from '@/components/ui/primitives'
import { applyCssVariables } from '@/lib/apply-css-variables'
import { useLabel } from '@/i18n/use-label'
import { getInspectedElement, readInspectStyle, setInspectedElement } from '@/lib/inspect-target'
import { cn, copyText } from '@/lib/utils'
import { useStudioStore } from '@/store/studio-store'
import { instantiatePreset } from '@/theme-engine/core/document'
import type { ThemeDocument } from '@/theme-engine/core/types'
import { presetById } from '@/theme-engine/presets'
import { ComponentsPreview, DataPreview, DesktopPreview, DialogPreview, WorkspacePreview } from './scenes'

const PREVIEW_STAMP = { id: '00000000-0000-4000-8000-0000000000aa', now: '2026-01-01T00:00:00.000Z' }
const COMPARE_STAMP = { id: '00000000-0000-4000-8000-0000000000bb', now: '2026-01-01T00:00:00.000Z' }

function scopeTheme(source: 'theme' | 'baseline'): ThemeDocument {
  const state = useStudioStore.getState()
  if (source === 'baseline') {
    return state.comparePresetId ? instantiatePreset(presetById(state.comparePresetId), COMPARE_STAMP) : state.baseline
  }
  return state.previewPresetId ? instantiatePreset(presetById(state.previewPresetId), PREVIEW_STAMP) : state.theme
}

const CSS_NAME: Record<string, string> = {
  background: 'background',
  color: 'color',
  border: 'border',
  borderRadius: 'border-radius',
  boxShadow: 'box-shadow',
  filter: 'filter',
  backdropFilter: 'backdrop-filter',
  transition: 'transition'
}

function SceneBody() {
  const scene = useStudioStore((state) => state.scene)
  if (scene === 'components') return <ComponentsPreview />
  if (scene === 'dialog') return <DialogPreview />
  if (scene === 'data') return <DataPreview />
  if (scene === 'workspace') return <WorkspacePreview />
  return <DesktopPreview />
}

function Backdrop() {
  const background = useStudioStore((state) => state.background)
  const custom = useStudioStore((state) => state.customBackground)
  const mode = background === 'custom' && !custom ? 'ambient' : background
  const style = mode === 'custom' && custom ? { backgroundImage: `url("${custom}")` } : undefined
  return <div className={`pv-backdrop pv-backdrop-${mode}`} style={style} />
}

export function BoundThemeScope({
  source = 'theme',
  bare = false,
  children
}: {
  source?: 'theme' | 'baseline'
  bare?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const apply = () => {
      const state = useStudioStore.getState()
      const node = ref.current
      if (!node) return
      applyCssVariables(node, scopeTheme(source), state.render)
    }
    apply()
    return useStudioStore.subscribe(apply)
  }, [source])

  return (
    <div
      ref={ref}
      className="theme-scope"
      data-testid={source === 'theme' ? 'preview-root' : 'preview-baseline'}
      onClick={
        bare
          ? undefined
          : (event) => {
              const target = (event.target as HTMLElement).closest<HTMLElement>('[data-inspect]')
              if (!target) return
              setInspectedElement(target)
              useStudioStore.getState().setInspection({
                name: target.dataset.inspect || 'Element',
                tokens: (target.dataset.tokens || '').split(' ').filter(Boolean),
                style: readInspectStyle(target)
              })
            }
      }
    >
      {bare ? (
        children
      ) : (
        <div className="pv-frame">
          <Backdrop />
          {children}
        </div>
      )}
    </div>
  )
}

const MIN_INSPECTOR_HEIGHT = 36

function clampInspector(height: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, height)))
}

function inspectorRoom(stage: HTMLElement, floor: number): { min: number; max: number } {
  const toolbar = stage.querySelector<HTMLElement>('.preview-toolbar')
  const banner = stage.querySelector<HTMLElement>('.preview-banner')
  const limitTop = (banner ?? toolbar)?.getBoundingClientRect().bottom ?? stage.getBoundingClientRect().top
  const max = Math.max(0, stage.getBoundingClientRect().bottom - limitTop)
  return { min: Math.min(floor, max), max }
}

function inspectorFloor(node: HTMLElement, head: HTMLElement | null): number {
  if (!head) return MIN_INSPECTOR_HEIGHT
  const styles = getComputedStyle(node)
  const pad = (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0)
  const border = (Number.parseFloat(styles.borderTopWidth) || 0) + (Number.parseFloat(styles.borderBottomWidth) || 0)
  return Math.ceil(head.offsetHeight + pad + border)
}

function measureInspector(node: HTMLElement, filled: boolean): number {
  const previous = { height: node.style.height, maxHeight: node.style.maxHeight }
  node.style.height = 'auto'
  node.style.maxHeight = filled ? '168px' : 'none'
  const height = Math.round(node.offsetHeight)
  node.style.height = previous.height
  node.style.maxHeight = previous.maxHeight
  return height
}

function InspectorBar() {
  const { label, language } = useLabel()
  const inspection = useStudioStore((state) => state.inspection)
  const theme = useStudioStore((state) => state.theme)
  const setInspection = useStudioStore((state) => state.setInspection)
  const barRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ bottom: number; min: number; max: number; moved: boolean } | null>(null)
  const [dragged, setDragged] = useState<number | null>(null)
  const [placeholder, setPlaceholder] = useState(0)
  const [limits, setLimits] = useState({ min: MIN_INSPECTOR_HEIGHT, max: 640 })
  useLayoutEffect(() => {
    const element = getInspectedElement()
    if (!inspection || !element) return
    const style = readInspectStyle(element)
    const changed = Object.entries(style).some(([key, value]) => inspection.style[key] !== value)
    if (changed) setInspection({ ...inspection, style })
  }, [theme, inspection, setInspection])
  useLayoutEffect(() => {
    const node = barRef.current
    const stage = node?.closest<HTMLElement>('.preview-stage')
    if (!node || !stage) return
    const measure = () => {
      const natural = measureInspector(node, Boolean(inspection))
      const room = inspectorRoom(stage, inspection ? inspectorFloor(node, headRef.current) : MIN_INSPECTOR_HEIGHT)
      setPlaceholder((current) => (current === natural ? current : natural))
      setLimits((current) => (current.min === room.min && current.max === room.max ? current : room))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [inspection, theme, language])
  useEffect(() => () => document.documentElement.classList.remove('inspector-dragging'), [])
  const applied = dragged == null ? null : clampInspector(dragged, limits.min, limits.max)
  const overlay = applied != null && placeholder > 0 && applied > placeholder
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stage = event.currentTarget.closest<HTMLElement>('.preview-stage')
    const node = barRef.current
    if (!stage || !node) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const room = inspectorRoom(stage, inspection ? inspectorFloor(node, headRef.current) : MIN_INSPECTOR_HEIGHT)
    setPlaceholder(measureInspector(node, Boolean(inspection)))
    setLimits(room)
    dragRef.current = { bottom: stage.getBoundingClientRect().bottom, min: room.min, max: room.max, moved: false }
    document.documentElement.classList.add('inspector-dragging')
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragRef.current
    if (!session) return
    session.moved = true
    setDragged(clampInspector(session.bottom - event.clientY, session.min, session.max))
  }
  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = dragRef.current
    dragRef.current = null
    document.documentElement.classList.remove('inspector-dragging')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!session?.moved) return
    setDragged(clampInspector(session.bottom - event.clientY, session.min, session.max))
  }
  const frame = (empty: boolean, children: ReactNode) => (
    <>
      {overlay ? <div key="inspector-slot" className="inspector-slot" style={{ height: placeholder }} aria-hidden="true" /> : null}
      <div key="inspector-frame" className={cn('inspector-frame', overlay && 'is-overlay')} style={applied == null ? undefined : { height: applied }}>
        <div
          className="inspector-resize"
          data-testid="inspector-resize"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <div ref={barRef} className={cn('inspector', empty && 'inspector-empty', applied != null && 'is-sized')} data-testid="inspector">
          {children}
        </div>
      </div>
    </>
  )
  if (!inspection) {
    return frame(
      true,
      <>
        <strong>{label('inspector:tokenInspector')}</strong>
        <span>{label('inspector:noElementSelected')}</span>
      </>
    )
  }
  const css = Object.entries(inspection.style)
    .map(([key, value]) => `${CSS_NAME[key] ?? key}: ${value}`)
    .join('\n')
  const title = inspection.name.includes(':') ? label(inspection.name) : inspection.name
  const entries = Object.entries(inspection.style)
  const background = entries.find(([key]) => key === 'background')
  const rest = entries.filter(([key]) => key !== 'background')
  const styleRow = (key: string, value: string) => (
    <div key={key} className="inspector-row">
      <span>{label(`inspector:${key}`)}</span>
      <code>{CSS_NAME[key] ?? key}: {value}</code>
    </div>
  )
  return frame(
    false,
    <>
      <div className="inspector-head" ref={headRef}>
        <strong>{label('inspector:tokenInspector')}</strong>
        <div className="inspector-actions">
          <button type="button" className="text-btn" onClick={() => void copyText(inspection.tokens.join('\n'))}>
            {label('inspector:copyToken')}
          </button>
          <button type="button" className="text-btn" onClick={() => void copyText(css)}>
            {label('inspector:copyCss')}
          </button>
          <button type="button" className="text-btn" onClick={() => setInspection(null)}>
            {label('common:clear')}
          </button>
        </div>
      </div>
      <div className="inspector-body">
        <div className="inspector-name" title={title}>{title}</div>
        <div className="inspector-kicker">{label('inspector:computedStyle')}</div>
        {background ? styleRow(background[0], background[1]) : null}
        {inspection.tokens.length > 0 ? (
          <div className="inspector-tokens">
            {inspection.tokens.map((token) => (
              <Tooltip key={token} label={label('inspector:copyToken')}>
                <button type="button" className="token-chip" onClick={() => void copyText(token)}>
                  {token}
                </button>
              </Tooltip>
            ))}
          </div>
        ) : null}
        {rest.map(([key, value]) => styleRow(key, value))}
      </div>
    </>
  )
}

export function PreviewStage() {
  const { label } = useLabel()
  const scene = useStudioStore((state) => state.scene)
  const setScene = useStudioStore((state) => state.setScene)
  const background = useStudioStore((state) => state.background)
  const setBackground = useStudioStore((state) => state.setBackground)
  const zoom = useStudioStore((state) => state.previewZoom)
  const setPreviewZoom = useStudioStore((state) => state.setPreviewZoom)
  const compare = useStudioStore((state) => state.compare)
  const comparePresetId = useStudioStore((state) => state.comparePresetId)
  const previewPresetId = useStudioStore((state) => state.previewPresetId)
  const setCompare = useStudioStore((state) => state.setCompare)
  const ratio = useStudioStore((state) => state.compareRatio)
  const setRatio = useStudioStore((state) => state.setCompareRatio)
  const focus = useStudioStore((state) => state.previewFocus)
  const setFocus = useStudioStore((state) => state.setPreviewFocus)
  const scenes = [
    ['desktop', 'preview:desktop'],
    ['components', 'preview:components'],
    ['dialog', 'preview:dialog'],
    ['data', 'preview:data'],
    ['workspace', 'preview:workspace']
  ] as const
  const backgrounds = [
    ['solid', 'preview:solidDark'],
    ['gradient', 'preview:darkGradient'],
    ['ambient', 'preview:blueAmbient'],
    ['grid', 'preview:abstractGrid'],
    ['custom', 'preview:customBackground']
  ] as const

  return (
    <section className="preview-stage">
      <div className="preview-toolbar no-drag">
        <div className="seg">
          {scenes.map(([id, labelKey]) => (
            <button key={id} type="button" className={cn(scene === id && 'active')} data-testid={`scene-${id}`} onClick={() => setScene(id)}>
              {label(labelKey)}
            </button>
          ))}
        </div>
        <div className="seg">
          {backgrounds.map(([id, labelKey]) => (
            <button
              key={id}
              type="button"
              className={cn(background === id && 'active')}
              onClick={() => {
                if (id === 'custom') {
                  void window.themeStudio.app.pickImage().then((result) => {
                    if (!result.canceled && result.dataUrl) useStudioStore.getState().setCustomBackground(result.dataUrl)
                  }).catch((error: unknown) => {
                    useStudioStore.getState().notify({ raw: error instanceof Error ? error.message : 'code:imageRequired' })
                  })
                  return
                }
                setBackground(id)
              }}
            >
              {label(labelKey)}
            </button>
          ))}
        </div>
        <div className="spacer" />
        <div className="tool-group">
          <button type="button" className="text-btn" aria-label={label('preview:zoomOut')} onClick={() => setPreviewZoom(zoom - 0.05)}>{label('preview:zoomOut')}</button>
          <label className="hint">
            {label('preview:zoom')}
            <input
              className="num"
              style={{ width: 64, marginLeft: 6 }}
              type="number"
              min={0.5}
              max={1.5}
              step={0.05}
              aria-label={label('preview:zoom')}
              value={zoom}
              onChange={(event) => {
                const next = Number(event.target.value)
                if (Number.isFinite(next)) setPreviewZoom(next)
              }}
            />
          </label>
          <button type="button" className="text-btn" aria-label={label('preview:zoomIn')} onClick={() => setPreviewZoom(zoom + 0.05)}>{label('preview:zoomIn')}</button>
          <button type="button" className="text-btn" aria-label={label('preview:resetZoom')} onClick={() => setPreviewZoom(1)}>{label('preview:resetZoom')}</button>
        </div>
        <button type="button" className={cn('ui-btn', compare && 'primary')} data-testid="before-after" onClick={() => setCompare(!compare)}>
          {label('preview:beforeAfter')}
        </button>
        <button type="button" className="ui-btn" onClick={() => setFocus(!focus)}>
          {focus ? label('preview:exitFullscreen') : label('preview:fullscreen')}
        </button>
      </div>
      {previewPresetId ? (
        <div className="preview-banner" data-testid="preset-preview-banner">
          <span>{label('theme-library:previewing', { name: label(`theme-library:presets.${previewPresetId}.name`) })}</span>
          <button type="button" className="text-btn" onClick={() => useStudioStore.getState().setPreviewPreset(null)}>
            {label('theme-library:actions.exitPreview')}
          </button>
        </div>
      ) : null}
      <div className="preview-scroll">
        <div className="preview-scale" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%` }}>
          {compare ? (
            <div className="compare">
              <div className="compare-pane" style={{ width: `${ratio * 100}%` }}>
                <div className="compare-label">
                  {comparePresetId ? label(`theme-library:presets.${comparePresetId}.name`) : label('preview:before')}
                </div>
                <BoundThemeScope source="baseline">
                  <SceneBody />
                </BoundThemeScope>
              </div>
              <div
                className="compare-divider"
                onPointerDown={(event) => {
                  const parent = event.currentTarget.parentElement
                  if (!parent) return
                  const rect = parent.getBoundingClientRect()
                  const move = (pointer: PointerEvent) => {
                    setRatio((pointer.clientX - rect.left) / rect.width)
                  }
                  const up = () => {
                    window.removeEventListener('pointermove', move)
                    window.removeEventListener('pointerup', up)
                  }
                  window.addEventListener('pointermove', move)
                  window.addEventListener('pointerup', up)
                }}
              />
              <div className="compare-pane" style={{ width: `${(1 - ratio) * 100}%` }}>
                <div className="compare-label">{label('preview:after')}</div>
                <BoundThemeScope>
                  <SceneBody />
                </BoundThemeScope>
              </div>
            </div>
          ) : (
            <BoundThemeScope>
              <SceneBody />
            </BoundThemeScope>
          )}
        </div>
      </div>
      <InspectorBar />
    </section>
  )
}
