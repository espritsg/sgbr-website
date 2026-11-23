'use client'

import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sgbr-theme'

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const isDarkNow = () => document.documentElement.classList.contains('dark')

export function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('theme')
  const dark = useSyncExternalStore(subscribe, isDarkNow, () => false)

  function toggle() {
    const next = !isDarkNow()
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // Private mode: the choice simply is not remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('toggle')}
      aria-pressed={dark}
      title={dark ? t('light') : t('dark')}
      className={`inline-flex size-9 items-center justify-center text-text transition-colors hover:text-accent ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  )
}
