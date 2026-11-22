import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PageTitle } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { searchSite } from '@/lib/data/search'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<{ q?: string }> }

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

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const query = ((await searchParams).q ?? '').trim().slice(0, 200)
  const t = await getTranslations('search')
  const results = query ? await searchSite(locale, query) : []
  return (
    <>
      <PageTitle title={t('title')} />
      <div className="container-reading">
        <form role="search" action="" className="flex gap-3">
          <label htmlFor="search-page-q" className="sr-only">
            {t('title')}
          </label>
          <input
            id="search-page-q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder={t('placeholder')}
            className="w-full rounded-full border border-line bg-surface px-5 py-3 text-text"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-6 text-sm font-semibold text-on-accent hover:bg-accent-hover"
          >
            {t('title')}
          </button>
        </form>
        {query ? (
          <>
            <p className="mt-6 text-sm text-muted">
              {t('results', { count: results.length, query })}
            </p>
            <ul className="mt-4 divide-y divide-line">
              {results.map((result) => (
                <li key={result.id} className="py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {t(`types.${result.collection}`)}
                  </p>
                  <Link
                    href={`${pathFor[result.collection]}/${result.slug}`}
                    className="font-serif text-2xl hover:text-accent"
                  >
                    {result.title}
                  </Link>
                  {result.excerpt && <p className="mt-1 text-sm text-muted">{result.excerpt}</p>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-6 text-muted">{t('empty')}</p>
        )}
      </div>
    </>
  )
}
