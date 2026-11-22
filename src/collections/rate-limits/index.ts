import type { CollectionConfig } from 'payload'

import { internalAccess } from '@/access/permissions'

/**
 * Request counters per hashed IP and purpose (ADR 0005). Internal, written only by
 * src/lib/rateLimit.ts and cleaned up by the daily job.
 */
export const RateLimits: CollectionConfig = {
  slug: 'rate-limits',
  access: internalAccess,
  admin: { hidden: true },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'count', type: 'number', required: true, defaultValue: 0 },
    { name: 'windowStart', type: 'date', required: true, index: true },
  ],
}
