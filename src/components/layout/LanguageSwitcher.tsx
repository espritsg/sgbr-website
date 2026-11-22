'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, type AppLocale } from '@/i18n/routing'

/** Simple EN/DE switch. Slugs are the same in both languages, so the path stays. */
export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('language')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function switchTo(next: AppLocale) {
    const query = searchParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { locale: next })
  }

  return (
    <div
      role="group"
      aria-label={t('switch')}
      className="flex items-center rounded-full border border-line p-0.5 text-xs font-semibold"
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={code === locale}
          lang={code}
          title={t(code)}
          className={`rounded-full px-2.5 py-1 uppercase ${code === locale ? 'bg-accent text-on-accent' : 'text-muted hover:text-text'}`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
