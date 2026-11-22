import { notFound } from 'next/navigation'

import { redirectFromCms } from '@/lib/data/cmsRedirects'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; page: string; rest: string[] }> }

/** Unknown deeper paths: check the editors' redirects, otherwise 404. */
export default async function UnknownPath({ params }: Props) {
  const { locale, page, rest } = await params
  const path = [page, ...rest].join('/')
  await redirectFromCms([`/${locale}/${path}`, `/${path}`], locale)
  notFound()
}
