import type { CollectionConfig } from 'payload'

import { applicationFileAccess } from '@/access/permissions'

import { formsGroup } from '../shared'
import { assertPdf } from './assertPdf'

/**
 * CVs uploaded with event applications. Private: only admin and board can read them,
 * files are served only through Payload's access-checked route (docs/formulare.md).
 */
export const ApplicationFiles: CollectionConfig = {
  slug: 'application-files',
  labels: {
    singular: { de: 'Bewerbungsdatei', en: 'Application file' },
    plural: { de: 'Bewerbungsdateien', en: 'Application files' },
  },
  access: applicationFileAccess,
  admin: {
    group: formsGroup,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'filesize', 'createdAt'],
  },
  upload: {
    staticDir: 'application-files',
    mimeTypes: ['application/pdf'],
    disableLocalStorage: false,
    // Never cache private files in shared caches.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      headers.set('X-Robots-Tag', 'noindex')
      return headers
    },
  },
  hooks: {
    beforeOperation: [assertPdf],
  },
  fields: [],
}
