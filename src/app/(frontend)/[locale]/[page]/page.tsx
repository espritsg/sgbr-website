import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { AdminBarDocument } from '@/components/preview/AdminBar'
import { PageTitle } from '@/components/ui/Section'
import type { AppLocale } from '@/i18n/routing'
import { getPage } from '@/lib/data/queries'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: AppLocale; page: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page: slug } = await params
  const page = await getPage(locale, slug)
  if (!page) return {}
  return buildMetadata({ locale, path: `/${slug}`, title: page.title, meta: page.meta })
}

/** About, Contact, Imprint, Privacy and other pages from the `pages` collection. */
export default async function StaticPage({ params }: Props) {
  const { locale, page: slug } = await params
  setRequestLocale(locale)
  const page = await getPage(locale, slug)
  if (!page) notFound()
  return (
    <>
      <AdminBarDocument collection="pages" id={page.id} label={page.title} />
      <PageTitle title={page.title} />
      <RenderBlocks blocks={page.layout} />
    </>
  )
}
