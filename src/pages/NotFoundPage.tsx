import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NotFoundPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))

  return (
    <div className="grid min-h-svh place-items-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Compass className="size-7" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">404</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t('notFound.title')}</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t('notFound.description')}</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700"
        >
          {t('notFound.home')}
        </Link>
      </div>
    </div>
  )
}
