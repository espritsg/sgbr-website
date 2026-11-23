'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { useRouter } from '@/i18n/navigation'

import { SearchResult, searchPathFor as pathFor } from '../search/SearchResult'
import { iconButtonClass } from '../ui/Button'
import { ArrowRight, MagnifyingGlass, X } from '../ui/icons'

type Suggestion = { id: number; title: string; slug: string; excerpt?: string; collection: string }

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
        limit: '8',
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
        className={iconButtonClass}
      >
        <MagnifyingGlass aria-hidden className="size-5" />
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialog.current && setOpen(false)}
        aria-label={t('title')}
        className="m-0 mt-0 h-auto max-h-none w-full max-w-none border-b border-line bg-bg p-0 text-text"
      >
        <div className="container-page relative py-8 md:py-12">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={tNav('close')}
            className={`${iconButtonClass} absolute right-3 top-3 md:right-8 md:top-4`}
          >
            <X aria-hidden className="size-5" />
          </button>
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
            className="mt-6 flex items-center gap-4 border-b-2 border-rule pb-3 md:mt-4"
          >
            <MagnifyingGlass aria-hidden className="size-7 shrink-0 text-muted md:size-9" />
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
          </form>
          {visibleResults.length > 0 && (
            <ul role="listbox" className="mt-4 grid gap-x-6 md:grid-cols-2">
              {visibleResults.map((result, index) => (
                <li
                  key={result.id}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === active}
                  className="border-b border-line"
                >
                  <SearchResult
                    {...result}
                    size="sm"
                    query={query}
                    typeLabel={t(`types.${result.collection}`)}
                    active={index === active}
                    onNavigate={() => setOpen(false)}
                  />
                </li>
              ))}
            </ul>
          )}
          {query.trim().length >= 2 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="meta">{visibleResults.length ? t('topHits') : t('noHits')}</p>
              <button
                type="button"
                onClick={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-text hover:text-accent"
              >
                {t('allResults')}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  )
}
