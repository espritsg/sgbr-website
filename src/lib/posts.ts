import type { Person, Post, Topic } from '@/payload-types'

import { joinNames } from './format'

export function peopleOf(post: Pick<Post, 'interviewees'>): Person[] {
  return (post.interviewees ?? []).filter((p): p is Person => typeof p === 'object' && p !== null)
}

export function topicsOf(post: Pick<Post, 'topics'>): Topic[] {
  return (post.topics ?? []).filter((t): t is Topic => typeof t === 'object' && t !== null)
}

/** The first main topic, used as the kicker above titles. */
export function mainTopicOf(post: Pick<Post, 'topics'>): Topic | null {
  return topicsOf(post).find((topic) => !topic.parent) ?? null
}

type Translate = (key: string, values?: Record<string, string>) => string

/** "Interview with X" for interviews, "By X" for guest articles (ADR 0006). */
export function bylineFor(
  post: Pick<Post, 'type' | 'interviewees'>,
  t: Translate,
  locale: string,
): string | null {
  const names = peopleOf(post).map((person) => person.name)
  if (!names.length) return null
  const joined = joinNames(names, locale)
  return post.type === 'guest-article'
    ? t('by', { names: joined })
    : t('interviewWith', { names: joined })
}
