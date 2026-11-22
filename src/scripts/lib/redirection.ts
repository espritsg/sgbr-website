/** Export of the WordPress plugin "Redirection" (JSON or CSV). */
import { parseCsv } from './csv'

export type LegacyRedirect = {
  from: string
  to: string
  code: '301' | '302' | '307' | '308'
  regex: boolean
}

const codeOf = (value: unknown): LegacyRedirect['code'] => {
  const code = String(value ?? '301')
  return code === '302' || code === '307' || code === '308' ? code : '301'
}

export function parseRedirection(content: string, fileName: string): LegacyRedirect[] {
  if (fileName.endsWith('.json')) {
    const data = JSON.parse(content) as { redirects?: Array<Record<string, unknown>> }
    return (data.redirects ?? []).map((entry) => ({
      from: String(entry.url ?? entry.match_url ?? ''),
      to: String((entry.action_data as { url?: string } | undefined)?.url ?? ''),
      code: codeOf(entry.action_code),
      regex: Boolean(entry.regex),
    }))
  }
  return parseCsv(content).map((row) => ({
    from: row.source ?? row.url ?? '',
    to: row.target ?? row['action_data'] ?? '',
    code: codeOf(row.code ?? row.action_code),
    regex: ['1', 'true', 'yes'].includes((row.regex ?? '').toLowerCase()),
  }))
}
