'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { useRouter } from '@/i18n/navigation'

/** Search as an overlay in the header; results are on /{locale}/search. */
export function SearchOverlay() {
  const t = useTranslations('search')
  const tNav = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    if (!open && element.open) element.close()
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tNav('search')}
        className="inline-flex size-9 items-center justify-center rounded-full text-text hover:bg-band"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialog.current && setOpen(false)}
        className="mx-auto mt-24 w-[min(40rem,calc(100%-2rem))] rounded-card bg-bg p-0 text-text backdrop:bg-black/40"
      >
        <form
          role="search"
          className="flex items-center gap-3 p-4"
          onSubmit={(event) => {
            event.preventDefault()
            const query = new FormData(event.currentTarget).get('q')?.toString().trim()
            if (!query) return
            setOpen(false)
            router.push(`/search?q=${encodeURIComponent(query)}`)
          }}
        >
          <label htmlFor="site-search" className="sr-only">
            {t('title')}
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            autoFocus
            placeholder={t('placeholder')}
            className="w-full bg-transparent px-2 py-3 text-lg outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-on-accent hover:bg-accent-hover"
          >
            {t('title')}
          </button>
        </form>
      </dialog>
    </>
  )
}
