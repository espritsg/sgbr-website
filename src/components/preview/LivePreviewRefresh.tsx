'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** Reloads the server-rendered page whenever the editor (auto)saves in Live Preview. */
export function LivePreviewRefresh({ serverUrl }: { serverUrl: string }) {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverUrl} />
}
