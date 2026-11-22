import type { CollectionConfig, FieldAccess } from 'payload'

import { canSendNewsletter } from '@/access/actions'
import { newsletterAccess } from '@/access/permissions'
import { slugField } from '@/fields/slug'
import { defaultEditor } from '@/lib/richtext/editors'

import { newsletterGroup } from '../shared'
import { computeArchiveVisibleFrom } from './hooks'

const onlySenders: FieldAccess = ({ req }) => canSendNewsletter(req.user)

/**
 * Newsletters: written here, sent through Resend in batches (docs/newsletter.md).
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
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: defaultEditor,
              label: {
                de: 'Text (Gastbeiträge, Ankündigungen)',
                en: 'Text (guest articles, announcements)',
              },
            },
            {
              name: 'featuredPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              label: { de: 'Empfohlene Artikel', en: 'Featured articles' },
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
                  de: 'Optional. Der Versand startet am Morgen dieses Tages (täglicher Lauf). Nur Admin und Editorial Board.',
                  en: 'Optional. Sending starts on the morning of this day (daily run). Admin and Editorial Board only.',
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
                { label: { de: 'Wird versendet', en: 'Sending' }, value: 'sending' },
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
                  label: { de: 'Empfänger', en: 'Recipients' },
                  access: { create: () => false, update: () => false },
                  admin: { readOnly: true, width: '50%' },
                },
              ],
            },
            {
              name: 'progress',
              type: 'group',
              label: { de: 'Versandfortschritt', en: 'Sending progress' },
              access: { create: () => false, update: () => false },
              admin: { readOnly: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'totalBatches',
                      type: 'number',
                      label: { de: 'Pakete gesamt', en: 'Total batches' },
                    },
                    {
                      name: 'sentBatches',
                      type: 'number',
                      label: { de: 'Pakete versendet', en: 'Batches sent' },
                    },
                    {
                      name: 'failedRecipients',
                      type: 'number',
                      label: { de: 'Fehler', en: 'Failed' },
                    },
                  ],
                },
                { name: 'startedAt', type: 'date', label: { de: 'Gestartet', en: 'Started' } },
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
  ],
}
