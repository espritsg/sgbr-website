/**
 * The four roles of the admin (docs/rollen.md). Exactly one role per user.
 */
export const roles = ['admin', 'board', 'editor', 'advisory'] as const
export type Role = (typeof roles)[number]

export const roleLabels: Record<Role, { de: string; en: string }> = {
  admin: { de: 'Admin', en: 'Admin' },
  board: { de: 'Editorial Board', en: 'Editorial Board' },
  editor: { de: 'Editor', en: 'Editor' },
  advisory: { de: 'Advisory Board', en: 'Advisory Board' },
}

type MaybeUser = { role?: string | null; collection?: string } | null | undefined

export function getRole(user: MaybeUser): Role | null {
  if (!user || (user.collection && user.collection !== 'users')) return null
  const role = user.role
  return (roles as readonly string[]).includes(role ?? '') ? (role as Role) : null
}

export function hasRole(user: MaybeUser, ...allowed: Role[]): boolean {
  const role = getRole(user)
  return role !== null && allowed.includes(role)
}
