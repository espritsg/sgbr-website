import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { speakerOf } from '@/components/events/EventCard'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { MediaImage } from '@/components/ui/MediaImage'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getEvent, getForm } from '@/lib/data/queries'
import { applicationState } from '@/lib/events'
import { formatDate, formatTime } from '@/lib/format'
import { isMedia } from '@/lib/media'
import { buildMetadata } from '@/lib/seo'
import type { Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const event = await getEvent(locale, slug)
  if (!event) return {}
  const speaker = speakerOf(event)
  return buildMetadata({
    locale,
    path: `/events/${slug}`,
    title: event.title || speaker?.name || slug,
    description: [speaker?.role, speaker?.organization].filter(Boolean).join(', '),
    meta: event.meta,
  })
}

export default async function EventPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const event = await getEvent(locale, slug)
  if (!event) notFound()
  const t = await getTranslations('events')
  const speaker = speakerOf(event)
  const application = applicationState(event)
  const formId =
    typeof event.applicationForm === 'object' ? event.applicationForm?.id : event.applicationForm
  const form = application.state === 'open' && formId ? await getForm(formId) : null
  const recap = typeof event.recap === 'object' ? (event.recap as Post | null) : null
  const gallery = (event.gallery ?? []).filter(isMedia)

  return (
    <>
      <AdminBarDocument collection="events" id={event.id} label={t('title')} />
      <section className="container-page grid gap-10 pb-8 pt-12 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t('title')}
          </p>
          <h1 className="mt-2 font-serif text-5xl leading-tight md:text-6xl">
            {event.title || speaker?.name}
          </h1>
          {speaker && (
            <p className="mt-3 text-lg">
              <Link href={`/people/${speaker.slug}`} className="font-semibold hover:text-accent">
                {speaker.name}
              </Link>
              {[speaker.role, speaker.organization].filter(Boolean).length > 0 &&
                `, ${[speaker.role, speaker.organization].filter(Boolean).join(', ')}`}
            </p>
          )}
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted">{formatDate(event.startsAt, locale)}</dt>
            <dd>{formatTime(event.startsAt, locale)}</dd>
            {event.location && (
              <>
                <dt className="text-muted">📍</dt>
                <dd>{event.location}</dd>
              </>
            )}
          </dl>
          {event.description && (
            <RichText
              data={event.description}
              locale={locale}
              className="prose mt-8 max-w-none text-text dark:prose-invert"
            />
          )}
          {recap && (
            <Link
              href={`/article/${recap.slug}`}
              className="mt-6 inline-block font-semibold text-accent hover:underline"
            >
              {t('recap')} →
            </Link>
          )}
        </div>
        <aside className="space-y-6">
          {speaker?.photo && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-band">
              <MediaImage
                media={speaker.photo}
                size="card"
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          {speaker?.organizationLogo && (
            <div className="relative h-20 rounded-card bg-[#ffffff] ring-1 ring-line">
              <MediaImage
                media={speaker.organizationLogo}
                size="thumbnail"
                fill
                sizes="300px"
                className="object-contain p-4"
              />
            </div>
          )}
        </aside>
      </section>

      {application.state !== 'none' && (
        <section id="apply" className="bg-band py-12">
          <div className="container-reading">
            <h2 className="font-serif text-3xl">{t('apply')}</h2>
            {application.state === 'open' && form && (
              <>
                {application.deadline && (
                  <p className="mt-2 text-sm text-muted">
                    {t('applicationDeadline', { date: formatDate(application.deadline, locale) })}
                  </p>
                )}
                <div className="mt-6">
                  <FormRenderer form={form} eventId={event.id} />
                </div>
              </>
            )}
            {application.state === 'notYetOpen' && (
              <p className="mt-2 text-muted">
                {t('applicationOpens', { date: formatDate(application.opensAt, locale) })}
              </p>
            )}
            {application.state === 'closed' && (
              <p className="mt-2 text-muted">{t('applicationClosed')}</p>
            )}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="container-page py-12">
          <h2 className="mb-6 font-serif text-3xl">{t('gallery')}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((photo) => (
              <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-card">
                <MediaImage media={photo} size="card" fill sizes="33vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
