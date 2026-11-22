import { Link } from '@/i18n/navigation'

export function Pagination({
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
  const href = (target: number) => {
    const params = new URLSearchParams({
      ...query,
      ...(target > 1 ? { page: String(target) } : {}),
    })
    const search = params.toString()
    return search ? `${basePath}?${search}` : basePath
  }
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2 text-sm">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((target) => (
        <Link
          key={target}
          href={href(target)}
          aria-current={target === page ? 'page' : undefined}
          className={`inline-flex size-9 items-center justify-center rounded-full ${target === page ? 'bg-accent text-on-accent' : 'border border-line hover:border-accent'}`}
        >
          {target}
        </Link>
      ))}
    </nav>
  )
}
