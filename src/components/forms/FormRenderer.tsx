import type { Form } from '@/payload-types'

import { RichText } from '../richtext/RichText'
import { FormClient, type FormField } from './FormClient'

/**
 * Renders a form from the form builder (docs/formulare.md). The server part renders
 * rich texts (confirmation, notes); the client part handles input and sending.
 */
export function FormRenderer({ form, eventId }: { form: Form; eventId?: number }) {
  const fields = (form.fields ?? []) as unknown as FormField[]
  const messages = Object.fromEntries(
    fields
      .filter((field) => field.blockType === 'message')
      .map((field, index) => [
        `message-${index}`,
        <RichText
          key={index}
          data={field.message}
          className="prose max-w-none text-text dark:prose-invert"
        />,
      ]),
  )
  return (
    <FormClient
      formId={form.id}
      eventId={eventId}
      fields={fields}
      submitLabel={form.submitButtonLabel ?? undefined}
      confirmationType={form.confirmationType ?? 'message'}
      redirectUrl={form.redirect?.url ?? undefined}
      confirmation={
        <RichText
          data={form.confirmationMessage}
          className="prose max-w-none text-text dark:prose-invert"
        />
      }
      messages={messages}
    />
  )
}
