import { describe, expect, it } from 'vitest'

import { parseAboutTeam } from '@/scripts/lib/importers'
import { parseEventDetail } from '@/scripts/lib/oldSite'

const upcoming = `
<div class="sgbr-se-detail-body">
  <h2 class="sgbr-se-h2">About the speaker</h2>
  <div class="sgbr-se-text"><p>Mark Branson has been President of <span class="notranslate">BaFin</span>.</p><p>Second &amp; last.</p></div>
  <h2 class="sgbr-se-h2">About <span class="notranslate">BaFin</span></h2>
  <div class="sgbr-se-text"><p>BaFin supervises banks.</p></div>
</div>`

const past = `
<article class="sgbr-story" data-sgbr-story>
  <header class="sgbr-story-intro">
    <h2 class="sgbr-story-intro-title">An Evening of Perspectives</h2>
    <div class="sgbr-story-recap"><p>On 15 October 2026 …</p></div>
  </header>
  <section class="sgbr-story-hero" id="c1">
    <figure><a href="x"><span class="sgbr-story-photo-fallback"><span>PICTURE</span></span><img src="https://old.example/01.jpg" alt="On stage"></a></figure>
    <h3 class="sgbr-story-heading" id="h1">An Evening with Dr. Weimer</h3>
    <div class="sgbr-story-text"><p>First.</p><p>Second.</p></div>
  </section>
  <section class="sgbr-story-stage"><div><img src="https://old.example/02.jpg" alt=""></div></section>
  <section class="sgbr-story-step" id="c2">
    <figure><img src="https://old.example/02.jpg" alt="Students"></figure>
    <h3 class="sgbr-story-heading" id="h2">A Career Across Industries</h3>
    <div class="sgbr-story-text"><p>Third.</p></div>
  </section>
</article>`

describe('old site: event detail pages', () => {
  it('reads the description of an upcoming event as headings and paragraphs', () => {
    const { descriptionHtml, recap } = parseEventDetail(upcoming)
    expect(recap).toBeUndefined()
    expect(descriptionHtml).toBe(
      '<h3>About the speaker</h3><p>Mark Branson has been President of BaFin.</p><p>Second &amp; last.</p><h3>About BaFin</h3><p>BaFin supervises banks.</p>',
    )
  })

  it('reads the recap of a past event with one chapter per scene', () => {
    const { recap, descriptionHtml } = parseEventDetail(past)
    expect(descriptionHtml).toBeUndefined()
    expect(recap?.title).toBe('An Evening of Perspectives')
    expect(recap?.intro).toEqual(['On 15 October 2026 …'])
    expect(recap?.chapters).toEqual([
      {
        imageUrl: 'https://old.example/01.jpg',
        imageAlt: 'On stage',
        heading: 'An Evening with Dr. Weimer',
        text: 'First.\n\nSecond.',
      },
      {
        imageUrl: 'https://old.example/02.jpg',
        imageAlt: 'Students',
        heading: 'A Career Across Industries',
        text: 'Third.',
      },
    ])
  })
})

describe('old site: team on the About page', () => {
  it('reads email and LinkedIn of each member', () => {
    const html = `<div class="sgbr-about-label">Editorial Board</div>
      <div class="sgbr-about-person"><div class="sgbr-about-name">Caspar Moebius</div>
      <div class="sgbr-about-links"><a href="https://www.linkedin.com/in/caspar-moebius/">in</a>
      <a href="mailto:Caspar.Moebius@stgallenbusinessreview.com">mail</a></div></div>`
    const [member] = parseAboutTeam(html, 'https://old.example')
    expect(member.email).toBe('caspar.moebius@stgallenbusinessreview.com')
    expect(member.linkedin).toBe('https://www.linkedin.com/in/caspar-moebius/')
  })
})
