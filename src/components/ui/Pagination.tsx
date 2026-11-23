import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import { pageWindow } from '@/lib/pagination'

import { CaretLeft, CaretRight } from './icons'

const cell =
  'inline-flex size-10 items-center justify-center text-sm font-semibold transition-colors duration-200'

/** Five page numbers around the current page, arrows for previous and next. */
export async function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number
  totalPages: number
  basePath: string
  query?: Record<string, string>
}) {
  if (totalPages <= 1) return null
  const t = await getTranslations('pagination')
  const href = (target: number) => {
    const params = new URLSearchParams({
      ...Object.fromEntries(Object.entries(query).filter(([, value]) => value)),
      ...(target > 1 ? { page: String(target) } : {}),
    })
    const search = params.toString()
    return search ? `${basePath}?${search}` : basePath
  }
  const arrow = (target: number, label: string, Icon: typeof CaretLeft) =>
    target >= 1 && target <= totalPages ? (
      <Link href={href(target)} aria-label={label} className={`${cell} hover:bg-band`}>
        <Icon aria-hidden className="size-4" />
      </Link>
    ) : (
      <span aria-hidden className={`${cell} text-line`}>
        <Icon className="size-4" />
      </span>
    )
  return (
    <div className="container-page mt-12">
      <nav
        aria-label={t('label')}
        className="flex items-center justify-center gap-1 border-t border-line pt-6"
      >
        {arrow(page - 1, t('previous'), CaretLeft)}
        {pageWindow(page, totalPages).map((target) => (
          <Link
            key={target}
            href={href(target)}
            aria-current={target === page ? 'page' : undefined}
            className={`${cell} ${target === page ? 'bg-text text-bg' : 'hover:bg-band'}`}
          >
            {target}
          </Link>
        ))}
        {arrow(page + 1, t('next'), CaretRight)}
      </nav>
    </div>
  )
}
