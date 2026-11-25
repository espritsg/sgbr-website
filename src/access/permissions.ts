/**
 * All access rules of the site in one place (docs/rollen.md).
 *
 * Every collection and global imports its access config from here. Changing a rule
 * means changing this file and the matching test in tests/int/access.test.ts.
 */
import type {
  Access,
  AccessArgs,
  CollectionConfig,
  FieldAccess,
  GlobalConfig,
  Where,
} from 'payload'

import { getRole, hasRole, type Role } from './roles'

type CollectionAccess = NonNullable<CollectionConfig['access']>
type GlobalAccess = NonNullable<GlobalConfig['access']>

const publishedOnly: Where = { _status: { equals: 'published' } }

/** Roles that may write content (as draft at least). */
const CONTENT_WRITERS: Role[] = ['admin', 'board', 'editor']
/** Roles that may publish, delete content and manage the site. */
const PUBLISHERS: Role[] = ['admin', 'board']

export const isLoggedIn: Access = ({ req }) => getRole(req.user) !== null
export const isAdmin: Access = ({ req }) => hasRole(req.user, 'admin')
export const isPublisher: Access = ({ req }) => hasRole(req.user, ...PUBLISHERS)
export const nobody: Access = () => false
export const anyone: Access = () => true

/**
 * Editors may create and change content, but never publish it. Payload asks this rule
 * with `data: { _status: 'published' }` to decide whether to show the publish and
 * schedule buttons, so a `false` here hides them for editors.
 */
const writeWithoutPublishing: Access = ({ req, data }: AccessArgs) => {
  if (hasRole(req.user, ...PUBLISHERS)) return true
  if (!hasRole(req.user, 'editor')) return false
  const status = (data as { _status?: string } | undefined)?._status
  return status !== 'published'
}

/** Public visitors see only published documents, logged-in users see everything. */
const readPublishedOrLoggedIn: Access = ({ req }) => (getRole(req.user) ? true : publishedOnly)

/** Content with drafts: posts, people, topics, issues, events, team-members, pages. */
export const contentAccess: CollectionAccess = {
  read: readPublishedOrLoggedIn,
  readVersions: isLoggedIn,
  create: writeWithoutPublishing,
  update: writeWithoutPublishing,
  delete: isPublisher,
}

/** Media: public files, editors may upload and edit, only publishers delete. */
export const mediaAccess: CollectionAccess = {
  read: anyone,
  create: ({ req }) => hasRole(req.user, ...CONTENT_WRITERS),
  update: ({ req }) => hasRole(req.user, ...CONTENT_WRITERS),
  delete: isPublisher,
}

/**
 * Newsletters: texts are content (editors write), sending is a separate action
 * (src/access/actions.ts). The public sees only archived, sent newsletters.
 */
export const newsletterAccess: CollectionAccess = {
  read: ({ req }) => {
    if (getRole(req.user)) return true
    const archived: Where = {
      and: [
        { status: { equals: 'sent' } },
        { showInArchive: { equals: true } },
        { archiveVisibleFrom: { less_than_equal: new Date().toISOString() } },
      ],
    }
    return archived
  },
  readVersions: isLoggedIn,
  create: ({ req }) => hasRole(req.user, ...CONTENT_WRITERS),
  update: ({ req }) => hasRole(req.user, ...CONTENT_WRITERS),
  delete: isPublisher,
}

/** Forms are built by publishers; everyone logged in can see them (e.g. to link an event). */
export const formAccess: CollectionAccess = {
  read: isLoggedIn,
  create: isPublisher,
  update: isPublisher,
  delete: isPublisher,
}

/**
 * Form submissions: anyone may submit through a form, only admin and board read.
 * Editors and advisory board never see submissions (decided 2026-11-22).
 */
export const formSubmissionAccess: CollectionAccess = {
  read: isPublisher,
  create: anyone,
  update: isAdmin,
  delete: isAdmin,
}

/** Uploaded CVs. Created only by the form submission hook (Local API). */
export const applicationFileAccess: CollectionAccess = {
  read: isPublisher,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}

export const redirectAccess: CollectionAccess = {
  read: isPublisher,
  create: isPublisher,
  update: isPublisher,
  delete: isPublisher,
}

/** Search index: public read, written only by the search plugin hooks. */
export const searchAccess: CollectionAccess = {
  read: anyone,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin,
}

/** Internal tables (rate limits, newsletter deliveries): admin only. */
export const internalAccess: CollectionAccess = {
  read: isAdmin,
  create: nobody,
  update: nobody,
  delete: isAdmin,
}

/** Users: only the admin creates and deletes; everyone else sees and edits only themselves. */
const selfOrAdmin: Access = ({ req }) => {
  if (hasRole(req.user, 'admin')) return true
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}

export const userAccess: CollectionAccess = {
  admin: ({ req }) => getRole(req.user) !== null,
  read: selfOrAdmin,
  create: isAdmin,
  update: selfOrAdmin,
  delete: isAdmin,
}

/** Only the admin may change roles, including their own. */
export const roleFieldAccess: { create: FieldAccess; update: FieldAccess } = {
  create: ({ req }) => hasRole(req.user, 'admin'),
  update: ({ req }) => hasRole(req.user, 'admin'),
}

/** Header, footer, homepage: public read, publishers edit. */
export const globalContentAccess: GlobalAccess = {
  read: anyone,
  update: isPublisher,
}

/** Site settings: admin edits, board reads. The frontend reads via the Local API. */
export const siteSettingsAccess: GlobalAccess = {
  read: isPublisher,
  update: isAdmin,
}

/**
 * Who may run background jobs through Payload's job endpoint: logged-in admins and
 * the daily Vercel Cron, which sends `Authorization: Bearer <CRON_SECRET>`.
 */
export function canRunJobs({ req }: { req: { user?: unknown; headers: Headers } }): boolean {
  if (hasRole(req.user as Parameters<typeof hasRole>[0], 'admin')) return true
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get('authorization') === `Bearer ${secret}`
}

/** Payload's own exports/imports (plugin-import-export): publishers only. */
export const exportAccess: CollectionAccess = {
  read: isPublisher,
  create: isPublisher,
  update: isPublisher,
  delete: isPublisher,
}
