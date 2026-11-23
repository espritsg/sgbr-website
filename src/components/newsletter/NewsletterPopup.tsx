'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Logo } from '../layout/Logo'
import { NewsletterSignup } from './NewsletterSignup'

const DISMISSED_KEY = 'sgbr-newsletter-popup'

/** Optional popup after a delay (site settings). Shown once; closing remembers the choice. */
export function NewsletterPopup({ delaySeconds }: { delaySeconds: number }) {
  const t = useTranslations('newsletter')
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY)) return
    } catch {
      return
    }
    if (window.location.pathname.includes('/newsletter')) return
    const timer = window.setTimeout(() => setOpen(true), delaySeconds * 1000)
    return () => window.clearTimeout(timer)
  }, [delaySeconds])

  useEffect(() => {
    if (open) dialog.current?.showModal()
  }, [open])

  function close() {
    try {
      localStorage.setItem(DISMISSED_KEY, new Date().toISOString())
    } catch {
      // Not remembered in private mode.
    }
    dialog.current?.close()
    setOpen(false)
  }

  if (!open) return null
  return (
    <dialog
      ref={dialog}
      onCancel={close}
      onClick={(event) => event.target === dialog.current && close()}
      aria-labelledby="newsletter-popup-title"
      className="m-auto w-[min(32rem,calc(100%-2rem))] border-t-4 border-accent bg-bg p-0 text-text"
    >
      <div className="p-8">
        <div className="flex items-start justify-between gap-4">
          <Logo className="h-8 w-auto text-navy dark:text-text" />
          <button
            type="button"
            onClick={close}
            aria-label={t('popupClose')}
            className="-mr-2 -mt-2 inline-flex size-9 items-center justify-center text-muted hover:text-text"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <h2 id="newsletter-popup-title" className="headline-lg mt-6">
          {t('popupTitle')}
        </h2>
        <p className="mt-2 text-sm text-muted">{t('intro')}</p>
        <div className="mt-6">
          <NewsletterSignup
            source="popup"
            variant="compact"
            onDone={() => window.setTimeout(close, 4000)}
          />
        </div>
        <button
          type="button"
          onClick={close}
          className="meta mt-5 underline underline-offset-4 hover:text-text"
        >
          {t('popupClose')}
        </button>
      </div>
    </dialog>
  )
}
