import { jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js'

// Calendar systems for the date picker. Dates are always *stored* as Gregorian
// ISO strings (yyyy-mm-dd); a calendar only changes how months are laid out.

/** A date in a specific calendar; `m` is 1-based (1 = first month). */
export interface CalendarDate {
  y: number
  m: number
  d: number
}

export interface CalendarSystem {
  /** Locale for Intl formatting (fa-IR uses the Persian calendar by default). */
  locale: string
  /** First day of the week as JS `getDay()` (0 = Sunday … 6 = Saturday). */
  weekStart: number
  monthNames: string[]
  /** Short weekday labels, starting at `weekStart`. */
  weekdayNames: string[]
  fromISO(iso: string): CalendarDate
  toISO(date: CalendarDate): string
  daysInMonth(y: number, m: number): number
}

const pad = (n: number) => String(n).padStart(2, '0')

const parseISO = (iso: string): CalendarDate => {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

const gregorian: CalendarSystem = {
  locale: 'en-US',
  weekStart: 0,
  monthNames: Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, i, 1)),
  ),
  weekdayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  fromISO: parseISO,
  toISO: ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`,
  daysInMonth: (y, m) => new Date(y, m, 0).getDate(),
}

const persian: CalendarSystem = {
  locale: 'fa-IR',
  weekStart: 6, // Saturday
  monthNames: [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ],
  weekdayNames: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  fromISO: (iso) => {
    const { y, m, d } = parseISO(iso)
    const { jy, jm, jd } = toJalaali(y, m, d)
    return { y: jy, m: jm, d: jd }
  },
  toISO: ({ y, m, d }) => {
    const { gy, gm, gd } = toGregorian(y, m, d)
    return `${gy}-${pad(gm)}-${pad(gd)}`
  },
  daysInMonth: jalaaliMonthLength,
}

/** Persian UI → Persian (Solar Hijri) calendar; otherwise Gregorian. */
export const getCalendar = (language: string) => (language === 'fa' ? persian : gregorian)

/** Day of the week (0 = Sunday) for a Gregorian ISO date. */
export const weekdayOf = (iso: string) => new Date(`${iso}T00:00:00`).getDay()

/** ISO date of the 1st of the month `delta` months away from the month containing `iso`. */
export const shiftMonth = (calendar: CalendarSystem, iso: string, delta: number) => {
  const { y, m } = calendar.fromISO(iso)
  const index = y * 12 + (m - 1) + delta
  return calendar.toISO({ y: Math.floor(index / 12), m: (index % 12) + 1, d: 1 })
}
