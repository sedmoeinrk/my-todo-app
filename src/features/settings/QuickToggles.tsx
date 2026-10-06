import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { IconButton } from '../../components/ui/IconButton'
import { cn } from '../../lib/cn'
import { languageSet, selectLanguage, selectTheme, themeToggled } from './settingsSlice'

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const isDark = theme === 'dark'

  return (
    <IconButton
      label={isDark ? t('settings.appearance.toLight') : t('settings.appearance.toDark')}
      onClick={() => dispatch(themeToggled())}
      className={className}
    >
      {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </IconButton>
  )
}

/** Shows the *other* language's short name; clicking switches to it. */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const language = useAppSelector(selectLanguage)
  const next = language === 'fa' ? 'en' : 'fa'

  return (
    <button
      type="button"
      onClick={() => dispatch(languageSet(next))}
      aria-label={t('settings.appearance.switchLanguage')}
      title={t('settings.appearance.switchLanguage')}
      lang={next}
      className={cn(
        'grid h-9 min-w-9 shrink-0 place-items-center rounded-lg px-2 text-sm font-semibold text-slate-500 transition-colors',
        'hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500',
        'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        next === 'fa' && 'font-fa',
        className,
      )}
    >
      {next === 'fa' ? 'فا' : 'EN'}
    </button>
  )
}
