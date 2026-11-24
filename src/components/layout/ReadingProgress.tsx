'use client'

import { useEffect, useRef } from 'react'

/**
 * Reading progress for articles: a thin accent line on the lower edge of the sticky
 * header (h-14, StickyHeader.tsx), visible together with it. 0 % when the text starts
 * at the top of the screen, 100 % when its end reaches the bottom. Updates write to the
 * style directly, so scrolling causes no React renders.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = target.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      const progress = distance > 0 ? -rect.top / distance : rect.top < 0 ? 1 : 0
      if (bar.current) {
        bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    // Same rule as the sticky header: visible once the masthead has left the screen.
    const masthead = document.getElementById('masthead')
    const observer =
      masthead && 'IntersectionObserver' in window
        ? new IntersectionObserver(([entry]) => {
            wrap.current?.classList.toggle('opacity-0', entry.isIntersecting)
          })
        : null
    if (masthead) observer?.observe(masthead)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer?.disconnect()
    }
  }, [targetId])

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-14 z-50 h-[3px] opacity-0 transition-opacity duration-300"
    >
      {/* transform, not Tailwind's scale-x-*: that sets the separate `scale` property. */}
      <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
