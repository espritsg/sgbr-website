import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'

/**
 * Turns on preview mode (drafts visible) for logged-in admin users and redirects
 * to the page. Used by Live Preview and the "Preview" button in the admin.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'
  // Only relative paths on this site, never an open redirect.
  if (!path.startsWith('/') || path.startsWith('//'))
    return new Response('Invalid path', { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Please log in to the admin first.', { status: 401 })

  ;(await draftMode()).enable()
  redirect(path)
}
