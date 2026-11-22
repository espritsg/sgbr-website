import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { BlobNotFoundError, del, get, put } from '@vercel/blob'

/**
 * Storage adapter for private Vercel Blob files (ADR 0012).
 *
 * The official @payloadcms/storage-vercel-blob adapter only supports public blobs.
 * CVs must never be reachable by URL, so this adapter stores them with
 * `access: 'private'` and streams them only through Payload's file route, which
 * checks the collection's read access first.
 */
export function privateBlobAdapter({ token }: { token: string }): Adapter {
  return ({ prefix = '' }) => ({
    name: 'private-vercel-blob',
    handleUpload: async ({ file, storageFilePath }) => {
      await put(storageFilePath, file.buffer, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: file.mimeType,
        token,
      })
    },
    handleDelete: async ({ storageFilePath }) => {
      await del(storageFilePath, { token })
    },
    staticHandler: async (req, { params: { filename } }) => {
      const pathname = prefix ? `${prefix}/${filename}` : filename
      try {
        const result = await get(pathname, { access: 'private', token, useCache: false })
        if (!result || result.statusCode !== 200) return new Response(null, { status: 404 })
        return new Response(result.stream, {
          headers: {
            'Content-Type': result.blob.contentType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Cache-Control': 'private, no-store',
            'X-Robots-Tag': 'noindex',
          },
        })
      } catch (error) {
        if (error instanceof BlobNotFoundError) return new Response(null, { status: 404 })
        req.payload.logger.error({ err: error, msg: 'Could not read private application file' })
        return new Response('Internal Server Error', { status: 500 })
      }
    },
  })
}
