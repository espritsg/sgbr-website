import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  children?: ReactNode
}

/**
 * Link for CMS-managed hrefs: internal paths ("/issues") get the locale prefix,
 * external links open in a new tab, files (/files/…) stay without prefix.
 */
export function AppLink({ href, ...props }: Props) {
  const isExternal = /^(https?:|mailto:|tel:)/.test(href)
  const isUnlocalized =
    href.startsWith('/files/') || href.startsWith('/api/') || href.startsWith('/admin')
  if (isExternal) {
    return (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noopener noreferrer"
        {...props}
      />
    )
  }
  if (isUnlocalized) return <a href={href} {...props} />
  return <Link href={href} {...props} />
}
