import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getTopics } from '@/lib/data/queries'
import { searchSite } from '@/lib/data/search'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: AppLocale }>
  searchParams: Promise<{ q?: string; type?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'search' })
  return { title: t('title'), robots: { index: false } }
}

const pathFor: Record<string, string> = {
  posts: '/article',
  issues: '/issues',
  events: '/events',
  people: '/people',
}
const types = ['posts', 'people', 'issues', 'events'] as const

/** Highlights the search term in a text. */
function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.split(new RegExp(`(${escaped})`, 'gi')).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-accent/15 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { q, type } = await searchParams
  const query = (q ?? '').trim().slice(0, 200)
  const filter = types.includes(type as never) ? type : undefined
  const t = await getTranslations('search')
  const all = query ? await searchSite(locale, query, 60) : []
  const results = filter ? all.filter((result) => result.collection === filter) : all
  const counts = Object.fromEntries(
    types.map((name) => [name, all.filter((result) => result.collection === name).length]),
  )
  const topics = query ? [] : (await getTopics(locale)).filter((topic) => !topic.parent)
  const filterHref = (name?: string) =>
    `/search?${new URLSearchParams({ q: query, ...(name ? { type: name } : {}) })}`

  return (
    <div className="container-page pt-10 md:pt-14">
      <form role="search" action="" className="flex items-end gap-4 border-b-2 border-rule pb-3">
        <label htmlFor="search-page-q" className="sr-only">
          {t('title')}
        </label>
        <input
          id="search-page-q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={t('placeholder')}
          autoFocus={!query}
          className="w-full bg-transparent font-serif text-3xl outline-none placeholder:text-muted md:text-5xl"
        />
        <Button type="submit">{t('title')}</Button>
      </form>

      {query ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line pb-3 text-sm">
            <p className="meta mr-auto">{t('results', { count: all.length, query })}</p>
            <Link
              href={filterHref()}
              className={
                !filter
                  ? 'font-semibold underline underline-offset-4'
                  : 'text-muted hover:text-text'
              }
            >
              {t('filterAll')} ({all.length})
            </Link>
            {types.map((name) =>
              counts[name] ? (
                <Link
                  key={name}
                  href={filterHref(name)}
                  className={
                    filter === name
                      ? 'font-semibold underline underline-offset-4'
                      : 'text-muted hover:text-text'
                  }
                >
                  {t(`types.${name}`)} ({counts[name]})
                </Link>
              ) : null,
            )}
          </div>
          {results.length ? (
            <ul className="divide-y divide-line">
              {results.map((result) => (
                <li key={result.id} className="grid gap-1 py-5 sm:grid-cols-[8rem_1fr]">
                  <p className="kicker pt-1.5">{t(`types.${result.collection}`)}</p>
                  <div>
                    <Link
                      href={`${pathFor[result.collection]}/${result.slug}`}
                      className="headline-md link-headline"
                    >
                      {highlight(result.title, query)}
                    </Link>
                    {result.excerpt && (
                      <p className="mt-1 line-clamp-2 text-[0.9375rem] text-muted">
                        {highlight(result.excerpt, query)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lead mt-8">{t('noResults')}</p>
          )}
        </>
      ) : (
        <div className="mt-10">
          <p className="kicker text-muted!">{t('suggestions')}</p>
          <ul className="mt-3 flex flex-wrap gap-3">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="inline-block border border-line px-4 py-2 text-sm font-semibold transition-colors hover:border-text"
                >
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
