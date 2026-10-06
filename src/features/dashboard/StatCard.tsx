import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useFormatNumber } from '../../lib/useFormatNumber'

interface StatCardProps {
  to: string
  label: string
  value: number
  icon: LucideIcon
  /** Tailwind classes for the icon tile */
  tone: string
}

export function StatCard({ to, label, value, icon: Icon, tone }: StatCardProps) {
  const formatNumber = useFormatNumber()
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 dark:bg-slate-900 dark:ring-slate-800"
    >
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl leading-tight font-bold text-slate-900 tabular-nums dark:text-white">
          {formatNumber(value)}
        </span>
        <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </span>
    </Link>
  )
}
