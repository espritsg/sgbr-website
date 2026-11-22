import type { CollectionConfig } from 'payload'

import { internalAccess } from '@/access/permissions'

/**
 * One row per recipient of a newsletter, created when sending starts. Batches and
 * their status make sending resumable without duplicates (docs/newsletter.md).
 */
export const NewsletterDeliveries: CollectionConfig = {
  slug: 'newsletter-deliveries',
  access: internalAccess,
  admin: { hidden: true },
  fields: [
    {
      name: 'newsletter',
      type: 'relationship',
      relationTo: 'newsletters',
      required: true,
      index: true,
    },
    { name: 'subscriber', type: 'relationship', relationTo: 'subscribers', required: true },
    { name: 'batch', type: 'number', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'sent', 'failed'],
    },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'messageId', type: 'text' },
    { name: 'error', type: 'text' },
  ],
}
