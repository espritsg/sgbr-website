'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

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
      aria-labelledby="newsletter-popup-title"
      className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-card bg-bg p-8 text-text backdrop:bg-black/40"
    >
      <h2 id="newsletter-popup-title" className="font-serif text-3xl">
        {t('popupTitle')}
      </h2>
      <p className="mt-2 text-sm text-muted">{t('intro')}</p>
      <div className="mt-6">
        <NewsletterSignup source="popup" onDone={() => window.setTimeout(close, 4000)} />
      </div>
      <button
        type="button"
        onClick={close}
        className="mt-4 text-sm text-muted underline hover:text-text"
      >
        {t('popupClose')}
      </button>
    </dialog>
  )
}
