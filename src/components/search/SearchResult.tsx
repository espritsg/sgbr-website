import type { ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import { ArrowRight, BookOpen, CalendarBlank, Newspaper, User } from '../ui/icons'

export const searchPathFor: Record<string, string> = {
  posts: '/article',
  issues: '/issues',
  events: '/events',
  people: '/people',
}

const typeIcon = {
  posts: Newspaper,
  issues: BookOpen,
  events: CalendarBlank,
  people: User,
} as const

/** Highlights the search term in a text. */
export function highlight(text: string, query: string): ReactNode {
  const term = query.trim()
  if (!term) return text
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.split(new RegExp(`(${escaped})`, 'gi')).map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className="bg-accent/15 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

/**
 * One search hit, the same in the search panel and on /search: type icon, type,
 * title, excerpt. `active` marks the keyboard selection in the panel.
 */
export function SearchResult({
  collection,
  slug,
  title,
  excerpt,
  typeLabel,
  query = '',
  active = false,
  onNavigate,
  size = 'md',
}: {
  collection: string
  slug: string
  title: string
  excerpt?: string
  typeLabel: string
  query?: string
  active?: boolean
  onNavigate?: () => void
  size?: 'sm' | 'md'
}) {
  const Icon = typeIcon[collection as keyof typeof typeIcon] ?? Newspaper
  return (
    <Link
      href={`${searchPathFor[collection]}/${slug}`}
      onClick={onNavigate}
      className={`group flex items-start gap-4 p-3 transition-colors duration-200 ${active ? 'bg-band' : 'hover:bg-band'} ${size === 'md' ? 'sm:p-4' : ''}`}
    >
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center border border-line bg-bg text-accent transition-colors group-hover:border-accent ${size === 'md' ? 'size-11' : 'size-9'}`}
      >
        <Icon className={size === 'md' ? 'size-5' : 'size-[18px]'} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="kicker block text-muted!">{typeLabel}</span>
        <span className={`mt-1 block ${size === 'md' ? 'headline-sm sm:text-xl' : 'headline-sm'}`}>
          {highlight(title, query)}
        </span>
        {excerpt && (
          <span
            className={`meta mt-1 ${size === 'md' ? 'line-clamp-2 text-[0.9375rem]' : 'line-clamp-1'}`}
          >
            {highlight(excerpt, query)}
          </span>
        )}
      </span>
      <ArrowRight
        aria-hidden
        className={`mt-6 size-4 shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent ${active ? 'text-accent' : ''}`}
      />
    </Link>
  )
}
