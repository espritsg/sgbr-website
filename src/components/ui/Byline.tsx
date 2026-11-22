import { getLocale, getTranslations } from 'next-intl/server'
import { Fragment } from 'react'

import { Link } from '@/i18n/navigation'
import { peopleOf } from '@/lib/posts'
import type { Post } from '@/payload-types'

const PLACEHOLDER = '\u0000'

/** "Interview with <linked names>" / "By <linked names>" (ADR 0006). */
export async function Byline({ post }: { post: Pick<Post, 'type' | 'interviewees'> }) {
  const t = await getTranslations('article')
  const locale = await getLocale()
  const people = peopleOf(post)
  if (!people.length) return null
  const template = t(post.type === 'guest-article' ? 'by' : 'interviewWith', { names: PLACEHOLDER })
  const [before, after] = template.split(PLACEHOLDER)
  const parts = new Intl.ListFormat(locale === 'de' ? 'de' : 'en', {
    type: 'conjunction',
  }).formatToParts(people.map((person) => person.slug))
  return (
    <>
      {before}
      {parts.map((part, index) => {
        if (part.type === 'literal') return <Fragment key={index}>{part.value}</Fragment>
        const person = people.find((p) => p.slug === part.value)
        return person ? (
          <Link
            key={index}
            href={`/people/${person.slug}`}
            className="font-semibold hover:text-accent"
          >
            {person.name}
          </Link>
        ) : null
      })}
      {after}
    </>
  )
}
