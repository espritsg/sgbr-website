import type { CollectionConfig } from 'payload'

import { contentAccess } from '@/access/permissions'
import { layoutBlocks } from '@/blocks/layout'
import { slugField } from '@/fields/slug'

import { contentGroup, contentVersions } from '../shared'

/** Static pages: about, contact, imprint, privacy. URL /{locale}/{slug}. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: { de: 'Seite', en: 'Page' }, plural: { de: 'Seiten', en: 'Pages' } },
  access: contentAccess,
  admin: {
    group: contentGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
  versions: contentVersions(),
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { de: 'Titel', en: 'Title' },
    },
    {
      name: 'layout',
      type: 'blocks',
      localized: true,
      label: { de: 'Inhalt', en: 'Content' },
      blocks: layoutBlocks,
    },
    slugField(),
  ],
}
