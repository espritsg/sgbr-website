import Link from 'next/link'
import type { ServerProps } from 'payload'

import { canSeeMailPreview } from '@/access/actions'
import { isResendEnabled } from '@/lib/email/config'

/** Navigation link to the local mail preview (admin only, only without Resend). */
export function MailPreviewLink({ user }: ServerProps) {
  if (isResendEnabled() || !canSeeMailPreview(user)) return null
  return (
    <Link href="/admin/mail-preview" style={{ display: 'block', padding: '8px 0', fontSize: 13 }}>
      ✉ Mail-Vorschau (nur lokal)
    </Link>
  )
}
