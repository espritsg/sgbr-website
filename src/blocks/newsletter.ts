import type { Block, Field, SelectField } from 'payload'

/**
 * Blocks inside the newsletter text (docs/newsletter.md). They render as email HTML
 * (src/emails/newsletter.ts) and on the archive page (src/components/richtext/RichText.tsx).
 */

const imagePosition: SelectField = {
  name: 'imagePosition',
  type: 'select',
  defaultValue: 'left',
  label: { de: 'Bild', en: 'Image' },
  options: [
    {
      label: {
        de: 'Links neben dem Text (Porträt, Logo)',
        en: 'Left of the text (portrait, logo)',
      },
      value: 'left',
    },
    {
      label: { de: 'Gross über dem Text (Gruppenfoto)', en: 'Large above the text (group photo)' },
      value: 'top',
    },
  ],
}

const link: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'linkLabel',
        type: 'text',
        label: { de: 'Linktext', en: 'Link label' },
        admin: { width: '50%' },
      },
      {
        name: 'linkUrl',
        type: 'text',
        label: { de: 'Link (URL)', en: 'Link (URL)' },
        admin: { width: '50%' },
      },
    ],
  },
  {
    name: 'linkStyle',
    type: 'select',
    defaultValue: 'link',
    label: { de: 'Darstellung des Links', en: 'Link style' },
    options: [
      { label: { de: 'Textlink', en: 'Text link' }, value: 'link' },
      { label: { de: 'Button', en: 'Button' }, value: 'button' },
    ],
  },
]

/** Text with an image beside or above it, e.g. guest commentary with portrait or an event with logo. */
export const NewsletterSectionBlock: Block = {
  slug: 'newsletterSection',
  interfaceName: 'NewsletterSectionBlock',
  labels: {
    singular: { de: 'Abschnitt mit Bild', en: 'Section with image' },
    plural: { de: 'Abschnitte mit Bild', en: 'Sections with image' },
  },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: { de: 'Bild', en: 'Image' } },
    imagePosition,
    { name: 'title', type: 'text', label: { de: 'Titel (fett)', en: 'Title (bold)' } },
    {
      name: 'subtitle',
      type: 'text',
      label: { de: 'Unterzeile (kursiv)', en: 'Subtitle (italic)' },
    },
    { name: 'text', type: 'richText', label: { de: 'Text', en: 'Text' } },
    ...link,
  ],
}

/** An article of the website with title, summary and image, placed anywhere in the newsletter. */
export const NewsletterArticleBlock: Block = {
  slug: 'newsletterArticle',
  interfaceName: 'NewsletterArticleBlock',
  labels: {
    singular: { de: 'Artikel', en: 'Article' },
    plural: { de: 'Artikel', en: 'Articles' },
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      label: { de: 'Artikel', en: 'Article' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { de: 'Bild (leer = Titelbild des Artikels)', en: 'Image (empty = article image)' },
    },
    { ...imagePosition, defaultValue: 'top' },
    {
      name: 'text',
      type: 'textarea',
      label: { de: 'Text (leer = Zusammenfassung)', en: 'Text (empty = summary)' },
    },
    {
      name: 'linkLabel',
      type: 'text',
      label: {
        de: 'Linktext (leer = „Read the interview“)',
        en: 'Link label (empty = "Read the interview")',
      },
    },
  ],
}

export const newsletterBlocks = [NewsletterSectionBlock, NewsletterArticleBlock]
