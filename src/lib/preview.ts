/** Paths of documents on the website, used by Live Preview and the preview button. */
export function documentPath(
  collection: string,
  slug: string | null | undefined,
  locale: string,
): string | null {
  if (!slug) return null
  switch (collection) {
    case 'posts':
      return `/${locale}/article/${slug}`
    case 'issues':
      return `/${locale}/issues/${slug}`
    case 'events':
      return `/${locale}/events/${slug}`
    case 'people':
      return `/${locale}/people/${slug}`
    case 'pages':
      return `/${locale}/${slug}`
    case 'newsletters':
      return `/${locale}/newsletter/${slug}`
    default:
      return null
  }
}

export function previewUrl(
  collection: string,
  slug: string | null | undefined,
  locale: string,
): string | null {
  const path = documentPath(collection, slug, locale)
  if (!path) return null
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
  return `${base}/next/preview?path=${encodeURIComponent(path)}`
}
