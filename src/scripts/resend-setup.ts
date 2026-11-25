/**
 * Sets up the newsletter in Resend once (ADR 0021, docs/deployment.md):
 * two segments (one per language), two topics (newsletter, event invitations) and
 * the contact properties. Safe to run again: existing ones are found by name/key.
 *
 *   RESEND_API_KEY=re_… npm run resend:setup
 *
 * Prints the four IDs for the environment variables in Vercel.
 */
import 'dotenv/config'

import { Resend } from 'resend'

const SEGMENTS = { RESEND_SEGMENT_EN: 'SGBR – English', RESEND_SEGMENT_DE: 'SGBR – Deutsch' }
const TOPICS = {
  RESEND_TOPIC_NEWSLETTER: { name: 'Newsletter', description: 'Monthly newsletter of SGBR' },
  RESEND_TOPIC_EVENTS: {
    name: 'Event invitations',
    description: 'Invitations to SGBR speaker events',
  },
}
const PROPERTIES = ['locale', 'source', 'consent_at', 'confirmed_at']

function check<T>(result: { data: T | null; error: { name: string; message: string } | null }) {
  if (result.error) throw new Error(`${result.error.name}: ${result.error.message}`)
  return result.data as T
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Bitte RESEND_API_KEY setzen (Key mit „Full access“).')
    process.exit(1)
  }
  const resend = new Resend(apiKey)
  const output: Record<string, string> = {}

  const segments = check(await resend.segments.list({ limit: 100 })).data
  for (const [env, name] of Object.entries(SEGMENTS)) {
    const found = segments.find((segment) => segment.name === name)
    output[env] = found ? found.id : check(await resend.segments.create({ name })).id
    console.log(`${found ? '✓' : '+'} Segment „${name}“`)
  }

  const topics = check(await resend.topics.list()).data
  for (const [env, topic] of Object.entries(TOPICS)) {
    const found = topics.find((item) => item.name === topic.name)
    // opt_out: only contacts who chose this interest at signup receive it.
    output[env] = found
      ? found.id
      : check(await resend.topics.create({ ...topic, defaultSubscription: 'opt_out' })).id
    console.log(`${found ? '✓' : '+'} Topic „${topic.name}“`)
  }

  const properties = check(await resend.contactProperties.list({ limit: 100 })).data
  for (const key of PROPERTIES) {
    if (properties.some((property) => property.key === key)) {
      console.log(`✓ Kontaktfeld ${key}`)
      continue
    }
    check(await resend.contactProperties.create({ key, type: 'string', fallbackValue: '' }))
    console.log(`+ Kontaktfeld ${key}`)
  }

  console.log('\nIn Vercel (Production und Preview) eintragen:\n')
  for (const [env, id] of Object.entries(output)) console.log(`${env}=${id}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
