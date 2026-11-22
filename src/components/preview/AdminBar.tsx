'use client'

import { PayloadAdminBar } from '@payloadcms/admin-bar'
import { useEffect, useState, useSyncExternalStore } from 'react'

import {
  getAdminBarDoc,
  setAdminBarDoc,
  subscribeAdminBarDoc,
  type AdminBarDoc,
} from './adminBarStore'

/**
 * "Edit" bar for logged-in editors (plugin admin-bar). Invisible for visitors:
 * it only appears once /api/users/me returns a user.
 */
export function AdminBar({ preview, serverUrl }: { preview: boolean; serverUrl: string }) {
  const doc = useSyncExternalStore(subscribeAdminBarDoc, getAdminBarDoc, () => null)
  const [loggedIn, setLoggedIn] = useState(false)

  return (
    <div className={loggedIn ? 'block' : 'hidden'}>
      <PayloadAdminBar
        cmsURL={serverUrl}
        adminPath="/admin"
        apiPath="/api"
        collectionSlug={doc?.collection}
        id={doc?.id ? String(doc.id) : undefined}
        collectionLabels={doc ? { singular: doc.label, plural: doc.label } : undefined}
        preview={preview}
        onPreviewExit={() => {
          // A full page load is needed so the draft-mode cookie is cleared server-side.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = `/next/exit-preview?path=${encodeURIComponent(window.location.pathname)}`
        }}
        onAuthChange={(user) => setLoggedIn(Boolean(user?.id))}
        className="!relative !z-40 !bg-[#082c52] !px-4 !py-2 !text-xs !text-white"
        style={{ position: 'relative' }}
      />
    </div>
  )
}

/** Rendered by a page to point the admin bar at its document. */
export function AdminBarDocument(props: NonNullable<AdminBarDoc>) {
  const { collection, id, label } = props
  useEffect(() => {
    setAdminBarDoc({ collection, id, label })
    return () => setAdminBarDoc(null)
  }, [collection, id, label])
  return null
}
