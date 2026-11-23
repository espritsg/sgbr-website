import { getTranslations } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { Listbox } from '@/components/forms/fields/Listbox'
import { buttonClass } from '@/components/ui/Button'
import { MagnifyingGlass, X } from '@/components/ui/icons'
import { Pagination } from '@/components/ui/Pagination'
import { PageTitle } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { countPostsByTopic, findPosts } from '@/lib/data/queries'
import type { Post, Topic } from '@/payload-types'

const parentId = (topic: Topic) =>
  typeof topic.parent === 'object' ? topic.parent?.id : topic.parent

const postTypes = ['interview', 'guest-article'] as const

export type TopicSearch = { page?: string; q?: string; type?: string }

/**
 * Topics overview and topic pages in one layout, so nothing shifts when a filter
 * changes: title, one filter panel (free text, type, topic chips), article grid.
 */
export async function TopicsExplorer({
  locale,
  topics,
  active,
  search,
}: {
  locale: AppLocale
  topics: Topic[]
  active: Topic | null
  search: TopicSearch
}) {
  const t = await getTranslations('topics')
  const tArticle = await getTranslations('article')
  const page = Math.max(1, Number(search.page) || 1)
  const query = (search.q ?? '').trim().slice(0, 100)
  const type = postTypes.find((value) => value === search.type) as Post['type'] | undefined

  const mains = topics.filter((topic) => !topic.parent)
  const childrenOf = (id: number) => topics.filter((topic) => parentId(topic) === id)
  const activeMain = active
    ? (mains.find((topic) => topic.id === (parentId(active) ?? active.id)) ?? null)
    : null
  const activeSub = active && activeMain && active.id !== activeMain.id ? active : null
  const subs = activeMain ? childrenOf(activeMain.id) : []
  const scope = (topic: Topic) => [topic.id, ...childrenOf(topic.id).map((child) => child.id)]

  const [posts, counts] = await Promise.all([
    findPosts(locale, {
      topicIds: activeSub ? [activeSub.id] : activeMain ? scope(activeMain) : undefined,
      query,
      type,
      page,
    }),
    countPostsByTopic(locale, [
      ...mains.map((topic) => ({ id: topic.id, topicIds: scope(topic) })),
      ...subs.map((topic) => ({ id: topic.id, topicIds: [topic.id] })),
    ]),
  ])

  const basePath = active ? `/topics/${active.slug}` : '/topics'
  const keep = (path: string) => {
    const params = new URLSearchParams({
      ...(query ? { q: query } : {}),
      ...(type ? { type } : {}),
    })
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
  }
  // Same chip for topics and sub-topics; the active sub-topic is outlined, not filled,
  // so only one filled chip is on screen.
  const chip = (isActive: boolean, level: 'main' | 'sub' = 'main') =>
    `inline-flex items-center gap-2 border px-3.5 py-2 text-[0.8125rem] font-semibold transition-colors duration-200 ${
      isActive
        ? level === 'main'
          ? 'border-text bg-text text-bg'
          : 'border-text bg-band text-text'
        : 'border-line text-text hover:border-text'
    }`
  const filtered = Boolean(query || type || active)

  return (
    <>
      <PageTitle kicker={t('title')} title={active ? active.title : t('allTitle')} />
      <div className="container-page">
        <div className="border-t border-line pt-6">
          <form
            role="search"
            action={`/${locale}${basePath}`}
            className="flex flex-col gap-3 md:flex-row"
          >
            <label htmlFor="topics-q" className="sr-only">
              {t('searchLabel')}
            </label>
            <div className="relative md:flex-1">
              <MagnifyingGlass
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted"
              />
              <input
                id="topics-q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder={t('searchPlaceholder')}
                className="h-12 w-full border border-line bg-surface pl-11 pr-3.5 text-[0.9375rem] text-text transition-colors placeholder:text-muted hover:border-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <Listbox
              id="topics-type"
              name="type"
              ariaLabel={t('type')}
              defaultValue={type ?? ''}
              options={[
                { value: '', label: t('allTypes') },
                ...postTypes.map((value) => ({ value, label: tArticle(`types.${value}`) })),
              ]}
              className="md:w-52"
            />
            <button type="submit" className={buttonClass('primary', 'h-12 py-0 md:px-8')}>
              {t('submit')}
            </button>
          </form>

          <nav aria-label={t('title')} className="mt-5 flex flex-wrap gap-2">
            <Link
              href={keep('/topics')}
              aria-current={!active ? 'page' : undefined}
              className={chip(!active)}
            >
              {t('all')}
            </Link>
            {mains.map((topic) => (
              <Link
                key={topic.id}
                href={keep(`/topics/${topic.slug}`)}
                aria-current={activeMain?.id === topic.id ? 'page' : undefined}
                className={chip(activeMain?.id === topic.id)}
              >
                {topic.title}
                <span className="font-normal opacity-60">{counts.get(topic.id) ?? 0}</span>
              </Link>
            ))}
          </nav>
          {subs.length > 0 && (
            <div className="mt-6">
              <p id="topics-sub-label" className="kicker mb-3 text-muted!">
                {t('filter')}
              </p>
              <nav aria-labelledby="topics-sub-label" className="flex flex-wrap gap-2">
                {[activeMain!, ...subs].map((topic) => {
                  const isMain = topic.id === activeMain!.id
                  const isActive = topic.id === (activeSub ?? activeMain)?.id
                  return (
                    <Link
                      key={topic.id}
                      href={keep(`/topics/${topic.slug}`)}
                      aria-current={isActive ? 'page' : undefined}
                      className={chip(isActive, 'sub')}
                    >
                      {isMain ? t('all') : topic.title}
                      {!isMain && (
                        <span className="font-normal opacity-60">{counts.get(topic.id) ?? 0}</span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-b border-line pb-3">
          <p className="meta">{t('count', { count: posts.totalDocs })}</p>
          {filtered && (
            <Link
              href="/topics"
              className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-muted transition-colors hover:text-text"
            >
              <X aria-hidden className="size-3.5" />
              {t('reset')}
            </Link>
          )}
        </div>

        {posts.docs.length ? (
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.docs.map((post, index) => (
              <ArticleCard key={post.id} post={post} priority={index < 3} />
            ))}
          </div>
        ) : (
          <p className="lead mt-10">{t('empty')}</p>
        )}
      </div>
      <Pagination
        page={page}
        totalPages={posts.totalPages}
        basePath={basePath}
        query={{ q: query, type: type ?? '' }}
      />
    </>
  )
}
