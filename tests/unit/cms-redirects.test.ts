import { describe, expect, it } from 'vitest'

import { normalizePath, redirectTarget } from '@/lib/data/cmsRedirects'
import type { Redirect } from '@/payload-types'

describe('CMS redirects', () => {
  it('normalizes paths', () => {
    expect(normalizePath('/a/b/')).toBe('/a/b')
    expect(normalizePath('a')).toBe('/a')
    expect(normalizePath('/')).toBe('/')
  })

  it('resolves custom URLs and references', () => {
    const custom = { id: 1, from: '/x', to: { type: 'custom', url: '/en/issues' } } as Redirect
    expect(redirectTarget(custom, 'en')).toBe('/en/issues')
    const reference = {
      id: 2,
      from: '/y',
      to: {
        type: 'reference',
        reference: { relationTo: 'posts', value: { id: 5, slug: 'an-article' } },
      },
    } as unknown as Redirect
    expect(redirectTarget(reference, 'de')).toBe('/de/article/an-article')
  })
})
