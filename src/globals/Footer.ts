import type { GlobalConfig } from 'payload'

import { globalContentAccess } from '@/access/permissions'

import { linkFields } from './linkFields'

export const socialPlatforms = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'X', value: 'x' },
  { label: 'Spotify', value: 'spotify' },
]

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { de: 'Fusszeile', en: 'Footer' },
  access: globalContentAccess,
  admin: { group: { de: 'Website', en: 'Website' } },
  fields: [
    {
      name: 'links',
      type: 'array',
      label: { de: 'Seitenlinks', en: 'Page links' },
      fields: linkFields,
      defaultValue: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Imprint', href: '/imprint' },
        { label: 'Privacy', href: '/privacy' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: { de: 'Social Links', en: 'Social links' },
      fields: [
        { name: 'platform', type: 'select', required: true, options: socialPlatforms },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'newsletterText',
      type: 'textarea',
      localized: true,
      label: { de: 'Text beim Newsletter-Formular', en: 'Text next to the newsletter form' },
    },
    {
      name: 'espritNote',
      type: 'textarea',
      localized: true,
      label: { de: 'ESPRIT-Hinweis', en: 'ESPRIT note' },
    },
  ],
}
