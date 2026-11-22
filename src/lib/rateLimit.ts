import crypto from 'crypto'
import type { Payload } from 'payload'

export type RateLimitOptions = { purpose: string; limit?: number; windowSeconds?: number }

/** Client IP from the proxy headers Vercel sets. */
export function clientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/** The IP is never stored in plain text (ADR 0005). */
export function hashKey(purpose: string, ip: string): string {
  const secret = process.env.PAYLOAD_SECRET || 'local'
  return `${purpose}:${crypto.createHmac('sha256', secret).update(ip).digest('hex').slice(0, 32)}`
}

/**
 * Fixed-window rate limit in Postgres (collection rate-limits). Returns false if
 * the request exceeds the limit. Default: 10 requests per 10 minutes.
 */
export async function checkRateLimit(
  payload: Payload,
  ip: string,
  options: RateLimitOptions,
): Promise<boolean> {
  const limit = options.limit ?? 10
  const windowMs = (options.windowSeconds ?? 600) * 1000
  const key = hashKey(options.purpose, ip)
  const now = Date.now()

  const existing = await payload.find({
    collection: 'rate-limits',
    where: { key: { equals: key } },
    limit: 1,
    depth: 0,
  })
  const entry = existing.docs[0]
  if (!entry || now - new Date(entry.windowStart).getTime() > windowMs) {
    if (entry) {
      await payload.update({
        collection: 'rate-limits',
        id: entry.id,
        data: { count: 1, windowStart: new Date(now).toISOString() },
      })
    } else {
      try {
        await payload.create({
          collection: 'rate-limits',
          data: { key, count: 1, windowStart: new Date(now).toISOString() },
        })
      } catch {
        // Created concurrently by a parallel request: count it on the next call.
      }
    }
    return true
  }
  if (entry.count >= limit) return false
  await payload.update({
    collection: 'rate-limits',
    id: entry.id,
    data: { count: entry.count + 1 },
  })
  return true
}

/** Deletes expired entries (daily job). */
export async function purgeRateLimits(
  payload: Payload,
  olderThanSeconds = 24 * 3600,
): Promise<number> {
  const before = new Date(Date.now() - olderThanSeconds * 1000).toISOString()
  const result = await payload.delete({
    collection: 'rate-limits',
    where: { windowStart: { less_than: before } },
  })
  return result.docs.length
}
