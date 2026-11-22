import { buildIssuesFeed, feedResponse } from '@/lib/feeds/esprit'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** /issues/?sgbr_feed=1 for espritsg.ch. Without the parameter: redirect (next.config.ts). */
export async function GET(request: Request) {
  if (!new URL(request.url).searchParams.has('sgbr_feed')) {
    return Response.redirect(new URL('/en/issues', request.url), 308)
  }
  return feedResponse(await buildIssuesFeed(await getPayloadClient()))
}
