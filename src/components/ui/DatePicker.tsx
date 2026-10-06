import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCalendar, shiftMonth, weekdayOf } from '../../lib/calendar'
import { cn } from '../../lib/cn'
import { formatDateWithYear, todayISO } from '../../lib/date'
import { useFormatNumber } from '../../lib/useFormatNumber'
import { controlClass } from './controlClass'
import { IconButton } from './IconButton'

interface DatePickerProps {
  id?: string
  /** Gregorian ISO date (yyyy-mm-dd) or null for "no date". */
  value: string | null
  onChange: (value: string | null) => void
}

/**
 * Inline calendar that follows the UI language: Persian (Solar Hijri, week starts
 * Saturday) in Persian, Gregorian in English. Opens below the field rather than as a
 * floating popover, so it never gets clipped inside scrollable dialogs.
 */
export function DatePicker({ id, value, onChange }: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const calendar = getCalendar(i18n.language)
  const formatNumber = useFormatNumber()
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const panelId = `${fieldId}-calendar`
  const fieldRef = useRef<HTMLButtonElement>(null)

  const today = todayISO()
  const [open, setOpen] = useState(false)
  /** Any date inside the month being shown (kept as ISO so switching language keeps the place). */
  const [viewISO, setViewISO] = useState(value ?? today)

  const toggle = () => {
    if (!open) setViewISO(value ?? today)
    setOpen((o) => !o)
  }

  const close = () => {
    setOpen(false)
    fieldRef.current?.focus()
  }

  const select = (iso: string | null) => {
    onChange(iso)
    close()
  }

  // Month grid
  const { y, m } = calendar.fromISO(viewISO)
  const firstOfMonth = calendar.toISO({ y, m, d: 1 })
  const leadingBlanks = (weekdayOf(firstOfMonth) - calendar.weekStart + 7) % 7
  const days = Array.from({ length: calendar.daysInMonth(y, m) }, (_, i) => calendar.toISO({ y, m, d: i + 1 }))
  const fullDate = new Intl.DateTimeFormat(calendar.locale, { dateStyle: 'full' })

  return (
    <div
      onKeyDown={(e) => {
        // Escape closes just the calendar, not the surrounding dialog.
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          close()
        }
      }}
    >
      <div className="relative">
        <button
          ref={fieldRef}
          id={fieldId}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(controlClass(), 'flex h-11 items-center gap-2.5 text-start', value && 'pe-11')}
        >
          <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden />
          <span className={cn('truncate', !value && 'text-slate-400')}>
            {value ? formatDateWithYear(value, i18n.language) : t('datePicker.placeholder')}
          </span>
        </button>
        {value && (
          <IconButton
            label={t('datePicker.clear')}
            onClick={() => onChange(null)}
            className="absolute inset-y-1 end-1 size-9"
          >
            <X className="size-4" />
          </IconButton>
        )}
      </div>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={t('datePicker.calendar')}
          className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm animate-[fade-in_120ms_ease-out] dark:border-slate-700 dark:bg-slate-900"
        >
          {/* month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <IconButton label={t('datePicker.prevMonth')} onClick={() => setViewISO(shiftMonth(calendar, viewISO, -1))}>
              <ChevronLeft className="size-5 rtl:rotate-180" />
            </IconButton>
            <p aria-live="polite" className="text-sm font-semibold text-slate-900 dark:text-white">
              {calendar.monthNames[m - 1]} {formatNumber(y, { useGrouping: false })}
            </p>
            <IconButton label={t('datePicker.nextMonth')} onClick={() => setViewISO(shiftMonth(calendar, viewISO, 1))}>
              <ChevronRight className="size-5 rtl:rotate-180" />
            </IconButton>
          </div>

          {/* weekday header */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400" aria-hidden>
            {calendar.weekdayNames.map((name) => (
              <span key={name} className="py-1">
                {name}
              </span>
            ))}
          </div>

          {/* days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {days.map((iso, i) => {
              const selected = iso === value
              const isToday = iso === today
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => select(iso)}
                  aria-pressed={selected}
                  aria-label={fullDate.format(new Date(`${iso}T00:00:00`))}
                  aria-current={isToday ? 'date' : undefined}
                  className={cn(
                    'grid h-9 place-items-center rounded-lg text-sm tabular-nums transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-brand-500',
                    selected
                      ? 'bg-brand-600 font-semibold text-white shadow-sm shadow-brand-600/30'
                      : isToday
                        ? 'font-semibold text-brand-600 ring-1 ring-brand-300 ring-inset hover:bg-brand-50 dark:text-brand-400 dark:ring-brand-500/50 dark:hover:bg-brand-500/10'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                  )}
                >
                  {formatNumber(i + 1)}
                </button>
              )
            })}
          </div>

          {/* shortcuts */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => select(today)}
              className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
            >
              {t('datePicker.today')}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => select(null)}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {t('datePicker.clear')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
