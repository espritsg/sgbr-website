import { Inter, Source_Serif_4 } from 'next/font/google'

// The only two typefaces of the site (docs/design-system.md). Self-hosted by next/font.
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

/** Headlines only; body text stays Inter (decided 2026-11-23). */
export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif-headline',
  display: 'swap',
})
