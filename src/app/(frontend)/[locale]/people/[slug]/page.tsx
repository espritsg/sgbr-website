import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { EventRow } from '@/components/events/EventRow'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { LinkedinLogo } from '@/components/ui/icons'
import { MediaImage } from '@/components/ui/MediaImage'
import { SectionHeader } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { getEventsByIds, getPerson, getPostsByIds } from '@/lib/data/queries'
import { isMedia } from '@/lib/media'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale; slug: string }> }

const idsOf = (docs: Array<number | { id: number }> | undefined) =>
  (docs ?? []).map((doc) => (typeof doc === 'object' ? doc.id : doc))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const person = await getPerson(locale, slug)
  if (!person) return {}
  return buildMetadata({
    locale,
    path: `/people/${slug}`,
    title: person.name,
    description: [person.role, person.organization].filter(Boolean).join(', '),
    image: person.photo,
  })
}

/** Person with all interviews and events (join fields). */
export default async function PersonPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const person = await getPerson(locale, slug)
  if (!person) notFound()
  const t = await getTranslations('people')
  const [articles, events] = await Promise.all([
    getPostsByIds(locale, idsOf(person.articles?.docs as never)),
    getEventsByIds(locale, idsOf(person.events?.docs as never)),
  ])
  const hasPhoto = isMedia(person.photo)
  return (
    <>
      <AdminBarDocument collection="people" id={person.id} label={person.name} />
      <header className="container-page pt-10 md:pt-14">
        <div
          className={`grid gap-8 border-b border-line pb-10 ${hasPhoto ? 'md:grid-cols-[14rem_1fr] md:gap-12' : ''}`}
        >
          {hasPhoto && (
            <div className="relative aspect-[4/5] w-40 overflow-hidden bg-band md:w-auto">
              <MediaImage
                media={person.photo}
                size="card"
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
          )}
          <div className="self-end">
            <p className="kicker">{t('kicker')}</p>
            <h1 className="display mt-3">{person.name}</h1>
            {(person.role || person.organization) && (
              <p className="lead mt-2">
                {[person.role, person.organization].filter(Boolean).join(', ')}
              </p>
            )}
            {person.bio && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-muted">{person.bio}</p>
            )}
            {person.linkedin && (
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-accent"
              >
                <LinkedinLogo aria-hidden className="size-5" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </header>
      {articles.length > 0 && (
        <section className="container-page mt-12">
          <SectionHeader title={t('interviews')} />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
      {events.length > 0 && (
        <section className="container-page mt-16">
          <SectionHeader title={t('events')} />
          <div className="divide-y divide-line">
            {events.map((event) => (
              <EventRow key={event.id} event={event} showYear />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
