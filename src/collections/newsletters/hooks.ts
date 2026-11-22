import type { CollectionBeforeChangeHook } from 'payload'

const DAY_MS = 24 * 60 * 60 * 1000

/** Returns when a sent newsletter becomes visible in the public archive. */
export function archiveVisibleFrom(
  sentAt: string | Date | null | undefined,
  delayDays: number | null | undefined,
): string | null {
  if (!sentAt) return null
  const days = Math.max(0, delayDays ?? 30)
  return new Date(new Date(sentAt).getTime() + days * DAY_MS).toISOString()
}

export const computeArchiveVisibleFrom: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const sentAt = data.sentAt ?? originalDoc?.sentAt
  const delay = data.archiveDelayDays ?? originalDoc?.archiveDelayDays
  data.archiveVisibleFrom = archiveVisibleFrom(sentAt, delay)
  return data
}
