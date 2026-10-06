import { ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '../../lib/useDocumentTitle'
import { LanguageToggle, ThemeToggle } from '../settings/QuickToggles'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation()
  useDocumentTitle(title)

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-10">
      {/* soft background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-400/25 blur-3xl dark:bg-brand-600/20"
      />

      <div className="absolute end-3 top-3 flex items-center gap-1">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <ListChecks className="size-6" aria-hidden />
          </div>
          <p className="text-sm font-semibold tracking-wide text-brand-600 dark:text-brand-400">
            {t('app.name')}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 backdrop-blur sm:p-8 dark:bg-slate-900/80 dark:ring-slate-800">
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</p>
      </div>
    </div>
  )
}
