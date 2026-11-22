/**
 * Access matrix from docs/rollen.md. If you change src/access/permissions.ts,
 * update docs/rollen.md and this test together.
 */
import type { CollectionSlug, GlobalSlug, Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import type { Role } from '@/access/roles'
import { plainTextToLexical } from '@/lib/richtext/plain'
import type { User } from '@/payload-types'

import { getTestPayload } from '../helpers/payload'
import { ensureRoleUsers, type TestUsers } from '../helpers/users'

let payload: Payload
let users: TestUsers
let publishedPostId: number
let draftPostId: number
let mainTopicId: number

async function allowed(fn: () => Promise<unknown>): Promise<boolean> {
  try {
    await fn()
    return true
  } catch (error) {
    const status = (error as { status?: number }).status
    if (status === 403) return false
    throw error
  }
}

const asUser = (role: Role | 'public'): { user?: User; overrideAccess: false } =>
  role === 'public' ? { overrideAccess: false } : { user: users[role], overrideAccess: false }

beforeAll(async () => {
  payload = await getTestPayload()
  users = await ensureRoleUsers(payload)
  const topic = await payload.create({
    collection: 'topics',
    data: { title: 'Business', slug: 'business-access-test', _status: 'published' },
  })
  mainTopicId = topic.id
  const published = await payload.create({
    collection: 'posts',
    data: {
      title: 'Published post',
      slug: 'access-published',
      summary: 'Summary.',
      type: 'interview',
      originalLanguage: 'en',
      topics: [mainTopicId],
      _status: 'published',
    },
  })
  publishedPostId = published.id
  const draft = await payload.create({
    collection: 'posts',
    draft: true,
    data: {
      title: 'Draft post',
      slug: 'access-draft',
      summary: 'Summary.',
      originalLanguage: 'en',
      _status: 'draft',
    },
  })
  draftPostId = draft.id
})

describe('content (posts as representative, same rules for all content collections)', () => {
  it('public sees only published posts', async () => {
    const result = await payload.find({ collection: 'posts', ...asUser('public'), limit: 100 })
    const ids = result.docs.map((d) => d.id)
    expect(ids).toContain(publishedPostId)
    expect(ids).not.toContain(draftPostId)
  })

  it.each(['admin', 'board', 'editor', 'advisory'] as Role[])(
    '%s sees drafts too',
    async (role) => {
      const result = await payload.find({
        collection: 'posts',
        ...asUser(role),
        draft: true,
        limit: 100,
      })
      expect(result.docs.map((d) => d.id)).toContain(draftPostId)
    },
  )

  const draftData = (slug: string) => ({
    title: slug,
    slug,
    summary: 'Summary.',
    originalLanguage: 'en' as const,
    _status: 'draft' as const,
  })

  it.each([
    ['admin', true],
    ['board', true],
    ['editor', true],
    ['advisory', false],
    ['public', false],
  ] as const)('%s may create drafts: %s', async (role, expected) => {
    const ok = await allowed(() =>
      payload.create({
        collection: 'posts',
        draft: true,
        data: draftData(`draft-by-${role}`),
        ...asUser(role),
      }),
    )
    expect(ok).toBe(expected)
  })

  it.each([
    ['admin', true],
    ['board', true],
    ['editor', false],
    ['advisory', false],
  ] as const)('%s may publish: %s', async (role, expected) => {
    const ok = await allowed(() =>
      payload.update({
        collection: 'posts',
        id: draftPostId,
        data: { _status: 'published', topics: [mainTopicId] },
        ...asUser(role),
      }),
    )
    expect(ok).toBe(expected)
    if (ok) {
      await payload.update({
        collection: 'posts',
        id: draftPostId,
        data: { _status: 'draft' },
        draft: true,
      })
    }
  })

  it('editor may change a draft without publishing it', async () => {
    const ok = await allowed(() =>
      payload.update({
        collection: 'posts',
        id: draftPostId,
        draft: true,
        data: { title: 'Changed by editor', _status: 'draft' },
        ...asUser('editor'),
      }),
    )
    expect(ok).toBe(true)
  })

  it('hides the publish button for editors (update access with _status published)', async () => {
    const { Posts } = await import('@/collections/posts')
    const update = Posts.access!.update!
    const req = (user?: User) => ({ user, payload }) as never
    expect(await update({ req: req(users.editor), data: { _status: 'published' } } as never)).toBe(
      false,
    )
    expect(await update({ req: req(users.editor), data: { _status: 'draft' } } as never)).toBe(true)
    expect(await update({ req: req(users.board), data: { _status: 'published' } } as never)).toBe(
      true,
    )
  })

  it.each([
    ['admin', true],
    ['board', true],
    ['editor', false],
    ['advisory', false],
  ] as const)('%s may delete: %s', async (role, expected) => {
    const doc = await payload.create({
      collection: 'posts',
      draft: true,
      data: draftData(`delete-by-${role}`),
    })
    const ok = await allowed(() =>
      payload.delete({ collection: 'posts', id: doc.id, ...asUser(role) }),
    )
    expect(ok).toBe(expected)
  })
})

describe('collections with restricted visibility', () => {
  const cases: Array<[CollectionSlug, Record<Role | 'public', boolean>]> = [
    ['subscribers', { admin: true, board: true, editor: false, advisory: false, public: false }],
    [
      'form-submissions',
      { admin: true, board: true, editor: false, advisory: false, public: false },
    ],
    [
      'application-files',
      { admin: true, board: true, editor: false, advisory: false, public: false },
    ],
    ['redirects', { admin: true, board: true, editor: false, advisory: false, public: false }],
    ['forms', { admin: true, board: true, editor: true, advisory: true, public: false }],
    ['rate-limits', { admin: true, board: false, editor: false, advisory: false, public: false }],
  ]

  for (const [collection, expectations] of cases) {
    it.each(Object.entries(expectations))(
      `${collection}: %s may read: %s`,
      async (role, expected) => {
        const ok = await allowed(() =>
          payload.find({ collection, limit: 1, ...asUser(role as Role | 'public') }),
        )
        expect(ok).toBe(expected)
      },
    )
  }

  it('subscribers cannot be created through the API, not even by the board', async () => {
    for (const role of ['board', 'editor', 'advisory', 'public'] as const) {
      const ok = await allowed(() =>
        payload.create({
          collection: 'subscribers',
          data: { email: `x-${role}@example.com`, locale: 'en', status: 'pending' },
          ...asUser(role),
        }),
      )
      expect(ok, role).toBe(false)
    }
  })

  it.each([
    ['admin', true],
    ['board', true],
    ['editor', false],
    ['advisory', false],
  ] as const)('forms: %s may build forms: %s', async (role, expected) => {
    const ok = await allowed(() =>
      payload.create({
        collection: 'forms',
        data: {
          title: `Form by ${role}`,
          confirmationType: 'message',
          confirmationMessage: plainTextToLexical('Thanks'),
          retentionMonths: 6,
        },
        ...asUser(role),
      }),
    )
    expect(ok).toBe(expected)
  })

  it('anyone may submit a form', async () => {
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Contact',
        confirmationType: 'message',
        confirmationMessage: plainTextToLexical('Thanks'),
        retentionMonths: 6,
        fields: [{ blockType: 'text', name: 'name', label: 'Name', required: false }],
      },
    })
    const ok = await allowed(() =>
      payload.create({
        collection: 'form-submissions',
        data: { form: form.id, submissionData: [{ field: 'name', value: 'Ada' }] },
        ...asUser('public'),
      }),
    )
    expect(ok).toBe(true)
  })
})

