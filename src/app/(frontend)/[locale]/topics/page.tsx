import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ArticleCard } from '@/components/cards/ArticleCard'
import { PageTitle } from '@/components/ui/Section'
import { Pagination } from '@/components/ui/Pagination'
import { TopicTabs } from '@/components/ui/TopicTabs'
import type { AppLocale } from '@/i18n/routing'
import { getPostsByTopic, getTopics } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'topics' })
  return buildMetadata({ locale, path: '/topics', title: t('title') })
}

export default async function TopicsPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const t = await getTranslations('topics')
  const topics = await getTopics(locale)
  const posts = await getPostsByTopic(
    locale,
    topics.map((topic) => topic.id),
    page,
  )
  return (
    <>
      <PageTitle title={t('title')} />
      <TopicTabs topics={topics} />
      <div className="container-page mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.docs.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
      <Pagination page={page} totalPages={posts.totalPages} basePath="/topics" />
    </>
  )
}
