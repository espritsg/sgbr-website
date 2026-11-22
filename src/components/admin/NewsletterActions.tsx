'use client'

import { Button, useAuth, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type Status = 'draft' | 'sending' | 'sent' | 'failed'

const texts = {
  de: {
    title: 'Versand',
    saveFirst: 'Bitte zuerst speichern.',
    recipients: (n: number) => `${n} Empfänger (bestätigt, passende Interessen)`,
    test: 'Testversand an mich',
    testDone: (to: string) => `Testversand an ${to} verschickt.`,
    send: 'Senden',
    confirm: (n: number) =>
      `Newsletter jetzt an ${n} Empfänger senden? Das lässt sich nicht rückgängig machen.`,
    sending: 'Wird versendet …',
    sent: 'Versendet.',
    resume: 'Versand läuft. Er setzt sich selbst fort.',
    failed: 'Versand fehlgeschlagen. Details unter „Versandfortschritt“.',
    error: 'Fehler',
    onlyTest: 'Senden dürfen nur Admin und Editorial Board.',
  },
  en: {
    title: 'Sending',
    saveFirst: 'Please save first.',
    recipients: (n: number) => `${n} recipients (confirmed, matching interests)`,
    test: 'Send test to me',
    testDone: (to: string) => `Test sent to ${to}.`,
    send: 'Send',
    confirm: (n: number) => `Send this newsletter to ${n} recipients now? This cannot be undone.`,
    sending: 'Sending …',
    sent: 'Sent.',
    resume: 'Sending is in progress and continues on its own.',
    failed: 'Sending failed. See "Sending progress".',
    error: 'Error',
    onlyTest: 'Only admin and editorial board can send.',
  },
}

/** Buttons "test" and "send" in the newsletter sidebar (docs/newsletter.md). */
export function NewsletterActions() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const locale = useLocale()
  const { i18n } = useTranslation()
  const t = texts[i18n.language === 'en' ? 'en' : 'de']
  const role = (user as { role?: string } | null)?.role
  const canSend = role === 'admin' || role === 'board'
  const [recipients, setRecipients] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('draft')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!id) return null
    const response = await fetch(`/api/newsletters/${id}/recipients`, { credentials: 'include' })
    return response.ok ? ((await response.json()) as { recipients: number; status: Status }) : null
  }, [id])

  const apply = (data: { recipients: number; status: Status } | null) => {
    if (!data) return
    setRecipients(data.recipients)
    setStatus(data.status)
  }

  useEffect(() => {
    let active = true
    load().then((data) => active && apply(data))
    return () => {
      active = false
    }
  }, [load])

  if (!id) return <p style={{ marginBottom: 24 }}>{t.saveFirst}</p>

  async function test() {
    setBusy(true)
    setMessage(null)
    const response = await fetch(`/api/newsletters/${id}/test?locale=${locale.code}`, {
      method: 'POST',
      credentials: 'include',
    })
    const data = await response.json().catch(() => ({}))
    setMessage(response.ok ? t.testDone(data.to) : `${t.error}: ${data.error ?? response.status}`)
    setBusy(false)
  }

  async function send() {
    if (recipients === null || !window.confirm(t.confirm(recipients))) return
    setBusy(true)
    setMessage(t.sending)
    const response = await fetch(`/api/newsletters/${id}/send`, {
      method: 'POST',
      credentials: 'include',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(`${t.error}: ${data.error ?? response.status}`)
    else setMessage(data.done ? t.sent : t.resume)
    setBusy(false)
    apply(await load())
  }

  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 8,
      }}
    >
      <h4 style={{ margin: '0 0 8px' }}>{t.title}</h4>
      {recipients !== null && (
        <p style={{ margin: '0 0 12px', fontSize: 13 }}>{t.recipients(recipients)}</p>
      )}
      {status === 'sending' && <p style={{ fontSize: 13 }}>{t.resume}</p>}
      {status === 'failed' && <p style={{ fontSize: 13 }}>{t.failed}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button buttonStyle="secondary" size="small" onClick={test} disabled={busy}>
          {t.test}
        </Button>
        {canSend && status === 'draft' && (
          <Button buttonStyle="primary" size="small" onClick={send} disabled={busy || !recipients}>
            {t.send}
          </Button>
        )}
      </div>
      {!canSend && <p style={{ fontSize: 12, marginTop: 8 }}>{t.onlyTest}</p>}
      {message && (
        <p role="status" style={{ fontSize: 13, marginTop: 12 }}>
          {message}
        </p>
      )}
    </div>
  )
}
