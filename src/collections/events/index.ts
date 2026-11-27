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
              name: 'applicationFor',
              type: 'select',
              defaultValue: 'dinner',
              label: { de: 'Bewerbung für', en: 'Application for' },
              options: [
                {
                  label: { de: 'Das Dinner mit dem Speaker', en: 'The dinner with the speaker' },
                  value: 'dinner',
                },
                { label: { de: 'Den Talk selbst', en: 'The talk itself' }, value: 'event' },
              ],
              admin: {
                description: {
                  de: 'Dinner: Der Talk ist offen, bewerben muss man sich nur fürs Dinner. Talk: Ohne Zusage keine Teilnahme. Steuert Button und Text auf der Eventseite.',
                  en: 'Dinner: the talk is open, only the dinner needs an application. Talk: attendance needs an application. Sets the button and text on the event page.',
                },
              },
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
              name: 'recapTitle',
              type: 'text',
              localized: true,
              label: { de: 'Rückblick: Titel', en: 'Recap: title' },
              admin: {
                description: {
                  de: 'Z. B. „An Evening of Perspectives“. Der Rückblick erscheint als Slideshow auf der Eventseite, sobald es Kapitel gibt.',
                  en: 'E.g. "An Evening of Perspectives". The recap shows as a slideshow on the event page once it has chapters.',
                },
              },
            },
            {
              name: 'recapIntro',
              type: 'richText',
              localized: true,
              editor: defaultEditor,
              label: { de: 'Rückblick: Einleitung', en: 'Recap: introduction' },
            },
            {
              name: 'recapChapters',
              type: 'array',
              label: { de: 'Rückblick: Kapitel (Slideshow)', en: 'Recap: chapters (slideshow)' },
              labels: {
                singular: { de: 'Kapitel', en: 'Chapter' },
                plural: { de: 'Kapitel', en: 'Chapters' },
              },
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: { de: 'Foto', en: 'Photo' },
                },
                {
                  name: 'heading',
                  type: 'text',
                  localized: true,
                  label: { de: 'Überschrift', en: 'Heading' },
                },
                {
                  name: 'text',
                  type: 'textarea',
                  localized: true,
                  label: { de: 'Text', en: 'Text' },
                  admin: {
                    description: {
                      de: 'Leerzeile = neuer Absatz.',
                      en: 'Blank line = new paragraph.',
                    },
                  },
                },
              ],
            },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              label: { de: 'Weitere Fotos', en: 'More photos' },
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
