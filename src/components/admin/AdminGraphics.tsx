import { Logo } from '@/components/layout/Logo'

/**
 * SGBR branding in the Payload admin (docs/redaktion.md): the wordmark on the login
 * page, the square mark in the navigation. Payload's own colours stay as they are.
 */
export function AdminLogo() {
  return <Logo className="sgbr-admin-logo" />
}

/** The favicon (src/app/icon.png), so browser tab and admin show the same mark. */
export function AdminIcon() {
  // eslint-disable-next-line @next/next/no-img-element -- tiny static icon in the admin
  return <img src="/icon.png" alt="" width={24} height={24} className="sgbr-admin-icon" />
}
