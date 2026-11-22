import type { ReactNode } from 'react'

import { AppLink } from './AppLink'

/** Section with a newspaper-style rule and heading. */
export function Section({
  title,
  link,
  children,
  className = '',
  band = false,
}: {
  title: string
  link?: { href: string; label: string }
  children: ReactNode
  className?: string
  band?: boolean
}) {
  return (
    <section className={`${band ? 'bg-band py-14' : 'py-12'} ${className}`}>
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4 border-t-2 border-text pt-3">
          <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
          {link && (
            <AppLink
              href={link.href}
              className="shrink-0 text-sm font-semibold text-accent hover:underline"
            >
              {link.label} →
            </AppLink>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}

export function PageTitle({
  kicker,
  title,
  intro,
}: {
  kicker?: string
  title: string
  intro?: string | null
}) {
  return (
    <div className="container-page pb-6 pt-12">
      {kicker && (
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{kicker}</p>
      )}
      <h1 className="mt-2 font-serif text-5xl leading-tight md:text-6xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
    </div>
  )
}
