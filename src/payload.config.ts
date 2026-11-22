import { postgresAdapter } from '@payloadcms/db-postgres'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { canRunJobs } from './access/permissions'
import { collections } from './collections'
import { Users } from './collections/users'
import { globals } from './globals'
import { previewUrl } from './lib/preview'
import { defaultEditor } from './lib/richtext/editors'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' – SGBR Admin',
    },
    dateFormat: 'dd.MM.yyyy HH:mm',
    // Live Preview: the page next to the editor, per language (docs/architektur.md).
    livePreview: {
      collections: ['posts', 'issues', 'events', 'people', 'pages'],
      url: ({ data, collectionConfig, locale }) =>
        previewUrl(
          collectionConfig?.slug ?? '',
          data?.slug as string | undefined,
          locale?.code ?? 'en',
        ) ?? '',
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  // Admin UI in German by default, users can switch to English in their account.
  i18n: {
    supportedLanguages: { de, en },
    fallbackLanguage: 'de',
  },
  // Content locales. Each locale falls back to the other one, so an article that
  // exists only in its original language is shown in both (docs/sprachen.md).
  localization: {
    defaultLocale: 'en',
    fallback: true,
    locales: [
      { code: 'en', label: 'English', fallbackLocale: 'de' },
      { code: 'de', label: 'Deutsch', fallbackLocale: 'en' },
    ],
  },
  collections,
  globals,
  editor: defaultEditor,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // Background jobs (docs/architektur.md). Tasks are registered in src/jobs.
  jobs: {
    access: {
      run: canRunJobs,
    },
    tasks: [],
  },
  sharp,
  plugins: plugins(),
})
