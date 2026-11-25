import 'dotenv/config'

// Integration tests run against a separate database (sgbr_test in docker-compose.yml),
// never against the development data.
const testUrl = process.env.DATABASE_URL_TEST || 'postgres://sgbr:sgbr@localhost:5433/sgbr_test'
process.env.DATABASE_URL = testUrl
process.env.PAYLOAD_SECRET ||= 'test-secret-not-for-production'
process.env.NEXT_PUBLIC_SERVER_URL ||= 'http://localhost:3000'
// Never send real emails from tests.
delete process.env.RESEND_API_KEY
// Mails and local newsletter contacts of tests go to a fresh temporary folder per
// test file, never to .mail-preview/ (and never to Resend: RESEND_API_KEY is removed above).
process.env.MAIL_PREVIEW_DIR = `${process.env.TMPDIR || '/tmp'}/sgbr-test-mails/${process.pid}-${Date.now()}`
process.env.CRON_SECRET = ''
// Uploads of tests go to a temporary folder, not to media/.
process.env.UPLOADS_DIR ||= `${process.env.TMPDIR || '/tmp'}/sgbr-test-uploads`
