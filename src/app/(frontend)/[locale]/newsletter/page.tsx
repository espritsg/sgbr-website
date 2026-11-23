import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup'
import { PageTitle, SectionHeader } from '@/components/ui/Section'
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
  const benefits = t.raw('benefits') as string[]
  return (
    <>
      <PageTitle kicker={t('title')} title={t('popupTitle')} intro={t('intro')} />
      <section className="container-page">
        <div className="grid gap-12 md:grid-cols-[1fr_1.5fr] md:gap-16">
          <div>
            <p className="kicker text-muted!">{t('benefitsTitle')}</p>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {benefits.map((benefit, index) => (
                <li key={benefit} className="flex items-baseline gap-4 py-4">
                  <span className="font-serif text-2xl font-semibold text-accent">{index + 1}</span>
                  <span className="text-[0.9375rem]">{benefit}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t-2 border-rule pt-6">
            <NewsletterSignup source="newsletter-page" variant="full" />
          </div>
        </div>
      </section>
      <section className="container-page mt-16">
        <SectionHeader title={t('archive')} />
        {archive.length ? (
          <ul className="border-t border-line">
            {archive.map((newsletter) => (
              <li
                key={newsletter.id}
                className="grid gap-2 border-b border-line py-5 sm:grid-cols-[10rem_1fr]"
              >
                <p className="meta">{newsletter.sentAt && formatDate(newsletter.sentAt, locale)}</p>
                <div>
                  <Link
                    href={`/newsletter/${newsletter.slug}`}
                    className="headline-md link-headline"
                  >
                    {newsletter.title}
                  </Link>
                  {newsletter.intro && (
                    <p className="mt-1 line-clamp-2 text-[0.9375rem] text-muted">
                      {newsletter.intro}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="meta">{t('archiveEmpty')}</p>
        )}
      </section>
    </>
  )
}
