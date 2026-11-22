import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { IssueCard } from '@/components/cards/IssueCard'
import { EventCard } from '@/components/events/EventCard'
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { MediaImage } from '@/components/ui/MediaImage'
import { Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import {
  getEvents,
  getHomepage,
  getIssues,
  getLatestDigitalIssue,
  getLatestPosts,
  getPostsByTopic,
  getTopics,
} from '@/lib/data/queries'
import { isMedia } from '@/lib/media'
import type { Issue, Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }> }

/** Homepage after the HBR model (docs/design-system.md, call 2026-11-21). */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  const homepage = await getHomepage(locale)
  const currentIssue =
    (typeof homepage.currentIssue === 'object' ? (homepage.currentIssue as Issue) : null) ??
    (await getLatestDigitalIssue(locale))
  const pinned = (homepage.pinnedPosts ?? []).filter(
    (p): p is Post => typeof p === 'object' && p !== null,
  )
  const latest = await getLatestPosts(
    locale,
    Math.max(0, 5 - pinned.length),
    pinned.map((p) => p.id),
  )
  const sidePosts = [...pinned, ...latest].slice(0, 5)

  const [upcoming, past, issues, topics] = await Promise.all([
    getEvents(locale, 'upcoming', 3),
    getEvents(locale, 'past', 8),
    getIssues(locale),
    homepage.showTopicSection ? getTopics(locale) : Promise.resolve([]),
  ])
  const pastPhotos = past
    .flatMap((event) => (event.gallery ?? []).filter(isMedia).slice(0, 1))
    .slice(0, 4)
  const archive = issues.filter((issue) => issue.id !== currentIssue?.id).slice(0, 6)

  const mainTopics = topics.filter((topic) => !topic.parent)
  // Latest article per main topic, without repeating articles shown above or in another topic.
  const shown = new Set(sidePosts.map((post) => post.id))
  const topicPosts: Array<{ topic: (typeof mainTopics)[number]; post: Post | null }> = []
  for (const topic of mainTopics) {
    const candidates = (await getPostsByTopic(locale, [topic.id], 1, 8)).docs
    const post = candidates.find((candidate) => !shown.has(candidate.id)) ?? null
    if (post) shown.add(post.id)
    topicPosts.push({ topic, post })
  }

  return (
    <>
      {/* 1. Current issue large, latest articles beside it */}
      <section className="container-page grid gap-10 py-10 lg:grid-cols-[1.4fr_1fr]">
        {currentIssue ? (
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t('currentIssue')}
            </p>
            <Link href={`/issues/${currentIssue.slug}`} className="group mt-3 block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-navy">
                {currentIssue.cover ? (
                  <MediaImage
                    media={currentIssue.cover}
                    size="hero"
                    fill
                    priority
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-end p-8 text-[#e8ecf1] md:p-12">
                    <span className="font-serif text-5xl leading-none md:text-7xl">
                      {currentIssue.title}
                    </span>
                  </div>
                )}
              </div>
              <h1 className="mt-5 font-serif text-4xl leading-tight group-hover:text-accent md:text-5xl">
                {currentIssue.title}
              </h1>
            </Link>
            {currentIssue.tagline && (
              <p className="mt-2 font-serif text-2xl italic text-muted">{currentIssue.tagline}</p>
            )}
            {currentIssue.description && (
              <p className="mt-3 max-w-2xl text-muted">{currentIssue.description}</p>
            )}
          </div>
        ) : (
          <div />
        )}
        <div>
          <h2 className="border-t-2 border-text pt-3 font-serif text-2xl">{t('latest')}</h2>
          <div>
            {sidePosts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="list" />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Speaker events */}
      <Section title={t('upcomingEvents')} link={{ href: '/events', label: t('allEvents') }} band>
        {upcoming.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-muted">—</p>
        )}
        {pastPhotos.length > 0 && (
          <>
            <h3 className="mt-12 font-serif text-2xl">{t('pastEvents')}</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {pastPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-card">
                  <MediaImage
                    media={photo}
                    size="card"
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </Section>

      {/* 3. The Magazine: current issue plus archive covers */}
      <Section title={t('magazine')} link={{ href: '/issues', label: t('allIssues') }}>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-7">
          {currentIssue && (
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <IssueCard issue={currentIssue} compact />
            </div>
          )}
          {archive.map((issue) => (
            <IssueCard key={issue.id} issue={issue} compact />
          ))}
        </div>
      </Section>

      {/* 4. Latest article per main topic */}
      {topicPosts.some((entry) => entry.post) && (
        <Section title={t('byTopic')} link={{ href: '/topics', label: t('byTopic') }}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {topicPosts.map(({ topic, post }) =>
              post ? (
                <div key={topic.id}>
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="mb-3 block text-sm font-semibold uppercase tracking-wider hover:text-accent"
                  >
                    {topic.title}
                  </Link>
                  <ArticleCard post={post} />
                </div>
              ) : null,
            )}
          </div>
        </Section>
      )}

      {/* 5. Newsletter */}
      <Section title="Newsletter" band>
        <div className="max-w-2xl">
          <NewsletterSignup source="newsletter-page" />
        </div>
      </Section>
    </>
  )
}
