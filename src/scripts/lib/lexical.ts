import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import type { SanitizedConfig } from 'payload'

import { articleEditor, defaultEditor } from '@/lib/richtext/editors'

type EditorKind = 'article' | 'default'
type LexicalNode = {
  type?: string
  value?: unknown
  children?: LexicalNode[]
  [key: string]: unknown
}

const cache = new Map<EditorKind, Awaited<ReturnType<typeof editorConfigFactory.fromEditor>>>()

/** Converts prepared HTML (see html.ts) to a Lexical document for the given editor. */
export async function htmlToLexical(
  config: SanitizedConfig,
  html: string,
  kind: EditorKind = 'article',
) {
  let editorConfig = cache.get(kind)
  if (!editorConfig) {
    editorConfig = await editorConfigFactory.fromEditor({
      config,
      editor: kind === 'article' ? articleEditor : defaultEditor,
    })
    cache.set(kind, editorConfig)
  }
  const state = convertHTMLToLexical({ editorConfig, html, JSDOM })
  normalizeUploadIds(state.root as LexicalNode)
  return state
}

/** Postgres uses numeric IDs; the HTML import stores them as strings. */
function normalizeUploadIds(node: LexicalNode) {
  if (node.type === 'upload' && typeof node.value === 'string' && /^\d+$/.test(node.value)) {
    node.value = Number(node.value)
  }
  node.children?.forEach(normalizeUploadIds)
}
