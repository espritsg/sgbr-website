import { APIError, type CollectionBeforeOperationHook } from 'payload'

import { applicationState } from '@/lib/events'
import { checkRateLimit, clientIp } from '@/lib/rateLimit'

/**
 * Protects public form submissions (docs/formulare.md):
 * - honeypot field filled → rejected
 * - at most 10 submissions per IP in 10 minutes
 * - an application may only reference an event whose application form is this
 *   form and whose application window is open
 * Runs before Payload validates and before uploads are stored.
 */
export const guardSubmission: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
  if (operation !== 'create') return args
  // Only requests from outside (REST, GraphQL) are checked; server code using the
  // Local API (imports, tests) is trusted.
  if (req.payloadAPI === 'local') return args

  const data = (args.data ?? {}) as Record<string, unknown>
  if (typeof data.honeypot === 'string' && data.honeypot.trim()) {
    throw new APIError('Submission rejected.', 400, undefined, true)
  }
  delete data.honeypot

  if (
    req.headers &&
    !(await checkRateLimit(req.payload, clientIp(req.headers), { purpose: 'form' }))
  ) {
    throw new APIError('Too many requests.', 429, undefined, true)
  }

  const formId = Number(
    typeof data.form === 'object' && data.form ? (data.form as { id: unknown }).id : data.form,
  )
  if (data.event !== undefined && data.event !== null && data.event !== '') {
    const eventId = Number(data.event)
    const event = Number.isInteger(eventId)
      ? await req.payload.findByID({
          collection: 'events',
          id: eventId,
          depth: 0,
          disableErrors: true,
        })
      : null
    const eventFormId = event
      ? typeof event.applicationForm === 'object'
        ? event.applicationForm?.id
        : event.applicationForm
      : null
    if (!event || eventFormId !== formId || applicationState(event).state !== 'open') {
      throw new APIError('Applications for this event are closed.', 400, undefined, true)
    }
    data.event = eventId
  } else {
    delete data.event
  }
  args.data = data
  return args
}
