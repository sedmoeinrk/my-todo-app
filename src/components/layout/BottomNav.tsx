import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { NAV_ITEMS } from './navItems'

/** Mobile-only tab bar with a centered "add todo" button. */
export function BottomNav({ onAddTodo }: { onAddTodo: () => void }) {
  const { t } = useTranslation()
  const [first, second, ...rest] = NAV_ITEMS

  const renderItem = ({ to, labelKey, icon: Icon, end }: (typeof NAV_ITEMS)[number]) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
          isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400',
        )
      }
    >
      <Icon className="size-5" aria-hidden />
      {t(labelKey)}
    </NavLink>
  )

  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div className="flex h-16 items-stretch">
        {renderItem(first)}
        {renderItem(second)}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={onAddTodo}
            aria-label={t('todos.new')}
            className="-mt-6 grid size-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/40 ring-4 ring-slate-50 transition active:scale-95 dark:ring-slate-950"
          >
            <Plus className="size-6" aria-hidden />
          </button>
        </div>
        {rest.map(renderItem)}
      </div>
    </nav>
  )
}
