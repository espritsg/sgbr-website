import type { Payload } from 'payload'

import type { Role } from '@/access/roles'
import type { User } from '@/payload-types'

export type TestUsers = Record<Role, User>

/** Creates (or reuses) one user per role for access tests. */
export async function ensureRoleUsers(payload: Payload): Promise<TestUsers> {
  const result = {} as TestUsers
  for (const role of ['admin', 'board', 'editor', 'advisory'] as Role[]) {
    const email = `${role}@test.sgbr.local`
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    const user =
      existing.docs[0] ??
      (await payload.create({
        collection: 'users',
        data: { email, password: 'test-password-123', name: role, role },
      }))
    // The first user always becomes admin; make sure every user has the intended role.
    result[role] =
      user.role === role
        ? ({ ...user, collection: 'users' } as User)
        : ({
            ...(await payload.update({ collection: 'users', id: user.id, data: { role } })),
            collection: 'users',
          } as User)
  }
  return result
}
