import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'de'] as const
export type AppLocale = (typeof locales)[number]
export const defaultLocale: AppLocale = 'en'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Both languages always carry a prefix: /en/... and /de/... (docs/sprachen.md)
  localePrefix: 'always',
  // "/" redirects based on the browser language; no cookie needed for that.
  localeDetection: true,
})

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value)
}
