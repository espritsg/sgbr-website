import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import { describe, expect, it } from 'vitest'

import { legacyRedirects } from '@/lib/redirects/legacy'

type Rule = ReturnType<typeof legacyRedirects>[number]
type Condition = { type: string; key?: string; value?: string }

/** Evaluates the redirect list like Next.js: first matching rule wins, has/missing on the query. */
function resolve(url: string): string | null {
  const parsed = new URL(url, 'https://example.com')
  const query = Object.fromEntries(parsed.searchParams)
  for (const rule of legacyRedirects() as Array<
    Rule & { has?: Condition[]; missing?: Condition[] }
  >) {
    const params = getPathMatch(rule.source, { removeUnnamedParams: true })(parsed.pathname)
    if (!params) continue
    const captured: Record<string, string> = {}
    const hasAll = (rule.has ?? []).every((condition) => {
      const value = query[condition.key ?? '']
      if (value === undefined) return false
      if (!condition.value) return true
      const match = new RegExp(`^${condition.value}$`).exec(value)
      Object.assign(captured, match?.groups ?? {})
      return Boolean(match)
    })
    const missingAll = (rule.missing ?? []).every(
      (condition) => query[condition.key ?? ''] === undefined,
    )
    if (!hasAll || !missingAll) continue
    const values = { ...params, ...captured } as Record<string, string | string[]>
    return rule.destination.replace(/:(\w+)\*?/g, (_, name) => {
      const value = values[name]
      return Array.isArray(value) ? value.join('/') : (value ?? '')
    })
  }
  return null
}

describe('legacy redirects', () => {
  it.each([
    ['/tennet-deal-lazard-insight/', '/en/article/tennet-deal-lazard-insight'],
    ['/management-ist-ein-kreativjob', '/en/article/management-ist-ein-kreativjob'],
    ['/issues-of-our-time/', '/en/article/issues-of-our-time'],
    ['/category/business/', '/en/topics/business'],
    ['/category/leadership/page/3/', '/en/topics/leadership'],
    ['/category/uncategorized/', '/en/topics'],
    ['/category/unknown-category/', '/en/topics'],
    ['/category/vc-pe-family-offices/', '/en/issues/vc-pe-family-offices'],
    ['/category/the-future-of-finance/', '/en/issues/the-future-of-finance'],
    ['/category/speaker-events/', '/en/events'],
    ['/category/speaker-events/?e=weimer', '/en/events/weimer'],
    ['/issues/', '/en/issues'],
    ['/tag/finance/', '/en/topics'],
    ['/author/mark-branson/', '/en/people/mark-branson'],
    ['/the-future-of-finance/', '/en/issues/the-future-of-finance'],
    ['/about/', '/en/about'],
    ['/contact/', '/en/contact'],
    ['/impressum/', '/en/imprint'],
    ['/Impressum/', '/en/imprint'],
    ['/unsubscribe/', '/en/newsletter'],
    ['/manage-your-subscription/', '/en/newsletter'],
    ['/feed/', '/en/feed.xml'],
    ['/?s=bank', '/en/search?q=bank'],
  ])('%s → %s', (from, to) => {
    expect(resolve(from)).toBe(to)
  })

  it.each([
    '/issues/?sgbr_feed=1',
    '/issues?sgbr_feed=1',
    '/category/speaker-events/?sgbr_feed=1',
    '/category/speaker-events?sgbr_feed=1',
  ])('lets the espritsg.ch feed %s through', (url) => {
    expect(resolve(url)).toBeNull()
  })

  it.each([
    '/en',
    '/de/article/x',
    '/admin',
    '/api/posts',
    '/files/a.pdf',
    '/wp-content/uploads/2026/08/a.pdf',
    '/next/preview',
    '/sitemap.xml',
    '/robots.txt',
    '/',
  ])('leaves new routes alone: %s', (url) => {
    expect(resolve(url)).toBeNull()
  })

  it('uses permanent redirects only', () => {
    expect(legacyRedirects().every((rule) => rule.permanent)).toBe(true)
  })
})
