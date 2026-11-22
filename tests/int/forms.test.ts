import fs from 'fs'
import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { guardSubmission } from '@/lib/forms/submissionGuard'
import { purgeExpiredSubmissions } from '@/lib/forms/retention'
import { plainTextToLexical } from '@/lib/richtext/plain'

import { getTestPayload } from '../helpers/payload'

let payload: Payload
let formId: number
let openEventId: number
let pastEventId: number
let speakerId: number
const pdf = fs.readFileSync('tests/fixtures/sample-cv.pdf')
const DAY = 86400_000

beforeAll(async () => {
  payload = await getTestPayload()
  const form = await payload.create({
    collection: 'forms',
    data: {
      title: 'Application test',
      confirmationType: 'message',
      confirmationMessage: plainTextToLexical('Thanks'),
      retentionMonths: 6,
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true },
        {
          blockType: 'upload',
          name: 'cv',
          label: 'CV',
          required: false,
          uploadCollection: 'application-files',
          mimeTypes: [{ mimeType: 'application/pdf' }],
        },
      ],
    },
  })
  formId = form.id
  speakerId = (
    await payload.create({
      collection: 'people',
      data: { name: 'Form Speaker', slug: 'form-speaker', _status: 'published' },
    })
  ).id
  openEventId = (
    await payload.create({
      collection: 'events',
      data: {
        slug: 'form-open',
        speaker: speakerId,
        startsAt: new Date(Date.now() + 10 * DAY).toISOString(),
        language: 'en',
        applicationForm: formId,
        applicationOpensAt: new Date(Date.now() - DAY).toISOString(),
        _status: 'published',
      },
    })
  ).id
  pastEventId = (
    await payload.create({
      collection: 'events',
      data: {
        slug: 'form-past',
        speaker: speakerId,
        startsAt: new Date(Date.now() - 200 * DAY).toISOString(),
        language: 'en',
        applicationForm: formId,
        _status: 'published',
      },
    })
  ).id
})

const restReq = (ip: string) =>
  ({ payload, payloadAPI: 'REST', headers: new Headers({ 'x-real-ip': ip }) }) as never
const guard = (data: Record<string, unknown>, ip = '203.0.113.200') =>
  guardSubmission({ args: { data }, operation: 'create', req: restReq(ip) } as never) as Promise<{
    data: Record<string, unknown>
  }>

describe('submission guard', () => {
  it('accepts an application while the window is open', async () => {
    const args = await guard({ form: formId, event: openEventId, honeypot: '', submissionData: [] })
    expect(args.data.event).toBe(openEventId)
    expect(args.data.honeypot).toBeUndefined()
  })

  it('rejects bots, closed events and events of another form', async () => {
    await expect(
      guard({ form: formId, honeypot: 'spam', submissionData: [] }, '203.0.113.201'),
    ).rejects.toMatchObject({ status: 400 })
    await expect(
      guard({ form: formId, event: pastEventId, submissionData: [] }, '203.0.113.202'),
    ).rejects.toMatchObject({ status: 400 })
    await expect(
      guard({ form: formId + 999, event: openEventId, submissionData: [] }, '203.0.113.203'),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('limits submissions per IP', async () => {
    for (let i = 0; i < 10; i++) await guard({ form: formId, submissionData: [] }, '203.0.113.250')
    await expect(
      guard({ form: formId, submissionData: [] }, '203.0.113.250'),
    ).rejects.toMatchObject({ status: 429 })
  })
})

describe('uploads', () => {
  it('stores the CV so that visitors cannot read it', async () => {
    const file = await payload.create({
      collection: 'application-files',
      data: {},
      file: { data: pdf, mimetype: 'application/pdf', name: 'cv.pdf', size: pdf.length },
    })
    await expect(
      payload.find({
        collection: 'application-files',
        overrideAccess: false,
        where: { id: { equals: file.id } },
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('rejects files that are not PDFs', async () => {
    const gif = Buffer.from('GIF89a........')
    await expect(
      payload.create({
        collection: 'application-files',
        data: {},
        file: { data: gif, mimetype: 'application/pdf', name: 'x.pdf', size: gif.length },
      }),
    ).rejects.toThrow()
  })
})

describe('retention', () => {
  it('deletes submissions and files 6 months after the event, keeps newer ones', async () => {
    const makeFile = () =>
      payload.create({
        collection: 'application-files',
        data: {},
        file: { data: pdf, mimetype: 'application/pdf', name: 'cv.pdf', size: pdf.length },
      })
    const oldFile = await makeFile()
    const newFile = await makeFile()
    // The plugin fills submissionUploads from the request files on create, so link afterwards.
    const submission = async (event: number | undefined, fileId: number) => {
      const doc = await payload.create({
        collection: 'form-submissions',
        data: { form: formId, event, submissionData: [{ field: 'name', value: 'Ada' }] },
      })
      return payload.update({
        collection: 'form-submissions',
        id: doc.id,
        data: {
          submissionUploads: [
            { field: 'cv', value: [{ relationTo: 'application-files', value: fileId }] },
          ],
        },
      })
    }
    const old = await submission(pastEventId, oldFile.id)
    const recent = await submission(openEventId, newFile.id)

    const result = await purgeExpiredSubmissions(payload)
    expect(result.submissions).toBeGreaterThanOrEqual(1)
    expect(result.files).toBeGreaterThanOrEqual(1)

    const exists = async (collection: 'form-submissions' | 'application-files', id: number) =>
      (await payload.find({ collection, where: { id: { equals: id } } })).totalDocs === 1
    expect(await exists('form-submissions', old.id)).toBe(false)
    expect(await exists('application-files', oldFile.id)).toBe(false)
    expect(await exists('form-submissions', recent.id)).toBe(true)
    expect(await exists('application-files', newFile.id)).toBe(true)
  })

  it('uses the submission date for forms without event', async () => {
    const recent = await payload.create({
      collection: 'form-submissions',
      data: { form: formId, submissionData: [{ field: 'name', value: 'Bo' }] },
    })
    const result = await purgeExpiredSubmissions(payload, new Date(Date.now() + 7 * 31 * DAY))
    expect(result.submissions).toBeGreaterThanOrEqual(1)
    expect(
      (await payload.find({ collection: 'form-submissions', where: { id: { equals: recent.id } } }))
        .totalDocs,
    ).toBe(0)
  })
})
