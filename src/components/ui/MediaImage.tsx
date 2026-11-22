import Image from 'next/image'

import { imageDimensions, imageSrc, isMedia } from '@/lib/media'
import type { Media } from '@/payload-types'

type Props = {
  media: Media | number | null | undefined
  size?: 'thumbnail' | 'card' | 'hero' | 'og'
  className?: string
  sizes?: string
  priority?: boolean
  fill?: boolean
  alt?: string
}

/** Image from the media collection. Renders nothing if the image is missing. */
export function MediaImage({ media, size, className, sizes, priority, fill, alt }: Props) {
  const src = imageSrc(media, size)
  if (!src || !isMedia(media)) return null
  const { width, height } = imageDimensions(media, size)
  const description = alt ?? media.alt ?? ''
  const focal =
    media.focalX != null && media.focalY != null ? `${media.focalX}% ${media.focalY}%` : undefined
  if (fill) {
    return (
      <Image
        src={src}
        alt={description}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        className={className}
        style={focal ? { objectPosition: focal } : undefined}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={description}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={focal ? { objectPosition: focal } : undefined}
    />
  )
}
