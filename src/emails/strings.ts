/** Texts of the emails per language (the website's UI texts live in src/i18n/messages). */
export const emailStrings = {
  en: {
    confirmSubject: 'Please confirm your subscription to the St. Gallen Business Review',
    confirmGreeting: (name?: string | null) => (name ? `Hello ${name},` : 'Hello,'),
    confirmText:
      'thank you for subscribing. Please confirm your email address by clicking the button below. If you did not subscribe, you can ignore this email.',
    confirmButton: 'Confirm subscription',
    confirmNote: 'This link is valid for 7 days.',
    readArticle: 'Read the interview',
    featured: 'In this edition',
    preferences: 'Change preferences',
    unsubscribe: 'Unsubscribe',
    footerReason: 'You receive this email because you subscribed on stgallenbusinessreview.com.',
    viewOnline: 'View in browser',
    testPrefix: '[TEST] ',
  },
  de: {
    confirmSubject: 'Bitte bestätigen Sie Ihre Anmeldung bei der St. Gallen Business Review',
    confirmGreeting: (name?: string | null) => (name ? `Guten Tag ${name},` : 'Guten Tag,'),
    confirmText:
      'vielen Dank für Ihre Anmeldung. Bitte bestätigen Sie Ihre E-Mail-Adresse über den Button unten. Wenn Sie sich nicht angemeldet haben, können Sie diese E-Mail ignorieren.',
    confirmButton: 'Anmeldung bestätigen',
    confirmNote: 'Der Link ist 7 Tage gültig.',
    readArticle: 'Zum Interview',
    featured: 'In dieser Ausgabe',
    preferences: 'Einstellungen ändern',
    unsubscribe: 'Abmelden',
    footerReason:
      'Sie erhalten diese E-Mail, weil Sie sich auf stgallenbusinessreview.com angemeldet haben.',
    viewOnline: 'Im Browser ansehen',
    testPrefix: '[TEST] ',
  },
} as const

export type EmailLocale = keyof typeof emailStrings
