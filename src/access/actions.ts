/**
 * Permissions for actions that are not plain CRUD (docs/rollen.md).
 */
import { hasRole } from './roles'

type MaybeUser = Parameters<typeof hasRole>[0]

/** Send a newsletter to all recipients. */
export function canSendNewsletter(user: MaybeUser): boolean {
  return hasRole(user, 'admin', 'board')
}

/** Send a test newsletter to one's own address. */
export function canSendTestNewsletter(user: MaybeUser): boolean {
  return hasRole(user, 'admin', 'board', 'editor')
}

/** See the local mail preview (only relevant without RESEND_API_KEY). */
export function canSeeMailPreview(user: MaybeUser): boolean {
  return hasRole(user, 'admin')
}
