import { permanentRedirect, redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { documentPath } from '@/lib/preview'
import type { Redirect } from '@/payload-types'

/** "/a/b/" and "/a/b" are the same old URL. */
export function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed || trimmed === '/') return '/'
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`
}

export function redirectTarget(entry: Redirect, locale: string): string | null {
  if (entry.to?.type === 'custom') return entry.to.url || null
  const reference = entry.to?.reference
  if (!reference || typeof reference.value !== 'object' || !reference.value) return null
  const slug = (reference.value as { slug?: string }).slug
  return documentPath(reference.relationTo, slug, locale)
}

/**
 * Redirects the editors maintain in the admin (plugin redirects). Checked only for
 * paths the site does not know, so normal pages need no extra query.
 */
export async function redirectFromCms(paths: string[], locale: string): Promise<void> {
  const candidates = [...new Set(paths.map(normalizePath))]
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'redirects',
    where: {
      or: candidates.flatMap((path) => [
        { from: { equals: path } },
        { from: { equals: `${path}/` } },
      ]),
    },
    limit: 1,
    depth: 1,
  })
  const entry = result.docs[0]
  if (!entry) return
  const target = redirectTarget(entry, locale)
  if (!target) return
  if (entry.type === '302' || entry.type === '307') redirect(target)
  permanentRedirect(target)
}
