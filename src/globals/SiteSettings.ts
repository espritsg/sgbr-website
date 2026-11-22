import type { GlobalConfig } from 'payload'

import { siteSettingsAccess } from '@/access/permissions'

import { socialPlatforms } from './Footer'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { de: 'Website-Einstellungen', en: 'Site settings' },
  access: siteSettingsAccess,
  admin: { group: { de: 'Einstellungen', en: 'Settings' } },
  fields: [
    {
      name: 'defaultSeo',
      type: 'group',
      label: { de: 'Standard-SEO', en: 'Default SEO' },
      fields: [
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: { de: 'Beschreibung', en: 'Description' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { de: 'Bild für Social Media', en: 'Social image' },
        },
      ],
    },
    { name: 'contactEmail', type: 'email', label: { de: 'Kontakt-E-Mail', en: 'Contact email' } },
    { name: 'address', type: 'textarea', label: { de: 'Adresse', en: 'Address' } },
    {
      name: 'socialProfiles',
      type: 'array',
      label: { de: 'Social-Profile', en: 'Social profiles' },
      fields: [
        { name: 'platform', type: 'select', required: true, options: socialPlatforms },
        { name: 'url', type: 'text', required: true },
      ],
    },
    {
      name: 'newsletterPopup',
      type: 'group',
      label: { de: 'Newsletter-Popup', en: 'Newsletter popup' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Anzeigen', en: 'Enabled' },
        },
        {
          name: 'delaySeconds',
          type: 'number',
          defaultValue: 10,
          min: 0,
          label: { de: 'Verzögerung (Sekunden)', en: 'Delay (seconds)' },
        },
      ],
    },
  ],
}
