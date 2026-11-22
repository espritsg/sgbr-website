import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let instance: Payload | undefined

/** Returns a shared Payload instance connected to the test database. */
export async function getTestPayload(): Promise<Payload> {
  if (!instance) instance = await getPayload({ config })
  return instance
}
