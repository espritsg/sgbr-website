import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import { canSeeMailPreview } from '@/access/actions'
import { isResendEnabled } from '@/lib/email/config'
import { listPreviews, readPreview } from '@/lib/email/preview'

/**
 * /admin/mail-preview: the latest mails that were written to .mail-preview/
 * instead of being sent (only without RESEND_API_KEY, admin only, ADR 0007).
 */
export async function MailPreviewView({ initPageResult, searchParams }: AdminViewServerProps) {
  const user = initPageResult.req.user
  if (!canSeeMailPreview(user)) return <div style={{ padding: 40 }}>Kein Zugriff.</div>
  if (isResendEnabled()) {
    return (
      <div style={{ padding: 40 }}>
        RESEND_API_KEY ist gesetzt: Mails werden echt versendet, es gibt keine lokale Vorschau.
      </div>
    )
  }
  const mails = await listPreviews()
  const selected = typeof searchParams?.file === 'string' ? searchParams.file : mails[0]?.file
  const html = selected ? await readPreview(selected) : null
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, padding: '40px 60px' }}
    >
      <div>
        <h1 style={{ marginTop: 0 }}>Mail-Vorschau</h1>
        <p style={{ fontSize: 13 }}>
          Lokal ohne RESEND_API_KEY werden Mails nicht verschickt, sondern hier gezeigt (Ordner
          .mail-preview/).
        </p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {mails.map((mail) => (
            <li
              key={mail.file}
              style={{ borderBottom: '1px solid var(--theme-elevation-100)', padding: '8px 0' }}
            >
              <Link
                href={`/admin/mail-preview?file=${encodeURIComponent(mail.file)}`}
                style={{ fontWeight: mail.file === selected ? 700 : 400 }}
              >
                {mail.subject}
              </Link>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {mail.to} · {mail.date}
              </div>
            </li>
          ))}
        </ul>
        {!mails.length && <p>Noch keine Mails.</p>}
      </div>
      <div>
        {html && (
          <iframe
            title="Mail"
            srcDoc={html}
            sandbox=""
            style={{
              width: '100%',
              height: '80vh',
              border: '1px solid var(--theme-elevation-150)',
              background: '#fff',
            }}
          />
        )}
      </div>
    </div>
  )
}
