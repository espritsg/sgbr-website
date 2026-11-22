/**
 * Builds a minimal Lexical document from plain text paragraphs. Used for seed data,
 * tests and fallbacks; the editor itself produces richer documents.
 */
export function plainTextToLexical(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        textStyle: '',
        children: [
          { type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 },
        ],
      })),
    },
  }
}
