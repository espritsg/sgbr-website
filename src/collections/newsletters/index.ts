import type { CollectionConfig, FieldAccess } from 'payload'

import { canSendNewsletter } from '@/access/actions'
import { newsletterAccess } from '@/access/permissions'
import { slugField } from '@/fields/slug'
import { newsletterEditor } from '@/lib/richtext/editors'

import { newsletterGroup } from '../shared'
import { newsletterAdminEndpoints } from './endpoints'
import { computeArchiveVisibleFrom } from './hooks'

const onlySenders: FieldAccess = ({ req }) => canSendNewsletter(req.user)

/**
 * Newsletters: written here, sent as Resend broadcasts, one per language (docs/newsletter.md).
 * After sending, they appear in the archive with a delay (`archiveDelayDays`).
 */
export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  labels: {
    singular: { de: 'Newsletter', en: 'Newsletter' },
    plural: { de: 'Newsletter', en: 'Newsletters' },
  },
  access: newsletterAccess,
  admin: {
    group: newsletterGroup,
    useAsTitle: 'title',
    defaultColumns: ['title', 'audience', 'status', 'sentAt', 'recipientCount'],
  },
  defaultSort: '-createdAt',
  versions: { maxPerDoc: 30 },
  endpoints: newsletterAdminEndpoints,
  hooks: {
    beforeChange: [computeArchiveVisibleFrom],
  },
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
              name: 'subject',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Betreff', en: 'Subject' },
            },
            {
              name: 'previewText',
              type: 'text',
              localized: true,
              label: { de: 'Vorschautext', en: 'Preview text' },
              admin: {
                description: {
                  de: 'Erscheint im Postfach nach dem Betreff.',
                  en: 'Shown in the inbox after the subject.',
                },
              },
            },
            {
              name: 'intro',
              type: 'textarea',
              localized: true,
              label: { de: 'Einleitung', en: 'Intro' },
              admin: {
                description: {
                  de: 'Leerzeile = neuer Absatz, einfacher Zeilenumbruch bleibt erhalten (z. B. Name und Funktion).',
                  en: 'Blank line = new paragraph; a single line break is kept (e.g. name and role).',
                },
              },
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: newsletterEditor,
              label: {
                de: 'Text (Gastbeiträge, Ankündigungen)',
                en: 'Text (guest articles, announcements)',
              },
              admin: {
                description: {
                  de: 'Über „+“ bzw. „/“: „Abschnitt mit Bild“ (Porträt, Logo, Gruppenfoto mit Text und Link) und „Artikel“ (Artikel der Website an genau dieser Stelle).',
                  en: 'Via "+" or "/": "Section with image" (portrait, logo, group photo with text and link) and "Article" (a website article at exactly this position).',
                },
              },
            },
            {
              name: 'featuredPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              label: { de: 'Weitere Artikel (am Ende)', en: 'More articles (at the end)' },
              admin: {
                description: {
                  de: 'Erscheinen nach dem Text unter „In dieser Ausgabe“. Für einen Artikel mitten im Newsletter den Block „Artikel“ im Text verwenden.',
                  en: 'Shown after the text under "In this edition". For an article within the newsletter, use the "Article" block in the text.',
                },
              },
            },
          ],
        },
        {
          label: { de: 'Versand', en: 'Sending' },
          fields: [
            {
              name: 'audience',
              type: 'select',
              required: true,
              defaultValue: 'newsletter',
              label: { de: 'Zielgruppe', en: 'Audience' },
              options: [
                {
                  label: { de: 'Newsletter (monatlich)', en: 'Newsletter (monthly)' },
                  value: 'newsletter',
                },
                { label: { de: 'Event-Einladungen', en: 'Event invitations' }, value: 'events' },
              ],
            },
            {
              name: 'scheduledFor',
              type: 'date',
              label: { de: 'Geplanter Versand', en: 'Scheduled sending' },
              access: { create: onlySenders, update: onlySenders },
              admin: {
                date: { pickerAppearance: 'dayOnly' },
                description: {
                  de: 'Optional. Wird am Morgen dieses Tages versendet (täglicher Lauf). Nur Admin und Editorial Board.',
                  en: 'Optional. Sent on the morning of this day (daily run). Admin and Editorial Board only.',
                },
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              index: true,
              label: { de: 'Status', en: 'Status' },
              options: [
                { label: { de: 'Entwurf', en: 'Draft' }, value: 'draft' },
                { label: { de: 'Versendet', en: 'Sent' }, value: 'sent' },
                { label: { de: 'Fehlgeschlagen', en: 'Failed' }, value: 'failed' },
              ],
              access: { create: () => false, update: () => false },
              admin: { readOnly: true },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sentAt',
                  type: 'date',
                  label: { de: 'Versendet am', en: 'Sent at' },
                  access: { create: () => false, update: () => false },
                  admin: { readOnly: true, width: '50%', date: { pickerAppearance: 'dayAndTime' } },
                },
                {
                  name: 'recipientCount',
                  type: 'number',
                  label: { de: 'Empfänger (höchstens)', en: 'Recipients (at most)' },
                  access: { create: () => false, update: () => false },
                  admin: { readOnly: true, width: '50%' },
                },
              ],
            },
            {
              name: 'resend',
              type: 'group',
              label: { de: 'Resend', en: 'Resend' },
              access: { create: () => false, update: () => false },
              admin: {
                readOnly: true,
                description: {
                  de: 'IDs der Broadcasts in Resend (ein Broadcast pro Sprache). Empfänger, Öffnungen und Klicks siehe Resend.',
                  en: 'IDs of the broadcasts in Resend (one per language). Recipients, opens and clicks: see Resend.',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'broadcastEn', type: 'text', label: 'Broadcast EN' },
                    { name: 'broadcastDe', type: 'text', label: 'Broadcast DE' },
                  ],
                },
                {
                  name: 'lastError',
                  type: 'textarea',
                  label: { de: 'Letzter Fehler', en: 'Last error' },
                },
              ],
            },
          ],
        },
        {
          label: { de: 'Archiv', en: 'Archive' },
          fields: [
            {
              name: 'showInArchive',
              type: 'checkbox',
              defaultValue: true,
              label: { de: 'Im Archiv zeigen', en: 'Show in archive' },
            },
            {
              name: 'archiveDelayDays',
              type: 'number',
              defaultValue: 30,
              min: 0,
              label: { de: 'Tage bis zum Archiv', en: 'Days until archive' },
              admin: {
                description: {
                  de: 'Erscheint so viele Tage nach dem Versand auf der Website. 0 = sofort.',
                  en: 'Appears on the website this many days after sending. 0 = immediately.',
                },
              },
            },
            {
              name: 'archiveVisibleFrom',
              type: 'date',
              index: true,
              label: { de: 'Im Archiv ab', en: 'In archive from' },
              admin: { readOnly: true, description: { de: 'Wird berechnet.', en: 'Computed.' } },
            },
          ],
        },
      ],
    },
    slugField(),
    {
      name: 'sendingActions',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '@/components/admin/NewsletterActions#NewsletterActions' },
      },
    },
  ],
}
