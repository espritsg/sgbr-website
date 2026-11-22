import { getTranslations, setRequestLocale } from 'next-intl/server'

import { PreferencesForm } from '@/components/newsletter/PreferencesForm'
import { PageTitle } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { findByToken } from '@/lib/newsletter/subscriptions'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false } }

type Props = { params: Promise<{ locale: AppLocale }>; searchParams: Promise<{ token?: string }> }

/** Change interests or unsubscribe, without login (link in every mail). */
export default async function PreferencesPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const { token } = await searchParams
  const t = await getTranslations('newsletter')
  const subscriber = await findByToken(await getPayloadClient(), 'preferencesToken', token)
  return (
    <>
      <PageTitle
        title={t('preferencesTitle')}
        intro={subscriber ? subscriber.email : t('confirmInvalid')}
      />
      {subscriber && token && (
        <div className="container-page">
          <PreferencesForm
            token={token}
            interests={(subscriber.interests ?? []) as string[]}
            unsubscribed={subscriber.status === 'unsubscribed'}
          />
        </div>
      )}
    </>
  )
}
