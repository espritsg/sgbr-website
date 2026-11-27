import type { CollectionConfig } from 'payload'

import { contentAccess } from '@/access/permissions'
import { slugField } from '@/fields/slug'
import { wpIdField } from '@/fields/wpId'

import { contentVersions, magazineGroup } from '../shared'

/** Interviewees, guest authors and speakers. URL /{locale}/people/{slug}. */
export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: { de: 'Person', en: 'Person' }, plural: { de: 'Personen', en: 'People' } },
  access: contentAccess,
  admin: {
    group: magazineGroup,
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', 'role', '_status'],
    listSearchableFields: ['name', 'organization'],
  },
  defaultSort: 'name',
  versions: contentVersions(false),
  fields: [
    { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' } },
    slugField('name'),
    {
      type: 'row',
      fields: [
        {
          name: 'role',
          type: 'text',
          localized: true,
          label: { de: 'Funktion', en: 'Role' },
          admin: { width: '50%' },
        },
        {
          name: 'organization',
          type: 'text',
          label: { de: 'Organisation', en: 'Organization' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'photo', type: 'upload', relationTo: 'media', label: { de: 'Foto', en: 'Photo' } },
        {
          name: 'organizationLogo',
          type: 'upload',
          relationTo: 'media',
          label: { de: 'Logo der Organisation', en: 'Organization logo' },
        },
      ],
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: { de: 'Kurzbiografie', en: 'Short bio' },
    },
    {
      name: 'bioNeedsReview',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: { de: 'Übersetzung der Kurzbiografie prüfen', en: 'Check bio translation' },
      admin: {
        position: 'sidebar',
        description: {
          de: 'Englische Kurzbiografie wurde aus dem Deutschen übersetzt (2026-11-27). Nach dem Prüfen abhaken.',
          en: 'English bio was translated from German (2026-11-27). Untick after reviewing.',
        },
      },
    },
    { name: 'linkedin', type: 'text', label: 'LinkedIn' },
    {
      name: 'articles',
      type: 'join',
      collection: 'posts',
      on: 'interviewees',
      label: { de: 'Artikel', en: 'Articles' },
      defaultSort: '-publishedAt',
    },
    {
      name: 'events',
      type: 'join',
      collection: 'events',
      on: 'speaker',
      label: { de: 'Events', en: 'Events' },
      defaultSort: '-startsAt',
    },
    wpIdField,
  ],
}
