/**
 * Final migration from the WordPress exports (docs/migration.md, phase 2).
 * Runs only at the very end, shortly before go-live.
 *
 *   MIGRATION_DIR=/path/to/wp-export npm run migrate:wp
 *
 * Optional: MIGRATION_SOURCE (old site, default https://stgallenbusinessreview.com),
 * MIGRATION_OFFLINE=1 (no network: files only from uploads/, feeds only from feeds/),
 * MIGRATION_ALL_MEDIA=1 (also unused library files), MIGRATION_COMPRESS_PDFS=1 (shrink PDFs over 10 MB, default: originals).
 * Exports contain personal data (subscribers): never commit them, delete after the migration.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { printReport } from './lib/importers'
import { runMigration } from './lib/migration'

const dir = process.env.MIGRATION_DIR || process.argv.slice(2).find((arg) => !arg.startsWith('-'))
if (!dir) {
  console.error('Bitte MIGRATION_DIR setzen (Ordner mit export.xml, siehe docs/migration.md).')
  process.exit(1)
}

const payload = await getPayload({ config })
try {
  console.log(`Finale Migration aus ${dir}`)
  console.log(
    process.env.ANTHROPIC_API_KEY
      ? 'Zusammenfassungen: Claude'
      : 'Zusammenfassungen: erster Absatz (kein ANTHROPIC_API_KEY)',
  )
  const { report, media } = await runMigration(payload, {
    dir,
    sourceUrl: process.env.MIGRATION_SOURCE,
    offline: process.env.MIGRATION_OFFLINE === '1',
    allMedia: process.env.MIGRATION_ALL_MEDIA === '1',
    compressPdfs: process.env.MIGRATION_COMPRESS_PDFS === '1',
  })
  printReport(report, media)
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
