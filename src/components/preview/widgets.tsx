import { useState, type CSSProperties, type ReactNode } from 'react'
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
