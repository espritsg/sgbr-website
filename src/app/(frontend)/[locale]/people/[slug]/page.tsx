import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { EventCard } from '@/components/events/EventCard'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { MediaImage } from '@/components/ui/MediaImage'
import type { AppLocale } from '@/i18n/routing'
import { getEventsByIds, getPerson, getPostsByIds } from '@/lib/data/queries'
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
  return (
    <>
      <AdminBarDocument collection="people" id={person.id} label={person.name} />
      <section className="container-page grid gap-10 pb-8 pt-12 md:grid-cols-[280px_1fr]">
        <div className="relative aspect-square overflow-hidden rounded-card bg-band">
          {person.photo && (
            <MediaImage
              media={person.photo}
              size="card"
              fill
              sizes="280px"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="font-serif text-5xl leading-tight">{person.name}</h1>
          {(person.role || person.organization) && (
            <p className="mt-2 text-lg text-muted">
              {[person.role, person.organization].filter(Boolean).join(', ')}
            </p>
          )}
          {person.bio && (
            <p className="mt-6 max-w-3xl whitespace-pre-line text-text">{person.bio}</p>
          )}
          {person.linkedin && (
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
            >
              LinkedIn →
            </a>
          )}
        </div>
      </section>
      {articles.length > 0 && (
        <section className="container-page py-10">
          <h2 className="mb-8 border-t-2 border-text pt-3 font-serif text-3xl">
            {t('interviews')}
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
      {events.length > 0 && (
        <section className="container-page py-10">
          <h2 className="mb-8 border-t-2 border-text pt-3 font-serif text-3xl">{t('events')}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
