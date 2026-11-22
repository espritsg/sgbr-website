import type { CollectionConfig, Where } from 'payload'

import { contentAccess } from '@/access/permissions'
import { slugField } from '@/fields/slug'

import { contentVersions, magazineGroup } from '../shared'

/**
 * Topics. A topic without parent is a main topic (Business, Entrepreneurship,
 * Finance & Economics, Politics); the others are sub-topics used as filters.
 */
export const Topics: CollectionConfig = {
  slug: 'topics',
  labels: { singular: { de: 'Thema', en: 'Topic' }, plural: { de: 'Themen', en: 'Topics' } },
  access: contentAccess,
  admin: {
    group: magazineGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'order', '_status'],
  },
  defaultSort: 'order',
  versions: contentVersions(false),
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { de: 'Titel', en: 'Title' },
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: { de: 'Beschreibung', en: 'Description' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'topics',
      label: { de: 'Übergeordnetes Thema', en: 'Parent topic' },
      filterOptions: ({ id }) => {
        // Only main topics can be parents (two levels), and never the topic itself.
        const mainTopics: Where = { parent: { exists: false } }
        if (!id) return mainTopics
        const mainTopicsExceptSelf: Where = { and: [mainTopics, { id: { not_equals: id } }] }
        return mainTopicsExceptSelf
      },
      admin: {
        position: 'sidebar',
        description: { de: 'Leer = Haupt-Thema.', en: 'Empty = main topic.' },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: { de: 'Reihenfolge', en: 'Order' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'articles',
      type: 'join',
      collection: 'posts',
      on: 'topics',
      label: { de: 'Artikel', en: 'Articles' },
      defaultSort: '-publishedAt',
    },
  ],
}
