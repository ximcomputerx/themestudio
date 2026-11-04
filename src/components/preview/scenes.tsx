import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatFileSize, uiLanguage } from '@/i18n/format'
import {
  PvAccordion,
  PvAlert,
  PvAvatar,
  PvBadge,
  PvButton,
  PvCheck,
  PvChip,
  PvColor,
  PvCombobox,
  PvDate,
  PvEmpty,
  PvField,
  PvIconButton,
  PvInput,
  PvKbdPair,
  PvNumber,
  PvProgress,
  PvRadio,
  PvSegment,
  PvSelect,
  PvSeparator,
  PvSkeleton,
  PvSlider,
  PvSpinner,
  PvSwitch,
  PvTabs,
  PvTextarea,
  PvToast,
  PvTooltip
} from './widgets'

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

function StateLine({ label, variant, tone }: { label: string; variant: 'primary' | 'secondary'; tone?: 'danger' }) {
  const { t } = useTranslation('preview')
  const testId = tone === 'danger' ? 'state-danger' : variant === 'primary' ? 'state-primary' : 'state-secondary'
  return (
    <div className="pv-state-line" data-testid={testId}>
      <span className="pv-secondary">{label}</span>
      <PvButton variant={variant} tone={tone}>{t('stateDefault')}</PvButton>
      <PvButton variant={variant} tone={tone} forced="hover">{t('stateHover')}</PvButton>
      <PvButton variant={variant} tone={tone} forced="focus">{t('stateFocus')}</PvButton>
      <PvButton variant={variant} tone={tone} forced="active">{t('stateActive')}</PvButton>
      <PvButton variant={variant} tone={tone} disabled>{t('stateDisabled')}</PvButton>
    </div>
  )
}

function CodeBlock({ source }: { source: string }) {
  const lines = source.split('\n')
  return (
    <div className="pv-editor" data-inspect="preview:inspect.editor" data-tokens="--ts-font-mono --ts-color-app-background --ts-color-text-primary">
      {lines.map((line, index) => (
        <div className="pv-code-line" key={`${index}-${line}`}>
          <span className="pv-gutter">{index + 1}</span>
          <span>{line.length > 0 ? line : '\u00a0'}</span>
        </div>
      ))}
    </div>
  )
}

