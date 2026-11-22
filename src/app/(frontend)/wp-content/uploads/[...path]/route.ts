import { findMediaByLegacyPath } from '@/lib/data/files'

/** Old WordPress file links (/wp-content/uploads/…) lead permanently to /files/… */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const legacyPath = path.map((segment) => decodeURIComponent(segment)).join('/')
  const media = await findMediaByLegacyPath(legacyPath)
  if (!media?.filename) return new Response('Not found', { status: 404 })
  return Response.redirect(
    new URL(`/files/${encodeURIComponent(media.filename)}`, request.url),
    308,
  )
}
