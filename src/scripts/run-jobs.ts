/**
 * Runs the daily jobs once by hand: npm run jobs
 * (daily maintenance plus all due jobs like scheduled publishing).
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { runDailyJobs } from '@/jobs/runJobs'

const payload = await getPayload({ config })
const result = await runDailyJobs(payload)
console.log(JSON.stringify(result, null, 2))
process.exit(0)
