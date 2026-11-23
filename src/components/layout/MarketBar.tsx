'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { MarketQuote } from '@/lib/market'

const REFRESH_MS = 5 * 60 * 1000

/**
 * Market snapshot between the date and the tools in the masthead (from tablet width).
 * Loads after the page, refreshes every five minutes and stays empty if there is no data.
 * Always one line: centred while it fits, otherwise a slow loop faded out on both sides.
 */
export function MarketBar() {
  const t = useTranslations('market')
  const locale = useLocale()
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [overflowing, setOverflowing] = useState(false)
  const box = useRef<HTMLElement>(null)
  const row = useRef<HTMLUListElement>(null) // the first copy, measured without padding

  useEffect(() => {
    const container = box.current
    if (!container || !('ResizeObserver' in window)) return
    const measure = () =>
      setOverflowing((row.current?.scrollWidth ?? 0) > container.clientWidth + 1)
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    if (row.current) observer.observe(row.current)
    measure()
    return () => observer.disconnect()
  }, [quotes.length])

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
  const list = (copy: boolean) => (
    <ul
      ref={copy ? undefined : row}
      aria-hidden={copy || undefined}
      className="flex w-max shrink-0 items-center gap-x-6 whitespace-nowrap text-xs tabular-nums"
    >
      {quotes.map((quote) => {
        const up = quote.changePercent >= 0
        return (
          <li key={quote.symbol} className="flex shrink-0 items-baseline gap-1.5">
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
  )

  return (
    <section
      ref={box}
      aria-label={t('label')}
      className={`group hidden min-w-0 flex-1 overflow-hidden md:flex ${
        overflowing
          ? 'justify-start [mask-image:linear-gradient(to_right,transparent,#000_3rem,#000_calc(100%-3rem),transparent)]'
          : 'justify-center'
      }`}
    >
      {quotes.length > 0 && (
        // Too narrow: two copies run as a slow loop (paused on hover), faded on both sides.
        <div
          data-ticker={overflowing || undefined}
          className={`flex w-max shrink-0 ${
            overflowing
              ? '[animation:sgbr-ticker_40s_linear_infinite] group-hover:[animation-play-state:paused]'
              : '[animation:sgbr-fade-in_300ms_var(--ease-out-soft)]'
          }`}
        >
          <div className={overflowing ? 'pr-6' : ''}>{list(false)}</div>
          {overflowing && <div className="pr-6">{list(true)}</div>}
        </div>
      )}
    </section>
  )
}