describe('media and newsletters', () => {
  it.each([
    ['admin', true],
    ['board', true],
    ['editor', true],
    ['advisory', false],
  ] as const)('newsletters: %s may write texts: %s', async (role, expected) => {
    const ok = await allowed(() =>
      payload.create({
        collection: 'newsletters',
        data: {
          title: `NL ${role}`,
          subject: 'Subject',
          status: 'draft',
          slug: `nl-${role}`,
          audience: 'newsletter',
        },
        ...asUser(role),
      }),
    )
    expect(ok).toBe(expected)
  })

  it('public sees only sent and archived newsletters', async () => {
    const draft = await payload.create({
      collection: 'newsletters',
      data: {
        title: 'Not sent',
        subject: 'S',
        slug: 'nl-not-sent',
        audience: 'newsletter',
        status: 'draft',
      },
    })
    const result = await payload.find({ collection: 'newsletters', ...asUser('public') })
    expect(result.docs.map((d) => d.id)).not.toContain(draft.id)
  })

  it('nobody can set the newsletter status through the API', async () => {
    const doc = await payload.create({
      collection: 'newsletters',
      data: {
        title: 'Status test',
        subject: 'S',
        slug: 'nl-status',
        audience: 'newsletter',
        status: 'draft',
      },
    })
    const updated = await payload.update({
      collection: 'newsletters',
      id: doc.id,
      data: { status: 'sent' },
      ...asUser('board'),
    })
    expect(updated.status).toBe('draft')
  })
})

