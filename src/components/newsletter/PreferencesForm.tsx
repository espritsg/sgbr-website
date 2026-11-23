'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ChoiceTile } from '../forms/fields'
import { Button } from '../ui/Button'
import { SuccessMessage } from './NewsletterSignup'

export function PreferencesForm({
  token,
  interests,
  unsubscribed,
}: {
  token: string
  interests: string[]
  unsubscribed: boolean
}) {
  const t = useTranslations('newsletter')
  const [state, setState] = useState<'idle' | 'sending' | 'saved' | 'unsubscribed' | 'error'>(
    unsubscribed ? 'unsubscribed' : 'idle',
  )

  async function post(body: Record<string, unknown>) {
    setState('sending')
    const response = await fetch('/api/newsletter/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...body }),
    })
    return response.ok
  }

  if (state === 'unsubscribed') return <SuccessMessage>{t('unsubscribed')}</SuccessMessage>

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={async (event) => {
        event.preventDefault()
        const selected = new FormData(event.currentTarget).getAll('interests')
        setState((await post({ interests: selected })) ? 'saved' : 'error')
      }}
    >
      <fieldset>
        <legend className="mb-2 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-muted">
          {t('interests')}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceTile
            name="interests"
            value="newsletter"
            defaultChecked={interests.includes('newsletter')}
            title={t('interestNewsletter')}
            description={t('interestNewsletterText')}
          />
          <ChoiceTile
            name="interests"
            value="events"
            defaultChecked={interests.includes('events')}
            title={t('interestEvents')}
            description={t('interestEventsText')}
          />
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" loading={state === 'sending'}>
          {t('save')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={async () =>
            setState((await post({ unsubscribe: true })) ? 'unsubscribed' : 'error')
          }
        >
          {t('unsubscribe')}
        </Button>
      </div>
      {state === 'saved' && <SuccessMessage>{t('saved')}</SuccessMessage>}
      {state === 'error' && (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      )}
    </form>
  )
}
