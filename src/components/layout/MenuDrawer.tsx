'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { Footer, Header } from '@/payload-types'

import { AppLink } from '../ui/AppLink'
import { Logo } from './Logo'

type Props = { navItems: NonNullable<Header['navItems']>; footer: Footer }

export function MenuDrawer({ navItems, footer }: Props) {
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)

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
        aria-label={t('menu')}
        className="inline-flex size-9 items-center justify-center text-text transition-colors hover:text-accent"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialog.current && setOpen(false)}
        className="sgbr-drawer ml-auto mr-0 h-dvh max-h-none w-full max-w-md border-l border-line bg-bg p-0 text-text"
      >
        <div className="flex h-full flex-col px-8 py-6">
          <div className="flex items-center justify-between border-b border-rule pb-5">
            <Logo className="h-8 w-auto text-navy dark:text-text" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="inline-flex size-9 items-center justify-center hover:text-accent"
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
          <nav aria-label={t('menu')} onClick={() => setOpen(false)} className="mt-6">
            <ul className="divide-y divide-line">
              {navItems.map((item) => (
                <li key={item.id ?? item.href}>
                  <AppLink
                    href={item.href}
                    className="flex items-center justify-between py-4 font-serif text-2xl font-semibold transition-colors hover:text-accent"
                  >
                    {item.label}
                    <span aria-hidden className="text-base text-muted">
                      →
                    </span>
                  </AppLink>
                </li>
              ))}
            </ul>
            <ul className="mt-8 grid grid-cols-2 gap-y-3 text-sm">
              {(footer.links ?? []).map((link) => (
                <li key={link.id ?? link.href}>
                  <AppLink
                    href={link.href}
                    className="text-muted transition-colors hover:text-text"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="mt-auto flex gap-6 border-t border-line pt-5 text-sm">
            {(footer.socialLinks ?? []).map((link) => (
              <li key={link.id ?? link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="capitalize text-muted hover:text-text"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}
