import type { Field, Tab } from 'payload'
import { describe, expect, it } from 'vitest'

import { Events } from '@/collections/events'
import { Issues } from '@/collections/issues'
import { Pages } from '@/collections/pages'
import { Posts } from '@/collections/posts'

function tabsOf(fields: Field[]): Tab[] {
  const tabs = fields.find((field) => field.type === 'tabs')
  return tabs && tabs.type === 'tabs' ? tabs.tabs : []
}

describe('admin layout', () => {
  it.each([
    ['posts', Posts],
    ['pages', Pages],
    ['issues', Issues],
    ['events', Events],
  ])('%s has SEO as its own last tab with the localized meta group', (_, collection) => {
    const tabs = tabsOf(collection.fields)
    const seo = tabs.at(-1)!
    expect(seo.label).toBe('SEO')
    const meta = seo.fields.find((field) => 'name' in field && field.name === 'meta')
    expect(meta).toMatchObject({ type: 'group', localized: true })
    // No SEO fields outside the tab.
    expect(collection.fields.some((field) => 'name' in field && field.name === 'meta')).toBe(false)
  })

  it('posts have the tabs content, relations, SEO', () => {
    expect(
      tabsOf(Posts.fields).map((tab) =>
        typeof tab.label === 'string' ? tab.label : (tab.label as { de: string }).de,
      ),
    ).toEqual(['Inhalt', 'Zuordnung', 'SEO'])
  })
})
