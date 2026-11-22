import crypto from 'crypto'

/** Random, unguessable token for confirmation and preferences links. */
export function createToken(): string {
  return crypto.randomBytes(24).toString('base64url')
}

export function isWellFormedToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{20,64}$/.test(token)
}
