import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
  tone?: 'default' | 'danger' | 'star'
  children: ReactNode
}

const tones = {
  default: 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200',
  danger: 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
  star: 'hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-500/10',
}

/** Square icon-only button; `label` is used for both tooltip and screen readers. */
export function IconButton({ label, active, tone = 'default', className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-lg transition-colors',
        'focus-visible:outline-2 focus-visible:outline-brand-500',
        tones[tone],
        // Only one text color class at a time, so the active color always wins.
        active && tone === 'star' ? 'text-amber-500' : 'text-slate-400',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
