import type { CollectionConfig } from 'payload'

import { contentAccess } from '@/access/permissions'
import { localeSelect } from '@/fields/localeSelect'
import { seoTab } from '@/fields/seoTab'
import { slugField } from '@/fields/slug'
import { wpIdField } from '@/fields/wpId'
import { articleEditor } from '@/lib/richtext/editors'

import { contentVersions, magazineGroup } from '../shared'
import { setPublishedAt } from './hooks'
import { validateMainTopic } from './validateMainTopic'

/** Articles: interviews and guest articles. URL /{locale}/article/{slug}. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: { de: 'Artikel', en: 'Article' },
    plural: { de: 'Artikel', en: 'Articles' },
  },
  access: contentAccess,
  admin: {
    group: magazineGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'originalLanguage', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'slug', 'summary'],
    description: {
      de: 'Interviews und Gastbeiträge. Liste „Zusammenfassung prüfen“: nach „Zusammenfassung prüfen = ja“ filtern.',
      en: 'Interviews and guest articles. To review summaries, filter by "Summary needs review = yes".',
    },
  },
  defaultSort: '-publishedAt',
  versions: contentVersions(),
  hooks: {
    beforeChange: [setPublishedAt],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { de: 'Inhalt', en: 'Content' },
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              defaultValue: 'interview',
              label: { de: 'Art', en: 'Type' },
              options: [
                { label: 'Interview', value: 'interview' },
                { label: { de: 'Gastbeitrag', en: 'Guest article' }, value: 'guest-article' },
              ],
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Titel', en: 'Title' },
            },
            {
              name: 'summary',
              type: 'textarea',
              required: true,
              localized: true,
              label: { de: 'Kurzzusammenfassung', en: 'Summary' },
              admin: {
                description: {
                  de: '1–2 Sätze für Karten und Listen: worum es geht und wer spricht. Keine Anrede.',
                  en: '1–2 sentences for cards and lists: what it is about and who speaks. No salutation.',
                },
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: { de: 'Artikelbild', en: 'Article image' },
              admin: {
                description: {
                  de: 'Für Artikel, Startseite und Karten.',
                  en: 'Used on the article, homepage and cards.',
                },
              },
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: articleEditor,
              label: { de: 'Text', en: 'Text' },
            },
          ],
        },
        {
          label: { de: 'Zuordnung', en: 'Relations' },
          fields: [
            {
              name: 'interviewees',
              type: 'relationship',
              relationTo: 'people',
              hasMany: true,
              label: { de: 'Personen', en: 'People' },
              admin: {
                description: {
                  de: 'Interview: „Interview with …“. Gastbeitrag: „By …“.',
                  en: 'Interview: "Interview with …". Guest article: "By …".',
                },
              },
            },
            {
              name: 'interviewers',
              type: 'relationship',
              relationTo: 'team-members',
              hasMany: true,
              label: { de: 'Interview geführt von', en: 'Interviewed by' },
            },
            {
              name: 'topics',
              type: 'relationship',
              relationTo: 'topics',
              hasMany: true,
              label: { de: 'Themen', en: 'Topics' },
              validate: validateMainTopic,
              admin: {
                description: {
                  de: 'Mindestens ein Haupt-Thema (Business, Entrepreneurship, Finance & Economics, Politics).',
                  en: 'At least one main topic (Business, Entrepreneurship, Finance & Economics, Politics).',
                },
              },
            },
            {
              name: 'issue',
              type: 'relationship',
              relationTo: 'issues',
              label: { de: 'Ausgabe', en: 'Issue' },
            },
            {
              name: 'issueImage',
              type: 'upload',
              relationTo: 'media',
              label: { de: 'Bild für die Ausgabenseite', en: 'Image for the issue page' },
              admin: {
                description: {
                  de: 'Optional: freigestelltes Porträt, nur auf der Ausgabenseite.',
                  en: 'Optional: cut-out portrait, only on the issue page.',
                },
              },
            },
          ],
        },
        seoTab(),
      ],
    },
    slugField(),
    {
      name: 'publishedAt',
      type: 'date',
      label: { de: 'Erscheinungsdatum', en: 'Publication date' },
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
      index: true,
    },
    localeSelect({
      name: 'originalLanguage',
      required: true,
      defaultValue: 'en',
      label: { de: 'Originalsprache', en: 'Original language' },
      admin: {
        position: 'sidebar',
        description: {
          de: 'Texte nur in dieser Sprache eintragen. Die andere Sprache zeigt das Original.',
          en: 'Enter texts in this language only. The other language shows the original.',
        },
      },
    }),
    {
      name: 'summaryNeedsReview',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: { de: 'Zusammenfassung prüfen', en: 'Summary needs review' },
      admin: {
        position: 'sidebar',
        description: {
          de: 'Von der Migration gesetzt. Nach dem Prüfen abhaken.',
          en: 'Set by the migration. Untick after reviewing.',
        },
      },
    },
    wpIdField,
  ],
}
