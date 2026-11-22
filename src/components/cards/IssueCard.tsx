import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { fileUrl } from '@/lib/media'
import type { Issue } from '@/payload-types'

import { MediaImage } from '../ui/MediaImage'

/** Issue with cover, year, tagline and "Read the issue" or PDF link. */
export async function IssueCard({ issue, compact = false }: { issue: Issue; compact?: boolean }) {
  const t = await getTranslations('issues')
  const pdf = fileUrl(issue.pdf)
  const isDigital = issue.format === 'digital'
  const href = isDigital ? `/issues/${issue.slug}` : pdf
  const cover = (
    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-band shadow-sm ring-1 ring-line">
      {issue.cover ? (
        <MediaImage
          media={issue.cover}
          size="card"
          fill
          sizes="(min-width: 1024px) 15vw, 40vw"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full flex-col justify-between bg-navy p-4 text-[#e8ecf1]">
          <span className="text-xs uppercase tracking-widest">SGBR · {issue.year}</span>
          <span className="font-serif text-2xl leading-tight">{issue.title}</span>
        </div>
      )}
    </div>
  )
  return (
    <article className="group">
      {href && isDigital ? (
        <Link href={href}>{cover}</Link>
      ) : href ? (
        <a href={href}>{cover}</a>
      ) : (
        cover
      )}
      <p className="mt-3 text-xs text-muted">{issue.year}</p>
      <h3 className="font-serif text-xl leading-tight">{issue.title}</h3>
      {!compact && issue.tagline && <p className="mt-1 text-sm text-muted">{issue.tagline}</p>}
      {!compact && href && (
        <p className="mt-2 text-sm font-semibold text-accent">
          {isDigital ? (
            <Link href={href}>{t('readIssue')} →</Link>
          ) : (
            <a href={href}>{t('downloadPdf')} ↓</a>
          )}
        </p>
      )}
    </article>
  )
}
