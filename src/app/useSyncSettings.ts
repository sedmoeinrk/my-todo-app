import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { selectLanguage, selectTheme } from '../features/settings/settingsSlice'
import { useAppSelector } from './hooks'

/** Mirrors theme and language from Redux onto <html> (class, lang, dir) and i18next. */
export function useSyncSettings() {
  const theme = useAppSelector(selectTheme)
  const language = useAppSelector(selectLanguage)
  const { i18n } = useTranslation()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#020618' : '#f8fafc')
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.dir = language === 'fa' ? 'rtl' : 'ltr'
    if (i18n.language !== language) void i18n.changeLanguage(language)
  }, [language, i18n])
}
