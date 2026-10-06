import { ListChecks, LogOut, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { loggedOut, selectCurrentUser } from '../../features/auth/authSlice'
import { selectUserCategories } from '../../features/categories/categoriesSlice'
import { categoryColorClasses, useCategoryLabel } from '../../features/categories/categoryStyles'
import { LanguageToggle, ThemeToggle } from '../../features/settings/QuickToggles'
import { selectTodoCountByCategory } from '../../features/todos/todosSlice'
import { cn } from '../../lib/cn'
import { useFormatNumber } from '../../lib/useFormatNumber'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { NAV_ITEMS } from './navItems'

interface SidebarProps {
  onAddTodo: () => void
  /** Called after any link is clicked (used to close the mobile drawer). */
  onNavigate?: () => void
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
  )

export function Sidebar({ onAddTodo, onNavigate }: SidebarProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const categories = useAppSelector(selectUserCategories)
  const counts = useAppSelector(selectTodoCountByCategory)
  const label = useCategoryLabel()
  const formatNumber = useFormatNumber()

  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
          <ListChecks className="size-5" aria-hidden />
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">{t('app.name')}</span>
      </Link>

      <div className="px-3 pb-2">
        <Button fullWidth onClick={onAddTodo}>
          <Plus className="size-4" aria-hidden />
          {t('todos.new')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <nav aria-label={t('nav.main')} className="space-y-1">
          {NAV_ITEMS.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
              <Icon className="size-[18px]" aria-hidden />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {categories.length > 0 && (
          <nav aria-label={t('categories.title')} className="mt-6">
            <p className="mb-1 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {t('categories.title')}
            </p>
            <div className="space-y-0.5">
              {categories.map((c) => (
                <NavLink key={c.id} to={`/todos/${c.id}`} onClick={onNavigate} className={linkClass}>
                  <span className={cn('size-2.5 shrink-0 rounded-full', categoryColorClasses[c.color].dot)} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{label(c)}</span>
                  {!!counts[c.id] && <span className="text-xs text-slate-400 tabular-nums">{formatNumber(counts[c.id])}</span>}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 px-3 pb-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {user && (
        <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 p-3 dark:border-slate-800">
          <Link
            to="/settings"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/70"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-semibold text-white uppercase">
              {user.username.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{user.username}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{t('nav.account')}</span>
            </span>
          </Link>
          <IconButton label={t('auth.logout')} tone="danger" onClick={() => dispatch(loggedOut())}>
            <LogOut className="size-4 rtl:rotate-180" />
          </IconButton>
        </div>
      )}
    </div>
  )
}
