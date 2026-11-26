/**
 * Shrinks an issue PDF for the website before uploading it in the admin
 * (docs/redaktion.md). Same settings as the migration (src/scripts/lib/pdf.ts).
 *
 *   npm run pdf:compress -- Ausgabe-2026.pdf              # writes Ausgabe-2026-web.pdf
 *   npm run pdf:compress -- Ausgabe-2026.pdf ziel.pdf
 *
 * Needs Ghostscript: macOS `brew install ghostscript`, Windows/Linux see ghostscript.com.
 */
import fs from 'fs/promises'
import path from 'path'

import { compressPdf, hasGhostscript } from './lib/pdf'

const [input, outputArg] = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
if (!input) {
  console.error('Aufruf: npm run pdf:compress -- <datei.pdf> [ziel.pdf]')
  process.exit(1)
}
if (!(await hasGhostscript())) {
  console.error('Ghostscript fehlt. macOS: brew install ghostscript')
  process.exit(1)
}

const output = outputArg ?? input.replace(/\.pdf$/i, '') + '-web.pdf'
const data = await fs.readFile(input)
console.log(`Komprimiere ${path.basename(input)} (${(data.length / 1e6).toFixed(1)} MB) …`)
// Threshold 0: compress whatever the size, the user asked for it.
const result = await compressPdf(data, 0)
await fs.writeFile(output, result.data)
console.log(
  result.compressed
    ? `Fertig: ${output} (${(result.data.length / 1e6).toFixed(1)} MB)`
    : `Keine Ersparnis, Original kopiert nach ${output}.`,
)
