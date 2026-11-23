import type { CollectionConfig } from 'payload'

import { contentAccess } from '@/access/permissions'
import { seoTab } from '@/fields/seoTab'
import { slugField } from '@/fields/slug'
import { wpIdField } from '@/fields/wpId'
import { defaultEditor } from '@/lib/richtext/editors'

import { contentVersions, magazineGroup } from '../shared'

/** Magazine issues: digital issues with their own page and the PDF archive. */
export const Issues: CollectionConfig = {
  slug: 'issues',
  labels: { singular: { de: 'Ausgabe', en: 'Issue' }, plural: { de: 'Ausgaben', en: 'Issues' } },
  access: contentAccess,
  admin: {
    group: magazineGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'format', '_status'],
  },
  defaultSort: '-year',
  versions: contentVersions(),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { de: 'Inhalt', en: 'Content' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Titel', en: 'Title' },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: { de: 'Unterzeile', en: 'Tagline' },
              admin: {
                description: {
                  de: 'z. B. „Who owns tomorrow’s market?“',
                  en: 'e.g. "Who owns tomorrow’s market?"',
                },
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: { de: 'Beschreibung', en: 'Description' },
            },
            {
              name: 'foreword',
              type: 'richText',
              localized: true,
              editor: defaultEditor,
              label: { de: 'Vorwort', en: 'Foreword' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'cover',
                  type: 'upload',
                  relationTo: 'media',
                  label: { de: 'Cover', en: 'Cover' },
                },
                {
                  name: 'pdf',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'PDF',
                  filterOptions: { mimeType: { equals: 'application/pdf' } },
                },
              ],
            },
            {
              name: 'editors',
              type: 'relationship',
              relationTo: 'team-members',
              hasMany: true,
              label: { de: 'Redaktion', en: 'Editors' },
            },
            {
              name: 'articles',
              type: 'join',
              collection: 'posts',
              on: 'issue',
              label: { de: 'Artikel', en: 'Articles' },
              defaultSort: 'publishedAt',
            },
          ],
        },
        seoTab(),
      ],
    },
    slugField(),
    {
      name: 'year',
      type: 'number',
      required: true,
      label: { de: 'Jahr', en: 'Year' },
      admin: { position: 'sidebar' },
      index: true,
    },
    {
      name: 'format',
      type: 'select',
      required: true,
      defaultValue: 'digital',
      label: { de: 'Format', en: 'Format' },
      options: [
        { label: { de: 'Digital (eigene Seite)', en: 'Digital (own page)' }, value: 'digital' },
        { label: { de: 'PDF (Archiv)', en: 'PDF (archive)' }, value: 'pdf' },
      ],
      admin: { position: 'sidebar' },
    },
    wpIdField,
  ],
}
