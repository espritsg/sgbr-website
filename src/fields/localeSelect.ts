import type { SelectField } from 'payload'

export const localeOptions = [
  { label: { de: 'Englisch', en: 'English' }, value: 'en' },
  { label: { de: 'Deutsch', en: 'German' }, value: 'de' },
]

export function localeSelect(overrides: Partial<SelectField> & { name: string }): SelectField {
  return {
    type: 'select',
    options: localeOptions,
    ...overrides,
  } as SelectField
}
