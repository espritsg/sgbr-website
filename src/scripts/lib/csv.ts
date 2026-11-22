/** Small CSV parser (RFC 4180: quotes, escaped quotes, commas and semicolons). */
export function parseCsv(input: string): Record<string, string>[] {
  const text = input.replace(/^﻿/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((cell) => cell !== '')) rows.push(row)
      row = []
      field = ''
    } else field += char
  }
  row.push(field)
  if (row.some((cell) => cell !== '')) rows.push(row)
  const [header, ...data] = rows
  if (!header) return []
  const keys = header.map((key) => key.trim().toLowerCase())
  return data.map((cells) =>
    Object.fromEntries(keys.map((key, index) => [key, (cells[index] ?? '').trim()])),
  )
}

/** Finds the first column whose name contains one of the words. */
export function column(row: Record<string, string>, ...words: string[]): string {
  const key = Object.keys(row).find((name) => words.some((word) => name.includes(word)))
  return key ? row[key] : ''
}
