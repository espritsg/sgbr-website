import type { Metadata } from 'next'

import { locales, type AppLocale } from '@/i18n/routing'

import { imageSrc, serverUrl } from './media'

type Meta =
  { title?: string | null; description?: string | null; image?: unknown } | null | undefined

/**
 * Metadata with hreflang alternates. For content in only one language the canonical
 * URL points to the original language, so Google sees no duplicate (docs/urls-und-weiterleitungen.md).
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  meta,
  canonicalLocale,
  image,
  type = 'website',
}: {
  locale: AppLocale
  path: string
  title: string
  description?: string | null
  meta?: Meta
  canonicalLocale?: AppLocale
  image?: unknown
  type?: 'website' | 'article'
}): Metadata {
  const base = serverUrl()
  const url = (code: AppLocale) => `${base}/${code}${path}`
  const ogImage = imageSrc((meta?.image ?? image) as never, 'og')
  const absoluteImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${base}${ogImage}`
    : undefined
  return {
    title: meta?.title || title,
    description: meta?.description || description || undefined,
    alternates: {
      canonical: url(canonicalLocale ?? locale),
      languages: canonicalLocale
        ? { [canonicalLocale]: url(canonicalLocale) }
        : Object.fromEntries(locales.map((code) => [code, url(code)])),
    },
    openGraph: {
      type,
      url: url(locale),
      title: meta?.title || title,
      description: meta?.description || description || undefined,
      siteName: 'St. Gallen Business Review',
      images: absoluteImage ? [{ url: absoluteImage }] : undefined,
      locale: locale === 'de' ? 'de_CH' : 'en_GB',
    },
  }
}
