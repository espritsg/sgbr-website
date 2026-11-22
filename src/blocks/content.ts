import type { Block } from 'payload'

/**
 * Blocks inside the Lexical text of articles (docs/datenmodell.md).
 * Kept in one file because they are small and always used together.
 */

export const QABlock: Block = {
  slug: 'qa',
  interfaceName: 'QABlock',
  labels: {
    singular: { de: 'Frage/Antwort', en: 'Question/answer' },
    plural: { de: 'Fragen/Antworten', en: 'Questions/answers' },
  },
  fields: [
    {
      name: 'question',
      type: 'textarea',
      required: true,
      label: { de: 'Frage', en: 'Question' },
    },
    {
      name: 'answer',
      type: 'richText',
      required: true,
      label: { de: 'Antwort', en: 'Answer' },
    },
  ],
}

export const QuoteBlock: Block = {
  slug: 'quote',
  interfaceName: 'QuoteBlock',
  labels: { singular: { de: 'Zitat', en: 'Quote' }, plural: { de: 'Zitate', en: 'Quotes' } },
  fields: [
    { name: 'text', type: 'textarea', required: true, label: { de: 'Zitat', en: 'Quote' } },
    { name: 'attribution', type: 'text', label: { de: 'Wer', en: 'Attribution' } },
  ],
}

export const EmbedBlock: Block = {
  slug: 'embed',
  interfaceName: 'EmbedBlock',
  labels: {
    singular: { de: 'Einbettung', en: 'Embed' },
    plural: { de: 'Einbettungen', en: 'Embeds' },
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'URL',
      admin: {
        description: {
          de: 'YouTube-, Vimeo- oder Spotify-Link.',
          en: 'YouTube, Vimeo or Spotify link.',
        },
      },
    },
    { name: 'caption', type: 'text', label: { de: 'Bildunterschrift', en: 'Caption' } },
  ],
}

export const PdfDownloadBlock: Block = {
  slug: 'pdfDownload',
  interfaceName: 'PdfDownloadBlock',
  labels: {
    singular: { de: 'PDF-Download', en: 'PDF download' },
    plural: { de: 'PDF-Downloads', en: 'PDF downloads' },
  },
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { equals: 'application/pdf' } },
      label: { de: 'Datei', en: 'File' },
    },
    { name: 'label', type: 'text', label: { de: 'Beschriftung', en: 'Label' } },
  ],
}

export const contentBlocks = [QABlock, QuoteBlock, EmbedBlock, PdfDownloadBlock]
