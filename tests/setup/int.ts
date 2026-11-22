import 'dotenv/config'

// Integration tests run against a separate database (sgbr_test in docker-compose.yml),
// never against the development data.
const testUrl = process.env.DATABASE_URL_TEST || 'postgres://sgbr:sgbr@localhost:5433/sgbr_test'
process.env.DATABASE_URL = testUrl
process.env.PAYLOAD_SECRET ||= 'test-secret-not-for-production'
process.env.NEXT_PUBLIC_SERVER_URL ||= 'http://localhost:3000'
// Never send real emails from tests.
delete process.env.RESEND_API_KEY
