import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Tab } from 'payload'

/**
 * SEO as its own tab (instead of the plugin appending it at the end of the form).
 * Same group `meta` and fields as the plugin, so the database schema stays the same.
 */
export function seoTab(): Tab {
  return {
    label: 'SEO',
    description: {
      de: 'Titel und Beschreibung für Google und Social Media. Leer = Titel und Kurzzusammenfassung des Dokuments.',
      en: 'Title and description for Google and social media. Empty = the document title and summary.',
    },
    fields: [
      {
        name: 'meta',
        type: 'group',
        label: 'SEO',
        localized: true,
        fields: [
          OverviewField({}),
          MetaTitleField({ hasGenerateFn: true }),
          MetaDescriptionField({ hasGenerateFn: true }),
          MetaImageField({ relationTo: 'media', hasGenerateFn: false }),
          PreviewField({ hasGenerateFn: false }),
        ],
      },
    ],
  }
}
