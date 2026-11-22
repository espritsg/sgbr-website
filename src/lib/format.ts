import { SITE_TIME_ZONE } from './dates'

/** Long date in the page language, Zurich time. */
export function formatDate(date: string | Date | null | undefined, locale: string): string {
  if (!date) return ''
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', {
    timeZone: SITE_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', {
    timeZone: SITE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(date))
}

/** "Ada Muster and Bo Beispiel" / "Ada Muster und Bo Beispiel". */
export function joinNames(names: string[], locale: string): string {
  return new Intl.ListFormat(locale === 'de' ? 'de' : 'en', { type: 'conjunction' }).format(names)
}
