'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { Footer, Header } from '@/payload-types'

import { AppLink } from '../ui/AppLink'
import { ThemeToggle } from './ThemeToggle'

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
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialog.current && setOpen(false)}
        className="ml-auto mr-0 h-dvh max-h-none w-full max-w-sm bg-bg p-0 text-text backdrop:bg-black/40"
      >
        <div className="flex h-full flex-col gap-8 p-6">
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl font-semibold">SGBR</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-band"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <nav aria-label={t('menu')} onClick={() => setOpen(false)}>
            <ul className="space-y-4 font-serif text-2xl">
              {navItems.map((item) => (
                <li key={item.id ?? item.href}>
                  <AppLink href={item.href} className="hover:text-accent">
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </ul>
            <ul className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
              {(footer.links ?? []).map((link) => (
                <li key={link.id ?? link.href}>
                  <AppLink href={link.href} className="text-muted hover:text-text">
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex items-center justify-between border-t border-line pt-6">
            <ul className="flex gap-4 text-sm">
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
            <ThemeToggle />
          </div>
        </div>
      </dialog>
    </>
  )
}
