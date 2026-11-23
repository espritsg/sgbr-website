import type { Footer } from '@/payload-types'

import { InstagramLogo, LinkedinLogo, SpotifyLogo, XLogo, YoutubeLogo } from './icons'

const icons = {
  instagram: InstagramLogo,
  linkedin: LinkedinLogo,
  youtube: YoutubeLogo,
  x: XLogo,
  spotify: SpotifyLogo,
} as const

const names: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  x: 'X',
  spotify: 'Spotify',
}

/** Social profiles as icon + name (footer, menu). */
export function SocialLinks({
  links,
  className = '',
  linkClassName = '',
  iconOnly = false,
}: {
  links: NonNullable<Footer['socialLinks']>
  className?: string
  linkClassName?: string
  iconOnly?: boolean
}) {
  if (!links.length) return null
  return (
    <ul className={className}>
      {links.map((link) => {
        const Icon = icons[link.platform as keyof typeof icons]
        const name = names[link.platform] ?? link.platform
        return (
          <li key={link.id ?? link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={iconOnly ? name : undefined}
              className={`inline-flex items-center gap-2.5 ${linkClassName}`}
            >
              {Icon && <Icon aria-hidden className="size-5 shrink-0" />}
              {!iconOnly && <span>{name}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
