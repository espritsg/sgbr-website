'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { Link } from '@/i18n/navigation'

type Props = {
  source: 'footer' | 'popup' | 'newsletter-page'
  variant?: 'full' | 'compact'
  onDone?: () => void
}

type State = 'idle' | 'sending' | 'done' | 'error' | 'limited'

/**
 * Newsletter signup with double opt-in (docs/newsletter.md). The response is the
 * same whether the address is new or known, so nobody learns who is subscribed.
 */
export function NewsletterSignup({ source, variant = 'full', onDone }: Props) {
  const t = useTranslations('newsletter')
  const tForms = useTranslations('forms')
  const locale = useLocale()
  const id = useId()
  const [state, setState] = useState<State>('idle')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setState('sending')
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          firstName: form.get('firstName') || undefined,
          interests: form.getAll('interests'),
          consent: form.get('consent') === 'on',
          website: form.get('website'),
          locale,
          source,
        }),
      })
      if (response.status === 429) return setState('limited')
      setState(response.ok ? 'done' : 'error')
      if (response.ok) onDone?.()
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p role="status" className="rounded-card bg-band p-5 text-text">
        {t('success')}
      </p>
    )
  }

  const compact = variant === 'compact'
  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false}>
      <div className={compact ? 'flex flex-col gap-3 sm:flex-row' : 'grid gap-3 sm:grid-cols-2'}>
        <div className="flex-1">
          <label htmlFor={`${id}-email`} className="mb-1 block text-sm font-medium">
            {t('email')}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-text"
          />
        </div>
        {!compact && (
          <div>
            <label htmlFor={`${id}-first`} className="mb-1 block text-sm font-medium">
              {t('firstName')}
            </label>
            <input
              id={`${id}-first`}
              name="firstName"
              type="text"
              autoComplete="given-name"
              className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-text"
            />
          </div>
        )}
      </div>
      {/* Honeypot: invisible to people, bots fill it in. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t('interests')}</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="interests"
              value="newsletter"
              defaultChecked
              className="size-4 accent-accent"
            />
            {t('interestNewsletter')}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="interests"
              value="events"
              className="size-4 accent-accent"
            />
            {t('interestEvents')}
          </label>
        </div>
      </fieldset>
      <label className="flex items-start gap-2 text-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-accent"
        />
        <span>
          {t.rich('consent', {
            link: (chunks) => (
              <Link href="/privacy" className="underline hover:text-text">
                {chunks}
              </Link>
            ),
          })}
        </span>
      </label>
      <button
        type="submit"
        disabled={state === 'sending'}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
      >
        {state === 'sending' ? t('submitting') : t('submit')}
      </button>
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {t('error')}
        </p>
      )}
      {state === 'limited' && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {tForms('tooManyRequests')}
        </p>
      )}
    </form>
  )
}
