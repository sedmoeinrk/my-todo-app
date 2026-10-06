/** Today's date as yyyy-mm-dd in the user's local time zone. */
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export type DayPeriod = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'

/** Part of the day for a local hour (0–23), used to pick the greeting. */
export const getDayPeriod = (hour: number): DayPeriod => {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

/** Full date with year for form fields, e.g. "Oct 7, 2026" / "۱۵ مهر ۱۴۰۵". */
export const formatDateWithYear = (isoDate: string, language: string) =>
  new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', { dateStyle: 'medium' }).format(
    new Date(`${isoDate}T00:00:00`),
  )

/** Formats a yyyy-mm-dd date for the UI language (Persian uses the Solar Hijri calendar). */
export const formatDate = (isoDate: string, language: string) => {
  const date = new Date(`${isoDate}T00:00:00`)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  }).format(date)
}
