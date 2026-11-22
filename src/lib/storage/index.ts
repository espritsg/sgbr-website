import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Plugin } from 'payload'

import { privateBlobAdapter } from './privateBlobAdapter'

/**
 * File storage (docs/architektur.md):
 * - with BLOB_READ_WRITE_TOKEN: Vercel Blob (media public, application files private)
 * - without: local disk (./media, ./application-files), for development
 *
 * `alwaysInsertFields` keeps the database schema identical with and without a token.
 */
export function storagePlugins(): Plugin[] {
  const token = process.env.BLOB_READ_WRITE_TOKEN || ''
  const enabled = Boolean(token)

  return [
    vercelBlobStorage({
      enabled,
      token,
      alwaysInsertFields: true,
      // Uploads go straight from the browser to Blob, so large PDFs are not limited
      // by the 4.5 MB request limit of Vercel Functions.
      clientUploads: true,
      collections: { media: true },
    }),
    cloudStoragePlugin({
      enabled,
      alwaysInsertFields: true,
      collections: {
        'application-files': {
          adapter: enabled ? privateBlobAdapter({ token }) : null,
          disableLocalStorage: enabled,
          prefix: 'application-files',
        },
      },
    }),
  ]
}
