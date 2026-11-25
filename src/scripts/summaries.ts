/**
 * Short summaries written outside the migration (e.g. by Claude Code in a session,
 * without ANTHROPIC_API_KEY; docs/migration.md).
 *
 *   npm run summaries -- export /path/articles.json   # texts of all articles
 *   npm run summaries -- apply  /path/summaries.json
 *     [{ "wpId": 123, "summary": "…", "type"?: "interview", "topic"?: "politics" }]
 *
 * `apply` writes the summary in the original language of each article and only
 * touches articles still marked "Summary needs review" (never edited ones).
 * The mark stays on, so the editors still check them. Optional: `type` corrects
 * interview/guest article, `topic` adds a main topic to articles that have none.
 */
import fs from 'fs/promises'

import config from '@payload-config'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { getPayload } from 'payload'

import type { Person, Post } from '@/payload-types'

const [mode, file] = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
if (!['export', 'apply'].includes(mode ?? '') || !file) {
  console.error('Aufruf: npm run summaries -- export|apply <datei.json>')
  process.exit(1)
}

const payload = await getPayload({ config })
const MAX_TEXT = 8000

async function allPosts(): Promise<Post[]> {
  const docs: Post[] = []
  for (let page = 1; ; page++) {
    const result = await payload.find({
      collection: 'posts',
      draft: true,
      depth: 1,
      limit: 100,
      page,
      locale: 'all' as never,
    })
    docs.push(...(result.docs as Post[]))
    if (!result.hasNextPage) break
  }
  return docs
}

/** Localized fields come as { en, de } with locale "all". */
const inLocale = <T>(value: unknown, locale: string): T | undefined =>
  value && typeof value === 'object' && locale in (value as Record<string, unknown>)
    ? ((value as Record<string, T>)[locale] ?? undefined)
    : (value as T | undefined)

if (mode === 'export') {
  const posts = await allPosts()
  const out = posts.map((post) => {
    const locale = post.originalLanguage
    const content = inLocale<SerializedEditorState>(post.content, locale)
    const text = content ? convertLexicalToPlaintext({ data: content }) : ''
    return {
      wpId: post.wpId,
      slug: post.slug,
      language: locale,
      type: post.type,
      status: post._status,
      title: inLocale<string>(post.title, locale),
      people: (post.interviewees ?? [])
        .filter((person): person is Person => typeof person === 'object' && person !== null)
        .map((person) => person.name),
      currentSummary: inLocale<string>(post.summary, locale) ?? '',
      needsReview: Boolean(post.summaryNeedsReview),
      text: text.replace(/\n{3,}/g, '\n\n').slice(0, MAX_TEXT),
    }
  })
  await fs.writeFile(file, JSON.stringify(out, null, 2))
  console.log(`${out.length} Artikel nach ${file} geschrieben.`)
} else {
  const entries = JSON.parse(await fs.readFile(file, 'utf8')) as Array<{
    wpId: number
    summary: string
    type?: Post['type']
    topic?: string | null
  }>
  const mainTopics = await payload.find({
    collection: 'topics',
    where: { parent: { exists: false } },
    depth: 0,
    limit: 50,
  })
  const mainTopicId = new Map(mainTopics.docs.map((topic) => [topic.slug, topic.id]))
  const mainIds = new Set(mainTopics.docs.map((topic) => topic.id))
  let written = 0
  let skipped = 0
  for (const entry of entries) {
    const summary = entry.summary?.trim()
    const found = await payload.find({
      collection: 'posts',
      where: { wpId: { equals: entry.wpId } },
      draft: true,
      depth: 0,
      limit: 1,
    })
    const post = found.docs[0]
    if (!post || !summary || !post.summaryNeedsReview) {
      skipped++
      continue
    }
    const data: Partial<Post> = { summary, summaryNeedsReview: true }
    if (entry.type === 'interview' || entry.type === 'guest-article') data.type = entry.type
    const topicIds = (post.topics ?? []).map((topic) =>
      typeof topic === 'object' ? topic.id : topic,
    )
    const newTopic = entry.topic ? mainTopicId.get(entry.topic) : undefined
    if (newTopic && !topicIds.some((id) => mainIds.has(id))) data.topics = [newTopic, ...topicIds]
    await payload.update({
      collection: 'posts',
      id: post.id,
      locale: post.originalLanguage,
      draft: post._status !== 'published',
      data,
      depth: 0,
      // Like the migration: articles still without a main topic stay saveable.
      context: { import: true },
    })
    written++
  }
  console.log(`${written} Zusammenfassungen geschrieben, ${skipped} übersprungen.`)
}
process.exit(0)
