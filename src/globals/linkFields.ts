import type { Field } from 'payload'

/** A label (per language) plus a link. Internal links start with "/" and get the locale prefix. */
export const linkFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'label',
        type: 'text',
        required: true,
        localized: true,
        label: { de: 'Beschriftung', en: 'Label' },
        admin: { width: '50%' },
      },
      {
        name: 'href',
        type: 'text',
        required: true,
        label: { de: 'Link', en: 'Link' },
        admin: {
          width: '50%',
          description: {
            de: 'Intern ohne Sprache, z. B. /issues. Extern mit https://.',
            en: 'Internal without language, e.g. /issues. External with https://.',
          },
        },
      },
    ],
  },
]
