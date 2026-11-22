import { buildEventsFeed, feedResponse } from '@/lib/feeds/esprit'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** /category/speaker-events/?sgbr_feed=1 for espritsg.ch. Without the parameter: redirect. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  if (!params.has('sgbr_feed')) {
    const id = params.get('e')
    return Response.redirect(
      new URL(id ? `/en/events/${encodeURIComponent(id)}` : '/en/events', request.url),
      308,
    )
  }
  return feedResponse(await buildEventsFeed(await getPayloadClient()))
}
