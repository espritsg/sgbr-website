import type { TextField } from 'payload'

import { slugify } from '@/lib/slugify'

/**
 * Slug field shared by all routable collections. Not localized: a document has the
 * same slug in /en and /de (docs/sprachen.md). Filled from `sourceField` if empty.
 */
export function slugField(sourceField = 'title'): TextField {
  return {
    name: 'slug',
    type: 'text',
    label: { de: 'Slug (URL)', en: 'Slug (URL)' },
    required: true,
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: {
        de: 'Teil der Adresse. Wird aus dem Titel erzeugt, wenn leer. Nach dem Veröffentlichen nicht mehr ändern.',
        en: 'Part of the URL. Generated from the title if empty. Do not change after publishing.',
      },
    },
    hooks: {
      beforeValidate: [
        ({ value, siblingData }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = siblingData?.[sourceField]
          if (typeof source === 'string' && source.trim()) return slugify(source)
          // Localized source fields arrive as the current locale's string in the admin.
          return value
        },
      ],
    },
  }
}
