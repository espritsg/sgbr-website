/**
 * Updates the contact and application forms in the database from src/scripts/lib/seed.ts
 * (development only): npm run seed:forms
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { attachApplicationForm, seedForms } from './lib/seed'
import { createReport } from './lib/importers'

const payload = await getPayload({ config })
const forms = await seedForms(payload)
await attachApplicationForm(payload, forms.application, createReport())
console.log('Formulare aktualisiert:', forms)
process.exit(0)
