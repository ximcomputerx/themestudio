import { useState } from 'react'
import { opaqueHex, parseColor, roundTo, toHex, toHslCss, toRgbCss, withAlpha, type Rgba } from '@/theme-engine/color/color'
import type { ColorTokens, ThemeSection, ThemeTokens } from '@/theme-engine/core/types'
import { presetById } from '@/theme-engine/presets'
import { FONT_STACKS, GLASS_DEPTHS, GLOW_LEVELS, MONO_STACKS, RANGES, type NumberRange } from '@/theme-engine/validation/ranges'
import { BoundThemeScope } from '@/components/preview/PreviewStage'
import { Slider, StudioSelect, Switch, Tooltip } from '@/components/ui/primitives'
import { formatNumber } from '@/i18n/format'
import { useLabel } from '@/i18n/use-label'
import { copyText } from '@/lib/utils'
import { useStudioStore } from '@/store/studio-store'

type NumericSection = {
  [S in ThemeSection]: {
    [K in keyof ThemeTokens[S]]: ThemeTokens[S][K] extends number ? S : never
  }[keyof ThemeTokens[S]] extends never
    ? never
    : S
}[ThemeSection]

type NumericKey<S extends ThemeSection> = {
  [K in keyof ThemeTokens[S]]: ThemeTokens[S][K] extends number ? K & string : never
}[keyof ThemeTokens[S]]

const COLOR_FIELDS: Array<{ key: keyof ColorTokens; labelKey: string; alpha?: boolean }> = [
  { key: 'appBackground', labelKey: 'colors:appBackground' },
  { key: 'workspaceBackground', labelKey: 'colors:workspaceBackground' },
  { key: 'sidebarBackground', labelKey: 'colors:sidebarBackground' },
  { key: 'panelBackground', labelKey: 'colors:panelBackground' },
  { key: 'glassSurface', labelKey: 'colors:glassBackground' },
  { key: 'glassHover', labelKey: 'colors:glassHover', alpha: true },
  { key: 'glassPopup', labelKey: 'colors:glassPopup', alpha: true },
  { key: 'primary', labelKey: 'colors:primary' },
  { key: 'secondary', labelKey: 'colors:secondary' },
  { key: 'accent', labelKey: 'colors:accent' },
  { key: 'textPrimary', labelKey: 'colors:textPrimary' },
  { key: 'textSecondary', labelKey: 'colors:textSecondary' },
  { key: 'textMuted', labelKey: 'colors:textMuted' },
  { key: 'border', labelKey: 'colors:border' },
  { key: 'success', labelKey: 'colors:success' },
  { key: 'warning', labelKey: 'colors:warning' },
  { key: 'error', labelKey: 'colors:error' },
  { key: 'info', labelKey: 'colors:info' }
]

const DEPTH_KEY = { low: 'glass:low', medium: 'glass:medium', high: 'glass:high' } as const
const LEVEL_KEY = { off: 'glow:off', subtle: 'glow:subtle', medium: 'glow:medium', strong: 'glow:strong', extreme: 'glow:extreme' } as const

