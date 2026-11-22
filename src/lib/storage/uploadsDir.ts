import path from 'path'

/**
 * Folder for local uploads (without Vercel Blob). Tests point UPLOADS_DIR to a
 * temporary folder so they never touch the development files.
 */
export function uploadsDir(name: 'media' | 'application-files'): string {
  return path.resolve(process.env.UPLOADS_DIR || process.cwd(), name)
}
