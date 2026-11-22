import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { cronEndpoint } from '@/endpoints/cron'
import { runDailyJobs } from '@/jobs/runJobs'

import { getTestPayload } from '../helpers/payload'

let payload: Payload

beforeAll(async () => {
  payload = await getTestPayload()
})

describe('daily jobs', () => {
  it('publishes scheduled articles that are due', async () => {
    const draft = await payload.create({
      collection: 'posts',
      draft: true,
      data: {
        title: 'Scheduled',
        slug: 'scheduled-post',
        summary: 'S',
        originalLanguage: 'en',
        type: 'interview',
        _status: 'draft',
      },
    })
    const topic = await payload.create({
      collection: 'topics',
      data: { title: 'Politics', slug: 'politics-jobs-test', _status: 'published' },
    })
    await payload.update({
      collection: 'posts',
      id: draft.id,
      draft: true,
      data: { topics: [topic.id] },
    })
    await payload.jobs.queue({
      task: 'schedulePublish',
      input: { type: 'publish', doc: { relationTo: 'posts', value: draft.id } },
      waitUntil: new Date(Date.now() - 60_000),
    })
    await runDailyJobs(payload)
    const after = await payload.findByID({ collection: 'posts', id: draft.id })
    expect(after._status).toBe('published')
  })

  it('logs the daily maintenance in the job', async () => {
    await runDailyJobs(payload)
    const jobs = await payload.find({
      collection: 'payload-jobs',
      where: { taskSlug: { equals: 'dailyMaintenance' } },
      sort: '-createdAt',
      limit: 1,
    })
    const job = jobs.docs[0] as unknown as {
      completedAt?: string
      log?: Array<{ output?: Record<string, number> }>
    }
    expect(job.completedAt).toBeTruthy()
    expect(job.log?.at(-1)?.output).toHaveProperty('unconfirmedSubscribersDeleted')
  })
})

describe('cron endpoint', () => {
  const call = (authorization?: string) =>
    cronEndpoint.handler({
      payload,
      headers: new Headers(authorization ? { authorization } : {}),
    } as never) as Promise<Response>

  it('needs the cron secret', async () => {
    process.env.CRON_SECRET = 'cron-test-secret'
    expect((await call()).status).toBe(401)
    expect((await call('Bearer wrong')).status).toBe(401)
    expect((await call('Bearer cron-test-secret')).status).toBe(200)
    process.env.CRON_SECRET = ''
    expect((await call('Bearer ')).status).toBe(401)
  })
})
