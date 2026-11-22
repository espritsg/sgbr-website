import path from 'path'
import type { Payload, Where } from 'payload'

import { decodeEntities } from './html'

const UPLOADS_MARKER = '/wp-content/uploads/'

/** "https://…/wp-content/uploads/2026/08/Rising-2024.pdf" → "2026/08/Rising-2024.pdf" */
export function legacyPathFromUrl(url: string): string | null {
  const index = url.indexOf(UPLOADS_MARKER)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + UPLOADS_MARKER.length).split('?')[0])
}

/** WordPress resizes images to name-300x200.jpg; this returns the original name. */
export function originalImageUrl(url: string): string {
  return url.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1').replace(/-scaled(\.[a-z]+)$/i, '$1')
}

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
}

export type MediaSource = {
  /** Where to download from. */
  url: string
  /** Optional local file instead of downloading (final migration with uploads folder). */
  readLocal?: (legacyPath: string) => Promise<Buffer | null>
  alt?: string
  caption?: string
  wpId?: number
}

export type MediaImporter = {
  /** Returns the media ID, importing the file once. Null if the file is unavailable. */
  get(source: MediaSource): Promise<number | null>
  missing: string[]
}

/**
 * Downloads files once per run and reuses existing media by legacyPath or wpId,
 * so repeated imports do not duplicate files.
 */
export function createMediaImporter(payload: Payload, userAgent: string): MediaImporter {
  const byKey = new Map<string, number>()
  const missing: string[] = []

  async function get(source: MediaSource): Promise<number | null> {
    if (!source.url) return null
    const legacyPath = legacyPathFromUrl(source.url)
    const key = legacyPath ?? source.url
    const cached = byKey.get(key)
    if (cached) return cached

    const or: Where[] = [
      ...(legacyPath ? [{ legacyPath: { equals: legacyPath } }] : []),
      ...(source.wpId ? [{ wpId: { equals: source.wpId } }] : []),
    ]
    if (or.length) {
      const existing = await payload.find({
        collection: 'media',
        where: { or },
        limit: 1,
        depth: 0,
      })
      if (existing.docs[0]) {
        byKey.set(key, existing.docs[0].id)
        return existing.docs[0].id
      }
    }

    let data: Buffer | null = null
    if (legacyPath && source.readLocal) data = await source.readLocal(legacyPath)
    if (!data) {
      try {
        const response = await fetch(source.url, { headers: { 'User-Agent': userAgent } })
        if (response.ok) data = Buffer.from(await response.arrayBuffer())
      } catch {
        data = null
      }
    }
    if (!data) {
      missing.push(source.url)
      return null
    }

    const name = decodeURIComponent(path.basename(new URL(source.url).pathname))
    const mimetype = MIME[path.extname(name).toLowerCase()] ?? 'application/octet-stream'
    try {
      const doc = await payload.create({
        collection: 'media',
        data: {
          alt: source.alt ? decodeEntities(source.alt) : undefined,
          caption: source.caption,
          legacyPath: legacyPath ?? undefined,
          wpId: source.wpId,
        },
        file: { data, mimetype, name, size: data.length },
        depth: 0,
      })
      byKey.set(key, doc.id)
      return doc.id
    } catch (error) {
      missing.push(`${source.url} (${(error as Error).message})`)
      return null
    }
  }

  return { get, missing }
}
