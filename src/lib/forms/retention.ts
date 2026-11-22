import type { Payload } from 'payload'

import { addMonths } from '@/lib/dates'

export type RetentionResult = { submissions: number; files: number; details: string[] }

type UploadRef = { relationTo?: string; value?: number | { id: number } }

function fileIds(submission: {
  submissionUploads?: Array<{ value?: UploadRef[] | null }> | null
}): number[] {
  return (submission.submissionUploads ?? [])
    .flatMap((entry) => entry.value ?? [])
    .filter((ref) => ref.relationTo === 'application-files')
    .map((ref) => (typeof ref.value === 'object' ? ref.value.id : ref.value))
    .filter((id): id is number => typeof id === 'number')
}

/**
 * Deletes submissions and their files after the retention period (docs/formulare.md):
 * `retentionMonths` of the form (default 6) after the event, or after the
 * submission date for forms without event. Returns a log of what was deleted.
 */
export async function purgeExpiredSubmissions(
  payload: Payload,
  now = new Date(),
): Promise<RetentionResult> {
  const result: RetentionResult = { submissions: 0, files: 0, details: [] }
  const forms = await payload.find({ collection: 'forms', limit: 0, depth: 0, pagination: false })

  for (const form of forms.docs) {
    const months = form.retentionMonths ?? 6
    // A submission is due if its reference date is before this cutoff.
    const cutoff = addMonths(now, -months).toISOString()
    let page = 1
    for (;;) {
      const submissions = await payload.find({
        collection: 'form-submissions',
        where: { form: { equals: form.id } },
        depth: 1,
        limit: 200,
        page,
      })
      for (const submission of submissions.docs) {
        const event = typeof submission.event === 'object' ? submission.event : null
        const referenceDate = event?.startsAt ?? submission.createdAt
        if (referenceDate >= cutoff) continue
        const files = fileIds(submission as never)
        await payload.delete({ collection: 'form-submissions', id: submission.id })
        for (const id of files) {
          await payload.delete({ collection: 'application-files', id }).catch(() => null)
        }
        result.submissions++
        result.files += files.length
      }
      if (!submissions.hasNextPage) break
      page++
    }
    if (result.submissions) result.details.push(`${form.title}: Frist ${months} Monate`)
  }
  return result
}
