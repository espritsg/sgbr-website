/**
 * English short bios for people who only have a German one (docs/migration.md),
 * translated outside Payload (e.g. by Claude Code in a session).
 *
 *   npm run bios -- export /path/bios-de.json   # people with German bio but no English one
 *   npm run bios -- apply  /path/bios-en.json   # [{ "id": 12, "bio": "…" }]
 *
 * `apply` writes only where the English bio is still empty and sets "Check bio
 * translation", so the editors see what was translated.
 */
import fs from 'fs/promises'

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Person } from '@/payload-types'

const [mode, file] = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
if (!['export', 'apply'].includes(mode ?? '') || !file) {
  console.error('Aufruf: npm run bios -- export|apply <datei.json>')
  process.exit(1)
}

const payload = await getPayload({ config })

async function allPeople(): Promise<Person[]> {
  const docs: Person[] = []
  for (let page = 1; ; page++) {
    const result = await payload.find({
      collection: 'people',
      draft: true,
      depth: 0,
      limit: 100,
      page,
      locale: 'all' as never,
    })
    docs.push(...(result.docs as Person[]))
    if (!result.hasNextPage) break
  }
  return docs
}

/** Localized fields come as { en, de } with locale "all". */
const bioIn = (person: Person, locale: 'en' | 'de'): string =>
  ((person.bio as unknown as Record<string, string | null> | null)?.[locale] ?? '').trim()

if (mode === 'export') {
  const people = (await allPeople()).filter((person) => bioIn(person, 'de') && !bioIn(person, 'en'))
  const out = people.map((person) => ({
    id: person.id,
    name: person.name,
    bio: bioIn(person, 'de'),
  }))
  await fs.writeFile(file, JSON.stringify(out, null, 2))
  console.log(`${out.length} Personen mit deutscher, aber ohne englische Kurzbiografie → ${file}`)
} else {
  const items = JSON.parse(await fs.readFile(file, 'utf8')) as Array<{ id: number; bio: string }>
  let written = 0
  for (const item of items) {
    const person = (await payload.findByID({
      collection: 'people',
      id: item.id,
      depth: 0,
      locale: 'all' as never,
      draft: true,
    })) as Person
    if (bioIn(person, 'en') || !item.bio?.trim()) continue
    await payload.update({
      collection: 'people',
      id: item.id,
      locale: 'en',
      data: { bio: item.bio.trim(), bioNeedsReview: true },
      context: { import: true },
    })
    written++
  }
  console.log(`${written} englische Kurzbiografien geschrieben (markiert „Übersetzung prüfen“).`)
}
process.exit(0)
