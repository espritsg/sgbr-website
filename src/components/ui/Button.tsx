import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { AppLink } from './AppLink'

type Variant = 'primary' | 'secondary' | 'ghost'

const styles: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-hover border border-accent hover:border-accent-hover',
  secondary: 'border border-text text-text hover:bg-text hover:text-bg',
  ghost:
    'text-text underline decoration-transparent underline-offset-4 hover:decoration-current px-0',
}

/** Square icon button (header tools, close buttons): pointer, hover surface, focus ring. */
export const iconButtonClass =
  'inline-flex size-10 shrink-0 items-center justify-center text-text transition-colors duration-200 hover:bg-band hover:text-accent active:bg-line'

export function buttonClass(variant: Variant = 'primary', extra = '') {
  return `inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${extra}`
}

export function Button({
  variant = 'primary',
  className = '',
  loading = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  loading?: boolean
  children: ReactNode
}) {
  return (
    <button
      className={buttonClass(variant, className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-3.5 animate-spin border-2 border-current border-r-transparent"
          style={{ borderRadius: '9999px' }}
        />
      )}
      {children}
    </button>
  )
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  href,
  children,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  variant?: Variant
  children: ReactNode
}) {
  return (
    <AppLink href={href} className={buttonClass(variant, className)} {...props}>
      {children}
    </AppLink>
  )
}
