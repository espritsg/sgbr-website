import { getRequestConfig } from 'next-intl/server'

import { isAppLocale, routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = isAppLocale(requested) ? requested : routing.defaultLocale

  return {
    locale,
    timeZone: 'Europe/Zurich',
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
