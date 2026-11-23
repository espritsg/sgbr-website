import type { Endpoint } from 'payload'

import { getMarketQuotes } from '@/lib/market'

/** GET /api/market: the market snapshot for the masthead, cached (src/lib/market). */
export const marketEndpoint: Endpoint = {
  path: '/market',
  method: 'get',
  handler: async () => {
    const quotes = await getMarketQuotes()
    return Response.json(
      { quotes },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  },
}
