import { describe, expect, it } from 'vitest'

import { categoryMap, categoryRedirectTarget } from '@/lib/categoryMap'
import { parseFeedDate, zurichToDate } from '@/lib/dates'
import { findImages, paragraphs, prepareHtmlForLexical, stripShortcodes } from '@/scripts/lib/html'
import { guessPostType, parseAboutTeam, parseIssuePage } from '@/scripts/lib/importers'
import { detectLanguage } from '@/scripts/lib/language'
import { legacyPathFromUrl, originalImageUrl } from '@/scripts/lib/media'
import { firstParagraphSummary, shorten } from '@/scripts/lib/summary'

describe('html clean-up', () => {
  it('removes WPBakery and gtranslate shortcodes', () => {
    const { html, removed } = stripShortcodes(
      '[vc_row][vc_column]<p>Text</p>[/vc_column][/vc_row][gtranslate]',
    )
    expect(html).toBe('<p>Text</p>')
    expect(removed).toBe(5)
  })

  it('finds images with their WordPress IDs', () => {
    const images = findImages(
      '<img class="wp-image-2679" src="https://x/a-1024x649.png" alt="Chart">',
    )
    expect(images).toEqual([{ wpId: 2679, src: 'https://x/a-1024x649.png', alt: 'Chart' }])
  })

  it('turns known images into upload nodes and drops unknown ones', () => {
    const html =
      '<figure><a href="x"><img class="wp-image-1" src="a.png"></a></figure><p><img src="b.png"></p>'
    const result = prepareHtmlForLexical(html, (image) => (image.wpId === 1 ? 42 : null))
    expect(result).toContain('data-lexical-upload-id="42"')
    expect(result).not.toContain('b.png')
    expect(result).not.toContain('<figure')
  })

  it('detects bold question paragraphs', () => {
    const items = paragraphs('<p><strong>Question?</strong></p><p>Answer.</p>')
    expect(items).toEqual([
      { text: 'Question?', bold: true },
      { text: 'Answer.', bold: false },
    ])
  })
})

describe('post type and language', () => {
  it('recognises interviews by their bold questions', () => {
    const q = '<p><strong>Why?</strong></p><p>Because.</p>'
    expect(guessPostType(q.repeat(3))).toBe('interview')
    expect(guessPostType('<p>Just an essay.</p>')).toBe('guest-article')
  })

  it('tells German from English', () => {
    const german =
      'Wir sind der Meinung, dass die Wirtschaft und die Politik nicht mit einer Stimme sprechen. Das ist auch für die Zukunft der Schweiz wichtig, und wir sehen das so.'
    const english =
      'We think that the economy and the politics of this country are not on the same page, and it is important for the future that we have this debate.'
    expect(detectLanguage(german).language).toBe('de')
    expect(detectLanguage(english).language).toBe('en')
    expect(detectLanguage('Hello').confident).toBe(false)
  })
})

describe('summaries without API key', () => {
  it('skips salutations, notes and questions', () => {
    const html = [
      '<p><strong>Mr. Pauli, thank you very much for taking the time to speak with us today?</strong></p>',
      '<p>Disclaimer: This interview was conducted on 11 December 2025 and reflects the situation then.</p>',
      '<p>Dear readers, we are glad to present this issue to you, it was a lot of work.</p>',
      '<p>I started at J.P. Morgan in 1998. It was a much smaller place back then, and the analyst programme was firm-wide.</p>',
    ].join('')
    expect(firstParagraphSummary(html)).toBe(
      'I started at J.P. Morgan in 1998. It was a much smaller place back then, and the analyst programme was firm-wide.',
    )
  })

  it('does not end a sentence after St. or Dr.', () => {
    expect(
      shorten('It started in the 80s. St. Gallen was small then. More text follows here.', 60),
    ).toBe('It started in the 80s. St. Gallen was small then.')
  })

  it('shortens at sentence boundaries without breaking abbreviations', () => {
    const text = 'Dr. Weimer joined KKR. '.repeat(30)
    const short = shorten(text, 60)
    expect(short.length).toBeLessThanOrEqual(60)
    expect(short.startsWith('Dr. Weimer joined KKR.')).toBe(true)
  })
})

describe('feeds and old pages', () => {
  it('parses feed dates as Zurich time (summer and winter)', () => {
    expect(parseFeedDate('15 October 2026', '19:00')?.toISOString()).toBe(
      '2026-10-15T17:00:00.000Z',
    )
    expect(parseFeedDate('3 December 2026', '18:30')?.toISOString()).toBe(
      '2026-12-03T17:30:00.000Z',
    )
    expect(parseFeedDate('not a date', '19:00')).toBeNull()
    expect(zurichToDate(2026, 3, 29, 3, 0).toISOString()).toBe('2026-03-29T01:00:00.000Z')
  })

  it('reads foreword, tagline and editors of an issue page', () => {
    const html =
      '<p class="sgbr-tfof-issue-subtitle"> Who Owns Tomorrow&rsquo;s Market? </p><div class="sgbr-tfof-foreword"><p>Ownership shapes.</p></div>' +
      '<span class="sgbr-tfof-signoff-name notranslate" translate="no"> Caspar Moebius </span>'
    expect(parseIssuePage(html)).toEqual({
      tagline: 'Who Owns Tomorrow’s Market?',
      forewordHtml: '<p>Ownership shapes.</p>',
      editorNames: ['Caspar Moebius'],
    })
  })

  it('reads the team from the About page', () => {
    const html =
      '<div class="sgbr-about-label">Editorial Board</div><div class="sgbr-about-person"><div class="sgbr-about-position">Editor-in-Chief</div>' +
      '<div class="sgbr-about-photo"><img src="/wp-content/themes/x/editor.jpg" alt="A"></div><div class="sgbr-about-name notranslate">Ada Muster</div>' +
      '<div class="sgbr-about-meta">Economics</div><div class="sgbr-about-uni">University of St. Gallen</div></div>' +
      '<div class="sgbr-about-label">Advisory Board</div><div class="sgbr-about-person sgbr-about-small"><div class="sgbr-about-name">Bo Beispiel</div></div>'
    const team = parseAboutTeam(html, 'https://example.com')
    expect(team[0]).toMatchObject({
      name: 'Ada Muster',
      group: 'editorial-board',
      position: 'Editor-in-Chief',
      study: 'Economics',
      photoUrl: 'https://example.com/wp-content/themes/x/editor.jpg',
    })
    expect(team[1]).toMatchObject({ name: 'Bo Beispiel', group: 'advisory' })
  })

  it('maps old upload URLs to legacy paths and originals', () => {
    expect(legacyPathFromUrl('https://x.com/wp-content/uploads/2026/08/Rising-2024.pdf')).toBe(
      '2026/08/Rising-2024.pdf',
    )
    expect(legacyPathFromUrl('https://x.com/wp-content/themes/a.png')).toBeNull()
    expect(originalImageUrl('https://x/a-headshot-150x150.jpg')).toBe('https://x/a-headshot.jpg')
  })
})

describe('category map', () => {
  it('covers all 38 old categories', () => {
    expect(Object.keys(categoryMap)).toHaveLength(38)
  })

  it('creates redirect targets', () => {
    expect(categoryRedirectTarget('business')).toBe('/topics/business')
    expect(categoryRedirectTarget('leadership')).toBe('/topics/leadership')
    expect(categoryRedirectTarget('vc-pe-family-offices')).toBe('/issues/vc-pe-family-offices')
    expect(categoryRedirectTarget('uncategorized')).toBe('/topics')
    expect(categoryRedirectTarget('unknown-category')).toBe('/topics')
  })
})
