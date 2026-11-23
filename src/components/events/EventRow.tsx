import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { SITE_TIME_ZONE } from '@/lib/dates'
import { formatTime } from '@/lib/format'
import type { Event, Person } from '@/payload-types'

export function speakerOf(event: Event): Person | null {
  return typeof event.speaker === 'object' ? event.speaker : null
}

function dateParts(date: string, locale: string) {
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', {
      timeZone: SITE_TIME_ZONE,
      ...options,
    }).format(new Date(date))
  return {
    day: format({ day: 'numeric' }),
    month: format({ month: 'short' }).replace('.', ''),
    weekday: format({ weekday: 'short' }).replace('.', ''),
    year: format({ year: 'numeric' }),
  }
}

/** One speaker event as a row: date block | speaker | time and place. Same everywhere. */
export async function EventRow({ event, showYear = false }: { event: Event; showYear?: boolean }) {
  const t = await getTranslations('events')
  const locale = await getLocale()
  const speaker = speakerOf(event)
  const date = dateParts(event.startsAt, locale)
  return (
    <article className="group grid grid-cols-[4.5rem_1fr] gap-x-5 gap-y-3 border-b border-line py-5 sm:grid-cols-[5rem_1fr_19rem]">
      <time
        dateTime={event.startsAt}
        className="row-span-2 flex flex-col items-start sm:row-span-1"
      >
        <span className="kicker text-muted!">{date.weekday}</span>
        <span className="font-serif text-4xl font-semibold leading-none">{date.day}</span>
        <span className="kicker mt-1">
          {date.month}
          {showYear && ` ${date.year}`}
        </span>
      </time>
      <div>
        <h3 className="headline-md">
          <Link href={`/events/${event.slug}`} className="link-headline">
            {event.title || speaker?.name}
          </Link>
        </h3>
        {speaker &&
          (event.title ? <p className="mt-1 text-sm font-semibold">{speaker.name}</p> : null)}
        {speaker && (
          <p className="meta mt-1">
            {[speaker.role, speaker.organization].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <dl className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1 text-sm sm:border-l sm:border-line sm:pl-5">
        <dt className="kicker pt-0.5 text-muted!">{t('time')}</dt>
        <dd>{formatTime(event.startsAt, locale)}</dd>
        {event.location && (
          <>
            <dt className="kicker pt-0.5 text-muted!">{t('place')}</dt>
            <dd>{event.location}</dd>
          </>
        )}
      </dl>
    </article>
  )
}