describe('globals', () => {
  const cases: Array<[GlobalSlug, Record<Role | 'public', { read: boolean; update: boolean }>]> = [
    [
      'header',
      {
        admin: { read: true, update: true },
        board: { read: true, update: true },
        editor: { read: true, update: false },
        advisory: { read: true, update: false },
        public: { read: true, update: false },
      },
    ],
    [
      'site-settings',
      {
        admin: { read: true, update: true },
        board: { read: true, update: false },
        editor: { read: false, update: false },
        advisory: { read: false, update: false },
        public: { read: false, update: false },
      },
    ],
  ]
  for (const [slug, expectations] of cases) {
    it.each(Object.entries(expectations))(`${slug}: %s`, async (role, expected) => {
      const who = asUser(role as Role | 'public')
      expect(await allowed(() => payload.findGlobal({ slug, ...who }))).toBe(expected.read)
      expect(await allowed(() => payload.updateGlobal({ slug, data: {}, ...who }))).toBe(
        expected.update,
      )
    })
  }
})

describe('users', () => {
  it('only the admin creates users', async () => {
    for (const role of ['board', 'editor', 'advisory'] as const) {
      const ok = await allowed(() =>
        payload.create({
          collection: 'users',
          data: { email: `new-by-${role}@test.sgbr.local`, password: 'pw-123456', role: 'editor' },
          ...asUser(role),
        }),
      )
      expect(ok, role).toBe(false)
    }
    expect(
      await allowed(() =>
        payload.create({
          collection: 'users',
          data: { email: 'new-by-admin@test.sgbr.local', password: 'pw-123456', role: 'editor' },
          ...asUser('admin'),
        }),
      ),
    ).toBe(true)
  })

  it('non-admins see only themselves', async () => {
    const result = await payload.find({ collection: 'users', ...asUser('board') })
    expect(result.docs.map((u) => u.id)).toEqual([users.board.id])
  })

  it('nobody but the admin can change a role, not even their own', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: users.editor.id,
      data: { role: 'admin' },
      ...asUser('editor'),
    })
    expect(updated.role).toBe('editor')
    const byAdmin = await payload.update({
      collection: 'users',
      id: users.advisory.id,
      data: { role: 'board' },
      ...asUser('admin'),
    })
    expect(byAdmin.role).toBe('board')
    await payload.update({ collection: 'users', id: users.advisory.id, data: { role: 'advisory' } })
  })

  it('users may not edit other users', async () => {
    const ok = await allowed(() =>
      payload.update({
        collection: 'users',
        id: users.editor.id,
        data: { name: 'x' },
        ...asUser('board'),
      }),
    )
    expect(ok).toBe(false)
  })
})
