import fs from 'fs/promises'
import path from 'path'

/**
 * Local mail preview (ADR 0007): without RESEND_API_KEY no email leaves the machine.
 * Each mail is logged and written to .mail-preview/ as HTML, text and JSON.
 */
export const PREVIEW_DIR = path.resolve(
  process.env.MAIL_PREVIEW_DIR || path.join(process.cwd(), '.mail-preview'),
)

export type PreviewMail = {
  to: string
  from: string
  subject: string
  html?: string
  text?: string
  headers?: Record<string, string>
}

function fileBase(mail: PreviewMail) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const slug = mail.subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
  return `${stamp}-${slug}-${Math.random().toString(36).slice(2, 7)}`
}

export async function writePreview(mail: PreviewMail): Promise<string> {
  console.log(`[mail preview] to=${mail.to} subject="${mail.subject}"`)
  const base = fileBase(mail)
  try {
    await fs.mkdir(PREVIEW_DIR, { recursive: true })
    await Promise.all([
      fs.writeFile(
        path.join(PREVIEW_DIR, `${base}.html`),
        mail.html ?? `<pre>${mail.text ?? ''}</pre>`,
      ),
      fs.writeFile(path.join(PREVIEW_DIR, `${base}.txt`), mail.text ?? ''),
      fs.writeFile(
        path.join(PREVIEW_DIR, `${base}.json`),
        JSON.stringify(
          {
            to: mail.to,
            from: mail.from,
            subject: mail.subject,
            headers: mail.headers ?? {},
            file: `${base}.html`,
          },
          null,
          2,
        ),
      ),
    ])
  } catch (error) {
    // Read-only file systems (e.g. a preview deployment without Resend): log only.
    console.warn(`[mail preview] could not write file: ${(error as Error).message}`)
  }
  return base
}

export type PreviewEntry = { file: string; to: string; subject: string; date: string }

/** Latest preview mails, newest first (admin view /admin/mail-preview). */
export async function listPreviews(limit = 50): Promise<PreviewEntry[]> {
  try {
    const files = (await fs.readdir(PREVIEW_DIR))
      .filter((file) => file.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit)
    return Promise.all(
      files.map(async (file) => {
        const meta = JSON.parse(await fs.readFile(path.join(PREVIEW_DIR, file), 'utf8'))
        return { file: meta.file, to: meta.to, subject: meta.subject, date: file.slice(0, 24) }
      }),
    )
  } catch {
    return []
  }
}

export async function readPreview(file: string): Promise<string | null> {
  if (!/^[\w.-]+\.html$/.test(file)) return null
  try {
    return await fs.readFile(path.join(PREVIEW_DIR, file), 'utf8')
  } catch {
    return null
  }
}