function NumberField<S extends NumericSection>({
  section,
  name,
  labelKey,
  range
}: {
  section: S
  name: NumericKey<S>
  labelKey: string
  range: NumberRange
}) {
  const { label, language } = useLabel()
  const value = useStudioStore((state) => state.theme[section][name] as number)
  const presetId = useStudioStore((state) => state.theme.meta.presetId)
  const setToken = useStudioStore((state) => state.setToken)
  const finishGesture = useStudioStore((state) => state.finishGesture)
  const fallback = presetById(presetId).tokens[section][name] as number
  const title = label(labelKey)
  const commit = (next: number, mode: 'push' | 'coalesce') => {
    const rounded = roundTo(Math.min(range.max, Math.max(range.min, next)), range.decimals)
    setToken(section, name, rounded as never, mode)
  }
  const current = formatNumber(value, language, range.decimals)
  const fallbackText = formatNumber(fallback, language, range.decimals)
  return (
    <label className="field">
      <div className="field-head">
        <span>{title}</span>
        <span className="field-meta">
          {label('theme-editor:currentValue')} {current}{range.unit}
          {' · '}
          {label('theme-editor:defaultValue')} {fallbackText}{range.unit}
        </span>
      </div>
      <div className="field-row">
        <Slider
          min={range.min}
          max={range.max}
          step={range.step}
          value={[value]}
          aria-label={title}
          onValueChange={([next]) => {
            if (typeof next === 'number') commit(next, 'coalesce')
          }}
          onValueCommit={() => finishGesture()}
        />
        <input
          className="num"
          type="number"
          min={range.min}
          max={range.max}
          step={range.step}
          value={value}
          aria-label={title}
          data-testid={`${section}-${String(name)}`}
          onChange={(event) => commit(Number(event.target.value), 'coalesce')}
          onBlur={() => finishGesture()}
        />
      </div>
      <Tooltip label={label('theme-editor:resetParameter')}>
        <button type="button" className="text-btn" onClick={() => { commit(fallback, 'push'); finishGesture() }}>
          {label('common:reset')}
        </button>
      </Tooltip>
    </label>
  )
}

function ColorField({ token, labelKey, alpha = false }: { token: keyof ColorTokens; labelKey: string; alpha?: boolean }) {
  const { label } = useLabel()
  const value = useStudioStore((state) => state.theme.colors[token])
  const presetId = useStudioStore((state) => state.theme.meta.presetId)
  const setToken = useStudioStore((state) => state.setToken)
  const finishGesture = useStudioStore((state) => state.finishGesture)
  const fallback = presetById(presetId).tokens.colors[token]
  const title = label(labelKey)
  const parsed = parseColor(value)
  const commit = (next: string) => {
    if (!parseColor(next)) return
    setToken('colors', token, next, 'coalesce')
  }
  return (
    <div className="field">
      <div className="field-head">
        <span>{title}</span>
        <span className="field-meta">{label('theme-editor:defaultValue')} {fallback}</span>
      </div>
      <div className="color-grid">
        <input aria-label={`${title} ${label('colors:picker')}`} type="color" value={opaqueHex(value)} onChange={(event) => commit(alpha && parsed ? withAlpha(event.target.value, parsed.a) : event.target.value)} onBlur={() => finishGesture()} />
        <input
          className="num"
          aria-label={`${title} ${label('colors:hex')}`}
          data-testid={token === 'primary' ? 'color-primary' : undefined}
          value={parsed ? toHex(parsed, alpha) : value}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => finishGesture()}
        />
        <span className="color-actions">
          <button type="button" className="text-btn" onClick={() => void copyText(value)}>{label('colors:copyColor')}</button>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              void navigator.clipboard.readText().then((textValue) => {
                if (parseColor(textValue)) setToken('colors', token, textValue.trim(), 'push')
              })
            }}
          >
            {label('colors:pasteColor')}
          </button>
          <Tooltip label={label('theme-editor:resetParameter')}>
            <button type="button" className="text-btn" onClick={() => setToken('colors', token, fallback, 'push')}>{label('common:reset')}</button>
          </Tooltip>
        </span>
      </div>
      {parsed ? <ColorChannels color={parsed} alpha={alpha} onChange={commit} /> : <div className="hint">{label('colors:enterColor')}</div>}
    </div>
  )
}

function ColorChannels({ color, alpha, onChange }: { color: Rgba; alpha: boolean; onChange: (value: string) => void }) {
  const { label } = useLabel()
  const hsl = toHslCss(color)
  return (
    <div className="color-pop">
      <div className="hint">{label('colors:hex')} {toHex(color, alpha)}</div>
      <div className="hint">{label('colors:rgb')} {toRgbCss(color)}</div>
      <div className="hint">{label('colors:hsl')} {hsl}</div>
      {alpha ? (
        <label>
          A
          <input className="num" type="number" min={0} max={1} step={0.01} value={roundTo(color.a, 2)} onChange={(event) => onChange(withAlpha(toHex(color), Number(event.target.value)))} />
        </label>
      ) : null}
    </div>
  )
}

