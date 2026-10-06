import { Layers, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { cn } from '../../lib/cn'
import { useFormatNumber } from '../../lib/useFormatNumber'
import { selectTodoCountByCategory, selectTodoStats } from '../todos/todosSlice'
import { selectUserCategories } from './categoriesSlice'
import { categoryColorClasses, useCategoryLabel } from './categoryStyles'
import { ManageCategoriesDialog } from './ManageCategoriesDialog'

const chipClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition',
    isActive
      ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800',
  )

function Count({ value }: { value: number }) {
  const formatNumber = useFormatNumber()
  if (!value) return null
  return <span className="text-xs tabular-nums opacity-60">{formatNumber(value)}</span>
}

/** Horizontally scrollable category chips; selecting one filters the todo list via the URL. */
export function CategoryFilterBar() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const categories = useAppSelector(selectUserCategories)
  const counts = useAppSelector(selectTodoCountByCategory)
  const { open } = useAppSelector(selectTodoStats)
  const label = useCategoryLabel()
  const [managing, setManaging] = useState(false)

  // Keep the status filter (?status=...) when switching categories.
  const search = searchParams.toString() ? `?${searchParams}` : ''

  return (
    <nav aria-label={t('categories.title')}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <NavLink to={{ pathname: '/todos', search }} end className={chipClass}>
          <Layers className="size-4" aria-hidden />
          {t('todos.allCategories')}
          <Count value={open} />
        </NavLink>
        {categories.map((c) => (
          <NavLink key={c.id} to={{ pathname: `/todos/${c.id}`, search }} className={chipClass}>
            <span className={cn('size-2.5 rounded-full', categoryColorClasses[c.color].dot)} aria-hidden />
            {label(c)}
            <Count value={counts[c.id] ?? 0} />
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setManaging(true)}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-dashed border-slate-300 px-3.5 text-sm font-medium whitespace-nowrap text-slate-500 hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:text-brand-400"
        >
          <Settings2 className="size-4" aria-hidden />
          {t('categories.manage')}
        </button>
      </div>
      <ManageCategoriesDialog open={managing} onClose={() => setManaging(false)} />
    </nav>
  )
}
