'use client'

import { useEffect, useState, type ReactNode } from 'react'

/** Compact header that slides in once the masthead has scrolled out of view (NYT pattern). */
export function StickyHeader({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const masthead = document.getElementById('masthead')
    if (!masthead || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting))
    observer.observe(masthead)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-bg/95 backdrop-blur transition-transform duration-300 [transition-timing-function:var(--ease-out-soft)] ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {children}
    </div>
  )
}
