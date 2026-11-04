import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function Inspectable({
  name,
  tokens,
  className,
  children
}: {
  name: string
  tokens: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className} data-inspect={name} data-tokens={tokens}>
      {children}
    </div>
  )
}

export function PvButton({
  children,
  variant = 'primary',
  forced,
  disabled,
  tone,
  onClick
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  forced?: 'hover' | 'focus' | 'active'
  disabled?: boolean
  tone?: 'danger'
  onClick?: () => void
}) {
  const inspect = variant === 'primary' ? 'preview:inspect.primaryButton' : 'preview:inspect.secondaryButton'
  return (
    <button
      type="button"
      className={cx('pv-btn', variant === 'primary' ? 'pv-btn-primary' : 'pv-btn-secondary', tone === 'danger' && 'pv-danger', forced && `is-${forced}`, disabled && 'is-disabled')}
      disabled={disabled}
      onClick={onClick}
      data-inspect={inspect}
      data-tokens="--ts-color-primary --ts-color-on-primary --ts-color-error --ts-glow-button --ts-glow-hover --ts-glow-focus --ts-glow-active --ts-radius-control --ts-duration-hover"
    >
      {children}
    </button>
  )
}

export function PvIconButton({
  label,
  forced,
  disabled,
  glyph = 'add',
  onClick
}: {
  label?: string
  forced?: 'hover' | 'focus' | 'active'
  disabled?: boolean
  glyph?: 'add' | 'close'
  onClick?: () => void
}) {
  const { t } = useTranslation('preview')
  const title = label ?? t('iconButton')
  return (
    <button
      type="button"
      className={cx('pv-icon-btn', forced && `is-${forced}`, disabled && 'is-disabled')}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      data-inspect="preview:inspect.iconButton"
      data-tokens="--ts-color-glass-hover --ts-color-border --ts-radius-control"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        {glyph === 'close' ? (
          <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.4" />
        ) : (
          <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.4" />
        )}
      </svg>
    </button>
  )
}

export function PvInput({
  placeholder,
  forced,
  disabled,
  defaultValue
}: {
  placeholder: string
  forced?: 'hover' | 'focus'
  disabled?: boolean
  defaultValue?: string
}) {
  return (
    <input
      className={cx('pv-input', forced && `is-${forced}`, disabled && 'is-disabled')}
      placeholder={placeholder}
      defaultValue={defaultValue ?? (forced ? 'Atlas / neon' : undefined)}
      disabled={disabled}
      data-inspect="preview:inspect.input"
      data-tokens="--ts-color-workspace-background --ts-color-text-primary --ts-color-focus-border --ts-glow-focus --ts-radius-control"
    />
  )
}

export function PvTextarea({ value, forced, disabled }: { value: string; forced?: 'focus'; disabled?: boolean }) {
  return (
    <textarea
      className={cx('pv-input', 'pv-textarea', forced && 'is-focus', disabled && 'is-disabled')}
      defaultValue={value}
      disabled={disabled}
      data-inspect="preview:inspect.textarea"
      data-tokens="--ts-color-workspace-background --ts-color-text-primary --ts-color-border --ts-radius-control"
    />
  )
}

export function PvField({
  label,
  hint,
  error,
  children
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className={cx('pv-field', error && 'is-error')} data-inspect="preview:inspect.field" data-tokens="--ts-color-text-secondary --ts-color-text-muted --ts-color-error --ts-color-border">
      <span className="pv-field-label">{label}</span>
      {children}
      {error ? <span className="pv-field-error">{error}</span> : hint ? <span className="pv-muted">{hint}</span> : null}
    </div>
  )
}

