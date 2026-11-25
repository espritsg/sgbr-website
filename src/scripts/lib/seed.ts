/**
 * Content that does not exist on the old site or lives in its theme: pages, forms,
 * a sample newsletter, test subscribers, globals and one user per role.
 * Used by the dev import; the final migration uses only pages and globals.
 */
import type { Payload } from 'payload'

import type { Role } from '@/access/roles'
import { localAudience, type Interest } from '@/lib/newsletter/audience'
import { plainTextToLexical } from '@/lib/richtext/plain'

import { APPLICATION_FILE_MAX_BYTES } from '../../collections/application-files/assertPdf'
import { stripTags } from './html'
import type { ImportReport } from './importers'
import { htmlToLexical } from './lexical'
import type { MediaImporter } from './media'
import { upsert } from './upsert'

type Id = number

export const SGBR_CONTACT_EMAIL = 'editorial@stgallenbusinessreview.com'
export const SGBR_ADDRESS =
  'ESPRIT St. Gallen – Beratung durch Studenten\nDufourstrasse 50\n9000 St. Gallen\nSwitzerland'
const LINKEDIN = 'https://www.linkedin.com/company/st-gallen-business-review/'
const INSTAGRAM = 'https://www.instagram.com/stgallenbusinessreview'

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

export async function seedForms(payload: Payload): Promise<{ contact: Id; application: Id }> {
  const notify = (subject: string) => ({
    emailTo: SGBR_CONTACT_EMAIL,
    subject,
    message: plainTextToLexical('A new submission has arrived. Details: {{*:table}}'),
  })

  const contact = await upsert(
    payload,
    'forms',
    { field: 'title', value: 'Contact' },
    {
      title: 'Contact',
      submitButtonLabel: 'Send',
      confirmationType: 'message',
      confirmationMessage: plainTextToLexical(
        'Thank you for your message. We will get back to you soon.',
      ),
      retentionMonths: 6,
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        { blockType: 'textarea', name: 'message', label: 'Message', required: true },
      ],
      emails: [
        notify('New message via the contact form'),
        {
          emailTo: '{{email}}',
          subject: 'Thank you for your message',
          message: plainTextToLexical(
            'Dear {{name}}, thank you for your message. We will get back to you soon.',
          ),
        },
      ],
    },
  )

  const application = await upsert(
    payload,
    'forms',
    { field: 'title', value: 'Application: Speaker Event' },
    {
      title: 'Application: Speaker Event',
      submitButtonLabel: 'Apply',
      confirmationType: 'message',
      confirmationMessage: plainTextToLexical(
        'Thank you for your application. We will let you know in good time before the event.',
      ),
      retentionMonths: 6,
      fields: [
        { blockType: 'text', name: 'firstName', label: 'First name', required: true, width: 50 },
        { blockType: 'text', name: 'lastName', label: 'Last name', required: true, width: 50 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
        {
          blockType: 'text',
          name: 'programme',
          label: 'Study programme',
          required: true,
          width: 50,
        },
        {
          blockType: 'select',
          name: 'semester',
          label: 'Semester',
          required: true,
          width: 50,
          placeholder: 'Please choose',
          options: [
            ...[1, 2, 3, 4, 5, 6].map((n) => ({
              label: `Bachelor, ${n}. semester`,
              value: `bachelor-${n}`,
            })),
            ...[1, 2, 3, 4].map((n) => ({ label: `Master, ${n}. semester`, value: `master-${n}` })),
            { label: 'PhD', value: 'phd' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          blockType: 'textarea',
          name: 'motivation',
          label: 'Why do you want to attend?',
          required: true,
        },
        {
          blockType: 'upload',
          name: 'cv',
          label: 'CV (PDF)',
          required: true,
          uploadCollection: 'application-files',
          mimeTypes: [{ mimeType: 'application/pdf' }],
          maxFileSize: APPLICATION_FILE_MAX_BYTES,
          multiple: false,
        },
        {
          blockType: 'checkbox',
          name: 'privacy',
          label:
            'I agree that my data is processed for this application and deleted after six months.',
          required: true,
        },
      ],
      emails: [
        notify('New application for a speaker event'),
        {
          emailTo: '{{email}}',
          subject: 'Your application to the St. Gallen Business Review',
          message: plainTextToLexical(
            'Dear {{firstName}}, thank you for your application. We will let you know in good time before the event.',
          ),
        },
      ],
    },
  )
  return { contact: contact.doc.id as Id, application: application.doc.id as Id }
}

/** Links the application form to the next upcoming event and opens applications now. */
export async function attachApplicationForm(payload: Payload, formId: Id, report: ImportReport) {
  const upcoming = await payload.find({
    collection: 'events',
    where: { startsAt: { greater_than: new Date().toISOString() } },
    sort: 'startsAt',
    limit: 1,
    depth: 0,
  })
  const event = upcoming.docs[0]
  if (!event) {
    report.notes.push('Kein kommendes Event gefunden: Bewerbungsformular nicht verknüpft.')
    return
  }
  const deadline = new Date(new Date(event.startsAt).getTime() - 3 * 24 * 60 * 60 * 1000)
  await payload.update({
    collection: 'events',
    id: event.id,
    data: {
      applicationForm: formId,
      applicationOpensAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      applicationDeadline: (deadline.getTime() > Date.now()
        ? deadline
        : new Date(event.startsAt)
      ).toISOString(),
    },
  })
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

type LegalRow = { id: string; label: string; html: string }

/** Splits the old imprint page into its labelled rows (`sgbr-legal__row`). */
export function parseLegalRows(html: string): LegalRow[] {
  const rows: LegalRow[] = []
  const parts = html.split(/<div class="sgbr-legal__row" id="/).slice(1)
  for (const part of parts) {
    const id = part.slice(0, part.indexOf('"'))
    const label = stripTags(part.match(/class="sgbr-legal__label">([\s\S]*?)<\/div>/)?.[1] ?? id)
    const body = part
      .replace(/^[\s\S]*?class="sgbr-legal__label">[\s\S]*?<\/div>/, '')
      .replace(/<div class="sgbr-legal__subhead">([\s\S]*?)<\/div>/g, '<h3>$1</h3>')
    rows.push({ id, label, html: body })
  }
  return rows
}

/** Sections added to the privacy policy for new features. Draft: legal review before go-live. */
const PRIVACY_DRAFT_SECTIONS = `
<h2>[Draft] Hosting</h2>
<p>This website is hosted by Vercel Inc. Content and files are stored with Neon (database) and Vercel Blob (files). When you visit the website, technical data (e.g. IP address, browser type, time of access) is processed to deliver and secure the site.</p>
<h2>[Draft] Statistics</h2>
<p>We use Vercel Web Analytics to collect anonymous usage statistics (e.g. page views). No cookies are set and no personal profiles are created. This replaces Matomo, which was used on the previous website.</p>
<h2>[Draft] Newsletter</h2>
<p>If you subscribe to our newsletter, we store your email address, optionally your first name, your interests, the language of the signup and the time of your consent and confirmation. You confirm your subscription through a link (double opt-in); before that click nothing is stored, and the link expires after seven days. The list of subscribers is kept and the emails are sent by the email service Resend (USA) on our behalf. You can change your preferences or unsubscribe at any time through the link in every email. After unsubscribing your address stays marked as "unsubscribed" so that we do not contact you again.</p>
<h2>[Draft] Forms and applications</h2>
<p>When you use a form on this website (e.g. the contact form or an application for a speaker event), we process the data you enter. Applications may include a CV as a PDF file. Only the editorial board can access submissions and files. Submissions and uploaded files are deleted automatically six months after the event (or six months after submission for forms without an event).</p>
`

export async function seedPages(
  payload: Payload,
  media: MediaImporter,
  sources: { aboutHtml: string | null; imprintHtml: string | null; contactHtml: string | null },
  contactFormId: Id,
) {
  const config = payload.config

  // About: mission text, team photo, team grid.
  const aboutLayout: Record<string, unknown>[] = []
  const mission = sources.aboutHtml?.match(/class="sgbr-about-mission"[^>]*>([\s\S]*?)<\/div>/)?.[1]
  aboutLayout.push({
    blockType: 'richText',
    content: mission
      ? await htmlToLexical(config, `<p>${mission}</p>`, 'default')
      : plainTextToLexical(
          'The St. Gallen Business Review publishes interviews with leaders from business, finance and politics.',
        ),
  })
  const teamPhoto = sources.aboutHtml?.match(
    /class="sgbr-about-teamphoto"[\s\S]*?<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/,
  )
  const caption = sources.aboutHtml?.match(/class="sgbr-about-caption[^"]*">([\s\S]*?)<\/div>/)?.[1]
  if (teamPhoto) {
    const image = await media.get({
      url: teamPhoto[1],
      alt: teamPhoto[2],
      caption: caption ? stripTags(caption) : undefined,
    })
    if (image) {
      aboutLayout.push({
        blockType: 'imageText',
        image,
        imagePosition: 'full',
        content: plainTextToLexical(caption ? stripTags(caption) : teamPhoto[2]),
      })
    }
  }
  aboutLayout.push({
    blockType: 'teamGrid',
    heading: 'Our team',
    groups: ['editorial-board', 'editors', 'advisory'],
  })

  // Contact: intro and contact details from the old page, plus the contact form.
  const contactIntro = sources.contactHtml?.match(
    /class="sgbr-contact__intro"[^>]*>([\s\S]*?)<\/div>/,
  )?.[1]
  const contactLayout = [
    {
      blockType: 'richText',
      content: contactIntro
        ? await htmlToLexical(config, contactIntro, 'default')
        : plainTextToLexical('We appreciate your questions and suggestions.'),
    },
    { blockType: 'contactForm', heading: 'Write to us', form: contactFormId, showAddress: true },
  ]

  // Imprint and privacy from the old imprint page.
  const rows = sources.imprintHtml ? parseLegalRows(sources.imprintHtml) : []
  const imprintHtml = rows
    .filter((row) => row.id !== 'privacy')
    .map((row) => `<h2>${row.label}</h2>${row.html}`)
    .join('\n')
  const privacyRow = rows.find((row) => row.id === 'privacy')
  const privacyHtml = `${privacyRow?.html ?? '<p>Data protection is important to us.</p>'}${PRIVACY_DRAFT_SECTIONS}`

  const pages = [
    { slug: 'about', title: 'About', layout: aboutLayout },
    { slug: 'contact', title: 'Contact', layout: contactLayout },
    {
      slug: 'imprint',
      title: 'Imprint',
      layout: [
        {
          blockType: 'richText',
          content: imprintHtml
            ? await htmlToLexical(config, imprintHtml, 'default')
            : plainTextToLexical('Imprint'),
        },
      ],
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      layout: [
        { blockType: 'richText', content: await htmlToLexical(config, privacyHtml, 'default') },
      ],
    },
  ]
  for (const page of pages) {
    await upsert(
      payload,
      'pages',
      { field: 'slug', value: page.slug },
      { ...page, _status: 'published' },
      { locale: 'en' },
    )
  }
  const germanTitles: Record<string, string> = {
    about: 'Über uns',
    contact: 'Kontakt',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
  }
  for (const [slug, title] of Object.entries(germanTitles)) {
    const found = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    if (found.docs[0])
      await payload.update({
        collection: 'pages',
        id: found.docs[0].id,
        locale: 'de',
        data: { title },
      })
  }
}

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------

export async function seedGlobals(payload: Payload, currentIssueSlug: string) {
  const issue = await payload.find({
    collection: 'issues',
    where: { slug: { equals: currentIssueSlug } },
    limit: 1,
    depth: 0,
  })
  await payload.updateGlobal({
    slug: 'homepage',
    data: { currentIssue: issue.docs[0]?.id ?? null, showTopicSection: true },
  })

  const nav = [
    { href: '/issues', en: 'Issues', de: 'Ausgaben' },
    { href: '/topics', en: 'Topics', de: 'Themen' },
    { href: '/events', en: 'Speaker Events', de: 'Speaker Events' },
    { href: '/newsletter', en: 'Newsletter', de: 'Newsletter' },
  ]
  const header = await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: { navItems: nav.map((item) => ({ label: item.en, href: item.href })) },
  })
  await payload.updateGlobal({
    slug: 'header',
    locale: 'de',
    data: {
      navItems: (header.navItems ?? []).map((item, index) => ({ ...item, label: nav[index].de })),
    },
  })

  const links = [
    { href: '/about', en: 'About', de: 'Über uns' },
    { href: '/contact', en: 'Contact', de: 'Kontakt' },
    { href: '/imprint', en: 'Imprint', de: 'Impressum' },
    { href: '/privacy', en: 'Privacy', de: 'Datenschutz' },
  ]
  const socialLinks = [
    { platform: 'linkedin' as const, url: LINKEDIN },
    { platform: 'instagram' as const, url: INSTAGRAM },
  ]
  const footer = await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: {
      links: links.map((link) => ({ label: link.en, href: link.href })),
      socialLinks,
      newsletterText:
        'Once a month: new interviews, guest articles and invitations to our speaker events.',
      espritNote:
        'The St. Gallen Business Review is published by ESPRIT St. Gallen, the student-run consultancy at the University of St. Gallen.',
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'de',
    data: {
      links: (footer.links ?? []).map((link, index) => ({ ...link, label: links[index].de })),
      newsletterText:
        'Einmal im Monat: neue Interviews, Gastbeiträge und Einladungen zu unseren Speaker Events.',
      espritNote:
        'Die St. Gallen Business Review wird herausgegeben von ESPRIT St. Gallen, der studentischen Unternehmensberatung an der Universität St. Gallen.',
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    data: {
      contactEmail: SGBR_CONTACT_EMAIL,
      address: SGBR_ADDRESS,
      socialProfiles: socialLinks,
      newsletterPopup: { enabled: true, delaySeconds: 10 },
      defaultSeo: {
        title: 'St. Gallen Business Review',
        description:
          'Interviews with leaders from business, finance and politics, published by students of the University of St. Gallen.',
      },
    },
  })
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'de',
    data: {
      defaultSeo: {
        title: 'St. Gallen Business Review',
        description:
          'Interviews mit Persönlichkeiten aus Wirtschaft, Finanzen und Politik, herausgegeben von Studierenden der Universität St. Gallen.',
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Newsletter, subscribers, users (dev only)
// ---------------------------------------------------------------------------

export async function seedNewsletters(payload: Payload) {
  const latest = await payload.find({
    collection: 'posts',
    sort: '-publishedAt',
    limit: 3,
    depth: 0,
  })
  const featuredPosts = latest.docs.map((doc) => doc.id)
  await upsert(
    payload,
    'newsletters',
    { field: 'slug', value: 'newsletter-january-2027' },
    {
      slug: 'newsletter-january-2027',
      title: 'Newsletter January 2027',
      subject: 'SGBR – New interviews and our next speaker event',
      previewText: 'Three new interviews and an invitation.',
      intro:
        'Happy new year! This month we bring you three new interviews and an invitation to our next speaker event.',
      content: plainTextToLexical('Guest article: placeholder text for the development site.'),
      featuredPosts,
      audience: 'newsletter',
      status: 'draft',
      archiveDelayDays: 30,
      showInArchive: true,
    },
    { locale: 'en' },
  )
  const sentAt = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  await upsert(
    payload,
    'newsletters',
    { field: 'slug', value: 'newsletter-example-archive' },
    {
      slug: 'newsletter-example-archive',
      title: 'Newsletter (example in the archive)',
      subject: 'SGBR – Example newsletter',
      intro:
        'This example shows how a sent newsletter appears in the archive 30 days after sending.',
      content: plainTextToLexical('Example content for the development site.'),
      featuredPosts,
      audience: 'newsletter',
      status: 'sent',
      sentAt,
      recipientCount: 0,
      archiveDelayDays: 30,
      showInArchive: true,
    },
    { locale: 'en' },
  )
}

/**
 * Three test contacts in the local stand-in for Resend (ADR 0007, 0021). Never written
 * to a real Resend account: with RESEND_API_KEY set this does nothing.
 */
export async function seedSubscribers(report: ImportReport) {
  if (process.env.RESEND_API_KEY) {
    report.notes.push('RESEND_API_KEY gesetzt: keine Test-Abonnenten angelegt (nur lokal).')
    return
  }
  const now = new Date().toISOString()
  const contacts = [
    {
      email: 'reader.en@example.com',
      firstName: 'Ada',
      locale: 'en' as const,
      interests: ['newsletter', 'events'] as Interest[],
    },
    {
      email: 'leserin.de@example.com',
      firstName: 'Clara',
      locale: 'de' as const,
      interests: ['newsletter'] as Interest[],
    },
    {
      email: 'events.only@example.com',
      locale: 'en' as const,
      interests: ['events'] as Interest[],
    },
  ]
  for (const contact of contacts) {
    await localAudience.createIfMissing({
      ...contact,
      source: 'admin',
      consentAt: now,
      confirmedAt: now,
    })
  }
}

/** One user per role; the password comes only from DEV_SEED_PASSWORD in .env (ADR 0007). */
export async function seedUsers(payload: Payload, report: ImportReport) {
  const password = process.env.DEV_SEED_PASSWORD
  if (!password) {
    report.notes.push('DEV_SEED_PASSWORD fehlt in .env: keine Testbenutzer angelegt.')
    return
  }
  const roles: Array<{ role: Role; name: string }> = [
    { role: 'admin', name: 'Admin (dev)' },
    { role: 'board', name: 'Editorial Board (dev)' },
    { role: 'editor', name: 'Editor (dev)' },
    { role: 'advisory', name: 'Advisory Board (dev)' },
  ]
  for (const { role, name } of roles) {
    const email = `${role}@sgbr.local`
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })
    if (existing.docs[0]) {
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data: { role, name, password },
      })
    } else {
      const created = await payload.create({
        collection: 'users',
        data: { email, name, role, password },
      })
      // The very first user always becomes admin; set the intended role afterwards.
      if (created.role !== role)
        await payload.update({ collection: 'users', id: created.id, data: { role } })
    }
  }
  report.notes.push(
    'Testbenutzer: admin@, board@, editor@, advisory@sgbr.local (Passwort aus DEV_SEED_PASSWORD).',
  )
}
