import { getLocale } from 'next-intl/server'

import type { AppLocale } from '@/i18n/routing'
import { getForm, getGlobals, getTeam } from '@/lib/data/queries'
import type { Page } from '@/payload-types'

import { FormRenderer } from '../forms/FormRenderer'
import { RichText } from '../richtext/RichText'
import { AppLink } from '../ui/AppLink'
import { MediaImage } from '../ui/MediaImage'

type Block = NonNullable<Page['layout']>[number]

const groupLabels: Record<string, string> = {
  'editorial-board': 'Editorial Board',
  editors: 'Editors',
  advisory: 'Advisory Board',
}

const prose =
  'prose prose-lg max-w-none text-text dark:prose-invert prose-headings:font-serif prose-a:text-accent'

/** Page layout blocks (About, Contact, Imprint, Privacy). */
export async function RenderBlocks({ blocks }: { blocks: Page['layout'] }) {
  const locale = (await getLocale()) as AppLocale
  return (
    <>
      {(blocks ?? []).map(async (block: Block) => {
        switch (block.blockType) {
          case 'richText':
            return (
              <div key={block.id} className="container-reading py-6">
                <RichText data={block.content} locale={locale} className={prose} />
              </div>
            )
          case 'imageText':
            return (
              <div key={block.id} className="container-page py-8">
                <div
                  className={`grid items-center gap-8 md:grid-cols-2 ${block.imagePosition === 'right' ? 'md:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="relative aspect-[3/2] overflow-hidden rounded-card bg-band">
                    <MediaImage
                      media={block.image}
                      size="hero"
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                  </div>
                  <RichText
                    data={block.content}
                    locale={locale}
                    className="prose max-w-none text-muted dark:prose-invert"
                  />
                </div>
              </div>
            )
          case 'teamGrid': {
            const groups = block.groups?.length
              ? block.groups
              : ['editorial-board', 'editors', 'advisory']
            const team = await getTeam(locale, groups)
            return (
              <div key={block.id} className="container-page py-8">
                {block.heading && (
                  <h2 className="mb-8 border-t-2 border-text pt-3 font-serif text-3xl">
                    {block.heading}
                  </h2>
                )}
                {groups.map((group) => {
                  const members = team.filter((member) => member.group === group)
                  if (!members.length) return null
                  return (
                    <div key={group} className="mb-12">
                      <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-accent">
                        {groupLabels[group]}
                      </h3>
                      <ul
                        className={`grid gap-8 ${group === 'editorial-board' ? 'sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}
                      >
                        {members.map((member) => (
                          <li key={member.id}>
                            <div className="relative aspect-square overflow-hidden rounded-card bg-band">
                              {member.photo && (
                                <MediaImage
                                  media={member.photo}
                                  size="card"
                                  fill
                                  sizes="25vw"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            {member.position && (
                              <p className="mt-3 text-xs uppercase tracking-wider text-muted">
                                {member.position}
                              </p>
                            )}
                            <p className="font-serif text-xl">{member.name}</p>
                            <p className="text-sm text-muted">
                              {[member.study, member.university].filter(Boolean).join(' · ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )
          }
          case 'contactForm': {
            const formId = typeof block.form === 'object' ? block.form.id : block.form
            const [form, { settings }] = await Promise.all([getForm(formId), getGlobals(locale)])
            return (
              <div
                key={block.id}
                className="container-page grid gap-10 py-8 md:grid-cols-[1fr_1.4fr]"
              >
                <div>
                  {block.heading && <h2 className="font-serif text-3xl">{block.heading}</h2>}
                  {block.showAddress && settings.address && (
                    <p className="mt-4 whitespace-pre-line text-muted">{settings.address}</p>
                  )}
                  {settings.contactEmail && (
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="mt-4 inline-block text-accent hover:underline"
                    >
                      {settings.contactEmail}
                    </a>
                  )}
                </div>
                {form && <FormRenderer form={form} />}
              </div>
            )
          }
          case 'cta':
            return (
              <div key={block.id} className="container-page py-8">
                <div className="rounded-card bg-band p-8 md:p-12">
                  <h2 className="font-serif text-3xl">{block.heading}</h2>
                  {block.text && <p className="mt-2 max-w-2xl text-muted">{block.text}</p>}
                  {block.linkUrl && (
                    <AppLink
                      href={block.linkUrl}
                      className="mt-6 inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
                    >
                      {block.linkLabel || block.linkUrl}
                    </AppLink>
                  )}
                </div>
              </div>
            )
          default:
            return null
        }
      })}
    </>
  )
}
