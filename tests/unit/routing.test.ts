import { describe, expect, it } from 'vitest'

import { defaultLocale, isAppLocale, locales, routing } from '@/i18n/routing'

describe('locale routing', () => {
  it('uses en and de with en as default', () => {
    expect(locales).toEqual(['en', 'de'])
    expect(defaultLocale).toBe('en')
  })

  it('always prefixes the locale', () => {
    expect(routing.localePrefix).toBe('always')
  })

  it('recognises valid locales only', () => {
    expect(isAppLocale('de')).toBe(true)
    expect(isAppLocale('es')).toBe(false)
    expect(isAppLocale(undefined)).toBe(false)
  })
})
