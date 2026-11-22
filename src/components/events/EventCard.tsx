import { getLocale, getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { formatDate, formatTime } from '@/lib/format'
import type { Event, Person } from '@/payload-types'

import { MediaImage } from '../ui/MediaImage'

export function speakerOf(event: Event): Person | null {
  return typeof event.speaker === 'object' ? event.speaker : null
}

/** Event card: date, time, speaker, role, company, logo, location. */
export async function EventCard({ event }: { event: Event }) {
  const t = await getTranslations('events')
  const locale = await getLocale()
  const speaker = speakerOf(event)
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-accent">
          <time dateTime={event.startsAt}>
            {formatDate(event.startsAt, locale)} · {formatTime(event.startsAt, locale)}
          </time>
        </p>
        {/* Logos sit on a light surface so dark logos stay visible in dark mode. */}
        {speaker?.organizationLogo && (
          <div className="relative h-10 w-24 shrink-0 rounded bg-[#ffffff] p-1">
            <MediaImage
              media={speaker.organizationLogo}
              size="thumbnail"
              fill
              sizes="96px"
              className="object-contain p-1"
            />
          </div>
        )}
      </div>
      <h3 className="mt-4 font-serif text-2xl leading-tight">
        <Link href={`/events/${event.slug}`} className="hover:text-accent">
          {event.title || speaker?.name}
        </Link>
      </h3>
      {speaker && (
        <p className="mt-1 text-sm text-muted">
          {[speaker.role, speaker.organization].filter(Boolean).join(', ')}
        </p>
      )}
      <div className="mt-auto pt-4 text-sm text-muted">
        {event.location && <p>{event.location}</p>}
        <p>
          {t('language', {
            language:
              event.language === 'de'
                ? locale === 'de'
                  ? 'Deutsch'
                  : 'German'
                : locale === 'de'
                  ? 'Englisch'
                  : 'English',
          })}
        </p>
      </div>
    </article>
  )
}
