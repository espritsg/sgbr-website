import { afterEach, describe, expect, it } from 'vitest'

import { publicFileUrl, r2Config } from '@/lib/storage'

describe('Cloudflare R2 storage', () => {
  afterEach(() => {
    for (const name of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ENDPOINT'])
      delete process.env[name]
  })

  it('builds public URLs with encoded names', () => {
    expect(publicFileUrl('https://pub-x.r2.dev', 'Rising 2024.pdf')).toBe(
      'https://pub-x.r2.dev/Rising%202024.pdf',
    )
    expect(publicFileUrl('https://pub-x.r2.dev', 'a.jpg', 'sub')).toBe(
      'https://pub-x.r2.dev/sub/a.jpg',
    )
  })

  it('uses the EU endpoint and stays off without credentials', () => {
    expect(r2Config().enabled).toBe(false)
    process.env.R2_ACCOUNT_ID = 'abc'
    process.env.R2_ACCESS_KEY_ID = 'key'
    process.env.R2_SECRET_ACCESS_KEY = 'secret'
    expect(r2Config()).toMatchObject({
      enabled: true,
      endpoint: 'https://abc.eu.r2.cloudflarestorage.com',
      mediaBucket: 'sgbr-media',
      privateBucket: 'sgbr-privat',
    })
  })
})
