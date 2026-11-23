import type { Post } from '@/payload-types'

import { ArticleCard } from './ArticleCard'

/** List of articles: first one large, then a grid with column rules, then horizontal rows. */
export async function PostGrid({ posts }: { posts: Post[] }) {
  const [first, ...rest] = posts
  if (!first) return null
  const grid = rest.slice(0, 3)
  const rows = rest.slice(3)
  return (
    <div className="container-page mt-8">
      <div className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-0 lg:divide-x lg:divide-line">
        <div className="lg:pr-8">
          <ArticleCard post={first} variant="lead" priority />
        </div>
        <div className="divide-y divide-line lg:pl-8">
          {grid.map((post) => (
            <ArticleCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-line">
        {rows.map((post) => (
          <ArticleCard key={post.id} post={post} variant="horizontal" />
        ))}
      </div>
    </div>
  )
}
