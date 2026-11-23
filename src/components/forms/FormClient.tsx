'use client'

import { useTranslations } from 'next-intl'
import { useId, useState, type ReactNode } from 'react'

import { Link } from '@/i18n/navigation'

import { Button } from '../ui/Button'
import { SuccessMessage } from '../newsletter/NewsletterSignup'
import { countries } from './countries'
import { Checkbox, FileDrop, SelectField, TextArea, TextInput } from './fields'

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

const DEFAULT_MAX_BYTES = 4 * 1024 * 1024

/** Renders a form from the form builder with the site's field components (docs/formulare.md). */
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

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const body = new FormData()
    const submissionData: Array<{ field: string; value: string }> = []

    for (const field of fields) {
      if (!field.name || field.blockType === 'message') continue
      if (field.blockType === 'upload') {
        for (const file of data.getAll(field.name)) {
          if (file instanceof File && file.size > 0) body.append(field.name, file)
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
        window.location.assign(redirectUrl)
        return
      }
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') return <SuccessMessage>{confirmation}</SuccessMessage>

  let messageIndex = 0
  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((field, index) => {
        const key = `${field.blockType}-${field.name ?? index}`
        const span = field.width && field.width <= 50 ? 'col-span-2 sm:col-span-1' : 'col-span-2'
        const common = {
          name: field.name,
          label: field.label ?? undefined,
          required: Boolean(field.required),
        }
        switch (field.blockType) {
          case 'message':
            return (
              <div key={key} className="col-span-2">
                {messages[`message-${messageIndex++}`]}
              </div>
            )
          case 'textarea':
            return <TextArea key={key} {...common} className={span} />
          case 'select':
            return (
              <SelectField
                key={key}
                {...common}
                options={field.options ?? []}
                placeholder={field.placeholder ?? t('choose')}
                className={span}
              />
            )
          case 'country':
            return (
              <SelectField
                key={key}
                {...common}
                options={countries}
                placeholder={t('choose')}
                className={span}
              />
            )
          case 'checkbox':
            return (
              <Checkbox
                key={key}
                name={field.name}
                required={Boolean(field.required)}
                className="col-span-2"
              >
                {field.label}
              </Checkbox>
            )
          case 'upload':
            return (
              <div key={key} className="col-span-2">
                <FileDrop
                  name={field.name ?? 'file'}
                  label={field.label ?? undefined}
                  required={Boolean(field.required)}
                  maxBytes={field.maxFileSize || DEFAULT_MAX_BYTES}
                  texts={{
                    choose: t('chooseFile'),
                    drop: t('dropFile'),
                    hint: t('fileHint'),
                    remove: t('removeFile'),
                    tooLarge: t('fileTooLarge'),
                    wrongType: t('fileWrongType'),
                  }}
                />
              </div>
            )
          default:
            return (
              <TextInput
                key={key}
                {...common}
                type={
                  field.blockType === 'email'
                    ? 'email'
                    : field.blockType === 'number'
                      ? 'number'
                      : 'text'
                }
                autoComplete={field.blockType === 'email' ? 'email' : undefined}
                className={span}
              />
            )
        }
      })}
      {/* Honeypot: invisible to people, bots fill it in (docs/formulare.md). */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="meta col-span-2">
        {t.rich('privacy', {
          link: (chunks) => (
            <Link href="/privacy" className="underline underline-offset-2 hover:text-text">
              {chunks}
            </Link>
          ),
        })}
      </p>
      {state === 'error' && (
        <p role="alert" className="col-span-2 text-sm text-danger">
          {t('error')}
        </p>
      )}
      {state === 'limited' && (
        <p role="alert" className="col-span-2 text-sm text-danger">
          {t('tooManyRequests')}
        </p>
      )}
      <div className="col-span-2">
        <Button type="submit" loading={state === 'sending'}>
          {state === 'sending' ? t('submitting') : submitLabel || t('submit')}
        </Button>
      </div>
    </form>
  )
}
