import type { Priority } from '../../types'

export const PRIORITIES: Priority[] = ['high', 'medium', 'low']

export const priorityClasses: Record<Priority, { badge: string; dot: string }> = {
  high: {
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  medium: {
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  low: {
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
}
