import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Footer, Header } from '@/payload-types'

import { NewsletterSignup } from '../newsletter/NewsletterSignup'
import { AppLink } from '../ui/AppLink'
import { Logo } from './Logo'

/** Dark footer with logo, newsletter line and link columns. Same look in light and dark mode. */
export async function SiteFooter({ footer, header }: { footer: Footer; header: Header }) {
  const t = await getTranslations()
  const columnTitle = 'mb-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-[#9fb3c2]'
  const columnLink =
    'text-sm text-[#e9edf0] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current'
  return (
    <footer className="dark mt-24 bg-petrol text-text">
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/15 py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Link href="/" aria-label={t('site.name')} className="inline-block text-[#ffffff]">
              <Logo className="h-12 w-auto" />
            </Link>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#b9c6d0]">
              {footer.espritNote || t('footer.esprit')}
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#ffffff]">
              {t('newsletter.title')}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[#b9c6d0]">
              {footer.newsletterText || t('newsletter.intro')}
            </p>
            <div className="mt-5">
              <NewsletterSignup source="footer" variant="inline" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
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
            <ul className="space-y-2.5">
              {(footer.socialLinks ?? []).map((link) => (
                <li key={link.id ?? link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${columnLink} capitalize`}
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
              <li>
                <a href="/en/feed.xml" className={columnLink}>
                  RSS
                </a>
              </li>
            </ul>
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
