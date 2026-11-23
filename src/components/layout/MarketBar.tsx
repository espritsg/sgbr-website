'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import type { MarketQuote } from '@/lib/market'

const REFRESH_MS = 5 * 60 * 1000

/**
 * Market snapshot between the date and the tools in the masthead (wide screens only).
 * Loads after the page, refreshes every five minutes and stays empty if there is no data.
 */
export function MarketBar() {
  const t = useTranslations('market')
  const locale = useLocale()
  const [quotes, setQuotes] = useState<MarketQuote[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/market')
        if (!response.ok) return
        const data = (await response.json()) as { quotes?: MarketQuote[] }
        if (active && Array.isArray(data.quotes)) setQuotes(data.quotes)
      } catch {
        // Keep the last values.
      }
    }
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const tag = locale === 'de' ? 'de-CH' : 'en-GB'
  return (
    <section
      aria-label={t('label')}
      className="hidden min-w-0 flex-1 justify-center overflow-hidden lg:flex"
    >
      {quotes.length > 0 && (
        <ul className="flex items-center gap-x-6 whitespace-nowrap text-xs tabular-nums [animation:sgbr-fade-in_300ms_var(--ease-out-soft)]">
          {quotes.map((quote) => {
            const up = quote.changePercent >= 0
            return (
              <li key={quote.symbol} className="flex items-baseline gap-1.5">
                <span className="font-semibold text-text">{quote.label}</span>
                <span className="text-muted">
                  {quote.price.toLocaleString(tag, {
                    minimumFractionDigits: quote.decimals,
                    maximumFractionDigits: quote.decimals,
                  })}
                </span>
                <span className={up ? 'text-success' : 'text-danger'}>
                  <span className="sr-only">{up ? t('up') : t('down')} </span>
                  {up ? '+' : '−'}
                  {Math.abs(quote.changePercent).toLocaleString(tag, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  %
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
