'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { Link } from '@/i18n/navigation'

import { Checkbox, ChoiceTile, fieldClass, TextInput } from '../forms/fields'
import { Button } from '../ui/Button'
import { CheckCircle } from '../ui/icons'

type Props = {
  source: 'footer' | 'popup' | 'newsletter-page'
  /** inline: one line (footer); full: newsletter page; compact: popup. */
  variant?: 'inline' | 'full' | 'compact'
  onDone?: () => void
}

type State = 'idle' | 'sending' | 'done' | 'error' | 'limited'

/** Animated check mark for the success message. */
export function SuccessMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border-l-2 border-accent py-1 pl-4 [animation:sgbr-fade-in_300ms_var(--ease-out-soft)]"
    >
      <CheckCircle
        aria-hidden
        weight="fill"
        className="mt-0.5 size-5 shrink-0 text-accent [animation:sgbr-pop_420ms_120ms_var(--ease-out-soft)_both]"
      />
      <p className="text-sm leading-relaxed text-text">{children}</p>
    </div>
  )
}

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
    const interests = form.getAll('interests')
    setState('sending')
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          firstName: form.get('firstName') || undefined,
          interests: interests.length ? interests : ['newsletter'],
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

  if (state === 'done') return <SuccessMessage>{t('success')}</SuccessMessage>

  const consent = (
    <Checkbox name="consent" required className="text-muted">
      {t.rich('consent', {
        link: (chunks) => (
          <Link href="/privacy" className="underline underline-offset-2 hover:text-text">
            {chunks}
          </Link>
        ),
      })}
    </Checkbox>
  )
  const honeypot = (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={`${id}-website`}>Website</label>
      <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  )
  const messages = (
    <>
      {state === 'error' && (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      )}
      {state === 'limited' && (
        <p role="alert" className="text-sm text-danger">
          {tForms('tooManyRequests')}
        </p>
      )}
    </>
  )

  if (variant === 'inline') {
    // Field and button side by side, same height, with a gap.
    return (
      <form onSubmit={submit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <label htmlFor={`${id}-email`} className="sr-only">
            {t('email')}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={t('email')}
            className={`${fieldClass} h-12 py-0 sm:flex-1`}
          />
          <input type="hidden" name="interests" value="newsletter" />
          <Button type="submit" loading={state === 'sending'} className="h-12 py-0 sm:px-8">
            {t('submit')}
          </Button>
        </div>
        {honeypot}
        {/* Consent spans the full row, from the field to the end of the button. */}
        <div className="text-left text-xs">{consent}</div>
        {messages}
      </form>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className={variant === 'full' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
        <TextInput name="email" type="email" required autoComplete="email" label={t('email')} />
        {variant === 'full' && (
          <TextInput name="firstName" autoComplete="given-name" label={t('firstName')} />
        )}
      </div>
      <fieldset>
        <legend className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">
          {t('interests')}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceTile
            name="interests"
            value="newsletter"
            defaultChecked
            title={t('interestNewsletter')}
            description={t('interestNewsletterText')}
          />
          <ChoiceTile
            name="interests"
            value="events"
            title={t('interestEvents')}
            description={t('interestEventsText')}
          />
        </div>
      </fieldset>
      {honeypot}
      {consent}
      <Button
        type="submit"
        loading={state === 'sending'}
        className={variant === 'full' ? 'h-12 w-full' : ''}
      >
        {state === 'sending' ? t('submitting') : t('submit')}
      </Button>
      {messages}
    </form>
  )
}
