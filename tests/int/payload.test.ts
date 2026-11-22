import { describe, expect, it } from 'vitest'

import { getTestPayload } from '../helpers/payload'

describe('payload', () => {
  it('connects to the test database', async () => {
    const payload = await getTestPayload()
    const users = await payload.find({ collection: 'users', limit: 1 })
    expect(users.docs).toBeDefined()
  })

  it('has en and de as content locales with crossed fallbacks', async () => {
    const payload = await getTestPayload()
    const localization = payload.config.localization
    if (!localization) throw new Error('localization missing')
    expect(localization.defaultLocale).toBe('en')
    const fallbacks = Object.fromEntries(
      localization.locales.map((l) => [l.code, l.fallbackLocale]),
    )
    expect(fallbacks).toEqual({ en: 'de', de: 'en' })
  })

  it('uses German as the default admin language', async () => {
    const payload = await getTestPayload()
    expect(payload.config.i18n.fallbackLanguage).toBe('de')
  })
})
