import { getLocale, getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { SITE_TIME_ZONE } from '@/lib/dates'
import { applicationState, isPastEvent } from '@/lib/events'
import { formatTime } from '@/lib/format'
import type { Event, Media, Person } from '@/payload-types'

import { Clock, ForkKnife, MapPin, Microphone } from '../ui/icons'
import { MediaImage } from '../ui/MediaImage'

export function speakerOf(event: Event): Person | null {
  return typeof event.speaker === 'object' ? event.speaker : null
}

export function dateParts(date: string, locale: string) {
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

/** Company logo on a fixed plate, so logos of any shape line up (event rows and pages). */
export function LogoPlate({
  logo,
  className = 'h-14 w-32',
}: {
  logo: Media | number | null | undefined
  className?: string
}) {
  if (!logo || typeof logo !== 'object') return null
  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-line bg-bg px-3 py-2 dark:border-transparent dark:bg-[#eef1f3] ${className}`}
    >
      <div className="relative size-full">
        <MediaImage media={logo} size="card" fill sizes="224px" className="object-contain" />
      </div>
    </div>
  )
}

/**
 * One speaker event as a row, the same on every page: date block | speaker with time
 * and place | company logo. All columns are vertically centred.
 */
export async function EventRow({ event, showYear = false }: { event: Event; showYear?: boolean }) {
  const t = await getTranslations('events')
  const locale = await getLocale()
  const speaker = speakerOf(event)
  const date = dateParts(event.startsAt, locale)
  const dinner = event.applicationFor === 'dinner' && applicationState(event).state === 'open'
  return (
    <article className="group relative grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-5 py-5 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-x-8">
      <time
        dateTime={event.startsAt}
        className="flex aspect-square flex-col items-center justify-center border border-line text-center transition-colors duration-200 group-hover:border-accent"
      >
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
          {date.weekday}
        </span>
        <span className="font-serif text-[2rem] font-semibold leading-none">{date.day}</span>
        <span className="kicker mt-0.5 text-[0.625rem]">
          {date.month}
          {showYear && ` ${date.year.slice(-2)}`}
        </span>
      </time>
      <div className="min-w-0">
        <h3 className="headline-md">
          {/* The link covers the whole row: everything is clickable. */}
          <Link
            href={`/events/${event.slug}`}
            className="underline decoration-transparent underline-offset-[0.18em] transition-colors duration-200 after:absolute after:inset-0 group-hover:decoration-current"
          >
            {event.title || speaker?.name}
          </Link>
        </h3>
        {speaker && (
          <p className="meta mt-1">
            {[event.title ? speaker.name : null, speaker.role, speaker.organization]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem] text-text">
          <li className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-muted" />
            <span className="sr-only">{t('time')}: </span>
            {formatTime(event.startsAt, locale)}
            {showYear && <span className="text-muted">· {date.year}</span>}
          </li>
          {event.location && (
            <li className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin aria-hidden className="size-4 shrink-0 text-muted" />
              <span className="sr-only">{t('place')}: </span>
              <span className="truncate">{event.location}</span>
            </li>
          )}
          {dinner && (
            <li className="inline-flex items-center gap-1.5 font-semibold text-accent">
              <ForkKnife aria-hidden className="size-4" />
              {t('dinnerOpen')}
            </li>
          )}
        </ul>
      </div>
      <LogoPlate logo={speaker?.organizationLogo} className="hidden h-14 w-32 sm:flex" />
    </article>
  )
}

/**
 * Upcoming speaker event as a card (homepage, events page). The whole card is one
 * link; past events stay rows (EventRow).
 */
export async function EventCard({ event }: { event: Event }) {
  const t = await getTranslations('events')
  const locale = await getLocale()
  const speaker = speakerOf(event)
  const date = dateParts(event.startsAt, locale)
  const dinner = event.applicationFor !== 'event' && applicationState(event).state === 'open'
  const applyOpen = applicationState(event).state === 'open'
  const isPast = isPastEvent(event)
  return (
    <article className="group relative flex h-full flex-col border border-line p-5 transition-colors duration-200 hover:border-text sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <time
          dateTime={event.startsAt}
          className="flex size-[4.5rem] shrink-0 flex-col items-center justify-center border border-line text-center"
        >
          <span className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-muted">
            {date.weekday}
          </span>
          <span className="font-serif text-[2rem] font-semibold leading-none">{date.day}</span>
          <span className="kicker mt-0.5 text-[0.625rem]">{date.month}</span>
        </time>
        <LogoPlate logo={speaker?.organizationLogo} className="h-14 w-32" />
      </div>
      {/* Past events only appear here to fill the homepage row; label them clearly. */}
      {isPast && (
        <p className="kicker mt-6 -mb-4 text-muted!">
          {t('pastEvent')} · {new Date(event.startsAt).getUTCFullYear()}
        </p>
      )}
      <h3 className="headline-md mt-6">
        <Link
          href={`/events/${event.slug}`}
          className="underline decoration-transparent underline-offset-[0.18em] transition-colors duration-200 after:absolute after:inset-0 group-hover:decoration-current"
        >
          {event.title || speaker?.name}
        </Link>
      </h3>
      {speaker && (
        <p className="meta mt-1">
          {[event.title ? speaker.name : null, speaker.role, speaker.organization]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      <div className="mt-auto pt-6">
        <ul className="space-y-1.5 border-t border-line pt-4 text-[0.8125rem]">
          <li className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0 text-muted" />
            <span className="sr-only">{t('time')}: </span>
            {formatTime(event.startsAt, locale)}
          </li>
          {event.location && (
            <li className="flex items-start gap-2">
              <MapPin aria-hidden className="mt-px size-4 shrink-0 text-muted" />
              <span className="sr-only">{t('place')}: </span>
              <span>{event.location}</span>
            </li>
          )}
          {applyOpen && (
            <li className="flex items-center gap-2 font-semibold text-accent">
              {dinner ? (
                <ForkKnife aria-hidden className="size-4 shrink-0" />
              ) : (
                <Microphone aria-hidden className="size-4 shrink-0" />
              )}
              {dinner ? t('dinnerOpen') : t('applicationsOpen')}
            </li>
          )}
        </ul>
      </div>
    </article>
  )
}

/** Grid of upcoming event cards. */
export function EventCardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}
