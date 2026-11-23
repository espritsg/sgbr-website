'use client'

import { useTranslations } from 'next-intl'
import { useSyncExternalStore } from 'react'

import { iconButtonClass } from '../ui/Button'
import { Moon, Sun } from '../ui/icons'

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
      className={`${iconButtonClass} ${className}`}
    >
      {dark ? <Sun aria-hidden className="size-5" /> : <Moon aria-hidden className="size-5" />}
    </button>
  )
}
