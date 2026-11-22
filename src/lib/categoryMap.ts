/**
 * Mapping of the 38 old WordPress categories to the new topics (docs/migration.md).
 * Proposed during the rebuild; the editorial team confirms it on the draft site.
 * Used by the dev import, the final migration and the redirects in next.config.ts.
 */

export type MainTopicSlug = 'business' | 'entrepreneurship' | 'finance-economics' | 'politics'

export type CategoryTarget =
  | { kind: 'main'; topic: MainTopicSlug }
  | { kind: 'sub'; topic: string; title: string; parent: MainTopicSlug }
  | { kind: 'issue'; issue: string; impliesTopic?: MainTopicSlug }
  | { kind: 'events' }
  | { kind: 'drop' }

export const mainTopics: Array<{
  slug: MainTopicSlug
  title: { en: string; de: string }
  order: number
}> = [
  { slug: 'business', title: { en: 'Business', de: 'Business' }, order: 10 },
  {
    slug: 'entrepreneurship',
    title: { en: 'Entrepreneurship', de: 'Entrepreneurship' },
    order: 20,
  },
  {
    slug: 'finance-economics',
    title: { en: 'Finance & Economics', de: 'Finance & Economics' },
    order: 30,
  },
  { slug: 'politics', title: { en: 'Politics', de: 'Politics' }, order: 40 },
]

const sub = (topic: string, title: string, parent: MainTopicSlug): CategoryTarget => ({
  kind: 'sub',
  topic,
  title,
  parent,
})

/** Old category slug → new target. */
export const categoryMap: Record<string, CategoryTarget> = {
  business: { kind: 'main', topic: 'business' },
  entrepreneurship: { kind: 'main', topic: 'entrepreneurship' },
  'finance-economics': { kind: 'main', topic: 'finance-economics' },
  politics: { kind: 'main', topic: 'politics' },

  leadership: sub('leadership', 'Leadership', 'business'),
  strategy: sub('strategy', 'Strategy', 'business'),
  technology: sub('technology', 'Technology', 'business'),
  digitalization: sub('digitalization', 'Digitalization', 'business'),
  data: sub('data', 'Data', 'business'),
  performance: sub('performance', 'Performance', 'business'),
  network: sub('network', 'Network', 'business'),
  sustainability: sub('sustainability', 'Sustainability', 'business'),
  tradition: sub('tradition', 'Tradition', 'business'),

  'role-models': sub('role-models', 'Role Models', 'entrepreneurship'),
  change: sub('change', 'Change', 'entrepreneurship'),
  individualism: sub('individualism', 'Individualism', 'entrepreneurship'),
  harmony: sub('harmony', 'Harmony', 'entrepreneurship'),
  art: sub('art', 'Art', 'entrepreneurship'),

  capital: sub('capital', 'Capital', 'finance-economics'),
  regulation: sub('regulation', 'Regulation', 'finance-economics'),

  security: sub('security', 'Security', 'politics'),
  education: sub('education', 'Education', 'politics'),
  health: sub('health', 'Health', 'politics'),
  science: sub('science', 'Science', 'politics'),
  nature: sub('nature', 'Nature', 'politics'),
  freedom: sub('freedom', 'Freedom', 'politics'),
  philosophy: sub('philosophy', 'Philosophy', 'politics'),
  philanthropy: sub('philanthropy', 'Philanthropy', 'politics'),

  // Issue categories also give their articles a main topic, so they can be published.
  'the-future-of-finance': {
    kind: 'issue',
    issue: 'the-future-of-finance',
    impliesTopic: 'finance-economics',
  },
  'vc-pe-family-offices': {
    kind: 'issue',
    issue: 'vc-pe-family-offices',
    impliesTopic: 'finance-economics',
  },
  'speaker-events': { kind: 'events' },

  // Not continued: technical leftovers of the old site.
  featured: { kind: 'drop' },
  world: { kind: 'drop' },
  uncategorized: { kind: 'drop' },
  'unkategorisiert-en': { kind: 'drop' },
  'unkategorisiert-it': { kind: 'drop' },
  'unkategorisiert-fr': { kind: 'drop' },
  'unkategorisiert-es': { kind: 'drop' },
}

/** New URL path (without locale) for an old category, used for redirects. */
export function categoryRedirectTarget(slug: string): string {
  const target = categoryMap[slug]
  if (!target) return '/topics'
  switch (target.kind) {
    case 'main':
      return `/topics/${target.topic}`
    case 'sub':
      return `/topics/${target.topic}`
    case 'issue':
      return `/issues/${target.issue}`
    case 'events':
      return '/events'
    case 'drop':
      return '/topics'
  }
}
