import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

/**
 * File storage (docs/architektur.md, ADR 0022): Cloudflare R2 over its S3 API.
 * - bucket R2_BUCKET_MEDIA (public): images and issue PDFs, delivered directly from
 *   R2_PUBLIC_URL (r2.dev or a custom domain), uploaded straight from the browser
 * - bucket R2_BUCKET_PRIVATE: application files (CVs), only through Payload's file
 *   route, which checks the read access first (ADR 0012)
 * Without R2 credentials the files stay on local disk (./media, ./application-files).
 *
 * `alwaysInsertFields` keeps the database schema identical with and without R2.
 */
export function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID || ''
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
  return {
    enabled: Boolean(accessKeyId && secretAccessKey && (accountId || process.env.R2_ENDPOINT)),
    // Buckets in the EU jurisdiction have their own endpoint.
    endpoint: process.env.R2_ENDPOINT || `https://${accountId}.eu.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    publicUrl: (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),
    mediaBucket: process.env.R2_BUCKET_MEDIA || 'sgbr-media',
    privateBucket: process.env.R2_BUCKET_PRIVATE || 'sgbr-bewerbungen',
  }
}

/** Public URL of a file in the media bucket. */
export function publicFileUrl(publicUrl: string, filename: string, prefix?: string): string {
  const key = [prefix, filename].filter(Boolean).join('/')
  return `${publicUrl}/${key.split('/').map(encodeURIComponent).join('/')}`
}

export function storagePlugins(): Plugin[] {
  const r2 = r2Config()
  if (r2.enabled && !r2.publicUrl) {
    throw new Error(
      'R2_PUBLIC_URL fehlt (öffentliche Adresse des Media-Buckets, docs/deployment.md).',
    )
  }
  const s3 = {
    endpoint: r2.endpoint,
    region: 'auto',
    forcePathStyle: true,
    credentials: { accessKeyId: r2.accessKeyId, secretAccessKey: r2.secretAccessKey },
    // R2 does not need the newer default checksums of the AWS SDK.
    requestChecksumCalculation: 'WHEN_REQUIRED' as const,
    responseChecksumValidation: 'WHEN_REQUIRED' as const,
  }

  return [
    s3Storage({
      enabled: r2.enabled,
      alwaysInsertFields: true,
      bucket: r2.mediaBucket,
      config: s3,
      // Browser → R2 directly (presigned URL), so large PDFs do not pass the
      // 4.5 MB request limit of Vercel Functions.
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => publicFileUrl(r2.publicUrl, filename, prefix),
        },
      },
    }),
    s3Storage({
      enabled: r2.enabled,
      alwaysInsertFields: true,
      bucket: r2.privateBucket,
      config: s3,
      collections: { 'application-files': { prefix: 'application-files' } },
    }),
  ]
}
