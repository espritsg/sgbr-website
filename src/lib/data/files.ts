import { originalImageUrl } from '@/scripts/lib/media'
import { getPayloadClient } from '@/lib/payload'
import type { Media } from '@/payload-types'

type SizeKey = keyof NonNullable<Media['sizes']>
const SIZES: SizeKey[] = ['thumbnail', 'card', 'hero', 'og']

/** Finds a media file by its filename (original or one of the generated sizes). */
export async function findMediaFile(
  filename: string,
): Promise<{ media: Media; url: string } | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'media',
    where: {
      or: [
        { filename: { equals: filename } },
        ...SIZES.map((size) => ({ [`sizes.${size}.filename`]: { equals: filename } })),
      ],
    },
    limit: 1,
    depth: 0,
  })
  const media = result.docs[0]
  if (!media) return null
  const size = SIZES.find((key) => media.sizes?.[key]?.filename === filename)
  const url = (size ? media.sizes?.[size]?.url : media.url) ?? null
  return url ? { media, url } : null
}

/**
 * Finds the media file for an old WordPress upload path. WordPress also served
 * resized copies (name-300x200.jpg); those lead to the original.
 */
export async function findMediaByLegacyPath(legacyPath: string): Promise<Media | null> {
  const payload = await getPayloadClient()
  const candidates = [...new Set([legacyPath, originalImageUrl(legacyPath)])]
  const result = await payload.find({
    collection: 'media',
    where: { legacyPath: { in: candidates } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
}
