'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import type { Media } from '@/payload-types'

import { CaretLeft, CaretRight } from '../ui/icons'
import { MediaImage } from '../ui/MediaImage'

export type RecapChapter = {
  id: string
  image: Media
  heading?: string | null
  text?: string | null
}

type Props = {
  title?: string | null
  eyebrow: string
  intro?: ReactNode
  chapters: RecapChapter[]
  labels: { previous: string; next: string; chapter: string }
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Recap of a past event as a slideshow: one photo with heading and text per chapter. */
export function EventRecap({ title, eyebrow, intro, chapters, labels }: Props) {
  const [index, setIndex] = useState(0)
  const touchStart = useRef<number | null>(null)
  const count = chapters.length
  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])
  const regionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const region = regionRef.current
    if (!region) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(index + 1)
      if (event.key === 'ArrowLeft') go(index - 1)
    }
    region.addEventListener('keydown', onKey)
    return () => region.removeEventListener('keydown', onKey)
  }, [go, index])

  const chapter = chapters[index]
  const arrow =
    'inline-flex size-11 items-center justify-center border border-line bg-bg text-text transition-colors hover:border-text disabled:opacity-40'

  return (
    <section
      ref={regionRef}
      aria-roledescription="carousel"
      aria-label={title ?? eyebrow}
      className="container-page mt-12"
    >
      <p className="kicker mb-3">{eyebrow}</p>
      {title && <h2 className="headline-lg max-w-3xl">{title}</h2>}
      {intro && <div className="mt-4 max-w-3xl">{intro}</div>}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
        <div
          className="relative aspect-[3/2] overflow-hidden bg-band"
          onTouchStart={(event) => (touchStart.current = event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            const start = touchStart.current
            const end = event.changedTouches[0]?.clientX
            if (start == null || end == null || Math.abs(end - start) < 40) return
            go(end < start ? index + 1 : index - 1)
          }}
        >
          {chapters.map((item, itemIndex) => (
            <div
              key={item.id}
              aria-hidden={itemIndex !== index}
              className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${itemIndex === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            >
              <MediaImage
                media={item.image}
                size="hero"
                fill
                priority={itemIndex === 0}
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div aria-live="polite" className="min-w-0">
          <p className="meta tabular-nums">
            {labels.chapter} {pad(index + 1)} / {pad(count)}
          </p>
          {chapter.heading && <h3 className="headline-md mt-2">{chapter.heading}</h3>}
          {chapter.text && (
            <div className="prose mt-4 max-w-none text-text dark:prose-invert prose-p:leading-[1.7]">
              {chapter.text
                .split(/\n\s*\n/)
                .filter((paragraph) => paragraph.trim())
                .map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph.trim()}</p>
                ))}
            </div>
          )}
          {count > 1 && (
            <div className="mt-6 flex items-center gap-3">
              <button type="button" className={arrow} onClick={() => go(index - 1)}>
                <CaretLeft aria-hidden className="size-5" />
                <span className="sr-only">{labels.previous}</span>
              </button>
              <button type="button" className={arrow} onClick={() => go(index + 1)}>
                <CaretRight aria-hidden className="size-5" />
                <span className="sr-only">{labels.next}</span>
              </button>
              <div className="ml-2 flex flex-wrap gap-1.5">
                {chapters.map((item, itemIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(itemIndex)}
                    aria-current={itemIndex === index}
                    className={`h-1 w-6 transition-colors ${itemIndex === index ? 'bg-text' : 'bg-line hover:bg-muted'}`}
                  >
                    <span className="sr-only">
                      {labels.chapter} {itemIndex + 1}
                      {item.heading ? `: ${item.heading}` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
