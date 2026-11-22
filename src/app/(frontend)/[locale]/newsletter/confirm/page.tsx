import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PageTitle } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { confirm } from '@/lib/newsletter/subscriptions'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<{ token?: string }> }

/** Double opt-in: the link from the confirmation mail lands here. */
export default async function ConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { token } = await searchParams
  const t = await getTranslations('newsletter')
  const subscriber = await confirm(await getPayloadClient(), token)
  return (
    <>
      <PageTitle
        title={subscriber ? t('confirmTitle') : t('title')}
        intro={subscriber ? t('confirmText') : t('confirmInvalid')}
      />
      <div className="container-page">
        {subscriber?.preferencesToken && (
          <Link
            href={`/newsletter/preferences?token=${subscriber.preferencesToken}`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            {t('preferencesTitle')} →
          </Link>
        )}
      </div>
    </>
  )
}
