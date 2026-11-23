import type { CollectionConfig } from 'payload'

import { contentAccess } from '@/access/permissions'
import { seoTab } from '@/fields/seoTab'
import { slugField } from '@/fields/slug'
import { defaultEditor } from '@/lib/richtext/editors'

import { contentVersions, magazineGroup } from '../shared'

/**
 * Speaker events. Upcoming/past is computed from `startsAt` (docs/datenmodell.md).
 * The slug keeps the old IDs (e.g. `weimer`), which espritsg.ch uses.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: { de: 'Speaker Event', en: 'Speaker event' },
    plural: { de: 'Speaker Events', en: 'Speaker events' },
  },
  access: contentAccess,
  admin: {
    group: magazineGroup,
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'speaker', 'startsAt', 'location', '_status'],
  },
  defaultSort: '-startsAt',
  versions: contentVersions(),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { de: 'Event', en: 'Event' },
          fields: [
            {
              name: 'speaker',
              type: 'relationship',
              relationTo: 'people',
              required: true,
              label: { de: 'Speaker', en: 'Speaker' },
            },
            {
              name: 'title',
              type: 'text',
              localized: true,
              label: { de: 'Titel (optional)', en: 'Title (optional)' },
              admin: {
                description: { de: 'Leer = Name des Speakers.', en: 'Empty = speaker name.' },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  required: true,
                  index: true,
                  label: { de: 'Beginn', en: 'Starts at' },
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      timeFormat: 'HH:mm',
                      displayFormat: 'dd.MM.yyyy HH:mm',
                    },
                    description: { de: 'Zeit in Zürcher Zeit.', en: 'Time in Zurich time.' },
                  },
                },
                {
                  name: 'language',
                  type: 'select',
                  required: true,
                  defaultValue: 'en',
                  label: { de: 'Sprache des Vortrags', en: 'Language of the talk' },
                  options: [
                    { label: { de: 'Englisch', en: 'English' }, value: 'en' },
                    { label: { de: 'Deutsch', en: 'German' }, value: 'de' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            { name: 'location', type: 'text', label: { de: 'Ort', en: 'Location' } },
            {
              name: 'description',
              type: 'richText',
              localized: true,
              editor: defaultEditor,
              label: { de: 'Beschreibung', en: 'Description' },
            },
          ],
        },
        {
          label: { de: 'Bewerbung', en: 'Application' },
          fields: [
            {
              name: 'applicationForm',
              type: 'relationship',
              relationTo: 'forms',
              label: { de: 'Bewerbungsformular', en: 'Application form' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'applicationOpensAt',
                  type: 'date',
                  label: { de: 'Bewerbung ab', en: 'Applications open' },
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
                  },
                },
                {
                  name: 'applicationDeadline',
                  type: 'date',
                  label: { de: 'Bewerbungsschluss', en: 'Application deadline' },
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime', timeFormat: 'HH:mm' },
                  },
                },
              ],
            },
          ],
        },
        {
          label: { de: 'Nach dem Event', en: 'After the event' },
          fields: [
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: { de: 'Fotos', en: 'Photos' },
            },
            {
              name: 'recap',
              type: 'relationship',
              relationTo: 'posts',
              label: { de: 'Rückblick (Artikel)', en: 'Recap (article)' },
            },
          ],
        },
        seoTab(),
      ],
    },
    slugField('slug'),
  ],
}
