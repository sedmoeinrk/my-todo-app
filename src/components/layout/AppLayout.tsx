import { ListChecks, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, ScrollRestoration, useMatch } from 'react-router-dom'
import { LanguageToggle, ThemeToggle } from '../../features/settings/QuickToggles'
import { TodoFormDialog } from '../../features/todos/TodoFormDialog'
import { cn } from '../../lib/cn'
import { useFocusTrap } from '../../lib/useFocusTrap'
import { IconButton } from '../ui/IconButton'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

/**
 * Desktop (lg+): fixed sidebar + content.
 * Mobile: sticky top bar, slide-in drawer (same sidebar) and bottom tab bar.
 */
export function AppLayout() {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  // Keyboard focus stays in the drawer while open and returns to the menu button after.
  const drawerRef = useFocusTrap<HTMLElement>(drawerOpen)

  // When viewing a category, new todos default to it.
  const categoryMatch = useMatch('/todos/:categoryId')
  const currentCategoryId = categoryMatch?.params.categoryId

  const openAdd = () => {
    setDrawerOpen(false)
    setAdding(true)
  }

  // Close the drawer with Escape and lock page scroll while it's open.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <div className="min-h-svh">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-slate-200 bg-white/70 backdrop-blur-xl lg:block dark:border-slate-800 dark:bg-slate-900/60">
        <Sidebar onAddTodo={openAdd} />
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/80 px-2 backdrop-blur-lg lg:hidden dark:border-slate-800 dark:bg-slate-900/80">
        <IconButton label={t('nav.openMenu')} onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen}>
          <Menu className="size-5" />
        </IconButton>
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <ListChecks className="size-5 text-brand-600" aria-hidden />
          {t('app.name')}
        </Link>
        <div className="ms-auto flex items-center">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      {/* mobile drawer */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', !drawerOpen && 'pointer-events-none')} aria-hidden={!drawerOpen}>
        <div
          onClick={() => setDrawerOpen(false)}
          className={cn(
            'absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity',
            drawerOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('nav.main')}
          tabIndex={-1}
          inert={!drawerOpen}
          className={cn(
            'absolute inset-y-0 start-0 w-72 max-w-[85vw] bg-white shadow-2xl outline-none transition-transform duration-300 dark:bg-slate-900',
            drawerOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
          )}
        >
          <IconButton
            label={t('common.close')}
            onClick={() => setDrawerOpen(false)}
            className="absolute end-3 top-3.5"
          >
            <X className="size-5" />
          </IconButton>
          <Sidebar onAddTodo={openAdd} onNavigate={() => setDrawerOpen(false)} />
        </aside>
      </div>

      {/* page content */}
      <main className="px-4 pt-6 pb-28 sm:px-6 lg:ms-64 lg:px-10 lg:pt-10 lg:pb-12">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      <BottomNav onAddTodo={openAdd} />

      <TodoFormDialog open={adding} onClose={() => setAdding(false)} defaultCategoryId={currentCategoryId} />
      <ScrollRestoration />
    </div>
  )
}
