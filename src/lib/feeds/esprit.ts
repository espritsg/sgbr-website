/**
 * JSON feeds for the plugin "ESPRIT – SGBR Connect" 1.0.1 on espritsg.ch
 * (docs/esprit-feed.md). Same keys, key order and types as the old WordPress feeds;
 * the URL values point to the new pages (ADR 0003). Contract: tests/int/esprit-feed.test.ts.
 */
import { ISSUE_SORT } from '@/lib/data/issueOrder'
import type { Payload } from 'payload'

import { formatFeedDate, formatFeedTime, isoWithOffset, isUpcoming } from '@/lib/dates'
import { fileUrl, serverUrl } from '@/lib/media'
import type { Event, Issue, Person } from '@/payload-types'

export type EventsFeed = {
  version: 1
  generated_at: string
  events: Array<{
    id: string
    status: 'upcoming' | 'past'
    logo_url: string
    url: string
    language: string
    name: string
    role: string
    company: string
    date: string
    time: string
    location: string
  }>
}

export type IssueFeedItem = {
  kind: 'digital' | 'pdf'
  year: string
  title: string
  description: string
  url: string
  cover_url: string
}
export type IssuesFeed = {
  version: 1
  generated_at: string
  digital: IssueFeedItem[]
  archive: IssueFeedItem[]
}

export function eventToFeedItem(event: Event, now = new Date()): EventsFeed['events'][number] {
  const speaker = (typeof event.speaker === 'object' ? event.speaker : null) as Person | null
  // Object literal in the exact key order of the old feed.
  return {
    id: event.slug,
    status: isUpcoming(event.startsAt, now) ? 'upcoming' : 'past',
    logo_url: fileUrl(speaker?.organizationLogo, true) ?? '',
    url: `${serverUrl()}/en/events/${event.slug}`,
    language: event.language === 'de' ? 'German' : 'English',
    name: speaker?.name ?? '',
    role: speaker?.role ?? '',
    company: speaker?.organization ?? '',
    date: formatFeedDate(event.startsAt),
    time: formatFeedTime(event.startsAt),
    location: event.location ?? '',
  }
}

export function issueToFeedItem(issue: Issue): IssueFeedItem {
  const digital = issue.format === 'digital'
  return {
    kind: digital ? 'digital' : 'pdf',
    year: String(issue.year),
    title: issue.title ?? '',
    description: issue.tagline ?? issue.description ?? '',
    url: digital ? `${serverUrl()}/en/issues/${issue.slug}` : (fileUrl(issue.pdf, true) ?? ''),
    cover_url: fileUrl(issue.cover, true) ?? '',
  }
}

/** Only published data, in English with fallback to German (docs/esprit-feed.md). */
export async function buildEventsFeed(payload: Payload, now = new Date()): Promise<EventsFeed> {
  const events = await payload.find({
    collection: 'events',
    locale: 'en',
    overrideAccess: false,
    sort: 'startsAt',
    limit: 500,
    depth: 2,
  })
  return {
    version: 1,
    generated_at: isoWithOffset(now),
    events: events.docs.map((event) => eventToFeedItem(event, now)),
  }
}

export async function buildIssuesFeed(payload: Payload, now = new Date()): Promise<IssuesFeed> {
  const issues = await payload.find({
    collection: 'issues',
    locale: 'en',
    overrideAccess: false,
    sort: ISSUE_SORT,
    limit: 500,
    depth: 1,
  })
  const items = issues.docs.map(issueToFeedItem)
  return {
    version: 1,
    generated_at: isoWithOffset(now),
    digital: items.filter((item) => item.kind === 'digital'),
    archive: items.filter((item) => item.kind === 'pdf'),
  }
}

/** JSON like PHP's json_encode on the old site: slashes escaped, Unicode as is. */
export function encodeLikeWordPress(data: unknown): string {
  return JSON.stringify(data).replace(/\//g, '\\/')
}

export function feedResponse(data: unknown): Response {
  return new Response(encodeLikeWordPress(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      // The plugin caches for 15 minutes itself; a short CDN cache is enough here.
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
