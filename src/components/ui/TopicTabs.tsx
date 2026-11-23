import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Topic } from '@/payload-types'

const parentId = (topic: Topic) =>
  typeof topic.parent === 'object' ? topic.parent?.id : topic.parent

/** Main topics as a text tab bar, sub-topics as text links (docs/design-system.md). */
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
  const subs = activeMain ? topics.filter((topic) => parentId(topic) === activeMain.id) : []
  const tab = (active: boolean) =>
    `shrink-0 border-b-2 pb-3 pt-1 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] transition-colors ${active ? 'border-accent text-text' : 'border-transparent text-muted hover:text-text'}`
  return (
    <div className="container-page">
      <nav
        aria-label={t('title')}
        className="-mb-px flex gap-8 overflow-x-auto border-b border-line"
      >
        <Link
          href="/topics"
          aria-current={!activeMain ? 'page' : undefined}
          className={tab(!activeMain)}
        >
          {t('all')}
        </Link>
        {mains.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.slug}`}
            aria-current={activeMain?.id === topic.id ? 'page' : undefined}
            className={tab(activeMain?.id === topic.id)}
          >
            {topic.title}
          </Link>
        ))}
      </nav>
      {subs.length > 0 && (
        <div
          className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-line py-4 text-sm"
          aria-label={t('filter')}
        >
          <span className="kicker text-muted!">{t('filter')}</span>
          <Link
            href={`/topics/${activeMain!.slug}`}
            className={
              !activeSub
                ? 'font-semibold text-text underline underline-offset-4'
                : 'text-muted hover:text-text'
            }
          >
            {t('all')}
          </Link>
          {subs.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.slug}`}
              className={
                activeSub?.id === topic.id
                  ? 'font-semibold text-text underline underline-offset-4'
                  : 'text-muted hover:text-text'
              }
            >
              {topic.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
