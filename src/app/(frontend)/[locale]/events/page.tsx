import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { EventRow } from '@/components/events/EventRow'
import { PageTitle, SectionHeader } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { getEvents } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'

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
  const [upcoming, past] = await Promise.all([
    getEvents(locale, 'upcoming'),
    getEvents(locale, 'past'),
  ])
  return (
    <>
      <PageTitle title={t('title')} intro={t('intro')} />
      <section className="container-page">
        <SectionHeader title={t('upcoming')} />
        {upcoming.length ? (
          <div className="border-t border-line">
            {upcoming.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="meta py-6">{t('none')}</p>
        )}
      </section>
      {past.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeader title={t('past')} />
          <div className="border-t border-line">
            {past.map((event) => (
              <EventRow key={event.id} event={event} showYear />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
