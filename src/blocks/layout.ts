import type { Block } from 'payload'

/** Page layout blocks for the `pages` collection (About, Contact, Imprint, Privacy). */

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: { de: 'Text', en: 'Text' }, plural: { de: 'Texte', en: 'Texts' } },
  fields: [
    { name: 'content', type: 'richText', required: true, label: { de: 'Text', en: 'Text' } },
  ],
}

export const TeamGridBlock: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
  labels: {
    singular: { de: 'Team-Raster', en: 'Team grid' },
    plural: { de: 'Team-Raster', en: 'Team grids' },
  },
  fields: [
    { name: 'heading', type: 'text', label: { de: 'Überschrift', en: 'Heading' } },
    {
      name: 'groups',
      type: 'select',
      hasMany: true,
      label: { de: 'Gruppen', en: 'Groups' },
      defaultValue: ['editorial-board', 'editors', 'advisory'],
      options: [
        { label: 'Editorial Board', value: 'editorial-board' },
        { label: 'Editors', value: 'editors' },
        { label: 'Advisory Board', value: 'advisory' },
      ],
    },
  ],
}

export const ContactFormBlock: Block = {
  slug: 'contactForm',
  interfaceName: 'ContactFormBlock',
  labels: { singular: { de: 'Formular', en: 'Form' }, plural: { de: 'Formulare', en: 'Forms' } },
  fields: [
    { name: 'heading', type: 'text', label: { de: 'Überschrift', en: 'Heading' } },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      label: { de: 'Formular', en: 'Form' },
    },
    {
      name: 'showAddress',
      type: 'checkbox',
      defaultValue: true,
      label: { de: 'Adresse aus den Einstellungen zeigen', en: 'Show address from site settings' },
    },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  labels: {
    singular: { de: 'Bild und Text', en: 'Image and text' },
    plural: { de: 'Bild und Text', en: 'Image and text' },
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { de: 'Bild', en: 'Image' },
    },
    { name: 'content', type: 'richText', required: true, label: { de: 'Text', en: 'Text' } },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      label: { de: 'Bild', en: 'Image' },
      options: [
        { label: { de: 'links', en: 'left' }, value: 'left' },
        { label: { de: 'rechts', en: 'right' }, value: 'right' },
      ],
    },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: {
    singular: { de: 'Handlungsaufruf', en: 'Call to action' },
    plural: { de: 'Handlungsaufrufe', en: 'Calls to action' },
  },
  fields: [
    { name: 'heading', type: 'text', required: true, label: { de: 'Überschrift', en: 'Heading' } },
    { name: 'text', type: 'textarea', label: { de: 'Text', en: 'Text' } },
    { name: 'linkLabel', type: 'text', label: { de: 'Button-Text', en: 'Button label' } },
    {
      name: 'linkUrl',
      type: 'text',
      label: { de: 'Link', en: 'Link' },
      admin: {
        description: {
          de: 'z. B. /newsletter oder https://…',
          en: 'e.g. /newsletter or https://…',
        },
      },
    },
  ],
}

export const layoutBlocks = [
  RichTextBlock,
  TeamGridBlock,
  ContactFormBlock,
  ImageTextBlock,
  CtaBlock,
]
