import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Footer, Header } from '@/payload-types'

import { NewsletterSignup } from '../newsletter/NewsletterSignup'
import { AppLink } from '../ui/AppLink'
import { SocialLinks } from '../ui/SocialLinks'
import { Logo } from './Logo'

/** Dark footer with logo, newsletter line and link columns. Same look in light and dark mode. */
export async function SiteFooter({ footer, header }: { footer: Footer; header: Header }) {
  const t = await getTranslations()
  const columnTitle = 'mb-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#9fb3c2]'
  const columnLink =
    'text-sm text-[#e9edf0] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current'
  return (
    <footer className="dark mt-24 bg-petrol text-text">
      {/* Newsletter: text first, the form below it, centred in one column. */}
      <div className="border-b border-white/15">
        <div className="container-page py-14 text-center">
          <p className={columnTitle}>{t('newsletter.title')}</p>
          <h2 className="font-serif text-[1.75rem] font-semibold leading-tight text-[#ffffff]">
            {t('newsletter.popupTitle')}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#b9c6d0]">
            {footer.newsletterText || t('newsletter.intro')}
          </p>
          <div className="mx-auto mt-8 max-w-xl text-left">
            <NewsletterSignup source="footer" variant="inline" />
          </div>
        </div>
      </div>
      <div className="container-page">
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div>
            <Link href="/" aria-label={t('site.name')} className="inline-block text-[#ffffff]">
              <Logo className="h-11 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#b9c6d0]">
              {footer.espritNote || t('footer.esprit')}
            </p>
          </div>
          <div>
            <p className={columnTitle}>{t('footer.sections')}</p>
            <ul className="space-y-2.5">
              {(header.navItems ?? []).map((item) => (
                <li key={item.id ?? item.href}>
                  <AppLink href={item.href} className={columnLink}>
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={columnTitle}>{t('footer.about')}</p>
            <ul className="space-y-2.5">
              {(footer.links ?? []).map((link) => (
                <li key={link.id ?? link.href}>
                  <AppLink href={link.href} className={columnLink}>
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={columnTitle}>{t('footer.follow')}</p>
            <SocialLinks
              links={footer.socialLinks ?? []}
              className="space-y-2.5"
              linkClassName={columnLink}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-white/15 py-6 text-xs text-[#8fa1ae]">
          <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
          <p>
            <a
              href="https://espritsg.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ffffff]"
            >
              ESPRIT St. Gallen
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