export function DesktopPreview() {
  const { t } = useTranslation('preview')
  const crumbs = [t('crumbStudio'), t('crumbLibrary'), t('workspaceTitle')]
  const nav = [
    ['settings', t('themeSettings')],
    ['files', t('fileManager')],
    ['projects', t('projects')],
    ['tokens', t('tokens')],
    ['status', t('connectionStatus')]
  ] as const
  const recent = [
    ['atlas', t('recentAtlas'), t('time2m')],
    ['nordic', t('recentNordic'), t('time1h')],
    ['draft', t('recentExportName'), t('timeYesterday')],
    ['sandbox', t('recentSandbox'), t('time3d')]
  ] as const
  const stats = [
    [t('statThemes'), t('statThemesValue')],
    [t('statContrast'), t('statContrastValue')],
    [t('statExports'), t('statExportsValue')],
    [t('statWarnings'), t('statWarningsValue')]
  ] as const
  const activity = [
    ['saved', t('activitySaved'), t('timeNow'), t('success'), 'ok', 'is-selected'],
    ['contrast', t('activityContrast'), t('time5m'), t('info'), 'info', 'is-hover'],
    ['export', t('activityExport'), t('time12m'), t('success'), 'ok', ''],
    ['preview', t('activityPreview'), t('time25m'), t('warning'), 'warn', ''],
    ['rename', t('activityRename'), t('time40m'), t('info'), 'info', ''],
    ['sync', t('activitySync'), t('time1h'), t('blocked'), 'err', 'is-disabled']
  ] as const
  return (
    <div className="pv-scene">
      <div className="pv-app">
        <div className="pv-titlebar" data-inspect="preview:inspect.titlebar" data-tokens="--ts-color-secondary-background --ts-color-text-primary">
          <strong>{t('sampleApp')}</strong>
          <span>{t('themePreview')}</span>
          <span className="pv-push">{t('connectionStatus')}</span>
        </div>
        <div className="pv-toolbar-line" data-inspect="preview:inspect.toolbar" data-tokens="--ts-color-elevated-surface --ts-color-border">
          <div className="pv-toolbar-row">
            <div className="pv-toolbar-cluster">
              <PvButton>{t('save')}</PvButton>
              <PvButton variant="secondary">{t('cancel')}</PvButton>
              <span className="pv-tip pv-tip-below" data-inspect="preview:inspect.tooltip" data-tokens="--ts-color-glass-popup --ts-glow-border --ts-radius-sm">
                <PvIconButton label={t('add')} />
                <span>{t('tokenHint')}</span>
              </span>
            </div>
            <div className="pv-tabs pv-toolbar-seg" data-testid="desktop-segments">
              <button type="button" className="pv-tab is-selected">{t('tabTokens')}</button>
              <button type="button" className="pv-tab">{t('tabGlass')}</button>
              <button type="button" className="pv-tab">{t('tabExport')}</button>
            </div>
            <div className="pv-toolbar-cluster pv-toolbar-end">
              <PvButton variant="secondary">{t('publish')}</PvButton>
              <PvButton variant="secondary">{t('sync')}</PvButton>
            </div>
          </div>
          <div className="pv-toolbar-row">
            <div className="pv-toolbar-fill">
              <PvInput placeholder={t('searchThemes')} />
              <div className="pv-toolbar-filter" data-testid="desktop-filter">
                <PvSelect
                  options={[
                    ['all', t('filterAll')],
                    ['dark', t('filterDark')],
                    ['light', t('filterLight')]
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pv-body">
          <aside className="pv-sidebar pv-glass" data-inspect="preview:inspect.sidebar" data-tokens="--ts-glass-surface --ts-backdrop-filter --ts-color-glass-border --ts-glow-border">
            <div className="pv-kicker">{t('navigation')}</div>
            {nav.map(([id, item], index) => (
              <button key={id} type="button" className={cx('pv-nav-item', index === 0 && 'is-selected', id === 'projects' && 'has-badge')}>
                <span>{item}</span>
                {id === 'projects' ? <PvBadge tone="info">{t('navCount')}</PvBadge> : null}
              </button>
            ))}
            <div className="pv-kicker pv-kicker-split">{t('recentProjects')}</div>
            {recent.map(([id, item, time]) => (
              <button key={id} type="button" className="pv-nav-item pv-nav-meta">
                <span>{item}</span>
                <span className="pv-muted">{time}</span>
              </button>
            ))}
          </aside>
          <div className="pv-main">
            <div className="pv-main-col">
              <div className="pv-page-head">
                <nav className="pv-breadcrumb" data-inspect="preview:inspect.breadcrumb" data-tokens="--ts-color-text-secondary --ts-color-text-primary">
                  {crumbs.map((item, index) => (
                    <span key={item} className={index === crumbs.length - 1 ? 'is-current' : undefined}>
                      {index > 0 ? <span className="pv-muted"> / </span> : null}
                      {item}
                    </span>
                  ))}
                </nav>
                <div className="pv-row">
                  <h3>{t('workspaceTitle')}</h3>
                  <PvBadge tone="ok">{t('buildPassing')}</PvBadge>
                </div>
                <p className="pv-secondary">{t('workspaceBody')}</p>
              </div>
              <div className="pv-stats" data-testid="desktop-stats" data-inspect="preview:inspect.stats" data-tokens="--ts-color-elevated-surface --ts-color-text-primary --ts-color-text-secondary --ts-color-border --ts-radius-lg">
                {stats.map(([label, value]) => (
                  <div key={label} className="pv-stat">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <section className="pv-panel pv-glass pv-block" data-inspect="preview:inspect.mainPanel" data-tokens="--ts-glass-surface --ts-shadow-outer --ts-inner-highlight --ts-radius-lg">
                <div className="pv-bars" data-inspect="preview:inspect.chart" data-tokens="--ts-color-primary --ts-color-accent --ts-glow-button">
                  <i style={{ height: '40%' }} />
                  <i style={{ height: '70%' }} />
                  <i style={{ height: '55%' }} />
                  <i style={{ height: '88%' }} />
                  <i style={{ height: '46%' }} />
                </div>
                <div className="pv-legend" data-inspect="preview:inspect.legend" data-tokens="--ts-color-primary --ts-color-accent --ts-color-secondary">
                  <span><i className="pv-swatch primary" /> {t('legendPrimary')}</span>
                  <span><i className="pv-swatch accent" /> {t('legendAccent')}</span>
                  <span><i className="pv-swatch secondary" /> {t('legendSecondary')}</span>
                </div>
                <PvField label={t('timeRange')}>
                  <PvSlider />
                </PvField>
                <div className="pv-list pv-activity" data-testid="desktop-activity" data-inspect="preview:inspect.activityList" data-tokens="--ts-color-text-primary --ts-color-text-secondary --ts-color-active-border --ts-color-glass-hover">
                  {activity.map(([id, label, time, badge, tone, state]) => (
                    <button key={id} type="button" className={cx('pv-list-row', state)} disabled={state === 'is-disabled'}>
                      <span>{label}</span>
                      <span className="pv-muted pv-time">{time}</span>
                      <PvBadge tone={tone || undefined}>{badge}</PvBadge>
                    </button>
                  ))}
                </div>
              </section>
            </div>
            <aside className="pv-float pv-glass pv-block" data-inspect="preview:inspect.floatingPanel" data-tokens="--ts-color-glass-popup --ts-shadow-outer --ts-glow-border --ts-radius-xl">
              <h3>{t('settings')}</h3>
              <PvSwitch label={t('liveSync')} />
              <PvField label={t('exportCopies')}>
                <PvNumber />
              </PvField>
              <div className="pv-stack">
                <PvCheck label={t('checkPassed')} checked />
                <PvCheck label={t('checkReview')} />
                <PvCheck label={t('checkBlocked')} />
              </div>
              <PvProgress />
              <div className="pv-split-actions">
                <PvButton>{t('save')}</PvButton>
                <PvButton variant="secondary">{t('sync')}</PvButton>
              </div>
            </aside>
          </div>
        </div>
        <PvToast />
        <div className="pv-status" data-inspect="preview:inspect.statusBar" data-tokens="--ts-color-secondary-background --ts-color-text-secondary">
          <span className="pv-dot" /> {t('ready')}
          <span>{t('utf8')}</span>
          <span>{t('sampleApp')}</span>
          <span className="pv-push">{t('lineColumn')}</span>
          <span>{t('spaces')}</span>
        </div>
      </div>
    </div>
  )
}

export function ComponentsPreview() {
  const { t } = useTranslation('preview')
  const crumbs = [t('crumbStudio'), t('crumbLibrary'), t('crumbPreset'), t('crumbTokens')]
  const list = [
    ['saved', t('listSaved'), t('success'), 'ok', 'is-selected'],
    ['draft', t('listDraft'), t('info'), 'info', 'is-hover'],
    ['review', t('listReviewItem'), t('review'), 'warn', ''],
    ['archived', t('listArchived'), t('retired'), '', 'is-disabled']
  ] as const
  return (
    <div className="pv-scene pv-scene-stack">
      <section className="pv-panel pv-glass pv-block">
        <h3>{t('buttons')}</h3>
        <div className="pv-state-table">
          <header className="pv-secondary">
            <span />
            <span>{t('stateDefault')}</span>
            <span>{t('stateHover')}</span>
            <span>{t('stateFocus')}</span>
            <span>{t('stateActive')}</span>
            <span>{t('stateDisabled')}</span>
          </header>
          <StateLine label={t('primary')} variant="primary" />
          <StateLine label={t('secondary')} variant="secondary" />
          <StateLine label={t('danger')} variant="secondary" tone="danger" />
          <div className="pv-state-line" data-testid="state-icon">
            <span className="pv-secondary">{t('iconButton')}</span>
            <PvIconButton />
            <PvIconButton forced="hover" />
            <PvIconButton forced="focus" />
            <PvIconButton forced="active" />
            <PvIconButton disabled />
          </div>
        </div>
        <div className="pv-row">
          <PvTooltip />
          <PvTooltip open />
        </div>
      </section>
      <section className="pv-panel pv-glass pv-block">
        <h3>{t('inputs')}</h3>
        <div className="pv-control-stack">
          <div className="pv-control-row cols-4">
            <PvInput placeholder={t('projectName')} />
            <PvInput placeholder={t('hoverField')} forced="hover" />
            <PvInput placeholder={t('focusedField')} forced="focus" />
            <PvInput placeholder={t('disabledInput')} defaultValue={t('disabledValue')} disabled />
          </div>
          <div data-inspect="preview:inspect.searchInput" data-tokens="--ts-color-text-primary --ts-glow-focus">
            <PvInput placeholder={t('searchTokens')} />
          </div>
          <div className="pv-control-row cols-2">
            <PvSelect />
            <PvSelect disabled />
          </div>
          <div className="pv-control-row cols-3">
            <PvCheck testId="check-glass" label={t('includeGlass')} checked />
            <PvCheck label={t('reducedChrome')} />
            <PvCheck label={t('stateDisabled')} disabled />
          </div>
          <div className="pv-control-row cols-3">
            <PvRadio label={t('desktopOption')} checked />
            <PvRadio label={t('workspaceOption')} />
            <PvRadio label={t('stateDisabled')} disabled />
          </div>
          <div className="pv-control-row cols-3">
            <PvSwitch />
            <PvSwitch checked={false} label={t('switchOff')} />
            <PvSwitch disabled label={t('stateDisabled')} />
          </div>
          <div className="pv-control-row cols-2">
            <PvSlider />
            <PvSlider disabled />
          </div>
          <div className="pv-control-row cols-4">
            <PvNumber testId="number-default" />
            <PvNumber testId="number-hover" forced="hover" />
            <PvNumber testId="number-focus" forced="focus" />
            <PvNumber testId="number-disabled" disabled />
          </div>
          <PvField label={t('combobox')}>
            <PvCombobox />
          </PvField>
          <div className="pv-control-row cols-2">
            <PvField label={t('color')}>
              <PvColor />
            </PvField>
            <PvField label={t('date')}>
              <PvDate />
            </PvField>
          </div>
        </div>
      </section>
      <section className="pv-panel pv-glass" data-testid="component-form" data-inspect="preview:inspect.form" data-tokens="--ts-color-text-primary --ts-color-text-muted --ts-color-error --ts-color-border">
        <h3>{t('formTitle')}</h3>
        <div className="pv-form-grid">
          <div className="pv-span-2">
            <PvField label={t('textareaLabel')}>
              <PvTextarea value={t('textareaValue')} />
            </PvField>
          </div>
          <PvField label={t('textareaFocus')}>
            <PvTextarea value={t('textareaValue')} forced="focus" />
          </PvField>
          <PvField label={t('textareaDisabled')}>
            <PvTextarea value={t('disabledValue')} disabled />
          </PvField>
          <PvField label={t('disabledInput')}>
            <PvInput placeholder={t('disabledInput')} defaultValue={t('disabledValue')} disabled />
          </PvField>
          <PvField label={t('errorLabel')} error={t('errorText')}>
            <PvInput placeholder={t('errorLabel')} defaultValue={t('errorValue')} />
          </PvField>
          <div className="pv-span-2">
            <PvField label={t('hintLabel')} hint={t('hintText')}>
              <PvInput placeholder={t('hintLabel')} defaultValue={t('hintValue')} />
            </PvField>
          </div>
        </div>
      </section>
      <section className="pv-panel pv-glass pv-block" data-testid="component-list">
        <h3>{t('navTitle')}</h3>
        <nav className="pv-breadcrumb" data-inspect="preview:inspect.breadcrumb" data-tokens="--ts-color-text-secondary --ts-color-text-primary">
          {crumbs.map((item, index) => (
            <span key={item} className={index === crumbs.length - 1 ? 'is-current' : undefined}>
              {index > 0 ? <span className="pv-muted"> / </span> : null}
              {item}
            </span>
          ))}
        </nav>
        <div className="pv-links">
          <button type="button" className="pv-link">{t('linkDefault')}</button>
          <button type="button" className="pv-link is-hover">{t('linkHover')}</button>
          <button type="button" className="pv-link is-disabled" disabled>{t('linkDisabled')}</button>
        </div>
        <h3>{t('listTitle')}</h3>
        <div className="pv-list" data-inspect="preview:inspect.list" data-tokens="--ts-color-text-primary --ts-color-active-border --ts-color-glass-hover --ts-color-text-muted">
          {list.map(([id, label, badge, tone, state]) => (
            <button key={id} type="button" className={cx('pv-list-row', state)} disabled={state === 'is-disabled'}>
              <span>{label}</span>
              <span />
              <PvBadge tone={tone || undefined}>{badge}</PvBadge>
            </button>
          ))}
        </div>
        <PvEmpty />
      </section>
      <section className="pv-panel pv-glass pv-block">
        <h3>{t('tableTitle')}</h3>
        <div className="pv-table-scroll" data-inspect="preview:inspect.table" data-tokens="--ts-color-border --ts-color-text-primary --ts-color-primary">
          <table className="pv-table pv-sample-table">
            <thead>
              <tr>
                <th>{t('columnName')}</th>
                <th>{t('columnGroup')}</th>
                <th>{t('columnValue')}</th>
                <th>{t('columnStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {([
                ['color.primary', t('colorGroup'), 'var(--ts-color-primary)', t('live'), 'is-selected'],
                ['glass.blur', t('glassGroup'), '8px', t('stable'), 'is-hover'],
                ['radius.md', t('radiusGroup'), '8px', t('stable'), ''],
                ['animation.hover', t('animationGroup'), '160ms', t('retired'), 'is-disabled']
              ] as const).map(([name, group, value, status, state]) => (
                <tr key={name} className={state}>
                  <td>{name}</td>
                  <td>{group}</td>
                  <td>{value}</td>
                  <td>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pv-pages pv-pages-end" data-inspect="preview:inspect.pagination" data-tokens="--ts-color-elevated-surface --ts-color-active-border --ts-color-primary">
          <button type="button" className="pv-page">{t('pagePrev')}</button>
          <button type="button" className="pv-page">1</button>
          <button type="button" className="pv-page is-selected">2</button>
          <button type="button" className="pv-page">3</button>
          <button type="button" className="pv-page">{t('pageNext')}</button>
        </div>
      </section>
      <section className="pv-panel pv-glass pv-block">
        <h3>{t('marksTitle')}</h3>
        <PvDate open />
        <div className="pv-row">
          <PvChip>{t('chipGlass')}</PvChip>
          <PvChip selected>{t('chipNeon')}</PvChip>
          <PvChip disabled>{t('chipDraft')}</PvChip>
        </div>
        <PvAccordion />
        <div className="pv-stack">
          <PvAlert tone="info" title={t('alertInfoTitle')} body={t('alertInfoBody')} />
          <PvAlert tone="warn" title={t('alertWarnTitle')} body={t('alertWarnBody')} />
          <PvAlert tone="err" title={t('alertErrTitle')} body={t('alertErrBody')} />
        </div>
        <PvSkeleton />
        <div className="pv-row">
          <PvAvatar initials={t('avatarInitials')} dot="ok" />
          <PvAvatar initials={t('avatarNordic')} tone="accent" />
          <PvAvatar initials={t('avatarMuted')} tone="muted" />
        </div>
        <PvSeparator />
        <section className="pv-card pv-glass" data-inspect="preview:inspect.card" data-tokens="--ts-glass-surface --ts-radius-lg --ts-shadow-outer">
          <h3>{t('cardSampleTitle')}</h3>
          <p className="pv-secondary">{t('cardSampleBody')}</p>
          <div className="pv-row">
            <PvBadge tone="ok">{t('ready')}</PvBadge>
            <PvButton variant="secondary">{t('review')}</PvButton>
          </div>
        </section>
      </section>
      <section className="pv-panel pv-glass pv-block">
        <h3>{t('status')}</h3>
        <PvSegment />
        <PvTabs />
        <div className="pv-row">
          <PvBadge>{t('accent')}</PvBadge>
          <PvBadge tone="ok">{t('success')}</PvBadge>
          <PvBadge tone="warn">{t('warning')}</PvBadge>
          <PvBadge tone="err">{t('error')}</PvBadge>
          <PvBadge tone="info">{t('info')}</PvBadge>
        </div>
        <div className="pv-progress-row">
          <PvSpinner />
          <PvProgress />
        </div>
        <PvToast />
      </section>
      <section className="pv-panel pv-glass" data-testid="bilingual-sample" data-inspect="preview:inspect.typeSpecimen" data-tokens="--ts-font-family --ts-font-size --ts-line-height --ts-letter-spacing --ts-color-text">
        <h3>{t('bilingualTitle')}</h3>
        <p>{t('bilingualBody')}</p>
        <p className="pv-secondary">{t('bilingualSecondary')}</p>
        <p className="pv-muted">{t('bilingualMuted')}</p>
      </section>
    </div>
  )
}

export function DialogPreview() {
  const { t } = useTranslation('preview')
  const [open, setOpen] = useState(true)
  const close = () => setOpen(false)
  return (
    <div className="pv-scene">
      <div className="pv-dialog-wrap">
        <div className="pv-backdrop pv-backdrop-ambient" />
        <div className="pv-dialog-stage">
          {open ? (
            <section className="pv-dialog pv-glass" data-testid="dialog-form" data-inspect="preview:inspect.glassDialog" data-tokens="--ts-color-glass-popup --ts-backdrop-filter --ts-radius-xl --ts-shadow-outer --ts-glow-border --ts-duration-dialog">
              <div className="pv-dialog-head">
                <div className="pv-row">
                  <h3>{t('applyPackage')}</h3>
                  <PvBadge tone="warn">{t('unsaved')}</PvBadge>
                </div>
                <PvIconButton glyph="close" label={t('close')} onClick={close} />
              </div>
              <p className="pv-secondary">{t('applyPackageBody')}</p>
              <p className="pv-secondary">{t('applyPackageDetail')}</p>
              <div className="pv-stack">
                <PvField label={t('fieldName')}>
                  <PvInput placeholder={t('fieldName')} defaultValue={t('disabledValue')} />
                </PvField>
                <PvField label={t('note')}>
                  <PvTextarea value={t('noteValue')} />
                </PvField>
                <PvField label={t('fieldScope')}>
                  <PvSelect
                    options={[
                      ['workspace', t('workspaceOption')],
                      ['desktop', t('desktopOption')],
                      ['library', t('crumbLibrary')]
                    ]}
                  />
                </PvField>
                <PvField label={t('date')}>
                  <PvDate />
                </PvField>
                <PvField label={t('fieldTarget')}>
                  <div className="pv-choice-grid">
                    <PvRadio name="pv-dialog-target" label={t('desktopOption')} checked />
                    <PvRadio name="pv-dialog-target" label={t('workspaceOption')} />
                  </div>
                </PvField>
                <PvField label={t('fieldOptions')}>
                  <div className="pv-choice-grid">
                    <PvCheck label={t('includeGlass')} checked />
                    <PvSwitch />
                  </div>
                </PvField>
                <PvField label={t('opacity')}>
                  <PvSlider />
                </PvField>
                <PvField label={t('retainCount')}>
                  <PvNumber />
                </PvField>
                <p className="pv-field-error">{t('dialogError')}</p>
                <div className="pv-dialog-actions">
                  <PvButton variant="secondary" tone="danger" onClick={close}>{t('dangerAction')}</PvButton>
                  <div className="pv-dialog-actions-end">
                    <PvButton variant="secondary" onClick={close}>{t('cancel')}</PvButton>
                    <PvButton onClick={close}>{t('confirm')}</PvButton>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="pv-panel pv-glass">
              <h3>{t('dialogClosed')}</h3>
              <PvButton onClick={() => setOpen(true)}>{t('reopenDialog')}</PvButton>
            </section>
          )}
          <div className="pv-dialog-side">
            <div className="pv-popover pv-glass" data-inspect="preview:inspect.popover" data-tokens="--ts-color-glass-popup --ts-radius-lg --ts-glow-border">
              <strong>{t('alert')}</strong>
              <p className="pv-secondary">{t('alertBody')}</p>
              <PvButton variant="secondary">{t('review')}</PvButton>
            </div>
            <div className="pv-menu pv-glass" data-inspect="preview:inspect.dropdown" data-tokens="--ts-color-glass-popup --ts-color-hover-border">
              <button type="button" className="is-selected">{t('duplicate')}</button>
              <button type="button">{t('rename')}</button>
              <button type="button" className="is-hover">{t('exportJson')}</button>
              <hr className="pv-menu-sep" />
              <button type="button">{t('exportZip')}</button>
              <button type="button" className="is-disabled" disabled>{t('delete')}</button>
            </div>
            <div className="pv-menu pv-glass" data-inspect="preview:inspect.contextMenu" data-tokens="--ts-color-glass-popup --ts-shadow-outer">
              <button type="button">{t('inspectToken')}</button>
              <button type="button" className="is-hover">{t('copyColor')}</button>
              <button type="button">{t('openInEditor')}</button>
              <button type="button" className="is-disabled" disabled>{t('reset')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DataPreview() {
  const { t, i18n } = useTranslation('preview')
  const language = uiLanguage(i18n.language)
  const rows = [
    ['color.primary', t('colorGroup'), 'var(--ts-color-primary)', '4.8:1', t('live'), 'info', 'is-selected'],
    ['glass.blur', t('glassGroup'), '8px', t('noneValue'), t('stable'), '', 'is-hover'],
    ['glow.radius', t('glowGroup'), '3px', t('noneValue'), t('edited'), 'warn', ''],
    ['border.color', t('borderGroup'), 'var(--ts-color-border)', '1.2:1', t('stable'), '', ''],
    ['shadow.outer', t('shadowGroup'), '14px', t('noneValue'), t('stable'), '', ''],
    ['font.family', t('typeGroup'), 'Segoe UI', t('noneValue'), t('stable'), '', ''],
    ['radius.md', t('radiusGroup'), '8px', t('noneValue'), t('stable'), '', ''],
    ['animation.hover', t('animationGroup'), '160ms', t('noneValue'), t('retired'), 'err', 'is-disabled']
  ] as const
  const files = [
    ['theme.json', 4096],
    ['variables.css', 6144],
    ['components.css', 3072],
    ['tailwind.css', 5120],
    ['shadcn.css', 3584],
    ['README.md', 2048]
  ] as const
  const tree = [
    ['src', 'src', 0, 'is-selected'],
    ['engine', 'theme-engine', 1, ''],
    ['presets', 'presets', 2, ''],
    ['components', 'components', 1, ''],
    ['preview', 'preview', 2, 'is-hover'],
    ['styles', 'styles', 1, ''],
    ['css', 'preview.css', 2, '']
  ] as const
  const exports = [
    ['theme.json', t('ready'), ''],
    ['variables.css', t('ready'), ''],
    ['tailwind.css', t('review'), 'warn'],
    ['shadcn.css', t('blocked'), 'err']
  ] as const
  return (
    <div className="pv-scene pv-data-grid">
      <section className="pv-panel pv-glass pv-span-2" data-testid="data-table" data-inspect="preview:inspect.table" data-tokens="--ts-color-border --ts-color-text-primary --ts-color-primary">
        <h3>{t('tokensTitle')}</h3>
        <div className="pv-table-bar">
          <div className="pv-table-search">
            <PvInput placeholder={t('searchTokens')} />
          </div>
          <div className="pv-table-filter">
            <PvSelect
              options={[
                ['all', t('filterAny')],
                ['live', t('live')],
                ['edited', t('edited')]
              ]}
            />
          </div>
          <PvIconButton label={t('add')} />
          <PvButton>{t('exportNav')}</PvButton>
        </div>
        <table className="pv-table pv-data-table">
          <colgroup>
            <col className="pv-col-check" />
            <col className="pv-col-name" />
            <col className="pv-col-group" />
            <col className="pv-col-value" />
            <col className="pv-col-contrast" />
            <col className="pv-col-status" />
          </colgroup>
          <thead>
            <tr>
              <th />
              <th>{t('columnName')}</th>
              <th>{t('columnGroup')}</th>
              <th>{t('columnValue')}</th>
              <th className="pv-num">{t('columnContrast')}</th>
              <th>{t('columnStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, group, value, contrast, status, tone, state]) => (
              <tr key={name} className={state}>
                <td>
                  <PvCheck label="" checked={state === 'is-selected'} disabled={state === 'is-disabled'} />
                </td>
                <td>{name}</td>
                <td>{group}</td>
                <td>{value}</td>
                <td className="pv-num">{contrast}</td>
                <td><span className={cx('pv-dot', tone)} /> {status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pv-pages pv-pages-end" data-inspect="preview:inspect.pagination" data-tokens="--ts-color-elevated-surface --ts-color-active-border --ts-color-primary">
          <button type="button" className="pv-page">{t('pagePrev')}</button>
          <button type="button" className="pv-page">1</button>
          <button type="button" className="pv-page is-selected">2</button>
          <button type="button" className="pv-page">3</button>
          <button type="button" className="pv-page">{t('pageNext')}</button>
        </div>
      </section>
      <section className="pv-panel pv-glass pv-block" data-inspect="preview:inspect.fileList" data-tokens="--ts-color-text-secondary --ts-color-border">
        <h3>{t('files')}</h3>
        <table className="pv-files">
          <tbody>
            {files.map(([name, size]) => (
              <tr key={name}>
                <td>{name}</td>
                <td className="pv-muted pv-num">{formatFileSize(size, language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="pv-link">{t('openFolder')}</button>
      </section>
      <section className="pv-panel pv-glass pv-block" data-inspect="preview:inspect.tree" data-tokens="--ts-color-text-secondary --ts-radius-control">
        <h3>{t('tree')}</h3>
        <div className="pv-tree">
          {tree.map(([id, label, depth, state]) => (
            <button key={id} type="button" className={state} style={{ paddingLeft: 8 + depth * 14 }}>
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="pv-card pv-glass pv-card-fill" data-inspect="preview:inspect.card" data-tokens="--ts-glass-surface --ts-radius-lg --ts-shadow-outer">
        <h3>{t('packageTitle')}</h3>
        <p className="pv-secondary">{t('packageBody')}</p>
        <div className="pv-card-foot">
          <PvProgress />
          <div className="pv-row">
            <span className="pv-dot" /> {t('ready')}
            <span className="pv-dot warn" /> {t('review')}
            <span className="pv-dot err" /> {t('blocked')}
          </div>
        </div>
      </section>
      <section className="pv-card pv-glass" data-inspect="preview:inspect.recentExports" data-tokens="--ts-color-text-primary --ts-color-border --ts-color-success --ts-color-warning --ts-color-error">
        <h3>{t('recentExports')}</h3>
        {exports.map(([name, status, tone]) => (
          <div key={name} className="pv-export-row">
            <span>{name}</span>
            <span className="pv-secondary"><span className={cx('pv-dot', tone)} /> {status}</span>
          </div>
        ))}
      </section>
    </div>
  )
}

export function WorkspacePreview() {
  const { t } = useTranslation('preview')
  const nav = [
    ['explorer', t('explorer')],
    ['search', t('search')],
    ['tokens', t('tokens')],
    ['export', t('exportNav')]
  ] as const
  const files = ['tokens.css', 'theme.json', 'components.css', 'variables.css', 'tailwind.css', 'README.md'] as const
  const tabs = ['tokens.css', 'theme.json', 'components.css'] as const
  const samples: Record<(typeof files)[number], string> = {
    'tokens.css': t('editorSample'),
    'theme.json': t('editorJson'),
    'components.css': t('editorComponents'),
    'variables.css': t('editorVariables'),
    'tailwind.css': t('editorTailwind'),
    'README.md': t('editorReadme')
  }
  const [file, setFile] = useState<(typeof files)[number]>('tokens.css')
  return (
    <div className="pv-scene">
      <div className="pv-workspace">
        <aside className="pv-sidebar pv-glass" data-inspect="preview:inspect.workspaceNav" data-tokens="--ts-glass-surface --ts-backdrop-filter">
          <div className="pv-avatar-line">
            <PvAvatar initials={t('avatarInitials')} caption={t('avatarName')} dot="ok" />
          </div>
          {nav.map(([id, item], index) => (
            <button key={id} type="button" className={index === 2 ? 'pv-nav-item is-selected' : 'pv-nav-item'}>{item}</button>
          ))}
          <div className="pv-workspace-search" data-testid="workspace-search">
            <PvInput placeholder={t('searchProjects')} />
          </div>
          <div className="pv-kicker pv-kicker-split">{t('files')}</div>
          <div className="pv-tree">
            {files.map((name) => (
              <button key={name} type="button" className={file === name ? 'is-selected' : undefined} onClick={() => setFile(name)}>
                {name}
              </button>
            ))}
          </div>
        </aside>
        <div className="pv-editor-tabs" data-inspect="preview:inspect.editorTabs" data-tokens="--ts-color-secondary-background --ts-color-active-border">
          {tabs.map((item) => (
            <button key={item} type="button" className={file === item ? 'pv-tab is-selected' : 'pv-tab'} onClick={() => setFile(item)}>
              {item === 'theme.json' ? <span className="pv-dirty" /> : null}
              {item}
              {file === item ? (
                <span className="pv-tab-close" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="pv-editor-wrap">
          <div className="pv-breadcrumb" data-inspect="preview:inspect.breadcrumb" data-tokens="--ts-color-text-secondary --ts-color-text-primary">
            <span>{t('crumbRoot')}</span>
            <span>/</span>
            <span>{t('crumbEngine')}</span>
            <span>/</span>
            <span className="is-current">{file}</span>
          </div>
          <CodeBlock source={samples[file]} />
          <aside className="pv-problems pv-glass" data-inspect="preview:inspect.problems" data-tokens="--ts-color-glass-popup --ts-glow-border --ts-shadow-outer">
            <strong>{t('problems')}</strong>
            <div className="pv-checkline"><span className="pv-dot" /> {t('noContrastErrors')}</div>
            <div className="pv-checkline"><span className="pv-dot warn" /> {t('problemWarn')}</div>
            <div className="pv-checkline"><span className="pv-dot info" /> {t('problemInfo')}</div>
          </aside>
        </div>
        <div className="pv-terminal-dock" data-inspect="preview:inspect.terminal" data-tokens="--ts-color-app-background --ts-font-mono --ts-color-text">
          <pre className="pv-terminal">{t('terminalBody')}</pre>
          <label className="pv-terminal-line">
            <span>PS Atlas&gt;</span>
            <input defaultValue={t('terminalCommand')} aria-label={t('terminalCommand')} />
          </label>
        </div>
        <div className="pv-status">
          <span className="pv-dot info" /> Theme Studio
          <span>{file}</span>
          <span>{t('utf8')}</span>
          <span>{t('statusLanguage')}</span>
          <span className="pv-push pv-status-end">
            <PvKbdPair />
            <span>{t('spaces')}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
