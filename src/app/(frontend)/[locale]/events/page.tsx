import type { Metadata } from 'next'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'

import { EventCard, speakerOf } from '@/components/events/EventCard'
import { MediaImage } from '@/components/ui/MediaImage'
import { PageTitle, Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getEvents } from '@/lib/data/queries'
import { formatDate } from '@/lib/format'
import { isMedia } from '@/lib/media'
import { buildMetadata } from '@/lib/seo'
import type { Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'events' })
  return buildMetadata({ locale, path: '/events', title: t('title') })
}

export default async function EventsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('events')
  const currentLocale = await getLocale()
  const [upcoming, past] = await Promise.all([
    getEvents(locale, 'upcoming'),
    getEvents(locale, 'past'),
  ])
  return (
    <>
      <PageTitle title={t('title')} />
      <Section title={t('upcoming')}>
        {upcoming.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-muted">{t('none')}</p>
        )}
      </Section>
      <Section title={t('past')} band>
        <ul className="grid gap-8 md:grid-cols-2">
          {past.map((event) => {
            const speaker = speakerOf(event)
            const photo = (event.gallery ?? []).find(isMedia)
            const recap = typeof event.recap === 'object' ? (event.recap as Post | null) : null
            return (
              <li key={event.id} className="grid grid-cols-[120px_1fr] gap-4">
                <div className="relative aspect-square overflow-hidden rounded-card bg-surface">
                  {photo ? (
                    <MediaImage
                      media={photo}
                      size="thumbnail"
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  ) : (
                    speaker?.organizationLogo && (
                      <div className="absolute inset-0 bg-[#ffffff]">
                        <MediaImage
                          media={speaker.organizationLogo}
                          size="thumbnail"
                          fill
                          sizes="120px"
                          className="object-contain p-4"
                        />
                      </div>
                    )
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted">{formatDate(event.startsAt, currentLocale)}</p>
                  <h3 className="font-serif text-xl leading-tight">
                    <Link href={`/events/${event.slug}`} className="hover:text-accent">
                      {event.title || speaker?.name}
                    </Link>
                  </h3>
                  {speaker && (
                    <p className="text-sm text-muted">
                      {[speaker.role, speaker.organization].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {recap && (
                    <Link
                      href={`/article/${recap.slug}`}
                      className="mt-1 inline-block text-sm font-semibold text-accent hover:underline"
                    >
                      {t('recap')} →
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </Section>
    </>
  )
}
