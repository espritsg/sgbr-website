/**
 * Checks that every URL of the old WordPress sitemap ends on a page with status 200
 * on the new site (docs/urls-und-weiterleitungen.md). Only reads; run before go-live.
 *
 *   npm run check:redirects                                   # against http://localhost:3000
 *   CHECK_TARGET=https://sgbr-preview.vercel.app npm run check:redirects
 *
 * CHECK_SITEMAP: sitemap index of the old site (default: https://stgallenbusinessreview.com/sitemap_index.xml)
 * CHECK_EXTRA:   file with additional old paths, one per line (e.g. from the Redirection plugin export)
 */
import fs from 'fs'

const SITEMAP = process.env.CHECK_SITEMAP || 'https://stgallenbusinessreview.com/sitemap_index.xml'
const TARGET = (process.env.CHECK_TARGET || 'http://localhost:3000').replace(/\/$/, '')
const USER_AGENT = 'Mozilla/5.0 (compatible; sgbr-redirect-check)'
const MAX_HOPS = 5

async function getText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${url}: ${response.status}`)
  return response.text()
}

const locs = (xml: string) =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'))

export async function collectOldPaths(): Promise<string[]> {
  const index = await getText(SITEMAP)
  const urls = new Set<string>()
  const children = locs(index).filter((url) => url.endsWith('.xml'))
  for (const child of children.length ? children : [SITEMAP]) {
    for (const url of locs(child === SITEMAP ? index : await getText(child))) urls.add(url)
  }
  if (process.env.CHECK_EXTRA) {
    for (const line of fs.readFileSync(process.env.CHECK_EXTRA, 'utf8').split('\n'))
      if (line.trim()) urls.add(line.trim())
  }
  return [...urls].map((url) => {
    const parsed = new URL(url, 'https://stgallenbusinessreview.com')
    return `${parsed.pathname}${parsed.search}`
  })
}

/** Follows redirects manually so every hop is visible. */
export async function follow(path: string): Promise<{ status: number; chain: string[] }> {
  let url = `${TARGET}${path}`
  const chain = [path]
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    const response = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': USER_AGENT } })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url).toString()
      chain.push(new URL(url).pathname + new URL(url).search)
      continue
    }
    return { status: response.status, chain }
  }
  return { status: 0, chain: [...chain, '(too many redirects)'] }
}

async function main() {
  const paths = await collectOldPaths()
  console.log(`${paths.length} alte URLs aus ${SITEMAP}, Ziel ${TARGET}\n`)
  const failures: string[] = []
  for (const path of paths) {
    const { status, chain } = await follow(path)
    const line = `${status} ${chain.join(' → ')}`
    if (status !== 200) failures.push(line)
    else if (process.env.CHECK_VERBOSE) console.log(line)
  }
  console.log(`OK: ${paths.length - failures.length}, Fehler: ${failures.length}`)
  for (const failure of failures) console.log(`  ${failure}`)
  process.exit(failures.length ? 1 : 0)
}

if (process.argv[1]?.includes('check-redirects')) await main()
