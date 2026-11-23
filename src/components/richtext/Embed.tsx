/** Privacy-friendly embeds for YouTube, Vimeo and Spotify; other links stay links. */
export function embedSrc(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (host === 'youtu.be')
      return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`
    if (host === 'vimeo.com')
      return `https://player.vimeo.com/video/${parsed.pathname.split('/').filter(Boolean)[0]}?dnt=1`
    if (host === 'open.spotify.com') return `https://open.spotify.com/embed${parsed.pathname}`
  } catch {
    return null
  }
  return null
}

export function Embed({ url, caption }: { url: string; caption?: string | null }) {
  const src = embedSrc(url)
  if (!src) {
    return (
      <p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {caption || url}
        </a>
      </p>
    )
  }
  const isAudio = src.includes('spotify')
  return (
    <figure className="not-prose my-8">
      <div className={isAudio ? 'h-[232px]' : 'aspect-video'}>
        <iframe
          src={src}
          title={caption || 'Embedded media'}
          className="size-full border-0"
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
    </figure>
  )
}
