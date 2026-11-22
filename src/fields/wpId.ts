import type { NumberField } from 'payload'

/** WordPress ID, set by the migration so repeated runs update instead of duplicating. */
export const wpIdField: NumberField = {
  name: 'wpId',
  type: 'number',
  label: { de: 'WordPress-ID', en: 'WordPress ID' },
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: { de: 'Nur für die Migration.', en: 'Used by the migration only.' },
  },
}
