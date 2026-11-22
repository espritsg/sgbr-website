import type { CollectionSlug, Payload, Where } from 'payload'

type Doc = { id: number | string; [key: string]: unknown }

/**
 * Creates or updates a document identified by one field (wpId, slug, email …),
 * so imports can run again without creating duplicates (docs/migration.md).
 */
export async function upsert(
  payload: Payload,
  collection: CollectionSlug,
  where: { field: string; value: string | number },
  data: Record<string, unknown>,
  options: { locale?: 'en' | 'de'; draft?: boolean } = {},
): Promise<{ doc: Doc; created: boolean }> {
  const existing = await payload.find({
    collection,
    where: { [where.field]: { equals: where.value } } as Where,
    limit: 1,
    depth: 0,
    draft: true,
    locale: options.locale,
  })
  const found = existing.docs[0] as unknown as Doc | undefined
  if (found) {
    const doc = (await payload.update({
      collection,
      id: found.id,
      data,
      locale: options.locale,
      depth: 0,
      draft: options.draft,
      context: { import: true },
    } as never)) as unknown as Doc
    return { doc, created: false }
  }
  const doc = (await payload.create({
    collection,
    data,
    locale: options.locale,
    depth: 0,
    draft: options.draft,
    context: { import: true },
  } as never)) as unknown as Doc
  return { doc, created: true }
}