export function PvSelect({
  options,
  disabled = false
}: {
  options?: ReadonlyArray<readonly [string, string]>
  disabled?: boolean
}) {
  const { t } = useTranslation('preview')
  const preset = [
    ['neon', t('optionNeon')],
    ['electric', t('optionElectric')],
    ['minimal', t('optionMinimal')]
  ] as const
  const items = options ?? preset
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(items[0]?.[0] ?? 'neon')
  const current = items.find((item) => item[0] === value)?.[1] ?? items[0]?.[1] ?? ''
  return (
    <div data-inspect="preview:inspect.select" data-tokens="--ts-color-glass-hover --ts-radius-control --ts-color-glass-popup">
      <button type="button" className="pv-select" disabled={disabled} onClick={() => setOpen((valueOpen) => !valueOpen)}>
        {current}
      </button>
      {open ? (
        <div className="pv-menu pv-glass" style={{ marginTop: 6 }}>
          {items.map(([id, item]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setValue(id)
                setOpen(false)
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function PvCheck({
  label,
  checked = false,
  disabled = false,
  testId
}: {
  label: string
  checked?: boolean
  disabled?: boolean
  testId?: string
}) {
  return (
    <label className="pv-check" data-testid={testId} data-inspect="preview:inspect.checkbox" data-tokens="--ts-color-primary --ts-color-text-primary --ts-color-border --ts-color-on-primary --ts-radius-sm --ts-glow-button">
      <input type="checkbox" defaultChecked={checked} disabled={disabled} />
      {label}
    </label>
  )
}

export function PvRadio({
  label,
  checked = false,
  disabled = false,
  name = 'pv-radio'
}: {
  label: string
  checked?: boolean
  disabled?: boolean
  name?: string
}) {
  return (
    <label className="pv-radio" data-inspect="preview:inspect.radio" data-tokens="--ts-color-primary --ts-color-text-primary --ts-color-border --ts-glow-button">
      <input type="radio" name={name} defaultChecked={checked} disabled={disabled} />
      {label}
    </label>
  )
}

export function PvSwitch({
  checked = true,
  disabled = false,
  label
}: {
  checked?: boolean
  disabled?: boolean
  label?: string
}) {
  const { t } = useTranslation('preview')
  return (
    <label className="pv-switch" data-inspect="preview:inspect.switch" data-tokens="--ts-color-primary --ts-glow-button --ts-radius-pill">
      <input type="checkbox" defaultChecked={checked} disabled={disabled} />
      {label ?? t('enabled')}
    </label>
  )
}

export function PvNumber({
  forced,
  disabled = false,
  testId
}: {
  forced?: 'hover' | 'focus'
  disabled?: boolean
  testId?: string
}) {
  const { t } = useTranslation('preview')
  const [value, setValue] = useState(12)
  const commit = (next: number) => {
    if (!Number.isFinite(next)) return
    setValue(Math.min(100, Math.max(0, next)))
  }
  return (
    <div
      className={cx('pv-number', forced && `is-${forced}`)}
      data-testid={testId}
      data-inspect="preview:inspect.numberInput"
      data-tokens="--ts-color-glass-hover --ts-color-text-primary --ts-color-border --ts-color-focus-border --ts-glow-focus --ts-radius-control"
    >
      <input
        className="pv-number-input"
        type="number"
        min={0}
        max={100}
        step={1}
        value={value}
        aria-label={t('numberField')}
        disabled={disabled}
        onChange={(event) => commit(Number(event.target.value))}
      />
      <button type="button" className="pv-number-step" aria-label={t('decrease')} disabled={disabled} onClick={() => commit(value - 1)}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1.5 7h11" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <button type="button" className="pv-number-step" aria-label={t('increase')} disabled={disabled} onClick={() => commit(value + 1)}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </div>
  )
}

export function PvSlider({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState(62)
  return (
    <input
      className="pv-range"
      type="range"
      min={0}
      max={100}
      step={1}
      value={value}
      disabled={disabled}
      style={{ '--pv-fill': `${value}%` } as CSSProperties}
      data-inspect="preview:inspect.slider"
      data-tokens="--ts-color-primary --ts-color-border --ts-glow-button --ts-glow-hover --ts-glow-focus --ts-radius-pill"
      onChange={(event) => {
        if (disabled) return
        setValue(Number(event.target.value))
      }}
    />
  )
}

export function PvTabs() {
  const { t } = useTranslation('preview')
  const tabs = [
    ['tokens', t('tabTokens')],
    ['glass', t('tabGlass')],
    ['export', t('tabExport')]
  ] as const
  const [tab, setTab] = useState<(typeof tabs)[number][0]>('tokens')
  return (
    <div className="pv-tabs" data-inspect="preview:inspect.tabs" data-tokens="--ts-color-primary --ts-color-active-border --ts-glow-active --ts-radius-lg">
      {tabs.map(([id, item]) => (
        <button key={id} type="button" className={cx('pv-tab', tab === id && 'is-selected')} aria-selected={tab === id} onClick={() => setTab(id)}>
          {item}
        </button>
      ))}
      <button type="button" className="pv-tab" disabled>
        {t('tabDisabled')}
      </button>
    </div>
  )
}

export function PvBadge({ tone, children }: { tone?: 'ok' | 'warn' | 'err' | 'info'; children: ReactNode }) {
  return (
    <span className={cx('pv-badge', tone)} data-inspect="preview:inspect.badge" data-tokens="--ts-color-accent --ts-color-success --ts-color-warning --ts-color-error --ts-color-info --ts-radius-pill">
      {children}
    </span>
  )
}

export function PvTooltip({ open = false }: { open?: boolean }) {
  const { t } = useTranslation('preview')
  return (
    <span className={cx('pv-tip', open && 'is-hover')} data-inspect="preview:inspect.tooltip" data-tokens="--ts-color-glass-popup --ts-glow-border --ts-radius-sm">
      <button type="button" className="pv-btn pv-btn-secondary">{t('hoverMe')}</button>
      <span>{t('tokenHint')}</span>
    </span>
  )
}

export function PvProgress() {
  return (
    <div className="pv-progress" data-inspect="preview:inspect.progress" data-tokens="--ts-color-primary --ts-color-accent --ts-glow-button --ts-radius-pill">
      <i />
    </div>
  )
}

export function PvToast() {
  const { t } = useTranslation('preview')
  return (
    <div className="pv-toast pv-glass" data-inspect="preview:inspect.toast" data-tokens="--ts-color-glass-popup --ts-color-active-border --ts-glow-border --ts-shadow-outer">
      <div>
        <strong>{t('themeApplied')}</strong>
        <div className="pv-secondary">{t('tokensUpdated')}</div>
      </div>
      <PvBadge tone="ok">{t('success')}</PvBadge>
    </div>
  )
}

const TODAY = { y: 2026, m: 10, d: 4 }
const WEEKDAYS = ['weekMon', 'weekTue', 'weekWed', 'weekThu', 'weekFri', 'weekSat', 'weekSun'] as const
const MONTHS = ['month1', 'month2', 'month3', 'month4', 'month5', 'month6', 'month7', 'month8', 'month9', 'month10', 'month11', 'month12'] as const

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatIso(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

function sameDay(a: { y: number; m: number; d: number }, b: { y: number; m: number; d: number }): boolean {
  return a.y === b.y && a.m === b.m && a.d === b.d
}

function shiftMonth(y: number, m: number, delta: number): { y: number; m: number } {
  const date = new Date(y, m + delta, 1)
  return { y: date.getFullYear(), m: date.getMonth() }
}

function monthCells(year: number, month: number): Array<{ y: number; m: number; d: number; outside: boolean }> {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const start = new Date(year, month, 1 - offset)
  const cells: Array<{ y: number; m: number; d: number; outside: boolean }> = []
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    cells.push({
      y: date.getFullYear(),
      m: date.getMonth(),
      d: date.getDate(),
      outside: date.getMonth() !== month || date.getFullYear() !== year
    })
  }
  while (cells.length > 35 && cells.slice(-7).every((cell) => cell.outside)) cells.splice(-7, 7)
  return cells
}

function rgbToHex(color: string): string | null {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color.toLowerCase()
  const match = color.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
  if (!match) return null
  const channel = (value: string) => Math.max(0, Math.min(255, Math.round(Number(value)))).toString(16).padStart(2, '0')
  return `#${channel(match[1] ?? '0')}${channel(match[2] ?? '0')}${channel(match[3] ?? '0')}`
}

export function PvDate({ open = false }: { open?: boolean }) {
  const { t } = useTranslation('preview')
  const [cursor, setCursor] = useState({ y: TODAY.y, m: TODAY.m })
  const [selected, setSelected] = useState(TODAY)
  if (!open) {
    return (
      <button
        type="button"
        className="pv-input pv-date-field"
        data-inspect="preview:inspect.datePicker"
        data-tokens="--ts-color-workspace-background --ts-color-text-primary --ts-color-border --ts-radius-control"
        onClick={() => {
          const last = new Date(selected.y, selected.m + 1, 0).getDate()
          setSelected({ ...selected, d: selected.d >= last ? 1 : selected.d + 1 })
        }}
      >
        {formatIso(selected.y, selected.m, selected.d)}
      </button>
    )
  }
  const cells = monthCells(cursor.y, cursor.m)
  return (
    <div className="pv-calendar" data-inspect="preview:inspect.datePicker" data-tokens="--ts-color-glass-popup --ts-color-text-primary --ts-color-text-muted --ts-color-active-border --ts-color-primary --ts-radius-control --ts-glow-active">
      <div className="pv-calendar-head">
        <button type="button" className="pv-calendar-nav" aria-label={t('calendarPrev')} onClick={() => setCursor(shiftMonth(cursor.y, cursor.m, -1))}>‹</button>
        <strong>{t('monthLabel', { year: cursor.y, month: t(MONTHS[cursor.m] ?? 'month1') })}</strong>
        <button type="button" className="pv-calendar-nav" aria-label={t('calendarNext')} onClick={() => setCursor(shiftMonth(cursor.y, cursor.m, 1))}>›</button>
      </div>
      <div className="pv-calendar-week">
        {WEEKDAYS.map((key) => <span key={key}>{t(key)}</span>)}
      </div>
      <div className="pv-calendar-grid">
        {cells.map((cell) => {
          const picked = sameDay(cell, selected)
          const today = sameDay(cell, TODAY)
          const disabled = !cell.outside && cell.d === 8
          return (
            <button
              key={formatIso(cell.y, cell.m, cell.d)}
              type="button"
              className={cx('pv-day', cell.outside && 'is-outside', today && 'is-today', picked && 'is-selected')}
              aria-label={formatIso(cell.y, cell.m, cell.d)}
              aria-pressed={picked}
              aria-current={today ? 'date' : undefined}
              disabled={disabled}
              onClick={() => {
                setSelected(cell)
                if (cell.outside) setCursor({ y: cell.y, m: cell.m })
              }}
            >
              {cell.d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PvColor() {
  const { t } = useTranslation('preview')
  const swatchRef = useRef<HTMLSpanElement>(null)
  const picked = useRef<string | null>(null)
  const [hex, setHex] = useState<string | null>(null)
  const [themeHex, setThemeHex] = useState('#000000')
  picked.current = hex
  useEffect(() => {
    const node = swatchRef.current
    const scope = node?.closest('.theme-scope')
    if (!node) return
    let frame = 0
    const read = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (picked.current) return
        const next = rgbToHex(getComputedStyle(node).backgroundColor)
        if (next) setThemeHex((current) => (current === next ? current : next))
      })
    }
    read()
    if (!scope) return () => cancelAnimationFrame(frame)
    const observer = new MutationObserver(read)
    observer.observe(scope, { attributes: true, attributeFilter: ['style'] })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])
  const shown = hex ?? themeHex
  return (
    <div className="pv-color" data-inspect="preview:inspect.colorInput" data-tokens="--ts-color-primary --ts-color-border --ts-color-text-primary --ts-radius-control --ts-glow-focus">
      <label className="pv-color-swatch">
        <input
          type="color"
          aria-label={t('color')}
          value={shown}
          onChange={(event) => setHex(event.target.value)}
        />
        <span ref={swatchRef} style={hex ? { background: hex } : undefined} />
      </label>
      <span className="pv-color-hex">{shown.toUpperCase()}</span>
    </div>
  )
}

export function PvCombobox() {
  const { t } = useTranslation('preview')
  const options = [
    ['neon', t('optionNeon')],
    ['electric', t('optionElectric')],
    ['minimal', t('optionMinimal')]
  ] as const
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const needle = query.trim().toLowerCase()
  const filtered = options.filter(([, label]) => label.toLowerCase().includes(needle))
  return (
    <div className="pv-combobox" data-inspect="preview:inspect.combobox" data-tokens="--ts-color-text-primary --ts-color-border --ts-color-glass-popup --ts-radius-control">
      <input
        className="pv-input"
        placeholder={t('comboboxPlaceholder')}
        value={query}
        aria-label={t('combobox')}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
      />
      {open ? (
        <div className="pv-menu pv-glass">
          {filtered.length === 0 ? <p className="pv-muted">{t('emptyHint')}</p> : filtered.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setQuery(label)
                setOpen(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function PvChip({ children, selected = false, disabled = false }: { children: ReactNode; selected?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={cx('pv-chip', selected && 'is-selected')}
      disabled={disabled}
      data-inspect="preview:inspect.chip"
      data-tokens="--ts-color-elevated-surface --ts-color-border --ts-color-active-border --ts-color-primary --ts-radius-pill"
    >
      {children}
    </button>
  )
}

export function PvAccordion() {
  const { t } = useTranslation('preview')
  const items = [
    ['glass', t('accordionGlass'), t('accordionGlassBody')],
    ['type', t('accordionType'), t('accordionTypeBody')],
    ['motion', t('accordionMotion'), t('accordionMotionBody')]
  ] as const
  const [open, setOpen] = useState<(typeof items)[number][0]>('glass')
  return (
    <div className="pv-accordion" data-inspect="preview:inspect.accordion" data-tokens="--ts-color-border --ts-color-text-primary --ts-color-text-secondary --ts-color-elevated-surface --ts-radius-control">
      {items.map(([id, title, body]) => (
        <div key={id} className="pv-accordion-item">
          <button type="button" aria-expanded={open === id} onClick={() => setOpen(id)}>
            {title}
          </button>
          {open === id ? <p>{body}</p> : null}
        </div>
      ))}
    </div>
  )
}

export function PvAvatar({
  initials,
  caption,
  tone,
  dot
}: {
  initials: string
  caption?: string
  tone?: 'accent' | 'muted'
  dot?: 'ok'
}) {
  return (
    <span className={cx('pv-avatar', tone === 'accent' && 'is-accent', tone === 'muted' && 'is-muted')} data-inspect="preview:inspect.avatar" data-tokens="--ts-color-primary --ts-color-on-primary --ts-color-accent --ts-color-text-muted --ts-color-success --ts-radius-pill">
      <span className="pv-avatar-face">
        {initials}
        {dot ? <i className="pv-avatar-dot" /> : null}
      </span>
      {caption ? <span className="pv-avatar-caption">{caption}</span> : null}
    </span>
  )
}

export function PvSkeleton() {
  return (
    <div className="pv-skeleton" data-inspect="preview:inspect.skeleton" data-tokens="--ts-color-text-muted --ts-color-elevated-surface --ts-radius-pill" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
  )
}

export function PvSpinner() {
  const { t } = useTranslation('preview')
  return <span className="pv-spinner" role="status" aria-label={t('spinner')} data-inspect="preview:inspect.spinner" data-tokens="--ts-color-primary --ts-radius-pill" />
}

export function PvAlert({ tone, title, body }: { tone: 'info' | 'warn' | 'err'; title: string; body: string }) {
  return (
    <div className={cx('pv-alert', tone)} data-inspect="preview:inspect.alert" data-tokens="--ts-color-info --ts-color-warning --ts-color-error --ts-color-border --ts-color-text-primary --ts-radius-control">
      <strong>{title}</strong>
      <span className="pv-secondary">{body}</span>
    </div>
  )
}

export function PvKbd({ children }: { children: ReactNode }) {
  return <kbd className="pv-kbd">{children}</kbd>
}

export function PvKbdPair() {
  const { t } = useTranslation('preview')
  return (
    <span className="pv-kbd-pair" data-inspect="preview:inspect.kbd" data-tokens="--ts-color-elevated-surface --ts-color-border --ts-color-text-secondary --ts-radius-sm">
      <PvKbd>{t('kbdCtrl')}</PvKbd>
      <PvKbd>{t('kbdKey')}</PvKbd>
    </span>
  )
}

export function PvEmpty() {
  const { t } = useTranslation('preview')
  return (
    <div className="pv-empty" data-inspect="preview:inspect.empty" data-tokens="--ts-color-text-primary --ts-color-text-muted --ts-color-border --ts-radius-control">
      <strong>{t('emptyTitle')}</strong>
      <span className="pv-muted">{t('emptyHint')}</span>
      <PvButton variant="secondary">{t('emptyAction')}</PvButton>
    </div>
  )
}

export function PvSeparator() {
  const { t } = useTranslation('preview')
  return <hr className="pv-sep" aria-label={t('separator')} data-inspect="preview:inspect.separator" data-tokens="--ts-color-border" />
}

export function PvSegment() {
  const { t } = useTranslation('preview')
  const tabs = [
    ['tokens', t('tabTokens')],
    ['glass', t('tabGlass')],
    ['export', t('tabExport')]
  ] as const
  const [tab, setTab] = useState<(typeof tabs)[number][0]>('tokens')
  return (
    <div className="pv-tabs pv-toolbar-seg" aria-label={t('segment')} data-inspect="preview:inspect.segment" data-tokens="--ts-color-primary --ts-color-active-border --ts-glow-active --ts-radius-lg">
      {tabs.map(([id, item]) => (
        <button key={id} type="button" className={cx('pv-tab', tab === id && 'is-selected')} aria-selected={tab === id} onClick={() => setTab(id)}>
          {item}
        </button>
      ))}
    </div>
  )
}
