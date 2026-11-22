import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { contentBlocks } from '@/blocks/content'

/** Editor for article text: default features plus Q&A, quote, embed and PDF blocks. */
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    BlocksFeature({ blocks: contentBlocks }),
  ],
})

/** Editor for everything else (bios, forewords, newsletter text, page text). */
export const defaultEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
})
