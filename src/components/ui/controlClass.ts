import { cn } from '../../lib/cn'

/** Shared look for inputs, selects and textareas. */
export const controlClass = (error?: string | null) =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 transition outline-none',
    'placeholder:text-slate-400 focus:ring-4',
    'dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]',
    error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/15 dark:border-slate-700',
  )
