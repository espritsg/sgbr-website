/**
 * PDF compression with Ghostscript for screen viewing (issue PDFs are print files of
 * up to 140 MB; Vercel Blob Hobby allows 1 GB in total). Text and vector graphics stay
 * as they are, photos are reduced to 150 dpi ("/ebook"). Needs `gs` on the machine
 * (macOS: `brew install ghostscript`); without it the file stays unchanged.
 */
import { execFile } from 'child_process'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { promisify } from 'util'

const run = promisify(execFile)

/** Files below this size are left alone. */
export const PDF_COMPRESS_MIN_BYTES = 10 * 1024 * 1024

export async function hasGhostscript(): Promise<boolean> {
  try {
    await run('gs', ['--version'])
    return true
  } catch {
    return false
  }
}

/**
 * Returns the compressed PDF, or the original if it is small, Ghostscript is missing,
 * compression fails or does not save at least 10 %.
 */
export async function compressPdf(
  data: Buffer,
  minBytes = PDF_COMPRESS_MIN_BYTES,
): Promise<{ data: Buffer; compressed: boolean }> {
  if (data.length < minBytes || data.subarray(0, 5).toString() !== '%PDF-') {
    return { data, compressed: false }
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'sgbr-pdf-'))
  const input = path.join(dir, 'in.pdf')
  const output = path.join(dir, 'out.pdf')
  try {
    await fs.writeFile(input, data)
    await run(
      'gs',
      [
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.6',
        '-dPDFSETTINGS=/ebook',
        '-dDetectDuplicateImages=true',
        '-dCompressFonts=true',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        `-sOutputFile=${output}`,
        input,
      ],
      { maxBuffer: 16 * 1024 * 1024, timeout: 10 * 60 * 1000 },
    )
    const result = await fs.readFile(output)
    const isPdf = result.subarray(0, 5).toString() === '%PDF-'
    return isPdf && result.length < data.length * 0.9
      ? { data: result, compressed: true }
      : { data, compressed: false }
  } catch {
    return { data, compressed: false }
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}
