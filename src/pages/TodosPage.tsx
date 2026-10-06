import { CircleCheckBig, ListTodo, Plus, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { selectCategoryById } from '../features/categories/categoriesSlice'
import { CategoryFilterBar } from '../features/categories/CategoryFilterBar'
import { useCategoryLabel } from '../features/categories/categoryStyles'
import { TodoFormDialog } from '../features/todos/TodoFormDialog'
import { TodoList } from '../features/todos/TodoList'
import { compareByImportance, selectTodosByCategory } from '../features/todos/todosSlice'
import { cn } from '../lib/cn'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useFormatNumber } from '../lib/useFormatNumber'
import type { Todo } from '../types'

const STATUSES = ['all', 'open', 'completed', 'starred'] as const

const matchesStatus = (todo: Todo, status: Status) =>
  status === 'all' ||
  (status === 'open' && !todo.completed) ||
  (status === 'completed' && todo.completed) ||
  (status === 'starred' && todo.starred)
type Status = (typeof STATUSES)[number]

export default function TodosPage() {
  const { t } = useTranslation()
  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = useAppSelector((state) => selectCategoryById(state, categoryId))
  const todos = useAppSelector((state) => selectTodosByCategory(state, categoryId ?? null))
  const label = useCategoryLabel()
  const [adding, setAdding] = useState(false)
  const formatNumber = useFormatNumber()
  useDocumentTitle(category ? label(category) : t('todos.title'))

  const statusParam = searchParams.get('status')
  const status: Status = STATUSES.includes(statusParam as Status) ? (statusParam as Status) : 'all'

  const counts: Record<Status, number> = {
    all: todos.length,
    open: todos.filter((t) => matchesStatus(t, 'open')).length,
    completed: todos.filter((t) => matchesStatus(t, 'completed')).length,
    starred: todos.filter((t) => matchesStatus(t, 'starred')).length,
  }

  // Open todos first, each group ordered by importance.
  const visible = useMemo(
    () =>
      todos
        .filter((t) => matchesStatus(t, status))
        .sort((a, b) => Number(a.completed) - Number(b.completed) || compareByImportance(a, b)),
    [todos, status],
  )

  // Unknown or deleted category in the URL → back to all todos.
  if (categoryId && !category) return <Navigate to="/todos" replace />

  const setStatus = (next: Status) =>
    setSearchParams(next === 'all' ? {} : { status: next }, { replace: true })

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-slate-900 dark:text-white">
            {category ? label(category) : t('todos.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('todos.summary', { open: counts.open, completed: counts.completed })}
          </p>
        </div>
        {/* Mobile uses the bottom bar's + button instead */}
        <Button onClick={() => setAdding(true)} className="shrink-0 max-lg:hidden">
          <Plus className="size-4" aria-hidden />
          {t('todos.new')}
        </Button>
      </header>

      <CategoryFilterBar />

      <div role="tablist" aria-label={t('todos.filters.label')} className="inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none] dark:bg-slate-800/70">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={cn(
              'h-8 shrink-0 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition',
              status === s
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {t(`todos.filters.${s}`)} <span className="text-xs tabular-nums opacity-60">{formatNumber(counts[s])}</span>
          </button>
        ))}
      </div>

      <TodoList
        todos={visible}
        showCategory={!category}
        empty={
          status === 'completed' ? (
            <EmptyState icon={CircleCheckBig} title={t('todos.empty.completedTitle')} />
          ) : status === 'starred' ? (
            <EmptyState
              icon={Star}
              title={t('todos.empty.starredTitle')}
              description={t('todos.empty.starredDescription')}
            />
          ) : (
            <EmptyState
              icon={ListTodo}
              title={t('todos.empty.title')}
              description={t('todos.empty.description')}
              action={
                <Button onClick={() => setAdding(true)}>
                  <Plus className="size-4" aria-hidden />
                  {t('todos.new')}
                </Button>
              }
            />
          )
        }
      />

      <TodoFormDialog open={adding} onClose={() => setAdding(false)} defaultCategoryId={category?.id} />
    </div>
  )
}
