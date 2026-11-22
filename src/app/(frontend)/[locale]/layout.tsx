import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { ThemeScript } from '@/components/layout/ThemeScript'
import { NewsletterPopup } from '@/components/newsletter/NewsletterPopup'
import { AdminBar } from '@/components/preview/AdminBar'
import { LivePreviewRefresh } from '@/components/preview/LivePreviewRefresh'
import { routing, type AppLocale } from '@/i18n/routing'
import { getGlobals } from '@/lib/data/queries'
import { cormorant, inter } from '@/lib/fonts'
import { serverUrl } from '@/lib/media'

import '../globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const { settings } = await getGlobals(locale)
  const t = await getTranslations({ locale, namespace: 'site' })
  const title = settings.defaultSeo?.title || t('name')
  return {
    metadataBase: new URL(serverUrl()),
    title: { default: title, template: `%s | ${t('name')}` },
    description: settings.defaultSeo?.description || t('tagline'),
    alternates: { types: { 'application/rss+xml': `${serverUrl()}/${locale}/feed.xml` } },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const { header, footer, settings } = await getGlobals(locale as AppLocale)
  const { isEnabled: preview } = await draftMode()
  const popup = settings.newsletterPopup

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <AdminBar preview={preview} serverUrl={serverUrl()} />
          {preview && <LivePreviewRefresh serverUrl={serverUrl()} />}
          <SiteHeader header={header} footer={footer} />
          <main id="main">{children}</main>
          <SiteFooter footer={footer} />
          {popup?.enabled && <NewsletterPopup delaySeconds={popup.delaySeconds ?? 10} />}
        </NextIntlClientProvider>
        {/* Vercel Web Analytics: no cookies, only on Vercel production (docs/architektur.md). */}
        {process.env.VERCEL_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
