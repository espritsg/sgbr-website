'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link, useRouter } from '@/i18n/navigation'

type Suggestion = { id: number; title: string; slug: string; excerpt?: string; collection: string }

const pathFor: Record<string, string> = {
  posts: '/article',
  issues: '/issues',
  events: '/events',
  people: '/people',
}

/** Search panel below the header with live suggestions from the search index. */
export function SearchOverlay() {
  const t = useTranslations('search')
  const tNav = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Suggestion[]>([])
  const [active, setActive] = useState(-1)
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      element.showModal()
      input.current?.focus()
    }
    if (!open && element.open) element.close()
  }, [open])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        'where[or][0][title][like]': term,
        'where[or][1][excerpt][like]': term,
        locale,
        limit: '6',
        depth: '0',
        sort: 'priority',
      })
      try {
        const response = await fetch(`/api/search?${params}`, { signal: controller.signal })
        const data = (await response.json()) as {
          docs: Array<{
            id: number
            title: string
            slug?: string
            excerpt?: string
            doc: { relationTo: string }
          }>
        }
        setResults(
          data.docs
            .filter((doc) => doc.slug)
            .map((doc) => ({
              id: doc.id,
              title: doc.title,
              slug: doc.slug!,
              excerpt: doc.excerpt,
              collection: doc.doc.relationTo,
            })),
        )
        setActive(-1)
      } catch {
        // Aborted or offline: keep the old suggestions.
      }
    }, 180)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query, locale])

  const visibleResults = query.trim().length >= 2 ? results : []

  function go(path: string) {
    setOpen(false)
    setQuery('')
    router.push(path)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tNav('search')}
        className="inline-flex size-9 items-center justify-center text-text transition-colors hover:text-accent"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialog.current && setOpen(false)}
        aria-label={t('title')}
        className="m-0 mt-0 h-auto max-h-none w-full max-w-none border-b border-line bg-bg p-0 text-text"
      >
        <div className="container-page py-8 md:py-12">
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              if (active >= 0 && visibleResults[active]) {
                const result = visibleResults[active]
                return go(`${pathFor[result.collection]}/${result.slug}`)
              }
              const term = query.trim()
              if (term) go(`/search?q=${encodeURIComponent(term)}`)
            }}
            className="flex items-end gap-4 border-b-2 border-rule pb-3"
          >
            <label htmlFor="site-search" className="sr-only">
              {t('title')}
            </label>
            <input
              ref={input}
              id="site-search"
              name="q"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActive((value) => Math.min(value + 1, visibleResults.length - 1))
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActive((value) => Math.max(value - 1, -1))
                }
              }}
              placeholder={t('placeholder')}
              aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined}
              className="w-full bg-transparent font-serif text-3xl outline-none placeholder:text-muted md:text-5xl"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="meta shrink-0 uppercase tracking-wider hover:text-text"
            >
              {tNav('close')} ✕
            </button>
          </form>
          {visibleResults.length > 0 && (
            <ul role="listbox" className="mt-2 divide-y divide-line">
              {visibleResults.map((result, index) => (
                <li
                  key={result.id}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === active}
                >
                  <Link
                    href={`${pathFor[result.collection]}/${result.slug}`}
                    onClick={() => setOpen(false)}
                    className={`grid grid-cols-[6rem_1fr] gap-4 py-3 transition-colors ${index === active ? 'bg-band' : 'hover:bg-band'}`}
                  >
                    <span className="kicker pl-2 pt-1">{t(`types.${result.collection}`)}</span>
                    <span>
                      <span className="headline-sm block">{result.title}</span>
                      {result.excerpt && (
                        <span className="meta line-clamp-1">{result.excerpt}</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
              className="meta mt-4 font-semibold text-text underline underline-offset-4"
            >
              {t('allResults')} →
            </button>
          )}
        </div>
      </dialog>
    </>
  )
}