function Section({ title, children, openDefault = false, onReset }: { title: string; children: React.ReactNode; openDefault?: boolean; onReset?: () => void }) {
  const { label } = useLabel()
  const [open, setOpen] = useState(openDefault)
  return (
    <section className="section">
      <button type="button" className="section-head" onClick={() => setOpen((value) => !value)}>
        <h3>{title}</h3>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div className="section-body">
          {children}
          {onReset ? (
            <button type="button" className="text-btn" onClick={onReset}>{label('theme-editor:resetCategory')}</button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function resetSection(section: ThemeSection): void {
  const state = useStudioStore.getState()
  const preset = presetById(state.theme.meta.presetId)
  state.patchTheme((theme) => {
    Object.assign(theme[section], structuredClone(preset.tokens[section]))
  })
}

export function PropertyEditor() {
  const { label } = useLabel()
  const depth = useStudioStore((state) => state.theme.glass.depth)
  const level = useStudioStore((state) => state.theme.glow.level)
  const glow = useStudioStore((state) => state.theme.glow)
  const border = useStudioStore((state) => state.theme.border)
  const shadow = useStudioStore((state) => state.theme.shadow)
  const type = useStudioStore((state) => state.theme.typography)
  const motion = useStudioStore((state) => state.theme.animation.reducedMotion)
  const presetId = useStudioStore((state) => state.theme.meta.presetId)
  const setToken = useStudioStore((state) => state.setToken)
  const preset = presetById(presetId)
  return (
    <aside className="properties">
      <div className="pane-head">
        <h2>{label('theme-editor:properties')}</h2>
        <button type="button" className="text-btn" onClick={() => void useStudioStore.getState().restoreActive()}>{label('theme-editor:resetTheme')}</button>
      </div>
      <div className="scroll">
        <Section title={label('theme-editor:colorSystem')} openDefault onReset={() => resetSection('colors')}>
          {COLOR_FIELDS.map((field) => (
            <ColorField key={field.key} token={field.key} labelKey={field.labelKey} alpha={field.alpha} />
          ))}
        </Section>
        <Section title={label('theme-editor:glassEffect')} openDefault onReset={() => resetSection('glass')}>
          <NumberField section="glass" name="opacity" labelKey="glass:opacity" range={RANGES.glass.opacity} />
          <NumberField section="glass" name="blur" labelKey="glass:blur" range={RANGES.glass.blur} />
          <NumberField section="glass" name="saturation" labelKey="glass:saturation" range={RANGES.glass.saturation} />
          <NumberField section="glass" name="borderOpacity" labelKey="glass:borderOpacity" range={RANGES.glass.borderOpacity} />
          <NumberField section="glass" name="innerHighlight" labelKey="glass:innerHighlight" range={RANGES.glass.innerHighlight} />
          <NumberField section="glass" name="contrast" labelKey="glass:contrast" range={RANGES.glass.contrast} />
          <div className="field">
            <div className="field-head"><span>{label('glass:depth')}</span><span>{label('theme-editor:defaultValue')} {label(DEPTH_KEY[preset.tokens.glass.depth])}</span></div>
            <StudioSelect
              ariaLabel={label('glass:depth')}
              value={depth}
              options={GLASS_DEPTHS.map((item) => ({ value: item, label: label(DEPTH_KEY[item]) }))}
              onChange={(next) => setToken('glass', 'depth', next, 'push')}
            />
          </div>
        </Section>
        <Section title={label('theme-editor:neonGlow')} openDefault onReset={() => resetSection('glow')}>
          <GlowColor />
          <NumberField section="glow" name="intensity" labelKey="glow:intensity" range={RANGES.glow.intensity} />
          <NumberField section="glow" name="radius" labelKey="glow:radius" range={RANGES.glow.radius} />
          <NumberField section="glow" name="spread" labelKey="glow:spread" range={RANGES.glow.spread} />
          <NumberField section="glow" name="opacity" labelKey="glow:opacity" range={RANGES.glow.opacity} />
          <div className="field">
            <div className="field-head"><span>{label('theme-editor:strength')}</span><span>{label('theme-editor:defaultValue')} {label(LEVEL_KEY[preset.tokens.glow.level])}</span></div>
            <StudioSelect
              ariaLabel={label('theme-editor:strength')}
              value={level}
              options={GLOW_LEVELS.map((item) => ({ value: item, label: label(LEVEL_KEY[item]) }))}
              onChange={(next) => setToken('glow', 'level', next, 'push')}
            />
          </div>
          <Toggle label={label('glow:border')} checked={glow.border} onChange={(checked) => setToken('glow', 'border', checked, 'push')} />
          <Toggle label={label('glow:button')} checked={glow.button} onChange={(checked) => setToken('glow', 'button', checked, 'push')} />
          <Toggle label={label('glow:focus')} checked={glow.inputFocus} onChange={(checked) => setToken('glow', 'inputFocus', checked, 'push')} />
          <Toggle label={label('glow:hover')} checked={glow.hover} onChange={(checked) => setToken('glow', 'hover', checked, 'push')} />
          <Toggle label={label('glow:active')} checked={glow.active} onChange={(checked) => setToken('glow', 'active', checked, 'push')} />
        </Section>
        <Section title={label('theme-editor:border')} onReset={() => resetSection('border')}>
          <BorderColor />
          <NumberField section="border" name="width" labelKey="theme-editor:borderWidth" range={RANGES.border.width} />
          <NumberField section="border" name="opacity" labelKey="theme-editor:borderOpacity" range={RANGES.border.opacity} />
          <NumberField section="border" name="radius" labelKey="theme-editor:borderRadius" range={RANGES.border.radius} />
          <SmallColor label={label('colors:activeBorder')} value={border.activeColor} onChange={(value) => setToken('border', 'activeColor', value, 'coalesce')} />
          <SmallColor label={label('colors:hoverBorder')} value={border.hoverColor} onChange={(value) => setToken('border', 'hoverColor', value, 'coalesce')} />
          <SmallColor label={label('colors:focusBorder')} value={border.focusColor} onChange={(value) => setToken('border', 'focusColor', value, 'coalesce')} />
        </Section>
        <Section title={label('theme-editor:shadow')} onReset={() => resetSection('shadow')}>
          <SmallColor label={label('colors:shadowColor')} value={shadow.color} onChange={(value) => setToken('shadow', 'color', value, 'coalesce')} />
          <NumberField section="shadow" name="blur" labelKey="theme-editor:shadowBlur" range={RANGES.shadow.blur} />
          <NumberField section="shadow" name="spread" labelKey="theme-editor:shadowSpread" range={RANGES.shadow.spread} />
          <NumberField section="shadow" name="opacity" labelKey="theme-editor:shadowOpacity" range={RANGES.shadow.opacity} />
          <NumberField section="shadow" name="offsetX" labelKey="theme-editor:offsetX" range={RANGES.shadow.offsetX} />
          <NumberField section="shadow" name="offsetY" labelKey="theme-editor:offsetY" range={RANGES.shadow.offsetY} />
          <Toggle label={label('theme-editor:innerShadow')} checked={shadow.inner} onChange={(checked) => setToken('shadow', 'inner', checked, 'push')} />
          <Toggle label={label('theme-editor:outerShadow')} checked={shadow.outer} onChange={(checked) => setToken('shadow', 'outer', checked, 'push')} />
        </Section>
        <Section title={label('theme-editor:typography')} onReset={() => resetSection('typography')}>
          <div className="field">
            {label('theme-editor:fontFamily')}
            <StudioSelect
              ariaLabel={label('theme-editor:fontFamily')}
              value={type.fontFamily}
              options={FONT_STACKS.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(next) => setToken('typography', 'fontFamily', next, 'push')}
            />
          </div>
          <div className="field">
            {label('theme-editor:monoFamily')}
            <StudioSelect
              ariaLabel={label('theme-editor:monoFamily')}
              value={type.monoFamily}
              options={MONO_STACKS.map((item) => ({ value: item.value, label: item.label }))}
              onChange={(next) => setToken('typography', 'monoFamily', next, 'push')}
            />
          </div>
          <NumberField section="typography" name="fontSize" labelKey="theme-editor:fontSize" range={RANGES.typography.fontSize} />
          <NumberField section="typography" name="fontWeight" labelKey="theme-editor:fontWeight" range={RANGES.typography.fontWeight} />
          <NumberField section="typography" name="lineHeight" labelKey="theme-editor:lineHeight" range={RANGES.typography.lineHeight} />
          <NumberField section="typography" name="letterSpacing" labelKey="theme-editor:letterSpacing" range={RANGES.typography.letterSpacing} />
          <SmallColor label={label('theme-editor:textColor')} value={type.textColor} onChange={(value) => setToken('typography', 'textColor', value, 'coalesce')} />
          <BoundThemeScope bare>
            <div className="type-sample">{label('preview:bilingualBody')}</div>
          </BoundThemeScope>
        </Section>
        <Section title={label('theme-editor:radius')} onReset={() => resetSection('radius')}>
          <NumberField section="radius" name="sm" labelKey="theme-editor:small" range={RANGES.radius.sm} />
          <NumberField section="radius" name="md" labelKey="theme-editor:medium" range={RANGES.radius.md} />
          <NumberField section="radius" name="lg" labelKey="theme-editor:large" range={RANGES.radius.lg} />
          <NumberField section="radius" name="xl" labelKey="theme-editor:extraLarge" range={RANGES.radius.xl} />
          <NumberField section="radius" name="pill" labelKey="theme-editor:pill" range={RANGES.radius.pill} />
        </Section>
        <Section title={label('theme-editor:animation')} onReset={() => resetSection('animation')}>
          <NumberField section="animation" name="transitionMs" labelKey="theme-editor:transition" range={RANGES.animation.transitionMs} />
          <NumberField section="animation" name="hoverMs" labelKey="theme-editor:hoverDuration" range={RANGES.animation.hoverMs} />
          <NumberField section="animation" name="focusMs" labelKey="theme-editor:focusDuration" range={RANGES.animation.focusMs} />
          <NumberField section="animation" name="panelMs" labelKey="theme-editor:panelAnimation" range={RANGES.animation.panelMs} />
          <NumberField section="animation" name="dialogMs" labelKey="theme-editor:dialogAnimation" range={RANGES.animation.dialogMs} />
          <NumberField section="animation" name="glowMs" labelKey="theme-editor:glowTransition" range={RANGES.animation.glowMs} />
          <Toggle label={label('theme-editor:reducedMotion')} checked={motion} onChange={(checked) => setToken('animation', 'reducedMotion', checked, 'push')} />
        </Section>
      </div>
    </aside>
  )
}

function GlowColor() {
  const { label } = useLabel()
  const value = useStudioStore((state) => state.theme.glow.color)
  const setToken = useStudioStore((state) => state.setToken)
  return <SmallColor label={label('colors:glowColor')} value={value} onChange={(next) => setToken('glow', 'color', next, 'coalesce')} />
}

function BorderColor() {
  const { label } = useLabel()
  const value = useStudioStore((state) => state.theme.border.color)
  const setToken = useStudioStore((state) => state.setToken)
  return <SmallColor label={label('colors:borderColor')} value={value} onChange={(next) => setToken('border', 'color', next, 'coalesce')} />
}

function SmallColor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <div className="field-head"><span>{label}</span><span>{value}</span></div>
      <div className="color-grid">
        <input type="color" aria-label={label} value={opaqueHex(value)} onChange={(event) => onChange(event.target.value)} />
        <input className="num" aria-label={`${label} HEX`} value={value} onChange={(event) => { if (parseColor(event.target.value)) onChange(event.target.value) }} />
      </div>
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <Switch checked={checked} aria-label={label} onCheckedChange={onChange} />
    </div>
  )
}
