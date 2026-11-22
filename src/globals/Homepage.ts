import type { GlobalConfig } from 'payload'

import { globalContentAccess } from '@/access/permissions'

/**
 * Homepage settings. Everything else fills itself: latest articles, upcoming events,
 * archive (docs/design-system.md).
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: { de: 'Startseite', en: 'Homepage' },
  access: globalContentAccess,
  admin: { group: { de: 'Website', en: 'Website' } },
  fields: [
    {
      name: 'currentIssue',
      type: 'relationship',
      relationTo: 'issues',
      label: { de: 'Aktuelle Ausgabe', en: 'Current issue' },
      admin: {
        description: {
          de: 'Leer = neueste digitale Ausgabe.',
          en: 'Empty = latest digital issue.',
        },
      },
    },
    {
      name: 'pinnedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      maxRows: 4,
      label: { de: 'Angepinnte Artikel', en: 'Pinned articles' },
      admin: {
        description: {
          de: 'Optional. Stehen vor den neuesten Artikeln neben der aktuellen Ausgabe.',
          en: 'Optional. Shown before the latest articles next to the current issue.',
        },
      },
    },
    {
      name: 'showTopicSection',
      type: 'checkbox',
      defaultValue: true,
      label: {
        de: 'Je Haupt-Thema den neuesten Artikel zeigen',
        en: 'Show the latest article per main topic',
      },
    },
  ],
}
