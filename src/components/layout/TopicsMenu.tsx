'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import { CaretDown } from '../ui/icons'

export type TopicLink = { id: number; title: string; slug: string }

type Props = {
  /** Main topics only, in the order set in the admin. */
  topics: TopicLink[]
  /** The nav link itself ("Topics"), rendered by the header. */
  children: ReactNode
  /** Sticky bar: the caret is not a tab stop while the bar is hidden. */
  compact?: boolean
}

/**
 * "Topics" nav item with a small dropdown of the main topics, built like the
 * language dropdown and set in the nav font. Opens on hover (mouse) or with the
 * caret button (touch, keyboard: arrows, Esc); a click outside closes it.
 */
export function TopicsMenu({ topics, children, compact = false }: Props) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const root = useRef<HTMLLIElement>(null)
  const caret = useRef<HTMLButtonElement>(null)
  const items = useRef<Array<HTMLAnchorElement | null>>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  if (!topics.length) return <li>{children}</li>

  function onKeyDown(event: React.KeyboardEvent) {
    const index = items.current.findIndex((item) => item === document.activeElement)
    if (event.key === 'Escape' && open) {
      setOpen(false)
      caret.current?.focus()
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      const next = index < 0 ? 0 : (index + step + topics.length) % topics.length
      // Wait one frame so the list is visible before focusing.
      requestAnimationFrame(() => items.current[next]?.focus())
    }
  }

  return (
    <li
      ref={root}
      className="relative flex items-center gap-1"
      onKeyDown={onKeyDown}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return
        clearTimeout(closeTimer.current)
        setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return
        closeTimer.current = setTimeout(() => setOpen(false), 150)
      }}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      {children}
      <button
        ref={caret}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
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
      {/* pt bridges the gap to the nav line, so the pointer can move down without closing. */}
      <div hidden={!open} className="absolute left-0 top-full z-50 pt-3">
        <ul
          id={menuId}
          role="menu"
          className="w-60 border border-line bg-surface py-1 shadow-[0_8px_24px_rgb(0_0_0/0.08)] [animation:sgbr-fade-in_160ms_var(--ease-out-soft)]"
        >
          {topics.map((topic, index) => (
            <li key={topic.id} role="none">
              <Link
                ref={(element) => {
                  items.current[index] = element
                }}
                role="menuitem"
                href={`/topics/${topic.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-text transition-colors hover:bg-band hover:text-accent focus:bg-band focus:outline-none"
              >
                {topic.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}
