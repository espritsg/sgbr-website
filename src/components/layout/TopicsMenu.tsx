'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import { ArrowRight, CaretDown } from '../ui/icons'

export type TopicGroup = {
  id: number
  title: string
  slug: string
  children: Array<{ id: number; title: string; slug: string }>
}

type Props = {
  groups: TopicGroup[]
  /** The nav link itself ("Topics"), rendered by the header. */
  children: ReactNode
  /** compact: the sticky bar (smaller caret, no tab stop while hidden). */
  compact?: boolean
}

/**
 * Nav item with a full-width panel: one column per main topic, its sub-topics below.
 * Opens on hover (mouse) or with the caret button (touch, keyboard); Esc and a
 * click outside close it. The panel is positioned against the nearest positioned
 * ancestor, which is the masthead nav or the fixed sticky bar.
 */
export function TopicsMenu({ groups, children, compact = false }: Props) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const root = useRef<HTMLLIElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      root.current?.querySelector<HTMLButtonElement>('button[aria-controls]')?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  if (!groups.length) return <li>{children}</li>

  const onPointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const onPointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  return (
    <li
      ref={root}
      className="flex items-center gap-1"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      {children}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('topicsMenu')}
        tabIndex={compact ? -1 : undefined}
        onClick={() => setOpen((value) => !value)}
        className="-mr-1 inline-flex size-6 items-center justify-center text-muted transition-colors hover:text-text"
      >
        <CaretDown
          aria-hidden
          className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={panelId}
        hidden={!open}
        // Any link click navigates away, so the panel closes with it.
        onClick={(event) => (event.target as HTMLElement).closest('a') && setOpen(false)}
        className="absolute inset-x-0 top-full z-50 border-y border-line bg-bg text-left normal-case tracking-normal shadow-[0_12px_32px_rgb(0_0_0/0.08)] [animation:sgbr-fade-in_160ms_var(--ease-out-soft)]"
      >
        <div className="container-page grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.id}>
              <Link
                href={`/topics/${group.slug}`}
                className="font-serif text-lg font-semibold leading-snug text-text transition-colors hover:text-accent"
              >
                {group.title}
              </Link>
              {group.children.length > 0 && (
                <ul className="mt-3 space-y-2 border-t border-line pt-3">
                  {group.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/topics/${child.slug}`}
                        className="text-sm font-normal text-muted transition-colors hover:text-text"
                      >
                        {child.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className="container-page">
          <div className="border-t border-line py-4">
            <Link
              href="/topics"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-text transition-colors hover:text-accent"
            >
              {t('allTopics')}
              <ArrowRight
                aria-hidden
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </li>
  )
}
