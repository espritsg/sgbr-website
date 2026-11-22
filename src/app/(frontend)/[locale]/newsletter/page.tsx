import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { PageTitle, Section } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { AppLocale } from '@/i18n/routing'
import { getNewsletterArchive } from '@/lib/data/queries'
import { formatDate } from '@/lib/format'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'newsletter' })
  return buildMetadata({ locale, path: '/newsletter', title: t('title'), description: t('intro') })
}

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('newsletter')
  const archive = await getNewsletterArchive(locale)
  return (
    <>
      <PageTitle title={t('title')} intro={t('intro')} />
      <div className="container-page">
        <div className="max-w-2xl rounded-card border border-line bg-surface p-6 md:p-8">
          <NewsletterSignup source="newsletter-page" />
        </div>
      </div>
      <Section title={t('archive')}>
        {archive.length ? (
          <ul className="divide-y divide-line">
            {archive.map((newsletter) => (
              <li key={newsletter.id} className="py-5">
                <p className="text-xs text-muted">
                  {newsletter.sentAt &&
                    t('sentOn', { date: formatDate(newsletter.sentAt, locale) })}
                </p>
                <Link
                  href={`/newsletter/${newsletter.slug}`}
                  className="font-serif text-2xl hover:text-accent"
                >
                  {newsletter.title}
                </Link>
                {newsletter.intro && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{newsletter.intro}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{t('archiveEmpty')}</p>
        )}
      </Section>
    </>
  )
}
