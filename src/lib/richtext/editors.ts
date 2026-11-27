import { BlocksFeature, FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { contentBlocks } from '@/blocks/content'
import { newsletterBlocks } from '@/blocks/newsletter'

/** Editor for article text: default features plus Q&A, quote, embed and PDF blocks. */
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    BlocksFeature({ blocks: contentBlocks }),
  ],
})

/** Editor for the newsletter text: default features plus section and article blocks. */
export const newsletterEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    BlocksFeature({ blocks: newsletterBlocks }),
  ],
})

/** Editor for everything else (bios, forewords, page text). */
export const defaultEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
})
