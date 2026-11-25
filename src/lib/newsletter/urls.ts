import { serverUrl } from '@/lib/media'

type Locale = 'en' | 'de'

export const newsletterUrls = {
  confirm: (locale: Locale, token: string) =>
    `${serverUrl()}/${locale}/newsletter/confirm?token=${encodeURIComponent(token)}`,
  online: (locale: Locale, slug: string) => `${serverUrl()}/${locale}/newsletter/${slug}`,
  article: (locale: Locale, slug: string) => `${serverUrl()}/${locale}/article/${slug}`,
}
