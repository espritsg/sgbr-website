import type { Endpoint } from 'payload'

import { runDailyJobs } from '@/jobs/runJobs'

/** GET /api/cron/run-jobs, called once a day by Vercel Cron with `Authorization: Bearer $CRON_SECRET`. */
export const cronEndpoint: Endpoint = {
  path: '/cron/run-jobs',
  method: 'get',
  handler: async (req) => {
    const secret = process.env.CRON_SECRET
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return Response.json({ ok: false }, { status: 401 })
    }
    const result = await runDailyJobs(req.payload)
    return Response.json({ ok: true, result })
  },
}
