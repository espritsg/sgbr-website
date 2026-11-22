/**
 * Guesses whether a text is German or English by counting frequent function words.
 * Good enough for magazine articles; unclear cases are reported by the import.
 */
const GERMAN = [
  'und',
  'der',
  'die',
  'das',
  'nicht',
  'ist',
  'mit',
  'sie',
  'wir',
  'ein',
  'eine',
  'auch',
  'für',
  'auf',
  'den',
  'dem',
  'sich',
  'zu',
  'von',
  'wie',
]
const ENGLISH = [
  'the',
  'and',
  'of',
  'to',
  'is',
  'in',
  'that',
  'we',
  'it',
  'for',
  'with',
  'are',
  'this',
  'on',
  'as',
  'be',
  'have',
  'what',
  'you',
  'not',
]

export type LanguageGuess = {
  language: 'en' | 'de'
  confident: boolean
  german: number
  english: number
}

export function detectLanguage(text: string): LanguageGuess {
  const words = text.toLowerCase().match(/[a-zäöüß]+/g) ?? []
  const count = (list: string[]) => {
    const set = new Set(list)
    return words.reduce((sum, word) => sum + (set.has(word) ? 1 : 0), 0)
  }
  const german = count(GERMAN)
  const english = count(ENGLISH)
  const language = german > english ? 'de' : 'en'
  const total = german + english
  const confident = total >= 20 && Math.max(german, english) / total >= 0.7
  return { language, confident, german, english }
}
