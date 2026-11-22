import { getTranslations } from 'next-intl/server'

import type { Footer } from '@/payload-types'

import { NewsletterSignup } from '../newsletter/NewsletterSignup'
import { AppLink } from '../ui/AppLink'

export async function SiteFooter({ footer }: { footer: Footer }) {
  const t = await getTranslations()
  return (
    <footer className="mt-24 bg-petrol text-[#e8ecf1]">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.2fr_1fr]">
        <div className="max-w-xl">
          <h2 className="font-serif text-3xl">{t('newsletter.title')}</h2>
          <p className="mt-2 text-sm text-[#c5ced8]">
            {footer.newsletterText || t('newsletter.intro')}
          </p>
          {/* The form sits on a light card so it looks the same in light and dark mode. */}
          <div className="mt-6 rounded-card bg-[#ffffff] p-6 text-[#1a1a1a] [--sgbr-bg:#fff] [--sgbr-surface:#fff] [--sgbr-band:#f4f6f9] [--sgbr-text:#1a1a1a] [--sgbr-muted:#6b6b6b] [--sgbr-line:#e3e7ed] [--sgbr-accent:#0b3c6d] [--sgbr-accent-hover:#082c52] [--sgbr-on-accent:#fff]">
            <NewsletterSignup source="footer" variant="compact" />
          </div>
        </div>
        <div className="flex flex-col gap-8 md:items-end md:text-right">
          <p className="font-serif text-3xl">St. Gallen Business Review</p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:justify-end">
              {(footer.links ?? []).map((link) => (
                <li key={link.id ?? link.href}>
                  <AppLink href={link.href} className="hover:underline">
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="flex gap-4 text-sm md:justify-end">
            {(footer.socialLinks ?? []).map((link) => (
              <li key={link.id ?? link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="capitalize hover:underline"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
          <p className="max-w-sm text-sm text-[#c5ced8]">
            {footer.espritNote || t('footer.esprit')}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs text-[#9aa4af]">
          {t('footer.rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  )
}
