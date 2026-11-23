import { getTranslations } from 'next-intl/server'

import { ButtonLink } from '@/components/ui/Button'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="container-reading py-24">
      <p className="kicker">404</p>
      <h1 className="display mt-3">{t('title')}</h1>
      <p className="lead mt-4">{t('text')}</p>
      <ButtonLink href="/" className="mt-8">
        {t('home')}
      </ButtonLink>
    </div>
  )
}
