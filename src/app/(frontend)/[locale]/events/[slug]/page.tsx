import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { speakerOf } from '@/components/events/EventRow'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { MediaImage } from '@/components/ui/MediaImage'
import { SectionHeader } from '@/components/ui/Section'
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
  const tLanguage = await getTranslations('language')
  const speaker = speakerOf(event)
  const application = applicationState(event)
  const formId =
    typeof event.applicationForm === 'object' ? event.applicationForm?.id : event.applicationForm
  const form = application.state === 'open' && formId ? await getForm(formId) : null
  const recap = typeof event.recap === 'object' ? (event.recap as Post | null) : null
  const gallery = (event.gallery ?? []).filter(isMedia)
  const facts = [
    { label: t('date'), value: formatDate(event.startsAt, locale) },
    { label: t('time'), value: formatTime(event.startsAt, locale) },
    { label: t('place'), value: event.location ?? '—' },
    { label: t('languageLabel'), value: tLanguage(`languageNames.${event.language}`) },
  ]

  return (
    <>
      <AdminBarDocument collection="events" id={event.id} label={t('title')} />
      <header className="container-page pt-10 md:pt-14">
        <Link href="/events" className="kicker hover:underline">
          ← {t('title')}
        </Link>
        <h1 className="display mt-4 max-w-4xl">{event.title || speaker?.name}</h1>
        {speaker && (
          <p className="lead mt-3">
            {[event.title ? speaker.name : null, speaker.role, speaker.organization]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        <dl className="mt-8 grid grid-cols-2 border-y border-rule md:grid-cols-4">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`py-4 pr-4 ${index > 0 ? 'md:border-l md:border-line md:pl-5' : ''} ${index % 2 === 1 ? 'border-l border-line pl-5 md:pl-5' : ''} ${index >= 2 ? 'border-t border-line md:border-t-0' : ''}`}
            >
              <dt className="kicker text-muted!">{fact.label}</dt>
              <dd className="mt-1 text-[0.9375rem] font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="container-page mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          {event.description && (
            <RichText
              data={event.description}
              locale={locale}
              className="prose prose-lg max-w-none text-text dark:prose-invert"
            />
          )}
          {recap && (
            <Link
              href={`/article/${recap.slug}`}
              className="mt-6 inline-block font-semibold underline underline-offset-4"
            >
              {t('recap')} →
            </Link>
          )}

          {application.state !== 'none' && (
            <div id="apply" className="mt-4 scroll-mt-20">
              <SectionHeader title={t('apply')} />
              {application.state === 'open' && form && (
                <>
                  <p className="text-muted">{t('applyIntro')}</p>
                  {application.deadline && (
                    <p className="meta mt-1">
                      {t('applicationDeadline', { date: formatDate(application.deadline, locale) })}
                    </p>
                  )}
                  <div className="mt-8">
                    <FormRenderer form={form} eventId={event.id} />
                  </div>
                </>
              )}
              {application.state === 'notYetOpen' && (
                <p className="text-muted">
                  {t('applicationOpens', { date: formatDate(application.opensAt, locale) })}
                </p>
              )}
              {application.state === 'closed' && (
                <p className="text-muted">{t('applicationClosed')}</p>
              )}
            </div>
          )}
        </div>

        {speaker && (
          <aside className="self-start border-t-2 border-rule pt-4 lg:sticky lg:top-20">
            <p className="kicker text-muted!">{t('speaker')}</p>
            {speaker.photo && (
              <div className="relative mt-3 aspect-[4/5] overflow-hidden bg-band">
                <MediaImage
                  media={speaker.photo}
                  size="card"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="headline-sm mt-3">
              <Link href={`/people/${speaker.slug}`} className="link-headline">
                {speaker.name}
              </Link>
            </h2>
            <p className="meta mt-1">
              {[speaker.role, speaker.organization].filter(Boolean).join(', ')}
            </p>
            {speaker.bio && (
              <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-muted">{speaker.bio}</p>
            )}
            {speaker.organizationLogo && (
              <div className="mt-5 flex h-16 items-center justify-center border border-line bg-[#ffffff] px-6">
                <div className="relative h-8 w-full">
                  <MediaImage
                    media={speaker.organizationLogo}
                    size="thumbnail"
                    fill
                    sizes="240px"
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </aside>
        )}
      </section>

      {gallery.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeader title={t('gallery')} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {gallery.map((photo) => (
              <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden bg-band">
                <MediaImage
                  media={photo}
                  size="card"
                  fill
                  sizes="33vw"
                  className="img-zoom object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
