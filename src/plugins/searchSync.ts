import type { BeforeSync } from '@payloadcms/plugin-search/types'

type SyncedDoc = {
  slug?: string
  title?: string
  name?: string
  summary?: string
  tagline?: string
  organization?: string
  role?: string
  speaker?: { name?: string } | number | string
}

/** Adds slug and a short excerpt to each search entry (docs/architektur.md). */
export const searchBeforeSync: BeforeSync = ({ originalDoc, searchDoc }) => {
  const doc = originalDoc as SyncedDoc
  const collection = searchDoc.doc.relationTo
  let title = searchDoc.title
  let excerpt = ''

  if (collection === 'posts') excerpt = doc.summary ?? ''
  if (collection === 'issues') excerpt = doc.tagline ?? ''
  if (collection === 'people') {
    title = doc.name ?? title
    excerpt = [doc.role, doc.organization].filter(Boolean).join(', ')
  }
  if (collection === 'events') {
    const speakerName = typeof doc.speaker === 'object' ? doc.speaker?.name : undefined
    title = doc.title || speakerName || doc.slug || title
  }

  return { ...searchDoc, title, slug: doc.slug ?? '', excerpt }
}
