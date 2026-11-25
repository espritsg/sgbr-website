import type { TaskConfig } from 'payload'

import { purgeExpiredSubmissions } from '@/lib/forms/retention'
import { runDueNewsletters } from '@/lib/newsletter/sending'
import { purgeRateLimits } from '@/lib/rateLimit'

const JOB_LOG_DAYS = 90

/**
 * Everything that runs once a day (docs/architektur.md). The output is kept in the
 * job (collection payload-jobs) as a log of what was done.
 */
export const dailyMaintenanceTask: TaskConfig<{
  input: Record<string, never>
  output: {
    newslettersSent: number
    submissionsDeleted: number
    applicationFilesDeleted: number
    rateLimitEntriesDeleted: number
    oldJobsDeleted: number
  }
}> = {
  slug: 'dailyMaintenance',
  label: 'Tägliche Wartung',
  retries: 1,
  inputSchema: [],
  outputSchema: [
    { name: 'newslettersSent', type: 'number' },
    { name: 'submissionsDeleted', type: 'number' },
    { name: 'applicationFilesDeleted', type: 'number' },
    { name: 'rateLimitEntriesDeleted', type: 'number' },
    { name: 'oldJobsDeleted', type: 'number' },
  ],
  handler: async ({ req }) => {
    const { payload } = req
    const newslettersSent = await runDueNewsletters(payload)
    const submissions = await purgeExpiredSubmissions(payload)
    const rateLimits = await purgeRateLimits(payload)
    const before = new Date(Date.now() - JOB_LOG_DAYS * 86400_000).toISOString()
    const oldJobs = await payload.delete({
      collection: 'payload-jobs',
      where: { and: [{ completedAt: { less_than: before } }] },
    })
    const output = {
      newslettersSent,
      submissionsDeleted: submissions.submissions,
      applicationFilesDeleted: submissions.files,
      rateLimitEntriesDeleted: rateLimits,
      oldJobsDeleted: oldJobs.docs.length,
    }
    payload.logger.info({ msg: 'Daily maintenance done', ...output })
    return { output }
  },
}
