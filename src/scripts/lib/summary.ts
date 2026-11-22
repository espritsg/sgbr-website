import Anthropic from '@anthropic-ai/sdk'

import { paragraphs } from './html'

/** Default model for summaries (docs/migration.md). Override with ANTHROPIC_MODEL. */
export const DEFAULT_SUMMARY_MODEL = 'claude-sonnet-5-5'
const MAX_SUMMARY_LENGTH = 320
const MAX_ARTICLE_CHARS = 60_000

// Models that accept the server-side refusal fallback (beta server-side-fallback-2026-07-01).
const FALLBACK_MODELS = [
  'claude-fable-5-2',
  'claude-fable-5-1',
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-sonnet-5-5',
]

export type SummaryInput = {
  title: string
  html: string
  language: 'en' | 'de'
  people: string[]
  type: 'interview' | 'guest-article'
}

export type SummaryResult = { summary: string; source: 'claude' | 'first-paragraph' }

const SALUTATION = /^(dear|sehr geehrte|liebe|lieber|hallo|hello|guten tag)\b/i
const THANKS = /\b(thank you|thanks for|vielen dank|danke,? dass|herzlichen dank)\b/i
const NOTE = /^(disclaimer|note|hinweis|anmerkung|editor’s note|editor's note)\b/i

/** Shortens text to whole sentences within the limit. */
export function shorten(text: string, max = MAX_SUMMARY_LENGTH): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  // Split only where punctuation is followed by a space and a capital letter, so
  // abbreviations like "J.P. Morgan" or "Dr." inside a sentence stay intact.
  const sentences = clean.split(
    /(?<=[.!?…])(?<!\b(?:St|Dr|Mr|Mrs|Ms|Prof|Nr|No|bzw|ca|vs|Hr|Fr|Mio|Mrd)\.)\s+(?=[A-ZÄÖÜ„"«(])/,
  )
  let result = ''
  for (const sentence of sentences) {
    const next = result ? `${result} ${sentence}` : sentence
    if (next.length > max) break
    result = next
  }
  if (result) return result
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

/**
 * Fallback without API key: the first meaningful paragraph. Skips salutations,
 * thank-you openers and the bold interview questions.
 */
export function firstParagraphSummary(html: string): string {
  const candidates = paragraphs(html).filter(
    (p) =>
      p.text.length >= 60 &&
      !p.bold &&
      !SALUTATION.test(p.text) &&
      !NOTE.test(p.text) &&
      !THANKS.test(p.text.slice(0, 120)),
  )
  const first = candidates[0] ?? paragraphs(html).find((p) => p.text.length >= 40)
  return first ? shorten(first.text) : ''
}

function buildPrompt(input: SummaryInput): string {
  const languageName = input.language === 'de' ? 'German' : 'English'
  const kind = input.type === 'interview' ? 'an interview' : 'a guest article'
  const people = input.people.length ? input.people.join(', ') : 'unknown'
  const text = paragraphs(input.html)
    .map((p) => p.text)
    .join('\n\n')
    .slice(0, MAX_ARTICLE_CHARS)
  return [
    `Below is ${kind} from the St. Gallen Business Review, a student business magazine.`,
    `Title: ${input.title}`,
    `People: ${people}`,
    '',
    `Write a summary of one or two sentences in ${languageName} for an article card on the website.`,
    'Say what the piece is about and who speaks. No salutation, no promotional tone, no facts that are not in the text.',
    `Answer with the summary only, at most ${MAX_SUMMARY_LENGTH} characters.`,
    '',
    '<article>',
    text,
    '</article>',
  ].join('\n')
}

let client: Anthropic | null = null

/**
 * Summary for an existing article. Uses Claude when ANTHROPIC_API_KEY is set,
 * otherwise the first meaningful paragraph. Either way the editors must review it.
 */
export async function createSummary(input: SummaryInput): Promise<SummaryResult> {
  if (!process.env.ANTHROPIC_API_KEY)
    return { summary: firstParagraphSummary(input.html), source: 'first-paragraph' }
  client ??= new Anthropic()
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_SUMMARY_MODEL
  try {
    const response = await client.beta.messages.create({
      model,
      max_tokens: 1024,
      output_config: { effort: 'low' },
      ...(FALLBACK_MODELS.includes(model)
        ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
        : {}),
      messages: [{ role: 'user', content: buildPrompt(input) }],
    })
    if (response.stop_reason === 'refusal') throw new Error('Claude declined to summarize')
    const text = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join(' ')
      .trim()
    if (!text) throw new Error('Empty summary')
    return { summary: shorten(text), source: 'claude' }
  } catch (error) {
    if (error instanceof Anthropic.APIError || error instanceof Error) {
      console.warn(
        `  Summary via Claude failed for "${input.title}": ${error.message}. Using first paragraph.`,
      )
    }
    return { summary: firstParagraphSummary(input.html), source: 'first-paragraph' }
  }
}
