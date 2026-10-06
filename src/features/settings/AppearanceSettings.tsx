import { Languages, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { cn } from '../../lib/cn'
import type { Language, Theme } from '../../types'
import { languageSet, selectLanguage, selectTheme, themeSet } from './settingsSlice'

interface Option<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
  lang?: string
}

function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 sm:w-64 dark:bg-slate-800">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="peer sr-only"
          />
          <span
            lang={o.lang}
            className={cn(
              'flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:text-slate-400',
              o.lang === 'fa' && 'font-fa',
              value === o.value && 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white',
            )}
          >
            {o.icon && <o.icon className="size-4" aria-hidden />}
            {o.label}
          </span>
        </label>
      ))}
    </div>
  )
}

function Row({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Icon className="size-[18px]" aria-hidden />
        </span>
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function AppearanceSettings() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const language = useAppSelector(selectLanguage)

  return (
    <section className="divide-y divide-slate-100 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
      <Row
        icon={theme === 'dark' ? Moon : Sun}
        title={t('settings.appearance.theme')}
        description={t('settings.appearance.themeDescription')}
      >
        <Segmented<Theme>
          name="theme"
          value={theme}
          onChange={(v) => dispatch(themeSet(v))}
          options={[
            { value: 'light', label: t('settings.appearance.light'), icon: Sun },
            { value: 'dark', label: t('settings.appearance.dark'), icon: Moon },
          ]}
        />
      </Row>
      <Row
        icon={Languages}
        title={t('settings.appearance.language')}
        description={t('settings.appearance.languageDescription')}
      >
        <Segmented<Language>
          name="language"
          value={language}
          onChange={(v) => dispatch(languageSet(v))}
          options={[
            { value: 'en', label: t('languages.en'), lang: 'en' },
            { value: 'fa', label: t('languages.fa'), lang: 'fa' },
          ]}
        />
      </Row>
    </section>
  )
}
