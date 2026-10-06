import { Archive, LayoutDashboard, ListTodo, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  /** Match the path exactly (needed for "/"). */
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/todos', labelKey: 'nav.todos', icon: ListTodo },
  { to: '/archive', labelKey: 'nav.archive', icon: Archive },
  { to: '/settings', labelKey: 'settings.title', icon: Settings },
]
