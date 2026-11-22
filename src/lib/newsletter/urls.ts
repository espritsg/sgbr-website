import { serverUrl } from '@/lib/media'

type Locale = 'en' | 'de'

export const newsletterUrls = {
  confirm: (locale: Locale, token: string) =>
    `${serverUrl()}/${locale}/newsletter/confirm?token=${encodeURIComponent(token)}`,
  preferences: (locale: Locale, token: string) =>
    `${serverUrl()}/${locale}/newsletter/preferences?token=${encodeURIComponent(token)}`,
  /** One-click unsubscribe (RFC 8058), used in the List-Unsubscribe header. */
  oneClickUnsubscribe: (token: string) =>
    `${serverUrl()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
  online: (locale: Locale, slug: string) => `${serverUrl()}/${locale}/newsletter/${slug}`,
  article: (locale: Locale, slug: string) => `${serverUrl()}/${locale}/article/${slug}`,
}
