import { Logo } from '@/components/layout/Logo'

/**
 * SGBR branding in the Payload admin (docs/redaktion.md): the wordmark on the login
 * page, the square mark in the navigation. Payload's own colours stay as they are.
 */
export function AdminLogo() {
  return <Logo className="sgbr-admin-logo" />
}

export function AdminIcon() {
  return (
    <span className="sgbr-admin-icon" aria-hidden>
      <Logo title="" />
    </span>
  )
}
