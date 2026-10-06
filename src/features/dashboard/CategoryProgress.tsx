import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { cn } from '../../lib/cn'
import { selectUserCategories } from '../categories/categoriesSlice'
import { categoryColorClasses, useCategoryLabel } from '../categories/categoryStyles'
import { selectActiveTodos } from '../todos/todosSlice'

/** Per-category completion bars; each row links to that category's list. */
export function CategoryProgress() {
  const { t } = useTranslation()
  const categories = useAppSelector(selectUserCategories)
  const todos = useAppSelector(selectActiveTodos)
  const label = useCategoryLabel()

  const rows = useMemo(
    () =>
      categories.map((category) => {
        const items = todos.filter((t) => t.categoryId === category.id)
        const done = items.filter((t) => t.completed).length
        return { category, total: items.length, done, open: items.length - done }
      }),
    [categories, todos],
  )

  if (rows.length === 0) return null

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {rows.map(({ category, total, done, open }) => {
        const percent = total ? Math.round((done / total) * 100) : 0
        return (
          <li key={category.id}>
            <Link
              to={`/todos/${category.id}`}
              className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className={cn('size-2.5 shrink-0 rounded-full', categoryColorClasses[category.color].dot)} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-slate-800 group-hover:text-brand-600 dark:text-slate-100 dark:group-hover:text-brand-400">
                    {label(category)}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400 tabular-nums">
                    {t('dashboard.openCount', { count: open })}
                  </span>
                </span>
                <span
                  className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={label(category)}
                >
                  <span
                    className={cn('block h-full rounded-full transition-all', categoryColorClasses[category.color].dot)}
                    style={{ width: `${percent}%` }}
                  />
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-slate-300 rtl:rotate-180 dark:text-slate-600" aria-hidden />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
