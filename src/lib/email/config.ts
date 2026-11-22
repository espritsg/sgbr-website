/** Sender addresses and mode (docs/newsletter.md, docs/deployment.md). */
export function emailConfig() {
  return {
    resendApiKey: process.env.RESEND_API_KEY || '',
    /** Transactional mails (form confirmations, password reset). */
    from:
      process.env.EMAIL_FROM || 'St. Gallen Business Review <editorial@stgallenbusinessreview.com>',
    /** Newsletter sender, on its own subdomain. */
    newsletterFrom:
      process.env.NEWSLETTER_FROM ||
      'St. Gallen Business Review <newsletter@news.stgallenbusinessreview.com>',
    newsletterReplyTo: process.env.NEWSLETTER_REPLY_TO || 'editorial@stgallenbusinessreview.com',
  }
}

export function isResendEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** Splits "Name <address>" into its parts. */
export function parseAddress(value: string): { name: string; address: string } {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  return match ? { name: match[1], address: match[2] } : { name: '', address: value.trim() }
}
