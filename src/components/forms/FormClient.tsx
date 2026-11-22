'use client'

import { useTranslations } from 'next-intl'
import { useId, useState, type ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import { countries } from './countries'

export type FormField = {
  blockType:
    | 'text'
    | 'email'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'number'
    | 'country'
    | 'message'
    | 'upload'
  name?: string
  label?: string | null
  required?: boolean | null
  width?: number | null
  defaultValue?: unknown
  placeholder?: string | null
  options?: Array<{ label: string; value: string }> | null
  message?: unknown
  mimeTypes?: Array<{ mimeType: string }> | null
  maxFileSize?: number | null
  multiple?: boolean | null
}

type Props = {
  formId: number
  eventId?: number
  fields: FormField[]
  submitLabel?: string
  confirmationType: 'message' | 'redirect'
  redirectUrl?: string
  confirmation: ReactNode
  messages: Record<string, ReactNode>
}

type State = 'idle' | 'sending' | 'done' | 'error' | 'limited'

const inputClass = 'w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-text'

export function FormClient({
  formId,
  eventId,
  fields,
  submitLabel,
  confirmationType,
  redirectUrl,
  confirmation,
  messages,
}: Props) {
  const t = useTranslations('forms')
  const id = useId()
  const [state, setState] = useState<State>('idle')
  const [fileError, setFileError] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = new FormData()
    const submissionData: Array<{ field: string; value: string }> = []

    for (const field of fields) {
      if (!field.name || field.blockType === 'message') continue
      if (field.blockType === 'upload') {
        for (const file of data.getAll(field.name)) {
          if (!(file instanceof File) || file.size === 0) continue
          if (field.maxFileSize && file.size > field.maxFileSize)
            return setFileError(t('fileTooLarge'))
          if (file.type !== 'application/pdf') return setFileError(t('fileWrongType'))
          body.append(field.name, file)
        }
        continue
      }
      const value =
        field.blockType === 'checkbox'
          ? data.get(field.name) === 'on'
            ? 'true'
            : 'false'
          : (data.get(field.name)?.toString() ?? '')
      submissionData.push({ field: field.name, value })
    }
    setFileError(null)
    body.append(
      '_payload',
      JSON.stringify({
        form: formId,
        event: eventId,
        submissionData,
        honeypot: data.get('website')?.toString() ?? '',
      }),
    )

    setState('sending')
    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        body,
        credentials: 'omit',
      })
      if (response.status === 429) return setState('limited')
      if (!response.ok) return setState('error')
      if (confirmationType === 'redirect' && redirectUrl) {
        window.location.href = redirectUrl
        return
      }
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="rounded-card border border-line bg-surface p-6">
        {confirmation}
      </div>
    )
  }

  let messageIndex = 0
  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-4">
      {fields.map((field, index) => {
        const key = `${field.blockType}-${field.name ?? index}`
        const half = field.width && field.width <= 50
        const wrapper = `col-span-2 ${half ? 'sm:col-span-1' : ''}`
        const fieldId = `${id}-${field.name}`
        const label = (
          <label htmlFor={fieldId} className="mb-1 block text-sm font-medium">
            {field.label}
            {field.required && <span className="text-accent"> *</span>}
          </label>
        )
        switch (field.blockType) {
          case 'message':
            return (
              <div key={key} className="col-span-2">
                {messages[`message-${messageIndex++}`]}
              </div>
            )
          case 'textarea':
            return (
              <div key={key} className={wrapper}>
                {label}
                <textarea
                  id={fieldId}
                  name={field.name}
                  required={Boolean(field.required)}
                  rows={6}
                  className={inputClass}
                />
              </div>
            )
          case 'select':
            return (
              <div key={key} className={wrapper}>
                {label}
                <select
                  id={fieldId}
                  name={field.name}
                  required={Boolean(field.required)}
                  className={inputClass}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {field.placeholder || '—'}
                  </option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          case 'country':
            return (
              <div key={key} className={wrapper}>
                {label}
                <select
                  id={fieldId}
                  name={field.name}
                  required={Boolean(field.required)}
                  className={inputClass}
                  defaultValue=""
                >
                  <option value="" disabled>
                    —
                  </option>
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          case 'checkbox':
            return (
              <label key={key} className="col-span-2 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name={field.name}
                  required={Boolean(field.required)}
                  className="mt-0.5 size-4 shrink-0 accent-accent"
                />
                <span>
                  {field.label}
                  {field.required && <span className="text-accent"> *</span>}
                </span>
              </label>
            )
          case 'upload':
            return (
              <div key={key} className="col-span-2">
                {label}
                <input
                  id={fieldId}
                  name={field.name}
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple={Boolean(field.multiple)}
                  required={Boolean(field.required)}
                  className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent"
                />
                <p className="mt-1 text-xs text-muted">{t('fileHint')}</p>
              </div>
            )
          default:
            return (
              <div key={key} className={wrapper}>
                {label}
                <input
                  id={fieldId}
                  name={field.name}
                  type={
                    field.blockType === 'email'
                      ? 'email'
                      : field.blockType === 'number'
                        ? 'number'
                        : 'text'
                  }
                  required={Boolean(field.required)}
                  autoComplete={field.blockType === 'email' ? 'email' : undefined}
                  className={inputClass}
                />
              </div>
            )
        }
      })}
      {/* Honeypot: invisible to people, bots fill it in (docs/formulare.md). */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="col-span-2 text-xs text-muted">
        {t.rich('privacy', {
          link: (chunks) => (
            <Link href="/privacy" className="underline hover:text-text">
              {chunks}
            </Link>
          ),
        })}
      </p>
      {fileError && (
        <p role="alert" className="col-span-2 text-sm text-red-700 dark:text-red-300">
          {fileError}
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="col-span-2 text-sm text-red-700 dark:text-red-300">
          {t('error')}
        </p>
      )}
      {state === 'limited' && (
        <p role="alert" className="col-span-2 text-sm text-red-700 dark:text-red-300">
          {t('tooManyRequests')}
        </p>
      )}
      <div className="col-span-2">
        <button
          type="submit"
          disabled={state === 'sending'}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          {state === 'sending' ? t('submitting') : submitLabel || t('submit')}
        </button>
      </div>
    </form>
  )
}
