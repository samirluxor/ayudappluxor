const SALT = 'AyudAppLuxor2024'
const ITERATIONS = 100000

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
