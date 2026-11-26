import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

import { legacyRedirects } from './src/lib/redirects/legacy'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Old URLs end with "/"; one redirect instead of two, and the feeds work with and without it.
  skipTrailingSlashRedirect: true,
  redirects: async () => legacyRedirects(),
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/files/**' }],
    // Media on Cloudflare R2 (public bucket, ADR 0022); a custom domain goes here too.
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev' },
      ...(process.env.R2_PUBLIC_URL && !process.env.R2_PUBLIC_URL.includes('.r2.dev')
        ? [{ protocol: 'https' as const, hostname: new URL(process.env.R2_PUBLIC_URL).hostname }]
        : []),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
