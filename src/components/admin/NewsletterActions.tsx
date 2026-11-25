'use client'

import { Button, useAuth, useDocumentInfo, useLocale, useTranslation } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

type Status = 'draft' | 'sent' | 'failed'
type Info = { recipients: number | null; status: Status; error?: string }

const texts = {
  de: {
    title: 'Versand',
    saveFirst: 'Bitte zuerst speichern.',
    recipients: (n: number) =>
      `Höchstens ${n} Empfänger (Resend schickt nur an Kontakte mit passendem Thema)`,
    test: 'Testversand an mich',
    testDone: (to: string) => `Testversand an ${to} verschickt.`,
    send: 'Senden',
    confirm: (n: number) =>
      `Newsletter jetzt an höchstens ${n} Empfänger senden? Das lässt sich nicht rückgängig machen.`,
    sending: 'Wird an Resend übergeben …',
    sent: 'An Resend übergeben. Zustellung und Statistik siehe Resend.',
    failed:
      'Versand fehlgeschlagen (Details im Reiter „Versand“ unter Resend). Erneut senden schickt nur, was noch fehlt.',
    retry: 'Erneut senden',
    error: 'Fehler',
    onlyTest: 'Senden dürfen nur Admin und Editorial Board.',
  },
  en: {
    title: 'Sending',
    saveFirst: 'Please save first.',
    recipients: (n: number) => `At most ${n} recipients (Resend only sends to matching topics)`,
    test: 'Send test to me',
    testDone: (to: string) => `Test sent to ${to}.`,
    send: 'Send',
    confirm: (n: number) =>
      `Send this newsletter to at most ${n} recipients now? This cannot be undone.`,
    sending: 'Handing over to Resend …',
    sent: 'Handed over to Resend. Delivery and statistics: see Resend.',
    failed:
      'Sending failed (details in the "Sending" tab under Resend). Sending again only sends what is missing.',
    retry: 'Send again',
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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('draft')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!id) return null
    const response = await fetch(`/api/newsletters/${id}/recipients`, { credentials: 'include' })
    return response.ok ? ((await response.json()) as Info) : null
  }, [id])

  const apply = (data: Info | null) => {
    if (!data) return
    setRecipients(data.recipients)
    setStatus(data.status)
    setLoadError(data.error ?? null)
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
    else setMessage(t.sent)
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
      {loadError && <p style={{ fontSize: 13 }}>{loadError}</p>}
      {status === 'failed' && <p style={{ fontSize: 13 }}>{t.failed}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button buttonStyle="secondary" size="small" onClick={test} disabled={busy}>
          {t.test}
        </Button>
        {canSend && status !== 'sent' && (
          <Button buttonStyle="primary" size="small" onClick={send} disabled={busy || !recipients}>
            {status === 'failed' ? t.retry : t.send}
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
