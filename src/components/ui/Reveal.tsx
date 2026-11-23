'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Fades its content in when it scrolls into view. Respects prefers-reduced-motion (CSS). */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'section'
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      element.dataset.reveal = 'visible'
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.dataset.reveal = 'visible'
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <Tag ref={ref} data-reveal="hidden" className={className}>
      {children}
    </Tag>
  )
}
