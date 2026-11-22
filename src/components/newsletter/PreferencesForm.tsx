'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

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
  const [state, setState] = useState<'idle' | 'saved' | 'unsubscribed' | 'error'>(
    unsubscribed ? 'unsubscribed' : 'idle',
  )

  async function post(body: Record<string, unknown>) {
    const response = await fetch('/api/newsletter/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...body }),
    })
    return response.ok
  }

  if (state === 'unsubscribed')
    return (
      <p role="status" className="rounded-card bg-band p-5">
        {t('unsubscribed')}
      </p>
    )

  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={async (event) => {
        event.preventDefault()
        const selected = new FormData(event.currentTarget).getAll('interests')
        setState((await post({ interests: selected })) ? 'saved' : 'error')
      }}
    >
      <fieldset className="space-y-3">
        <legend className="mb-2 font-medium">{t('interests')}</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="interests"
            value="newsletter"
            defaultChecked={interests.includes('newsletter')}
            className="size-4 accent-accent"
          />
          {t('interestNewsletter')}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="interests"
            value="events"
            defaultChecked={interests.includes('events')}
            className="size-4 accent-accent"
          />
          {t('interestEvents')}
        </label>
      </fieldset>
      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={async () =>
            setState((await post({ unsubscribe: true })) ? 'unsubscribed' : 'error')
          }
          className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold hover:border-accent"
        >
          {t('unsubscribe')}
        </button>
      </div>
      {state === 'saved' && (
        <p role="status" className="text-sm text-muted">
          {t('saved')}
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {t('error')}
        </p>
      )}
    </form>
  )
}
