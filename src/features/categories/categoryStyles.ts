import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category, CategoryColor } from '../../types'

// Full class names are spelled out so Tailwind can detect them at build time.
export const categoryColorClasses: Record<CategoryColor, { dot: string; soft: string; ring: string }> = {
  indigo: {
    dot: 'bg-indigo-500',
    soft: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
    ring: 'ring-indigo-500',
  },
  emerald: {
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    ring: 'ring-emerald-500',
  },
  amber: {
    dot: 'bg-amber-500',
    soft: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    ring: 'ring-amber-500',
  },
  rose: {
    dot: 'bg-rose-500',
    soft: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    ring: 'ring-rose-500',
  },
  sky: {
    dot: 'bg-sky-500',
    soft: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    ring: 'ring-sky-500',
  },
  violet: {
    dot: 'bg-violet-500',
    soft: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    ring: 'ring-violet-500',
  },
  orange: {
    dot: 'bg-orange-500',
    soft: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
    ring: 'ring-orange-500',
  },
  teal: {
    dot: 'bg-teal-500',
    soft: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    ring: 'ring-teal-500',
  },
}

/** Display name: built-in categories follow the UI language until renamed. */
export function useCategoryLabel() {
  const { t } = useTranslation()
  return useCallback((category: Category) => (category.nameKey ? t(category.nameKey) : category.name), [t])
}
