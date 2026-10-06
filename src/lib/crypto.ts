// Password hashing with the browser's Web Crypto API (PBKDF2 + SHA-256, per-user salt).
// Note: this only protects passwords at rest in localStorage. Real security needs a backend.

const ITERATIONS = 100_000
const encoder = new TextEncoder()

const toHex = (buffer: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('')

export const isCryptoAvailable = () => typeof crypto !== 'undefined' && !!crypto.subtle

export const generateSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)))

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(bits)
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  return (await hashPassword(password, salt)) === hash
}
