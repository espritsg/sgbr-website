import type { CollectionBeforeChangeHook } from 'payload'

/** Sets publishedAt the first time an article is published, if the editor left it empty. */
export const setPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data?._status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}
