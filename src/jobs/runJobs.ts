import type { Payload } from 'payload'

/**
 * What the daily Vercel Cron (and `npm run jobs`) does: queue the daily maintenance
 * and run all due jobs, including scheduled publishing (docs/architektur.md).
 */
export async function runDailyJobs(payload: Payload) {
  await payload.jobs.queue({ task: 'dailyMaintenance', input: {} })
  const result = await payload.jobs.run({ allQueues: true, limit: 200 })
  return result
}
