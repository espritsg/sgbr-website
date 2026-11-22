/** Date helpers. All dates on the site are shown in Zurich time (docs/sprachen.md). */
export const SITE_TIME_ZONE = 'Europe/Zurich'

/** Offset of a time zone at a given instant, in minutes (e.g. +60 for CET). */
function timeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return Math.round((asUtc - date.getTime()) / 60000)
}

/** Converts a wall-clock time in Zurich (e.g. 2026-10-15 19:00) to an exact instant. */
export function zurichToDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const offset = timeZoneOffsetMinutes(guess, SITE_TIME_ZONE)
  const result = new Date(guess.getTime() - offset * 60000)
  // Second pass handles dates right at a daylight-saving switch.
  const correctedOffset = timeZoneOffsetMinutes(result, SITE_TIME_ZONE)
  return correctedOffset === offset ? result : new Date(guess.getTime() - correctedOffset * 60000)
}

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/** Parses "15 October 2026" + "19:00" (format of the espritsg.ch feed) as Zurich time. */
export function parseFeedDate(date: string, time: string): Date | null {
  const match = date.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (!match) return null
  const month = MONTHS.indexOf(match[2].toLowerCase()) + 1
  if (month === 0) return null
  const [hour, minute] = (time.match(/^(\d{1,2}):(\d{2})$/)?.slice(1) ?? ['0', '0']).map(Number)
  return zurichToDate(Number(match[3]), month, Number(match[1]), hour, minute)
}

/** "15 October 2026" in English, Zurich time (feed format). */
export function formatFeedDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SITE_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/** "19:00", Zurich time (feed format). */
export function formatFeedTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SITE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(date))
}

/** ISO 8601 with offset, e.g. 2026-11-22T17:18:10+00:00 (feed `generated_at`). */
export function isoWithOffset(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '+00:00')
}

/** Upcoming until the event starts (ADR 0003). */
export function isUpcoming(startsAt: string | Date, now: Date = new Date()): boolean {
  return new Date(startsAt).getTime() > now.getTime()
}

/** Adds whole months, keeping the time of day. */
export function addMonths(date: Date | string, months: number): Date {
  const result = new Date(date)
  result.setUTCMonth(result.getUTCMonth() + months)
  return result
}
