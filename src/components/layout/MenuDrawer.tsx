'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { Footer, Header } from '@/payload-types'

import { AppLink } from '../ui/AppLink'
import { iconButtonClass } from '../ui/Button'
import { ArrowRight, List, X } from '../ui/icons'
import { SocialLinks } from '../ui/SocialLinks'
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
        className={iconButtonClass}
      >
        <List aria-hidden className="size-5" />
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(event) => event.target === dialog.current && setOpen(false)}
        className="sgbr-drawer ml-auto mr-0 h-dvh max-h-none w-full max-w-md border-l border-line bg-bg p-0 text-text"
      >
        <div className="flex h-full flex-col px-8 py-6">
          <div className="flex items-center justify-between border-b border-line pb-5">
            <Logo className="h-8 w-auto text-navy dark:text-text" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className={`${iconButtonClass} -mr-2`}
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          <nav aria-label={t('menu')} onClick={() => setOpen(false)} className="mt-6">
            <ul className="divide-y divide-line">
              {navItems.map((item) => (
                <li key={item.id ?? item.href}>
                  <AppLink
                    href={item.href}
                    className="group flex items-center justify-between py-4 text-sm font-semibold uppercase tracking-[0.1em] transition-colors hover:text-accent"
                  >
                    {item.label}
                    <ArrowRight
                      aria-hidden
                      className="size-4 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent"
                    />
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
          <SocialLinks
            links={footer.socialLinks ?? []}
            className="mt-auto flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5 text-sm"
            linkClassName="text-muted transition-colors hover:text-text"
          />
        </div>
      </dialog>
    </>
  )
}
