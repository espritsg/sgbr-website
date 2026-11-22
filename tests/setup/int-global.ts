import 'dotenv/config'
import fs from 'fs'
import pg from 'pg'

/**
 * Starts every integration test run with an empty test database, so Payload can
 * push the current schema without asking about data loss.
 */
export default async function setup() {
  const connectionString =
    process.env.DATABASE_URL_TEST || 'postgres://sgbr:sgbr@localhost:5433/sgbr_test'
  if (!/test/.test(connectionString)) {
    throw new Error(`Refusing to reset a database that is not a test database: ${connectionString}`)
  }
  const client = new pg.Client({ connectionString })
  await client.connect()
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;')
  await client.end()
  // Fresh upload folder per run.
  fs.rmSync(`${process.env.TMPDIR || '/tmp'}/sgbr-test-uploads`, { recursive: true, force: true })
}
