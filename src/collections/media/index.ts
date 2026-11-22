import type { CollectionConfig } from 'payload'

import { mediaAccess } from '@/access/permissions'
import { wpIdField } from '@/fields/wpId'

import { contentGroup } from '../shared'

/**
 * Images and PDFs. Public URL is /files/{filename} (docs/urls-und-weiterleitungen.md).
 * Without BLOB_READ_WRITE_TOKEN files are stored in ./media.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: { de: 'Datei', en: 'File' }, plural: { de: 'Medien', en: 'Media' } },
  access: mediaAccess,
  admin: {
    group: contentGroup,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800 },
      { name: 'hero', width: 1600 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: { de: 'Alternativtext', en: 'Alt text' },
      admin: {
        description: {
          de: 'Kurz beschreiben, was zu sehen ist (für Screenreader und Suche).',
          en: 'Describe briefly what is shown (for screen readers and search).',
        },
      },
    },
    { name: 'caption', type: 'text', localized: true, label: { de: 'Bildunterschrift', en: 'Caption' } },
    { name: 'credit', type: 'text', label: { de: 'Bildnachweis', en: 'Credit' } },
    {
      name: 'legacyPath',
      type: 'text',
      index: true,
      label: { de: 'Alter Pfad (WordPress)', en: 'Legacy path (WordPress)' },
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: {
          de: 'Pfad unter /wp-content/uploads/, für Weiterleitungen alter Links.',
          en: 'Path below /wp-content/uploads/, for redirects of old links.',
        },
      },
    },
    wpIdField,
  ],
}
