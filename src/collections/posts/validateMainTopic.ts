import type { Validate } from 'payload'

type TopicValue = number | string | { id: number | string } | { relationTo: string; value: unknown }

function toId(value: TopicValue): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return value.id
  return null
}

/**
 * Every article needs at least one main topic (a topic without parent).
 * Payload skips validation for drafts, so this only applies when publishing.
 * The migration bypasses it (context.import) so old URLs keep working; its report
 * lists the affected articles for the editorial team.
 */
export const validateMainTopic: Validate<unknown, unknown, unknown, object> = async (
  value,
  { req },
) => {
  if (req.context?.import === true) return true
  const ids = (Array.isArray(value) ? (value as TopicValue[]) : [])
    .map(toId)
    .filter((id) => id !== null)
  const message =
    req.i18n?.language === 'de'
      ? 'Mindestens ein Haupt-Thema auswählen.'
      : 'Select at least one main topic.'
  if (ids.length === 0) return message
  const result = await req.payload.find({
    collection: 'topics',
    where: { and: [{ id: { in: ids } }, { parent: { exists: false } }] },
    limit: 1,
    depth: 0,
    draft: true,
    req,
  })
  return result.totalDocs > 0 ? true : message
}
