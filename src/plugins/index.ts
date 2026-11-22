import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Plugin } from 'payload'

import {
  exportAccess,
  formAccess,
  formSubmissionAccess,
  isAdmin,
  redirectAccess,
  searchAccess,
} from '@/access/permissions'
import { formsGroup, settingsGroup } from '@/collections/shared'
import { storagePlugins } from '@/lib/storage'

import { searchBeforeSync } from './searchSync'

const isMcpEnabled = process.env.MCP_ENABLED === 'true'

export function plugins(): Plugin[] {
  return [
    ...storagePlugins(),

    seoPlugin({
      collections: ['posts', 'pages', 'issues', 'events'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }) => {
        const title =
          (doc as { title?: string; slug?: string })?.title ?? (doc as { slug?: string })?.slug
        return title ? `${title} | St. Gallen Business Review` : 'St. Gallen Business Review'
      },
      generateDescription: ({ doc }) =>
        (doc as { summary?: string; tagline?: string })?.summary ??
        (doc as { tagline?: string })?.tagline ??
        '',
    }),

    redirectsPlugin({
      collections: ['posts', 'pages', 'issues', 'events', 'people', 'topics'],
      redirectTypes: ['301', '302', '307', '308'],
      overrides: {
        access: redirectAccess,
        admin: { group: settingsGroup },
        labels: {
          singular: { de: 'Weiterleitung', en: 'Redirect' },
          plural: { de: 'Weiterleitungen', en: 'Redirects' },
        },
      },
    }),

    searchPlugin({
      collections: ['posts', 'issues', 'events', 'people'],
      localize: true,
      defaultPriorities: { posts: 10, issues: 20, events: 30, people: 40 },
      beforeSync: searchBeforeSync,
      searchOverrides: {
        access: searchAccess,
        admin: {
          group: settingsGroup,
          hidden: ({ user }) => (user as { role?: string })?.role !== 'admin',
        },
        labels: {
          singular: { de: 'Suchindex', en: 'Search index' },
          plural: { de: 'Suchindex', en: 'Search index' },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          { name: 'slug', type: 'text', index: true, admin: { readOnly: true } },
          { name: 'excerpt', type: 'textarea', localized: true, admin: { readOnly: true } },
        ],
      },
    }),

    formBuilderPlugin({
      fields: {
        text: true,
        email: true,
        textarea: true,
        select: true,
        checkbox: true,
        number: true,
        country: true,
        message: true,
        upload: true,
        date: false,
        state: false,
        radio: false,
        payment: false,
      },
      uploadCollections: ['application-files'],
      redirectRelationships: ['pages', 'posts', 'events'],
      formOverrides: {
        access: formAccess,
        admin: { group: formsGroup },
        labels: {
          singular: { de: 'Formular', en: 'Form' },
          plural: { de: 'Formulare', en: 'Forms' },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'retentionMonths',
            type: 'number',
            defaultValue: 6,
            min: 1,
            required: true,
            label: { de: 'Aufbewahrung (Monate)', en: 'Retention (months)' },
            admin: {
              position: 'sidebar',
              description: {
                de: 'Einsendungen und Dateien werden so viele Monate nach dem Event gelöscht (ohne Event: nach dem Einsendedatum).',
                en: 'Submissions and files are deleted this many months after the event (without event: after submission).',
              },
            },
          },
        ],
      },
      formSubmissionOverrides: {
        access: formSubmissionAccess,
        admin: {
          group: formsGroup,
          defaultColumns: ['form', 'event', 'createdAt'],
        },
        labels: {
          singular: { de: 'Einsendung', en: 'Submission' },
          plural: { de: 'Einsendungen', en: 'Submissions' },
        },
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: 'event',
            type: 'relationship',
            relationTo: 'events',
            index: true,
            label: { de: 'Event', en: 'Event' },
            admin: { readOnly: true, position: 'sidebar' },
          },
        ],
      },
    }),

    importExportPlugin({
      collections: [
        { slug: 'posts', import: false },
        { slug: 'people', import: false },
        { slug: 'issues', import: false },
        { slug: 'events', import: false },
        { slug: 'topics', import: false },
        { slug: 'team-members', import: false },
        { slug: 'subscribers', import: false },
        { slug: 'form-submissions', import: false },
      ],
      overrideExportCollection: ({ collection }) => ({
        ...collection,
        access: exportAccess,
        admin: { ...collection.admin, group: settingsGroup },
      }),
      overrideImportCollection: ({ collection }) => ({
        ...collection,
        access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
        admin: { ...collection.admin, group: settingsGroup, hidden: true },
      }),
    }),

    // Built in, off by default (MCP_ENABLED=false). When disabled, the plugin keeps its
    // collections in the schema so turning it on needs no migration.
    mcpPlugin({
      disabled: !isMcpEnabled,
      collections: {
        posts: { enabled: { find: true, create: true, update: true, delete: false } },
        people: { enabled: { find: true, create: true, update: true, delete: false } },
        events: { enabled: { find: true, create: true, update: true, delete: false } },
        media: { enabled: { find: true, create: true, update: true, delete: false } },
      },
      overrideApiKeyCollection: (collection) => ({
        ...collection,
        access: { read: isAdmin, create: isAdmin, update: isAdmin, delete: isAdmin },
        admin: { ...collection.admin, group: settingsGroup },
      }),
    }),
  ]
}
