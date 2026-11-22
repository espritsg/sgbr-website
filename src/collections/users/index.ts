import type { CollectionConfig } from 'payload'

import { roleFieldAccess, userAccess } from '@/access/permissions'
import { roleLabels, roles } from '@/access/roles'

import { settingsGroup } from '../shared'
import { firstUserIsAdmin } from './hooks'

/** Admin users. Only the admin creates users and changes roles (docs/rollen.md). */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { de: 'Benutzer', en: 'User' }, plural: { de: 'Benutzer', en: 'Users' } },
  access: userAccess,
  admin: {
    group: settingsGroup,
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
  },
  hooks: {
    beforeChange: [firstUserIsAdmin],
  },
  fields: [
    { name: 'name', type: 'text', label: { de: 'Name', en: 'Name' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'advisory',
      saveToJWT: true,
      access: roleFieldAccess,
      label: { de: 'Rolle', en: 'Role' },
      options: roles.map((role) => ({ value: role, label: roleLabels[role] })),
      admin: {
        position: 'sidebar',
        description: {
          de: 'Nur der Admin kann Rollen ändern. Ausscheidende auf „Advisory Board“ setzen.',
          en: 'Only the admin can change roles. Set people who leave to "Advisory Board".',
        },
      },
    },
    {
      name: 'teamMember',
      type: 'relationship',
      relationTo: 'team-members',
      label: { de: 'Teammitglied', en: 'Team member' },
      admin: { position: 'sidebar' },
    },
  ],
}
