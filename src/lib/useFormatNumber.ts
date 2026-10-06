import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

/** Formats numbers with the UI language's digits (۰-۹ in Persian). */
export function useFormatNumber() {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US'
  return useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format(value),
    [locale],
  )
}
