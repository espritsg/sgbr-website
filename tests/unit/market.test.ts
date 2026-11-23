import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getMarketQuotes, MARKET_SYMBOLS, parseChart, resetMarketCache } from '@/lib/market'

const chart = (price: number, previousClose: number) => ({
  chart: { result: [{ meta: { regularMarketPrice: price, chartPreviousClose: previousClose } }] },
})
const ok = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))

describe('parseChart', () => {
  it('reads price and previous close', () => {
    expect(parseChart(chart(110, 100))).toEqual({ price: 110, previousClose: 100 })
  })
  it('falls back to previousClose', () => {
    const body = { chart: { result: [{ meta: { regularMarketPrice: 5, previousClose: 4 } }] } }
    expect(parseChart(body)).toEqual({ price: 5, previousClose: 4 })
  })
  it('returns null for errors and missing values', () => {
    expect(parseChart({ chart: { result: null, error: { code: 'Not Found' } } })).toBeNull()
    expect(parseChart(chart(Number.NaN, 100))).toBeNull()
    expect(parseChart(chart(10, 0))).toBeNull()
    expect(parseChart(null)).toBeNull()
  })
})

describe('getMarketQuotes', () => {
  beforeEach(() => resetMarketCache())

  it('loads all symbols in order with the change in percent', async () => {
    const fetcher = vi.fn(() => ok(chart(102, 100))) as unknown as typeof fetch
    const quotes = await getMarketQuotes(fetcher)
    expect(quotes.map((quote) => quote.label)).toEqual(MARKET_SYMBOLS.map((entry) => entry.label))
    expect(quotes[0].changePercent).toBeCloseTo(2)
  })

  it('leaves out failed symbols and caches the result', async () => {
    let call = 0
    const fetcher = vi.fn(() =>
      call++ === 0 ? Promise.reject(new Error('offline')) : ok(chart(99, 100)),
    ) as unknown as typeof fetch
    const first = await getMarketQuotes(fetcher)
    expect(first).toHaveLength(MARKET_SYMBOLS.length - 1)
    await getMarketQuotes(fetcher)
    expect(fetcher).toHaveBeenCalledTimes(MARKET_SYMBOLS.length)
  })

  it('returns an empty list when nothing loads', async () => {
    const fetcher = vi.fn(() => Promise.resolve(new Response('', { status: 500 })))
    expect(await getMarketQuotes(fetcher as unknown as typeof fetch)).toEqual([])
  })
})
