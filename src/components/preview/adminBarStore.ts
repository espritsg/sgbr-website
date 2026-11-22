'use client'

/** Tiny store so a page can tell the admin bar which document it shows. */
export type AdminBarDoc = { collection: string; id: number | string; label: string } | null

let current: AdminBarDoc = null
const listeners = new Set<() => void>()

export function setAdminBarDoc(doc: AdminBarDoc) {
  current = doc
  listeners.forEach((listener) => listener())
}

export function subscribeAdminBarDoc(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getAdminBarDoc() {
  return current
}
