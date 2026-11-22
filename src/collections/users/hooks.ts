import type { CollectionBeforeChangeHook } from 'payload'

/** The very first user (created on /admin/create-first-user) becomes admin. */
export const firstUserIsAdmin: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  const existing = await req.payload.count({ collection: 'users', overrideAccess: true, req })
  if (existing.totalDocs === 0) data.role = 'admin'
  return data
}
