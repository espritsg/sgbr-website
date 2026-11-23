import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { fileUrl } from '@/lib/media'
import type { Issue } from '@/payload-types'

import { Logo } from '../layout/Logo'
import { MediaImage } from '../ui/MediaImage'

/** Issue cover (or a typographic placeholder) with year and title. */
export async function IssueCover({
  issue,
  sizes = '(min-width: 1024px) 15vw, 40vw',
}: {
  issue: Issue
  sizes?: string
}) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-navy shadow-[0_1px_0_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.35)]">
      {issue.cover ? (
        <MediaImage
          media={issue.cover}
          size="card"
          fill
          sizes={sizes}
          className="img-zoom object-cover"
        />
      ) : (
        <div className="flex size-full flex-col justify-between p-[8%] text-[#ffffff]">
          <Logo className="w-3/4" />
          <div>
            <span className="block text-[0.625rem] font-bold uppercase tracking-[0.14em] opacity-70">
              {issue.year}
            </span>
            <span className="mt-1 block font-serif text-[clamp(1rem,2vw,1.75rem)] font-semibold leading-tight">
              {issue.title}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export async function IssueCard({
  issue,
  showTagline = false,
}: {
  issue: Issue
  showTagline?: boolean
}) {
  const t = await getTranslations('issues')
  const pdf = fileUrl(issue.pdf)
  const isDigital = issue.format === 'digital'
  const href = isDigital ? `/issues/${issue.slug}` : pdf
  const cover = <IssueCover issue={issue} />
  return (
    <article className="group">
      {href && isDigital ? (
        <Link href={href}>{cover}</Link>
      ) : href ? (
        <a href={href}>{cover}</a>
      ) : (
        cover
      )}
      <p className="kicker mt-3">{issue.year}</p>
      <h3 className="headline-sm mt-1">{issue.title}</h3>
      {showTagline && issue.tagline && <p className="meta mt-1">{issue.tagline}</p>}
      {!isDigital && pdf && (
        <a
          href={pdf}
          className="meta mt-1 inline-block font-semibold text-text! underline decoration-transparent underline-offset-4 hover:decoration-current"
        >
          {t('downloadPdf')} ↓
        </a>
      )}
    </article>
  )
}
