import type { CollectionConfig } from 'payload'

/** Drafts, versions and scheduled publishing for content collections (docs/datenmodell.md). */
export function contentVersions(autosave = true): CollectionConfig['versions'] {
  return {
    maxPerDoc: 50,
    drafts: {
      autosave: autosave ? { interval: 2000 } : false,
      schedulePublish: true,
    },
  }
}

export const contentGroup = { de: 'Inhalte', en: 'Content' }
export const magazineGroup = { de: 'Magazin', en: 'Magazine' }
export const newsletterGroup = { de: 'Newsletter', en: 'Newsletter' }
export const formsGroup = { de: 'Formulare', en: 'Forms' }
export const settingsGroup = { de: 'Einstellungen', en: 'Settings' }
