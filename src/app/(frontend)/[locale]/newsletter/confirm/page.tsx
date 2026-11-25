import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PageTitle } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { confirm } from '@/lib/newsletter/subscriptions'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<{ token?: string }> }

/** Double opt-in: the link from the confirmation mail lands here. */
export default async function ConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { token } = await searchParams
  const t = await getTranslations('newsletter')
  const subscriber = await confirm(token)
  return (
    <PageTitle
      title={subscriber ? t('confirmTitle') : t('title')}
      intro={subscriber ? t('confirmText') : t('confirmInvalid')}
    />
  )
}
