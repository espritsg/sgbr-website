import { getLocale, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { Link } from '@/i18n/navigation'
import type { Footer, Header } from '@/payload-types'

import { AppLink } from '../ui/AppLink'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MenuDrawer } from './MenuDrawer'
import { SearchOverlay } from './SearchOverlay'
import { ThemeToggle } from './ThemeToggle'

type Props = { header: Header; footer: Footer }

/** Newspaper-style masthead: date line, wordmark, navigation (docs/design-system.md). */
export async function SiteHeader({ header, footer }: Props) {
  const t = await getTranslations()
  const locale = await getLocale()
  const today = new Intl.DateTimeFormat(locale === 'de' ? 'de-CH' : 'en-GB', {
    timeZone: 'Europe/Zurich',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const nav = header.navItems ?? []

  return (
    <header className="border-b border-line bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t('nav.skipToContent')}
      </a>
      <div className="container-page flex items-center justify-between gap-4 py-3 text-xs text-muted">
        <span className="hidden capitalize sm:inline">{today}</span>
        <div className="ml-auto flex items-center gap-1">
          <SearchOverlay />
          <Suspense fallback={null}>
            <LanguageSwitcher />
          </Suspense>
          <ThemeToggle />
          <MenuDrawer navItems={nav} footer={footer} />
        </div>
      </div>
      <div className="container-page border-t border-line py-6 text-center md:py-8">
        <Link
          href="/"
          className="inline-block font-serif text-4xl font-semibold tracking-tight text-text md:text-6xl"
        >
          St. Gallen Business Review
        </Link>
      </div>
      <nav aria-label="Main" className="hidden border-t border-line md:block">
        <ul className="container-page flex items-center justify-center gap-10 py-3 text-sm font-medium uppercase tracking-wider">
          {nav.map((item) => (
            <li key={item.id ?? item.href}>
              <AppLink href={item.href} className="text-text hover:text-accent">
                {item.label}
              </AppLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
