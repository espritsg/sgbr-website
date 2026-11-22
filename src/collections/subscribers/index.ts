import type { CollectionConfig } from 'payload'

import { subscriberAccess } from '@/access/permissions'
import { localeSelect } from '@/fields/localeSelect'

import { newsletterGroup } from '../shared'

const secret = { read: () => false, create: () => false, update: () => false }

/**
 * Newsletter subscribers. Not public; created only through the signup endpoint
 * with double opt-in (docs/newsletter.md). Unsubscribing never deletes, so the
 * address is not contacted again.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: {
    singular: { de: 'Abonnent', en: 'Subscriber' },
    plural: { de: 'Abonnenten', en: 'Subscribers' },
  },
  access: subscriberAccess,
  admin: {
    group: newsletterGroup,
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'status', 'interests', 'locale', 'createdAt'],
    listSearchableFields: ['email', 'firstName'],
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      label: { de: 'E-Mail', en: 'Email' },
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
        ],
      },
    },
    { name: 'firstName', type: 'text', label: { de: 'Vorname', en: 'First name' } },
    localeSelect({
      name: 'locale',
      required: true,
      defaultValue: 'en',
      label: { de: 'Sprache', en: 'Language' },
    }),
    {
      name: 'interests',
      type: 'select',
      hasMany: true,
      label: { de: 'Interessen', en: 'Interests' },
      defaultValue: ['newsletter'],
      options: [
        { label: { de: 'Newsletter', en: 'Newsletter' }, value: 'newsletter' },
        { label: { de: 'Event-Einladungen', en: 'Event invitations' }, value: 'events' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      label: { de: 'Status', en: 'Status' },
      options: [
        { label: { de: 'Unbestätigt', en: 'Pending' }, value: 'pending' },
        { label: { de: 'Bestätigt', en: 'Confirmed' }, value: 'confirmed' },
        { label: { de: 'Abgemeldet', en: 'Unsubscribed' }, value: 'unsubscribed' },
        { label: { de: 'Unzustellbar', en: 'Bounced' }, value: 'bounced' },
        { label: { de: 'Spam-Beschwerde', en: 'Complained' }, value: 'complained' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'consentAt',
          type: 'date',
          label: { de: 'Einwilligung', en: 'Consent' },
          admin: { readOnly: true },
        },
        {
          name: 'confirmedAt',
          type: 'date',
          label: { de: 'Bestätigt am', en: 'Confirmed at' },
          admin: { readOnly: true },
        },
        {
          name: 'unsubscribedAt',
          type: 'date',
          label: { de: 'Abgemeldet am', en: 'Unsubscribed at' },
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'source',
      type: 'select',
      label: { de: 'Quelle', en: 'Source' },
      admin: { readOnly: true },
      options: [
        { label: 'Footer', value: 'footer' },
        { label: 'Popup', value: 'popup' },
        { label: { de: 'Newsletter-Seite', en: 'Newsletter page' }, value: 'newsletter-page' },
        { label: { de: 'MailPoet-Import', en: 'MailPoet import' }, value: 'mailpoet-import' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    // Secret tokens for the confirmation and preferences links. Never exposed via the API.
    { name: 'confirmToken', type: 'text', index: true, access: secret, admin: { hidden: true } },
    {
      name: 'preferencesToken',
      type: 'text',
      index: true,
      access: secret,
      admin: { hidden: true },
    },
  ],
}
