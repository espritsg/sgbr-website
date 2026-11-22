import { findMediaFile } from '@/lib/data/files'

/**
 * Stable download URL /files/{filename} for images and PDFs. Redirects to the
 * storage (Vercel Blob or local), so links stay the same if storage changes.
 */
export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params
  const file = await findMediaFile(decodeURIComponent(filename))
  if (!file) return new Response('Not found', { status: 404 })
  const target = new URL(file.url, request.url)
  return Response.redirect(target, 302)
}
