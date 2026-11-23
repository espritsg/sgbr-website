import Link from 'next/link'
import type { ServerProps } from 'payload'

import { canSeeMailPreview } from '@/access/actions'
import { isResendEnabled } from '@/lib/email/config'

/** Dashboard card for the local mail preview (admin only, only without Resend, ADR 0007). */
export function MailPreviewCard({ user }: ServerProps) {
  if (isResendEnabled() || !canSeeMailPreview(user)) return null
  return (
    <div style={{ padding: '0 6px 40px' }}>
      <h2 style={{ margin: '0 0 16px' }}>Werkzeuge</h2>
      <Link
        href="/admin/mail-preview"
        className="card"
        style={{ display: 'block', maxWidth: 320, padding: 20, textDecoration: 'none' }}
      >
        <strong>Mail-Vorschau (nur lokal)</strong>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
          Alle Mails, die lokal nicht verschickt werden: Newsletter, Bestätigungen, Formulare.
        </div>
      </Link>
    </div>
  )
}
