import type { CollectionConfig } from 'payload'

import { contentAccess } from '@/access/permissions'

import { contentVersions, magazineGroup } from '../shared'

export const teamGroups = [
  { label: 'Editorial Board', value: 'editorial-board' },
  { label: 'Editors', value: 'editors' },
  { label: 'Advisory Board', value: 'advisory' },
] as const

/** The editorial team shown on the About page. */
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: {
    singular: { de: 'Teammitglied', en: 'Team member' },
    plural: { de: 'Team', en: 'Team' },
  },
  access: contentAccess,
  admin: {
    group: magazineGroup,
    useAsTitle: 'name',
    defaultColumns: ['name', 'group', 'position', 'active', '_status'],
  },
  defaultSort: 'order',
  versions: contentVersions(false),
  fields: [
    { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' } },
    { name: 'photo', type: 'upload', relationTo: 'media', label: { de: 'Foto', en: 'Photo' } },
    {
      name: 'group',
      type: 'select',
      required: true,
      defaultValue: 'editors',
      label: { de: 'Gruppe', en: 'Group' },
      options: [...teamGroups],
    },
    { name: 'position', type: 'text', localized: true, label: { de: 'Position', en: 'Position' } },
    {
      type: 'row',
      fields: [
        {
          name: 'study',
          type: 'text',
          localized: true,
          label: { de: 'Studiengang', en: 'Study programme' },
        },
        { name: 'university', type: 'text', label: { de: 'Universität', en: 'University' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: { de: 'E-Mail', en: 'Email' },
          admin: {
            width: '50%',
            description: {
              de: 'Wird auf der About-Seite angezeigt.',
              en: 'Shown on the About page.',
            },
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          label: { de: 'LinkedIn-Profil (URL)', en: 'LinkedIn profile (URL)' },
          admin: { width: '50%' },
          validate: (value: unknown) =>
            !value || /^https:\/\/([a-z]+\.)?linkedin\.com\//.test(String(value))
              ? true
              : 'https://www.linkedin.com/in/…',
        },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      label: { de: 'Aktiv', en: 'Active' },
      admin: {
        position: 'sidebar',
        description: { de: 'Ehemalige abhaken.', en: 'Untick for alumni.' },
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: { de: 'Reihenfolge', en: 'Order' },
      admin: { position: 'sidebar' },
    },
  ],
}
