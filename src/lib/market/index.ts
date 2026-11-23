/**
 * Market snapshot for the masthead (docs/entscheidungen/0020-boersenkurse.md): the same five
 * symbols as the old site, fetched on the server from the public Yahoo Finance
 * chart endpoint and kept in memory for a few minutes. Browsers never call Yahoo.
 */

export const MARKET_SYMBOLS = [
  { symbol: '^GSPC', label: 'S&P 500', decimals: 2 },
  { symbol: '^GDAXI', label: 'DAX', decimals: 2 },
  { symbol: '^N225', label: 'Nikkei 225', decimals: 0 },
  { symbol: '^HSI', label: 'Hang Seng', decimals: 0 },
  { symbol: 'EURUSD=X', label: 'EUR/USD', decimals: 4 },
] as const

export type MarketQuote = {
  symbol: string
  label: string
  decimals: number
  price: number
  /** Change against the previous close, in percent. */
  changePercent: number
}

const CACHE_MS = 5 * 60 * 1000
const TIMEOUT_MS = 4000
const SOURCE = 'https://query1.finance.yahoo.com'

/** Reads price and previous close from a Yahoo chart response; null if anything is missing. */
export function parseChart(body: unknown): { price: number; previousClose: number } | null {
  const meta = (body as { chart?: { result?: Array<{ meta?: Record<string, unknown> }> } })?.chart
    ?.result?.[0]?.meta
  if (!meta) return null
  const price = Number(meta.regularMarketPrice)
  const previousClose = Number(meta.chartPreviousClose ?? meta.previousClose)
  if (!Number.isFinite(price) || !Number.isFinite(previousClose) || previousClose <= 0) return null
  return { price, previousClose }
}

async function fetchQuote(
  entry: (typeof MARKET_SYMBOLS)[number],
  fetcher: typeof fetch,
): Promise<MarketQuote | null> {
  try {
    const response = await fetcher(
      `${SOURCE}/v8/finance/chart/${encodeURIComponent(entry.symbol)}?range=1d&interval=1d`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; sgbr-website)' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    )
    if (!response.ok) return null
    const parsed = parseChart(await response.json())
    if (!parsed) return null
    return {
      symbol: entry.symbol,
      label: entry.label,
      decimals: entry.decimals,
      price: parsed.price,
      changePercent: ((parsed.price - parsed.previousClose) / parsed.previousClose) * 100,
    }
  } catch {
    return null
  }
}

let cache: { at: number; quotes: MarketQuote[] } | null = null
let pending: Promise<MarketQuote[]> | null = null

/**
 * All quotes that could be loaded, in the fixed order. Failed symbols are left out;
 * if every symbol fails, the last good result is kept so the bar does not flicker.
 */
export async function getMarketQuotes(fetcher: typeof fetch = fetch): Promise<MarketQuote[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.quotes
  pending ??= Promise.all(MARKET_SYMBOLS.map((entry) => fetchQuote(entry, fetcher)))
    .then((results) => {
      const quotes = results.filter((quote): quote is MarketQuote => quote !== null)
      if (quotes.length || !cache) cache = { at: Date.now(), quotes }
      else cache = { ...cache, at: Date.now() }
      return cache.quotes
    })
    .finally(() => {
      pending = null
    })
  return pending
}

/** For tests. */
export function resetMarketCache() {
  cache = null
  pending = null
}
