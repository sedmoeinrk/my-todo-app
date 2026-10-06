import { Archive, ArrowRight, CircleCheckBig, CircleDashed, Plus, Star } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { selectCurrentUser } from '../features/auth/authSlice'
import { CategoryProgress } from '../features/dashboard/CategoryProgress'
import { StatCard } from '../features/dashboard/StatCard'
import { TodoFormDialog } from '../features/todos/TodoFormDialog'
import { TodoList } from '../features/todos/TodoList'
import { selectActiveTodos, selectTodoStats, selectTopStarredTodos } from '../features/todos/todosSlice'
import { getDayPeriod } from '../lib/date'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import { useFormatNumber } from '../lib/useFormatNumber'
import { useNow } from '../lib/useNow'

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white/60 p-4 ring-1 ring-slate-200 sm:p-5 dark:bg-slate-900/40 dark:ring-slate-800">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const user = useAppSelector(selectCurrentUser)
  const stats = useAppSelector(selectTodoStats)
  const topStarred = useAppSelector(selectTopStarredTodos)
  const openStarredCount = useAppSelector(
    (state) => selectActiveTodos(state).filter((t) => t.starred && !t.completed).length,
  )
  /** Which "new todo" button opened the dialog; the empty-state one pre-stars the todo. */
  const [adding, setAdding] = useState<'normal' | 'starred' | null>(null)
  useDocumentTitle(t('nav.dashboard'))
  const formatNumber = useFormatNumber()

  // Refreshes every minute so the greeting and date stay right if the tab stays open.
  const now = useNow()
  const today = new Intl.DateTimeFormat(i18n.language === 'fa' ? 'fa-IR' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now)
  const progress = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const moreStarred = openStarredCount - topStarred.length

  return (
    <div className="space-y-6">
      {/* hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 p-6 text-white shadow-xl shadow-brand-600/20 sm:p-8">
        <div aria-hidden className="absolute -end-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm font-medium text-white/70">{today}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          {t(`dashboard.greeting.${getDayPeriod(now.getHours())}`, { name: user?.username })}
        </h1>
        <p className="mt-1 text-white/80">
          {stats.open ? t('dashboard.openSummary', { count: stats.open }) : t('dashboard.allDone')}
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {formatNumber(progress / 100, { style: 'percent' })}
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={() => setAdding('normal')}
          className="mt-5 bg-white! text-brand-700! ring-0! hover:bg-white/90!"
        >
          <Plus className="size-4" aria-hidden />
          {t('todos.new')}
        </Button>
      </header>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          to="/todos?status=open"
          label={t('dashboard.stats.open')}
          value={stats.open}
          icon={CircleDashed}
          tone="bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
        />
        <StatCard
          to="/todos?status=completed"
          label={t('dashboard.stats.completed')}
          value={stats.completed}
          icon={CircleCheckBig}
          tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
        />
        <StatCard
          to="/todos?status=starred"
          label={t('dashboard.stats.starred')}
          value={stats.starred}
          icon={Star}
          tone="bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
        />
        <StatCard
          to="/archive"
          label={t('dashboard.stats.archived')}
          value={stats.archived}
          icon={Archive}
          tone="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* top 5 starred */}
        <Panel
          title={t('dashboard.topStarred')}
          action={
            <Link
              to="/todos?status=starred"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              {t('dashboard.viewAllStarred')}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </Link>
          }
        >
          <TodoList
            todos={topStarred}
            empty={
              <EmptyState
                icon={Star}
                title={t('dashboard.noStarredTitle')}
                description={t('dashboard.noStarredDescription')}
                action={
                  <Button variant="secondary" onClick={() => setAdding('starred')}>
                    <Plus className="size-4" aria-hidden />
                    {t('dashboard.addStarred')}
                  </Button>
                }
              />
            }
          />
          {moreStarred > 0 && (
            <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.moreStarred', { count: moreStarred })}
            </p>
          )}
        </Panel>

        {/* categories */}
        <Panel
          title={t('categories.title')}
          action={
            <Link to="/todos" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t('dashboard.viewAll')}
            </Link>
          }
        >
          <CategoryProgress />
        </Panel>
      </div>

      <TodoFormDialog open={!!adding} onClose={() => setAdding(null)} defaultStarred={adding === 'starred'} />
    </div>
  )
}
