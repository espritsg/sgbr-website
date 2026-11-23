import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { SectionHeader } from '@/components/ui/Section'
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
      {/* One calm column: what it is, then the form. */}
      <section className="container-reading pt-12 md:pt-16">
        <div className="text-center">
          <p className="kicker mb-3">{t('title')}</p>
          <h1 className="display">{t('popupTitle')}</h1>
          <p className="lead mx-auto mt-4 max-w-xl">{t('intro')}</p>
        </div>
        <div className="mt-10 border-t-2 border-rule pt-8">
          <NewsletterSignup source="newsletter-page" variant="full" />
          <p className="meta mt-6 text-center">{t('privacyNote')}</p>
        </div>
      </section>
      {archive.length > 0 && (
        <section className="container-reading mt-20">
          <SectionHeader title={t('archiveTitle')} />
          <ul className="divide-y divide-line">
            {archive.map((newsletter) => (
              <li key={newsletter.id} className="py-4 first:pt-0">
                <p className="meta">{newsletter.sentAt && formatDate(newsletter.sentAt, locale)}</p>
                <Link
                  href={`/newsletter/${newsletter.slug}`}
                  className="headline-sm mt-1 inline-block link-headline"
                >
                  {newsletter.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
