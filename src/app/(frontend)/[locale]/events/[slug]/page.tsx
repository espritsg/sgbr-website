import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { LogoPlate, speakerOf } from '@/components/events/EventRow'
import { FormRenderer } from '@/components/forms/FormRenderer'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { RichText } from '@/components/richtext/RichText'
import { FormDialog, FormDialogButton } from '@/components/forms/FormDialog'
import {
  CalendarBlank,
  Clock,
  ForkKnife,
  MapPin,
  Microphone,
  Translate,
} from '@/components/ui/icons'
import { MediaImage } from '@/components/ui/MediaImage'
import { ArrowLink, BackLink, SectionHeader } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { getEvent, getForm } from '@/lib/data/queries'
import { applicationState } from '@/lib/events'
import { SITE_TIME_ZONE } from '@/lib/dates'
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
  const forDinner = event.applicationFor !== 'event'
  const applyLabel = forDinner ? t('applyDinner') : t('applyEvent')
  const applyIntro = forDinner ? t('applyIntroDinner') : t('applyIntroEvent')
  const applyIcon = forDinner ? (
    <ForkKnife aria-hidden className="size-4" />
  ) : (
    <Microphone aria-hidden className="size-4" />
  )
  const longDate = new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', {
    timeZone: SITE_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(event.startsAt))
  const facts = [
    { icon: CalendarBlank, label: t('date'), value: longDate },
    { icon: Clock, label: t('time'), value: formatTime(event.startsAt, locale) },
    ...(event.location ? [{ icon: MapPin, label: t('place'), value: event.location }] : []),
    {
      icon: Translate,
      label: t('languageLabel'),
      value: tLanguage(`languageNames.${event.language}`),
    },
  ]

  return (
    <>
      <AdminBarDocument collection="events" id={event.id} label={t('title')} />
      <header className="container-page pt-10 md:pt-14">
        <BackLink href="/events">{t('back')}</BackLink>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="min-w-0">
            <p className="kicker mb-3">{t('kicker')}</p>
            <h1 className="headline-xl max-w-3xl">{event.title || speaker?.name}</h1>
            {speaker && (
              <p className="lead mt-3">
                {[event.title ? speaker.name : null, speaker.role, speaker.organization]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <LogoPlate logo={speaker?.organizationLogo} className="h-20 w-44 md:h-24 md:w-56" />
        </div>
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-line py-5">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-2.5">
              <fact.icon aria-hidden className="size-5 shrink-0 text-accent" />
              <dt className="sr-only">{fact.label}</dt>
              <dd className="text-[0.9375rem] font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="container-page mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="min-w-0">
          {event.description && (
            <>
              <h2 className="kicker mb-4 text-muted!">{t('about')}</h2>
              <RichText
                data={event.description}
                locale={locale}
                className="prose prose-lg max-w-none text-text dark:prose-invert"
              />
            </>
          )}
          {recap && (
            <ArrowLink href={`/article/${recap.slug}`} className="mt-6 text-base">
              {t('recap')}
            </ArrowLink>
          )}

          {application.state !== 'none' && (
            <div
              id="apply"
              className="mt-12 scroll-mt-24 border-t border-line pt-8 first:mt-0 first:border-t-0 first:pt-0"
            >
              <h2 className="headline-md">{applyLabel}</h2>
              {application.state === 'open' && form && (
                <>
                  <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
                    {applyIntro}
                  </p>
                  <div className="mt-6 flex flex-col items-start gap-2.5">
                    <FormDialogButton dialogId="apply-form">
                      {applyIcon}
                      {applyLabel}
                    </FormDialogButton>
                    {application.deadline && (
                      <p className="meta">
                        {t('applicationDeadline', {
                          date: formatDate(application.deadline, locale),
                        })}
                      </p>
                    )}
                  </div>
                  <FormDialog id="apply-form" title={applyLabel} intro={applyIntro}>
                    <FormRenderer form={form} eventId={event.id} />
                  </FormDialog>
                </>
              )}
              {application.state === 'notYetOpen' && (
                <p className="mt-3 text-muted">
                  {t('applicationOpens', { date: formatDate(application.opensAt, locale) })}
                </p>
              )}
              {application.state === 'closed' && (
                <p className="mt-3 text-muted">{t('applicationClosed')}</p>
              )}
            </div>
          )}
        </div>

        {speaker && (
          <aside className="bg-band p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-4 lg:block">
              {speaker.photo && (
                <div className="relative size-20 shrink-0 overflow-hidden bg-line lg:aspect-[4/5] lg:size-auto lg:w-full">
                  <MediaImage
                    media={speaker.photo}
                    size="card"
                    fill
                    sizes="(min-width: 1024px) 272px, 80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="lg:mt-5">
                <p className="kicker text-muted!">{t('speaker')}</p>
                <h2 className="headline-sm mt-1">{speaker.name}</h2>
                <p className="meta mt-1">
                  {[speaker.role, speaker.organization].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
            {speaker.bio && (
              <p className="mt-4 line-clamp-6 text-sm leading-relaxed text-muted">{speaker.bio}</p>
            )}
            <ArrowLink href={`/people/${speaker.slug}`} className="mt-4">
              {t('profile')}
            </ArrowLink>
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
