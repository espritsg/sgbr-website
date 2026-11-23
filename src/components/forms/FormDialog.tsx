'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { buttonClass, iconButtonClass } from '../ui/Button'
import { X } from '../ui/icons'

const OPEN_EVENT = 'sgbr:open-form'

/**
 * Opens the form dialog with the given id from anywhere on the page, so several
 * buttons (head of the event page, below the text) can share one dialog.
 */
export function FormDialogButton({
  dialogId,
  children,
  variant = 'primary',
  className = '',
}: {
  dialogId: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: dialogId }))}
      className={buttonClass(variant, className)}
    >
      {children}
    </button>
  )
}

/**
 * A form (e.g. an event application) as a modal dialog: title and intro on top,
 * the form scrolls inside. Esc, the close button and a click on the backdrop close it.
 */
export function FormDialog({
  id,
  title,
  intro,
  children,
}: {
  id: string
  title: string
  intro?: ReactNode
  children: ReactNode
}) {
  const t = useTranslations('nav')
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail === id) setOpen(true)
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    // A link to …#<id> (e.g. "apply here" in a post or mail) opens the dialog directly.
    const onHash = () => window.location.hash === `#${id}` && setOpen(true)
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen)
      window.removeEventListener('hashchange', onHash)
    }
  }, [id])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      element.showModal()
      // Focus the title, not the close button, so no focus ring appears on open.
      element.querySelector<HTMLElement>(`#${id}-title`)?.focus()
    }
    if (!open && element.open) element.close()
  }, [open, id])

  return (
    <dialog
      ref={dialog}
      id={id}
      aria-labelledby={`${id}-title`}
      onClose={() => {
        setOpen(false)
        if (window.location.hash === `#${id}`) {
          history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      }}
      onClick={(event) => event.target === dialog.current && setOpen(false)}
      className="m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden border border-line bg-bg p-0 text-text"
    >
      <div className="flex max-h-[92dvh] flex-col">
        <div className="flex items-start justify-between gap-6 border-b border-line px-6 py-5 sm:px-8">
          <div>
            <h2 id={`${id}-title`} tabIndex={-1} className="headline-md outline-none">
              {title}
            </h2>
            {intro && <div className="meta mt-2 text-[0.875rem] leading-relaxed">{intro}</div>}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('close')}
            className={`${iconButtonClass} -mr-2 -mt-1`}
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </div>
    </dialog>
  )
}
