import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Topic } from '@/payload-types'

/** Main topics as tabs, sub-topics of the active main topic as filters (docs/design-system.md). */
export async function TopicTabs({
  topics,
  activeMain,
  activeSub,
}: {
  topics: Topic[]
  activeMain?: Topic | null
  activeSub?: Topic | null
}) {
  const t = await getTranslations('topics')
  const mains = topics.filter((topic) => !topic.parent)
  const subs = activeMain
    ? topics.filter(
        (topic) =>
          (typeof topic.parent === 'object' ? topic.parent?.id : topic.parent) === activeMain.id,
      )
    : []
  return (
    <div className="container-page">
      <nav
        aria-label={t('title')}
        className="flex gap-6 overflow-x-auto border-b border-line text-sm font-semibold uppercase tracking-wider"
      >
        <Link
          href="/topics"
          aria-current={!activeMain ? 'page' : undefined}
          className={`shrink-0 border-b-2 py-3 ${!activeMain ? 'border-accent text-accent' : 'border-transparent hover:text-accent'}`}
        >
          {t('all')}
        </Link>
        {mains.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            aria-current={activeMain?.id === topic.id ? 'page' : undefined}
            className={`shrink-0 border-b-2 py-3 ${activeMain?.id === topic.id ? 'border-accent text-accent' : 'border-transparent hover:text-accent'}`}
          >
            {topic.title}
          </Link>
        ))}
      </nav>
      {subs.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label={t('filter')}>
          <span className="mr-2 text-xs text-muted">{t('filter')}:</span>
          <Link
            href={`/topics/${activeMain!.slug}`}
            className={`rounded-full border px-3 py-1 text-xs ${!activeSub ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-accent'}`}
          >
            {t('all')}
          </Link>
          {subs.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className={`rounded-full border px-3 py-1 text-xs ${activeSub?.id === topic.id ? 'border-accent bg-accent text-on-accent' : 'border-line hover:border-accent'}`}
            >
              {topic.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
