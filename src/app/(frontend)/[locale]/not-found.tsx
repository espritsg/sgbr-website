import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  return (
    <div className="container-reading py-24 text-center">
      <p className="font-serif text-7xl text-accent">404</p>
      <h1 className="mt-4 font-serif text-4xl">{t('title')}</h1>
      <p className="mt-3 text-muted">{t('text')}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
      >
        {t('home')}
      </Link>
    </div>
  )
}
