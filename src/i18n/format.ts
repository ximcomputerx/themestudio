import type { ResolvedLanguage } from '@shared/locale'

export function uiLanguage(language: string | undefined): ResolvedLanguage {
  return language === 'zh-CN' ? 'zh-CN' : 'en-US'
}

export function formatDate(iso: string, language: ResolvedLanguage, timeZone?: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: language === 'zh-CN' ? 'long' : 'short',
    day: 'numeric',
    timeZone
  }).format(date)
}

export function formatNumber(value: number, language: ResolvedLanguage, decimals: number): string {
  return new Intl.NumberFormat(language, {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatPercent(ratio: number, language: ResolvedLanguage): string {
  return new Intl.NumberFormat(language, { style: 'percent', maximumFractionDigits: 0 }).format(ratio)
}

export function formatFileSize(bytes: number, language: ResolvedLanguage): string {
  const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return new Intl.NumberFormat(language, {
    style: 'unit',
    unit: units[unit],
    unitDisplay: 'short',
    maximumFractionDigits: value < 10 && unit > 0 ? 1 : 0
  }).format(value)
}

export type RelativeDescription = { kind: 'now' } | { kind: 'text'; text: string }

export function describeRelative(iso: string, language: ResolvedLanguage, now = Date.now()): RelativeDescription {
  const time = new Date(iso).getTime()
  if (!Number.isFinite(time)) return { kind: 'text', text: '' }
  const diffSec = Math.round((time - now) / 1000)
  if (Math.abs(diffSec) < 45) return { kind: 'now' }
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
  const abs = Math.abs(diffSec)
  if (abs < 3600) return { kind: 'text', text: rtf.format(Math.round(diffSec / 60), 'minute') }
  if (abs < 86400) return { kind: 'text', text: rtf.format(Math.round(diffSec / 3600), 'hour') }
  if (abs < 86400 * 30) return { kind: 'text', text: rtf.format(Math.round(diffSec / 86400), 'day') }
  return { kind: 'text', text: formatDate(iso, language) }
}
