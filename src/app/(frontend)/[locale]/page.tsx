import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { use } from 'react'

type Props = { params: Promise<{ locale: string }> }

export default function HomePage({ params }: Props) {
  const { locale } = use(params)
  setRequestLocale(locale)
  const t = useTranslations('site')

  return (
    <main className="container-page py-16">
      <h1 className="text-5xl text-accent">{t('name')}</h1>
      <p className="mt-4 text-muted">{t('tagline')}</p>
    </main>
  )
}
