import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { column, parseCsv } from '@/scripts/lib/csv'
import { compressPdf } from '@/scripts/lib/pdf'
import {
  findExport,
  isSystemAccount,
  parseLocalDate,
  splitNameAndRole,
} from '@/scripts/lib/migration'

describe('German MailPoet export', () => {
  // Header as MailPoet writes it with a German admin (BOM included).
  const csv =
    '﻿E-Mail,Vorname,Nachname,Abonnement-Zeit,Bestätigungs-Zeit,Listen-Status,"Globaler Status",Liste\n' +
    'a@example.org,Ada,,2026-09-11 20:05:22,2026-10-01 12:48:59,subscribed,subscribed,SGBR\n' +
    'b@example.org,,,2026-09-12 10:00:00,,subscribed,unconfirmed,SGBR\n' +
    'c@example.org,,,2026-09-13 10:00:00,2026-09-13 10:05:00,subscribed,bounced,SGBR\n'
  const rows = parseCsv(csv)

  it('takes the global status, not the list status', () => {
    expect(rows.map((row) => column(row, 'globaler status', 'global status', 'status'))).toEqual([
      'subscribed',
      'unconfirmed',
      'bounced',
    ])
  })

  it('finds e-mail, first name and both dates', () => {
    expect(column(rows[0], 'e-mail', 'email')).toBe('a@example.org')
    expect(column(rows[0], 'vorname', 'first')).toBe('Ada')
    expect(parseLocalDate(column(rows[0], 'abonnement-zeit', 'subscribed'))).toBe(
      '2026-09-11T18:05:00.000Z',
    )
    expect(column(rows[0], 'bestätigungs-zeit', 'confirmed')).toBe('2026-10-01 12:48:59')
  })

  it('tries the words in order', () => {
    const row = { status: 'a', 'globaler status': 'b' }
    expect(column(row, 'globaler status', 'status')).toBe('b')
    expect(column(row, 'missing')).toBe('')
  })
})

describe('export file names', () => {
  it('uses the expected name, otherwise the original export name', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sgbr-exports-'))
    fs.writeFileSync(path.join(dir, 'site.WordPress.2026-11-25.xml'), '')
    fs.writeFileSync(path.join(dir, 'MailPoet_export.csv'), '')
    expect(path.basename(await findExport(dir, 'export.xml', /\.wordpress\..*\.xml$/i))).toBe(
      'site.WordPress.2026-11-25.xml',
    )
    expect(path.basename(await findExport(dir, 'mailpoet.csv', /^mailpoet.*\.csv$/i))).toBe(
      'MailPoet_export.csv',
    )
    fs.writeFileSync(path.join(dir, 'mailpoet.csv'), '')
    expect(path.basename(await findExport(dir, 'mailpoet.csv', /^mailpoet.*\.csv$/i))).toBe(
      'mailpoet.csv',
    )
    expect(path.basename(await findExport(dir, 'redirection.json', /^redirection.*\.json$/i))).toBe(
      'redirection.json',
    )
  })
})

describe('WordPress authors', () => {
  it('splits name and role', () => {
    expect(splitNameAndRole('Joe Kaeser - CEO, Siemens AG')).toEqual({
      name: 'Joe Kaeser',
      role: 'CEO, Siemens AG',
    })
    expect(splitNameAndRole('Daniel Kueng, CEO - Switzerland Global Enterprise')).toEqual({
      name: 'Daniel Kueng',
      role: 'CEO, Switzerland Global Enterprise',
    })
    expect(splitNameAndRole('Peter Tschirky – CEO Grand Resort Bad Ragaz')).toEqual({
      name: 'Peter Tschirky',
      role: 'CEO Grand Resort Bad Ragaz',
    })
    expect(splitNameAndRole('Carolina Müller-Möhl')).toEqual({ name: 'Carolina Müller-Möhl' })
    expect(splitNameAndRole('Dr. Michael Kemmer &amp; Dr. Uwe Gammert')).toEqual({
      name: 'Dr. Michael Kemmer & Dr. Uwe Gammert',
    })
    expect(splitNameAndRole('Bonita und Wolfgang Grupp')).toEqual({
      name: 'Bonita und Wolfgang Grupp',
    })
  })

  it('knows the technical accounts', () => {
    expect(isSystemAccount('it-vorstand')).toBe(true)
    expect(isSystemAccount('Admin')).toBe(true)
    expect(isSystemAccount('Georges Kern')).toBe(false)
  })
})

describe('PDF compression', () => {
  it('leaves small files and non-PDFs unchanged', async () => {
    const small = Buffer.from('%PDF-1.4 small')
    expect(await compressPdf(small)).toEqual({ data: small, compressed: false })
    const notPdf = Buffer.alloc(11 * 1024 * 1024, 1)
    expect((await compressPdf(notPdf)).compressed).toBe(false)
  })
})
