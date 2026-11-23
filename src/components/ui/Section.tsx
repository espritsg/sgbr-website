import type { ReactNode } from 'react'

import { AppLink } from './AppLink'

/** Section heading with the 2px newspaper rule; optional "all …" link on the right. */
export function SectionHeader({
  title,
  link,
  as: Tag = 'h2',
}: {
  title: string
  link?: { href: string; label: string }
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="rule-top mb-6 flex items-baseline justify-between gap-4 pt-3">
      <Tag className="headline-md">{title}</Tag>
      {link && (
        <AppLink
          href={link.href}
          className="meta shrink-0 font-semibold text-text! underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {link.label} →
        </AppLink>
      )}
    </div>
  )
}

/** Vertical rhythm for page sections: one size everywhere. */
export function Section({
  title,
  link,
  children,
  className = '',
  band = false,
}: {
  title?: string
  link?: { href: string; label: string }
  children: ReactNode
  className?: string
  band?: boolean
}) {
  return (
    <section className={`${band ? 'bg-band py-14' : 'py-12'} ${className}`}>
      <div className="container-page">
        {title && <SectionHeader title={title} link={link} />}
        {children}
      </div>
    </section>
  )
}

/** Page head: kicker, title, intro. Same spacing on every page. */
export function PageTitle({
  kicker,
  title,
  intro,
  narrow = false,
}: {
  kicker?: string
  title: string
  intro?: string | null
  narrow?: boolean
}) {
  return (
    <header className={`${narrow ? 'container-reading' : 'container-page'} pb-8 pt-10 md:pt-14`}>
      <div className="border-b border-rule pb-8">
        {kicker && <p className="kicker mb-3">{kicker}</p>}
        <h1 className="display max-w-4xl">{title}</h1>
        {intro && <p className="lead mt-4 max-w-2xl">{intro}</p>}
      </div>
    </header>
  )
}
