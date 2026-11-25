import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Plugin } from 'payload'

import { privateBlobAdapter } from './privateBlobAdapter'

/**
 * File storage (docs/architektur.md, ADR 0012). Vercel fixes public/private per
 * store, so there are two stores with their own tokens:
 * - BLOB_READ_WRITE_TOKEN: public store for media (images, issue PDFs)
 * - BLOB_PRIVATE_READ_WRITE_TOKEN: private store for application files (CVs)
 * Without a token the files of that collection stay on local disk (development).
 *
 * `alwaysInsertFields` keeps the database schema identical with and without tokens.
 */
export function storagePlugins(): Plugin[] {
  const publicToken = process.env.BLOB_READ_WRITE_TOKEN || ''
  const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN || ''

  // On Vercel the disk is read-only: CV uploads would fail later with an unclear error.
  if (process.env.VERCEL && publicToken && !privateToken) {
    throw new Error(
      'BLOB_PRIVATE_READ_WRITE_TOKEN fehlt: privaten Blob-Store für Bewerbungsdateien anlegen und mit Präfix BLOB_PRIVATE verbinden (docs/deployment.md).',
    )
  }

  return [
    vercelBlobStorage({
      enabled: Boolean(publicToken),
      token: publicToken,
      alwaysInsertFields: true,
      // Uploads go straight from the browser to Blob, so large PDFs are not limited
      // by the 4.5 MB request limit of Vercel Functions.
      clientUploads: true,
      collections: { media: true },
    }),
    cloudStoragePlugin({
      enabled: Boolean(privateToken),
      alwaysInsertFields: true,
      collections: {
        'application-files': {
          adapter: privateToken ? privateBlobAdapter({ token: privateToken }) : null,
          disableLocalStorage: Boolean(privateToken),
          prefix: 'application-files',
        },
      },
    }),
  ]
}
