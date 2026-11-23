import { getLocale, getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getTopics } from '@/lib/data/queries'
import type { Footer, Header, Topic } from '@/payload-types'

import { AppLink } from '../ui/AppLink'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { MarketBar } from './MarketBar'
import { MenuDrawer } from './MenuDrawer'
import { SearchOverlay } from './SearchOverlay'
import { StickyHeader } from './StickyHeader'
import { ThemeToggle } from './ThemeToggle'
import { TopicsMenu, type TopicLink } from './TopicsMenu'

type Props = { header: Header; footer: Footer }

const TOPICS_HREF = '/topics'

/** Main topics for the nav dropdown and the drawer, in the order set in the admin. */
function mainTopics(topics: Topic[]): TopicLink[] {
  return topics.filter((topic) => !topic.parent).map(({ id, title, slug }) => ({ id, title, slug }))
}

function Tools({ header, footer, topics }: Props & { topics: TopicLink[] }) {
  return (
    <div className="flex items-center">
      <SearchOverlay />
      <Suspense fallback={<span className="w-14" />}>
        <LanguageSwitcher />
      </Suspense>
      <ThemeToggle />
      <MenuDrawer navItems={header.navItems ?? []} footer={footer} topics={topics} />
    </div>
  )
}

/** Masthead like a newspaper front page, plus a compact sticky bar (docs/design-system.md). */
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
  const topics = mainTopics(await getTopics(locale as AppLocale))

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        {t('nav.skipToContent')}
      </a>
      <header id="masthead" className="relative bg-bg">
        <div className="container-page">
          <div className="flex h-12 items-center justify-between gap-4">
            <span className="meta hidden shrink-0 capitalize sm:inline">{today}</span>
            <MarketBar />
            <div className="ml-auto shrink-0">
              <Tools header={header} footer={footer} topics={topics} />
            </div>
          </div>
          <div className="flex justify-center pb-6 pt-2 md:pb-8 md:pt-4">
            <Link href="/" aria-label={t('site.name')} className="text-navy dark:text-text">
              <Logo className="h-12 w-auto md:h-[4.5rem]" />
            </Link>
          </div>
          <nav aria-label="Main" className="hidden border-y border-rule md:block">
            <ul className="flex items-center justify-center gap-x-10 py-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.1em]">
              {nav.map((item) => {
                const link = (
                  <AppLink
                    href={item.href}
                    className="text-text underline decoration-transparent decoration-2 underline-offset-[10px] transition-colors hover:decoration-accent"
                  >
                    {item.label}
                  </AppLink>
                )
                return item.href === TOPICS_HREF ? (
                  <TopicsMenu key={item.id ?? item.href} topics={topics}>
                    {link}
                  </TopicsMenu>
                ) : (
                  <li key={item.id ?? item.href}>{link}</li>
                )
              })}
            </ul>
          </nav>
          <div className="border-b border-rule md:hidden" />
        </div>
      </header>
      <StickyHeader>
        <div className="container-page flex h-14 items-center justify-between gap-6">
          <Link
            href="/"
            aria-label={t('site.name')}
            className="text-navy dark:text-text"
            tabIndex={-1}
          >
            <Logo className="h-7 w-auto" />
          </Link>
          <ul className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.1em] lg:flex">
            {nav.map((item) => {
              const link = (
                <AppLink href={item.href} tabIndex={-1} className="hover:text-accent">
                  {item.label}
                </AppLink>
              )
              return item.href === TOPICS_HREF ? (
                <TopicsMenu key={item.id ?? item.href} topics={topics} compact>
                  {link}
                </TopicsMenu>
              ) : (
                <li key={item.id ?? item.href}>{link}</li>
              )
            })}
          </ul>
          <Tools header={header} footer={footer} topics={topics} />
        </div>
      </StickyHeader>
    </>
  )
}
