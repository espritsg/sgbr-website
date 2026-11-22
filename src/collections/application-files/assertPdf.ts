import { APIError, type CollectionBeforeOperationHook } from 'payload'

/** Max. CV size. Vercel Functions accept at most 4.5 MB per request (ADR 0012). */
export const APPLICATION_FILE_MAX_BYTES = 4 * 1024 * 1024

const PDF_MAGIC = Buffer.from('%PDF-')

/** Returns true if the buffer starts with the PDF signature. */
export function looksLikePdf(data: Buffer | Uint8Array | undefined | null): boolean {
  if (!data || data.length < PDF_MAGIC.length) return false
  return Buffer.from(data.subarray(0, PDF_MAGIC.length)).equals(PDF_MAGIC)
}

/** Rejects uploads that only claim to be PDFs (checks the file content, not the name). */
export const assertPdf: CollectionBeforeOperationHook = ({ operation, req }) => {
  if (operation !== 'create' && operation !== 'update') return
  const file = req.file
  if (!file) return
  if (file.size > APPLICATION_FILE_MAX_BYTES) {
    throw new APIError('The file is larger than 4 MB.', 413, undefined, true)
  }
  if (!looksLikePdf(file.data)) {
    throw new APIError('Only PDF files are allowed.', 400, undefined, true)
  }
}
