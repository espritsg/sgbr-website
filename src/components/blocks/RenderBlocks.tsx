import { getLocale, getTranslations } from 'next-intl/server'

import type { AppLocale } from '@/i18n/routing'
import { getForm, getGlobals, getTeam } from '@/lib/data/queries'
import type { Page } from '@/payload-types'

import { FormRenderer } from '../forms/FormRenderer'
import { RichText } from '../richtext/RichText'
import { ButtonLink } from '../ui/Button'
import { MediaImage } from '../ui/MediaImage'
import { Reveal } from '../ui/Reveal'
import { SectionHeader } from '../ui/Section'

type Block = NonNullable<Page['layout']>[number]

const groupLabels: Record<string, string> = {
  'editorial-board': 'Editorial Board',
  editors: 'Editors',
  advisory: 'Advisory Board',
}

const prose =
  'prose prose-lg max-w-none text-text dark:prose-invert prose-headings:font-serif prose-headings:tracking-tight prose-p:leading-[1.75] prose-a:text-accent'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
}

/** Page layout blocks (About, Contact, Imprint, Privacy). One vertical rhythm: mt-14 between blocks. */
export async function RenderBlocks({ blocks }: { blocks: Page['layout'] }) {
  const locale = (await getLocale()) as AppLocale
  const t = await getTranslations('contact')
  return (
    <div className="space-y-14 pt-2">
      {(blocks ?? []).map(async (block: Block, index) => {
        switch (block.blockType) {
          case 'richText':
            return (
              <div key={block.id} className="container-reading">
                <RichText
                  data={block.content}
                  locale={locale}
                  className={`${prose} ${index === 0 ? '[&>p:first-of-type]:text-xl [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:text-text' : ''}`}
                />
              </div>
            )
          case 'imageText':
            if (block.imagePosition === 'full') {
              return (
                <Reveal key={block.id}>
                  <figure className="container-wide">
                    <div className="relative aspect-[16/9] overflow-hidden bg-band">
                      <MediaImage
                        media={block.image}
                        size="hero"
                        fill
                        sizes="(min-width: 1080px) 1040px, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="meta mt-3 max-w-3xl">
                      <RichText data={block.content} locale={locale} />
                    </figcaption>
                  </figure>
                </Reveal>
              )
            }
            return (
              <Reveal key={block.id} className="container-page">
                <div
                  className={`grid items-center gap-10 md:grid-cols-2 ${block.imagePosition === 'right' ? 'md:[&>*:first-child]:order-2' : ''}`}
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-band">
                    <MediaImage
                      media={block.image}
                      size="hero"
                      fill
                      sizes="50vw"
                      className="object-cover"
                    />
                  </div>
                  <RichText data={block.content} locale={locale} className={prose} />
                </div>
              </Reveal>
            )
          case 'teamGrid': {
            const groups = block.groups?.length
              ? block.groups
              : ['editorial-board', 'editors', 'advisory']
            const team = await getTeam(locale, groups)
            return (
              <section key={block.id} className="container-page space-y-14">
                {groups.map((group) => {
                  const members = team.filter((member) => member.group === group)
                  if (!members.length) return null
                  const large = group === 'editorial-board'
                  return (
                    <Reveal key={group}>
                      <SectionHeader title={groupLabels[group]} />
                      <ul
                        className={`grid gap-x-6 gap-y-10 ${large ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}
                      >
                        {members.map((member) => (
                          <li key={member.id}>
                            <div className="relative aspect-[4/5] overflow-hidden bg-band">
                              {member.photo ? (
                                <MediaImage
                                  media={member.photo}
                                  size="card"
                                  fill
                                  sizes={large ? '30vw' : '20vw'}
                                  className="object-cover"
                                />
                              ) : (
                                <span
                                  aria-hidden
                                  className="flex size-full items-center justify-center font-serif text-4xl font-semibold text-muted"
                                >
                                  {initials(member.name)}
                                </span>
                              )}
                            </div>
                            {member.position && <p className="kicker mt-3">{member.position}</p>}
                            <p className={`mt-1 ${large ? 'headline-md' : 'headline-sm'}`}>
                              {member.name}
                            </p>
                            <p className="meta mt-1">
                              {[member.study, member.university].filter(Boolean).join(' · ')}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  )
                })}
              </section>
            )
          }
          case 'contactForm': {
            const formId = typeof block.form === 'object' ? block.form.id : block.form
            const [form, { settings }] = await Promise.all([getForm(formId), getGlobals(locale)])
            return (
              <section key={block.id} className="container-page">
                <div className="grid gap-12 border-t border-line pt-8 md:grid-cols-[1fr_1.6fr] md:gap-16">
                  <div>
                    {block.heading && <h2 className="headline-lg">{block.heading}</h2>}
                    <dl className="mt-6 space-y-5 text-sm">
                      {block.showAddress && settings.address && (
                        <div>
                          <dt className="kicker text-muted!">{t('address')}</dt>
                          <dd className="mt-1 whitespace-pre-line leading-relaxed">
                            {settings.address}
                          </dd>
                        </div>
                      )}
                      {settings.contactEmail && (
                        <div>
                          <dt className="kicker text-muted!">{t('email')}</dt>
                          <dd className="mt-1">
                            <a
                              href={`mailto:${settings.contactEmail}`}
                              className="underline underline-offset-4 hover:text-accent"
                            >
                              {settings.contactEmail}
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  {form && <FormRenderer form={form} />}
                </div>
              </section>
            )
          }
          case 'cta':
            return (
              <section key={block.id} className="container-page">
                <div className="grid gap-6 border-y border-line py-10 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <h2 className="headline-lg">{block.heading}</h2>
                    {block.text && <p className="mt-2 max-w-2xl text-muted">{block.text}</p>}
                  </div>
                  {block.linkUrl && (
                    <ButtonLink href={block.linkUrl}>{block.linkLabel || block.linkUrl}</ButtonLink>
                  )}
                </div>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
