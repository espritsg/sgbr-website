import { describe, expect, it } from 'vitest'

import { canRunJobs } from '@/access/permissions'
import { looksLikePdf } from '@/collections/application-files/assertPdf'
import { archiveVisibleFrom } from '@/collections/newsletters/hooks'
import { slugify } from '@/lib/slugify'

describe('slugify', () => {
  it('creates URL-safe slugs', () => {
    expect(slugify('VC, PE & Family Offices')).toBe('vc-pe-and-family-offices')
    expect(slugify('Über die Zukunft der Straße')).toBe('uber-die-zukunft-der-strasse')
    expect(slugify('  --Hello   World--  ')).toBe('hello-world')
  })
})

describe('archiveVisibleFrom', () => {
  it('adds the delay to the sending date', () => {
    expect(archiveVisibleFrom('2026-12-01T08:00:00.000Z', 30)).toBe('2026-12-31T08:00:00.000Z')
  })
  it('0 days means immediately', () => {
    expect(archiveVisibleFrom('2026-12-01T08:00:00.000Z', 0)).toBe('2026-12-01T08:00:00.000Z')
  })
  it('defaults to 30 days and returns null before sending', () => {
    expect(archiveVisibleFrom('2026-12-01T08:00:00.000Z', null)).toBe('2026-12-31T08:00:00.000Z')
    expect(archiveVisibleFrom(null, 30)).toBeNull()
  })
})

describe('looksLikePdf', () => {
  it('checks the file signature, not the name', () => {
    expect(looksLikePdf(Buffer.from('%PDF-1.7\n...'))).toBe(true)
    expect(looksLikePdf(Buffer.from('GIF89a'))).toBe(false)
    expect(looksLikePdf(undefined)).toBe(false)
  })
})

describe('canRunJobs', () => {
  const req = (headers: Record<string, string>, user?: unknown) => ({
    user,
    headers: new Headers(headers),
  })

  it('accepts the cron secret and admins only', () => {
    process.env.CRON_SECRET = 'secret-123'
    expect(canRunJobs({ req: req({ authorization: 'Bearer secret-123' }) })).toBe(true)
    expect(canRunJobs({ req: req({ authorization: 'Bearer wrong' }) })).toBe(false)
    expect(canRunJobs({ req: req({}, { role: 'admin', collection: 'users' }) })).toBe(true)
    expect(canRunJobs({ req: req({}, { role: 'board', collection: 'users' }) })).toBe(false)
  })

  it('rejects everything without CRON_SECRET except admins', () => {
    delete process.env.CRON_SECRET
    expect(canRunJobs({ req: req({ authorization: 'Bearer ' }) })).toBe(false)
  })
})
