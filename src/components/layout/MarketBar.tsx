'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import type { MarketQuote } from '@/lib/market'

const REFRESH_MS = 5 * 60 * 1000
/** Width of the soft fade at each edge (1.5rem) and the smallest gap between quotes (1.25rem). */
const EDGE_PX = 24
const GAP_PX = 20

/**
 * Market snapshot between the date and the tools in the masthead (from tablet width).
 * Loads after the page, refreshes every five minutes and stays empty if there is no data.
 * Always one line with a soft fade at both edges: spread over the full width while the
 * quotes fit, otherwise a slow endless loop (paused on hover) so every quote comes by.
 * With reduced motion the loop stands still, centred, and is cut softly on both sides.
 */
export function MarketBar() {
  const t = useTranslations('market')
  const locale = useLocale()
  const [quotes, setQuotes] = useState<MarketQuote[]>([])
  const [overflowing, setOverflowing] = useState(false)
  const box = useRef<HTMLElement>(null)
  const row = useRef<HTMLUListElement>(null)

  // Compare the natural width of the quotes (smallest gaps, both fades) with the space.
  // Measured from the items, so it gives the same answer in both modes (no flicker).
  useEffect(() => {
    const container = box.current
    if (!container || !('ResizeObserver' in window)) return
    const measure = () => {
      const items = Array.from(row.current?.children ?? []) as HTMLElement[]
      if (!items.length) return
      const natural =
        items.reduce((sum, item) => sum + item.offsetWidth, 0) +
        GAP_PX * (items.length - 1) +
        2 * EDGE_PX
      setOverflowing(natural > container.clientWidth)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    measure()
    return () => observer.disconnect()
  }, [quotes])

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
  const list = (copy: boolean, fill = false) => (
    <ul
      ref={copy ? undefined : row}
      aria-hidden={copy || undefined}
      className={`flex shrink-0 items-center gap-x-5 whitespace-nowrap text-xs tabular-nums ${
        fill ? 'w-full justify-between px-6' : 'w-max'
      }`}
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
      className="group hidden min-w-0 flex-1 justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_1.5rem,#000_calc(100%-1.5rem),transparent)] md:flex"
    >
      {quotes.length > 0 &&
        (overflowing ? (
          // Two copies run as a loop; moving by one copy (50 %) makes it seamless.
          <div
            data-ticker
            className="flex w-max shrink-0 [animation:sgbr-ticker_40s_linear_infinite] group-hover:[animation-play-state:paused]"
          >
            <div className="pr-5">{list(false)}</div>
            <div className="pr-5">{list(true)}</div>
          </div>
        ) : (
          <div className="flex w-full [animation:sgbr-fade-in_300ms_var(--ease-out-soft)]">
            {list(false, true)}
          </div>
        ))}
    </section>
  )
}
