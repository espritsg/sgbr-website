'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type AppLocale } from '@/i18n/routing'

/** Language dropdown (EN ▾). Slugs are the same in both languages, so the path stays. */
export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale
  const t = useTranslations('language')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const root = useRef<HTMLDivElement>(null)
  const items = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!open) return
    items.current[Math.max(0, locales.indexOf(locale))]?.focus()
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [open, locale])

  function choose(next: AppLocale) {
    setOpen(false)
    if (next === locale) return
    const query = searchParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { locale: next })
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const index = items.current.findIndex((item) => item === document.activeElement)
    if (event.key === 'Escape') {
      setOpen(false)
      root.current?.querySelector<HTMLButtonElement>('button')?.focus()
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + locales.length) % locales.length
      items.current[next]?.focus()
    }
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t('switch')}: ${t(locale)}`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-9 items-center gap-1 px-2 text-xs font-semibold uppercase tracking-wider text-text transition-colors hover:text-accent"
      >
        {locale}
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className={`size-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>
      <div
        id={menuId}
        role="menu"
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-1 w-40 border border-line bg-surface py-1 shadow-[0_8px_24px_rgb(0_0_0/0.08)] [animation:sgbr-fade-in_160ms_var(--ease-out-soft)]"
      >
        {locales.map((code, index) => (
          <button
            key={code}
            ref={(element) => {
              items.current[index] = element
            }}
            type="button"
            role="menuitemradio"
            aria-checked={code === locale}
            lang={code}
            onClick={() => choose(code)}
            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-text transition-colors hover:bg-band focus:bg-band focus:outline-none"
          >
            {t(code)}
            {code === locale && (
              <span aria-hidden className="text-accent">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
