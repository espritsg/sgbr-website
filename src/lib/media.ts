import type { Media } from '@/payload-types'

type SizeName = 'thumbnail' | 'card' | 'hero' | 'og'
type MediaLike = Media | number | null | undefined

export function isMedia(value: unknown): value is Media {
  return typeof value === 'object' && value !== null && 'filename' in value
}

/** Public base URL without trailing slash. */
export function serverUrl(): string {
  return (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
}

/** Stable public download URL, independent of the storage (docs/urls-und-weiterleitungen.md). */
export function fileUrl(media: MediaLike, absolute = false): string | null {
  if (!isMedia(media) || !media.filename) return null
  const path = `/files/${encodeURIComponent(media.filename)}`
  return absolute ? `${serverUrl()}${path}` : path
}

/**
 * URL for <Image>: the storage URL of the best fitting size. Locally that is
 * /api/media/file/…, with Vercel Blob the blob URL.
 */
export function imageSrc(media: MediaLike, size?: SizeName): string | null {
  if (!isMedia(media)) return null
  const sized = size ? media.sizes?.[size] : undefined
  const url = sized?.url || media.url || null
  // Payload prefixes local files with the server URL; <Image> needs them relative.
  if (url?.startsWith(serverUrl())) return url.slice(serverUrl().length) || null
  return url
}

export function imageDimensions(
  media: MediaLike,
  size?: SizeName,
): { width: number; height: number } {
  if (!isMedia(media)) return { width: 1200, height: 800 }
  const sized = size ? media.sizes?.[size] : undefined
  return {
    width: sized?.width || media.width || 1200,
    height: sized?.height || media.height || 800,
  }
}
