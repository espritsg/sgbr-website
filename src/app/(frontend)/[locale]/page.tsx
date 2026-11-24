import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { IssueCard, IssueCover } from '@/components/cards/IssueCard'
import { EventCard, EventCardGrid } from '@/components/events/EventRow'
import { Reveal } from '@/components/ui/Reveal'
import { ArrowRight } from '@/components/ui/icons'
import { ArrowLink, SectionHeader } from '@/components/ui/Section'
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
import type { Issue, Post } from '@/payload-types'

/** Speaker events on the homepage: one row of cards. */
const EVENT_SLOTS = 3

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }> }

/** Homepage: newspaper grid with column rules (docs/design-system.md). */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const tIssues = await getTranslations('issues')

  const homepage = await getHomepage(locale)
  const currentIssue =
    (typeof homepage.currentIssue === 'object' ? (homepage.currentIssue as Issue) : null) ??
    (await getLatestDigitalIssue(locale))
  const pinned = (homepage.pinnedPosts ?? []).filter(
    (p): p is Post => typeof p === 'object' && p !== null,
  )
  const latest = await getLatestPosts(
    locale,
    9,
    pinned.map((p) => p.id),
  )
  const stories = [...pinned, ...latest]
  const [leadStory, ...rest] = stories
  const secondary = rest.slice(0, 2)
  const ranked = rest.slice(2, 7)

  const [upcoming, past, issues, topics] = await Promise.all([
    getEvents(locale, 'upcoming', EVENT_SLOTS),
    getEvents(locale, 'past', EVENT_SLOTS),
    getIssues(locale),
    homepage.showTopicSection ? getTopics(locale) : Promise.resolve([]),
  ])
  // One full row: upcoming events first, filled up with the most recent past ones.
  const events = [...upcoming, ...past].slice(0, EVENT_SLOTS)
  const showsPast = events.length > upcoming.length
  const archive = issues.filter((issue) => issue.id !== currentIssue?.id).slice(0, 6)

  const shown = new Set(stories.slice(0, 7).map((post) => post.id))
  const topicPosts: Array<{ topic: (typeof topics)[number]; posts: Post[] }> = []
  for (const topic of topics.filter((item) => !item.parent)) {
    const candidates = (await getPostsByTopic(locale, [topic.id], 1, 8)).docs
      .filter((post) => !shown.has(post.id))
      .slice(0, 2)
    candidates.forEach((post) => shown.add(post.id))
    topicPosts.push({ topic, posts: candidates })
  }

  return (
    <>
      {/* 1. Front: current issue | lead story | latest list */}
      <section className="container-page pt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-0 lg:divide-x lg:divide-line">
          {currentIssue && (
            <div className="lg:pr-8">
              <p className="kicker mb-3">{t('currentIssue')}</p>
              <Link href={`/issues/${currentIssue.slug}`} className="group block">
                <div className="mx-auto max-w-[16rem] lg:max-w-none">
                  <IssueCover issue={currentIssue} sizes="(min-width: 1024px) 22vw, 60vw" />
                </div>
                <h2 className="headline-md mt-4 link-headline">{currentIssue.title}</h2>
              </Link>
              {currentIssue.tagline && (
                <p className="mt-1 font-serif text-lg italic text-muted">{currentIssue.tagline}</p>
              )}
              <ArrowLink href={`/issues/${currentIssue.slug}`} className="mt-3">
                {tIssues('readIssue')}
              </ArrowLink>
            </div>
          )}
          <div className="order-first lg:order-none lg:px-8">
            {leadStory && <ArticleCard post={leadStory} variant="lead" priority />}
            <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
              {secondary.map((post) => (
                <ArticleCard key={post.id} post={post} variant="compact" />
              ))}
            </div>
          </div>
          <div className="lg:pl-8">
            <p className="kicker mb-1">{t('latest')}</p>
            <div className="divide-y divide-line">
              {ranked.map((post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  variant="compact"
                  rank={index + 1}
                  showSummary={false}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Speaker events */}
      <Reveal as="section" className="container-page mt-16">
        <SectionHeader
          title={showsPast ? t('events') : t('upcomingEvents')}
          link={{ href: '/events', label: t('allEvents') }}
        />
        {events.length ? (
          <EventCardGrid>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </EventCardGrid>
        ) : (
          <p className="meta">—</p>
        )}
      </Reveal>

      {/* 3. The Magazine: cover strip */}
      <Reveal as="section" className="mt-16 bg-band py-12">
        <div className="container-page">
          <SectionHeader title={t('magazine')} link={{ href: '/issues', label: t('allIssues') }} />
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {archive.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </Reveal>

      {/* 4. Main topics with column rules */}
      {topicPosts.some((entry) => entry.posts.length) && (
        <Reveal as="section" className="container-page mt-16">
          <SectionHeader title={t('byTopic')} link={{ href: '/topics', label: t('allTopics') }} />
          {/* Equal padding on every column (negative margin outside), so all images get the same size. */}
          <div className="grid gap-10 sm:grid-cols-2 lg:-mx-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-line">
            {topicPosts.map(({ topic, posts }) =>
              posts.length ? (
                <div key={topic.id} className="lg:px-6">
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="group mb-4 flex items-center justify-between border-b border-line pb-2 text-xs font-bold uppercase tracking-[0.12em] hover:text-accent"
                  >
                    {topic.title}
                    <ArrowRight
                      aria-hidden
                      className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                  <ArticleCard post={posts[0]} />
                  {posts[1] && (
                    <div className="mt-4 border-t border-line">
                      <ArticleCard post={posts[1]} variant="compact" showSummary={false} />
                    </div>
                  )}
                </div>
              ) : null,
            )}
          </div>
        </Reveal>
      )}
    </>
  )
}
