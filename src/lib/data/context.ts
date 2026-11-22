import { draftMode } from 'next/headers'

import type { AppLocale } from '@/i18n/routing'

/**
 * Query options for the website. Visitors get only published content because the
 * access rules apply (overrideAccess: false). In preview mode (draftMode, only for
 * logged-in editors) drafts are shown too.
 */
export async function queryOptions(locale: AppLocale) {
  const { isEnabled } = await draftMode()
  return {
    locale,
    draft: isEnabled,
    overrideAccess: isEnabled,
  } as const
}
