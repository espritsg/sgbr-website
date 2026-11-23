import type { ReactNode } from 'react'

import { AppLink } from './AppLink'
import { ArrowLeft, ArrowRight } from './icons'

/** Small kicker link back to the overview ("← Issues"). */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <AppLink
      href={href}
      className="kicker group inline-flex items-center gap-1.5 text-muted! transition-colors hover:text-text!"
    >
      <ArrowLeft
        aria-hidden
        className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
      />
      {children}
    </AppLink>
  )
}

/** Text link with an arrow that moves on hover ("All issues", "Read the issue"). */
export function ArrowLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <AppLink
      href={href}
      className={`group/arrow inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-text transition-colors hover:text-accent ${className}`}
    >
      {children}
      <ArrowRight
        aria-hidden
        className="size-3.5 transition-transform duration-200 group-hover/arrow:translate-x-0.5"
      />
    </AppLink>
  )
}

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
        <ArrowLink href={link.href} className="shrink-0">
          {link.label}
        </ArrowLink>
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

/**
 * Page head: optional kicker and the title. No rule of its own: the first section
 * below brings it, so there is never a double line (docs/design-system.md).
 */
export function PageTitle({
  kicker,
  title,
  intro,
  narrow = false,
  children,
}: {
  kicker?: string
  title: string
  intro?: string | null
  narrow?: boolean
  children?: ReactNode
}) {
  return (
    <header className={`${narrow ? 'container-reading' : 'container-page'} pb-8 pt-10 md:pt-14`}>
      {kicker && <p className="kicker mb-3">{kicker}</p>}
      <h1 className="display max-w-4xl">{title}</h1>
      {intro && <p className="lead mt-4 max-w-2xl">{intro}</p>}
      {children}
    </header>
  )
}
