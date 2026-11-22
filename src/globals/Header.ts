import type { GlobalConfig } from 'payload'

import { globalContentAccess } from '@/access/permissions'

import { linkFields } from './linkFields'

export const Header: GlobalConfig = {
  slug: 'header',
  label: { de: 'Kopfzeile', en: 'Header' },
  access: globalContentAccess,
  admin: { group: { de: 'Website', en: 'Website' } },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: { de: 'Navigation', en: 'Navigation' },
      maxRows: 6,
      fields: linkFields,
      defaultValue: [
        { label: 'Issues', href: '/issues' },
        { label: 'Topics', href: '/topics' },
        { label: 'Speaker Events', href: '/events' },
        { label: 'Newsletter', href: '/newsletter' },
      ],
    },
  ],
}
