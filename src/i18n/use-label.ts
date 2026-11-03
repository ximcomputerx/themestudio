import { useTranslation } from 'react-i18next'
import { uiLanguage } from './format'

export function useLabel() {
  const { t, i18n } = useTranslation()
  const label = (key: string, values?: Record<string, unknown>): string =>
    (t as (next: string, options?: object) => string)(key, values)
  return { label, language: uiLanguage(i18n.language) }
}
