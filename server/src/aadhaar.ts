import crypto from 'node:crypto'

// Must match hospital-patient-reg/server/src/lib/encryption.ts, which encrypts the numbers when
// patients submit.
const ALGORITHM = 'aes-256-cbc'

function getEncryptionKey(): Buffer {
  const secret = process.env.AADHAAR_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || 'default_aadhaar_secret_key_32bytes_long!'
  return crypto.createHash('sha256').update(secret).digest()
}

function decryptAadhaar(stored: string): string | null {
  const [ivHex, ...rest] = stored.split(':')
  const encryptedText = rest.join(':')
  if (!ivHex || !encryptedText) return stored // legacy plain-text value
  try {
    const iv = Buffer.from(ivHex, 'hex')
    if (iv.length !== 16) return null
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv)
    return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
  } catch {
    return null
  }
}

/** Last 4 digits of a stored Aadhaar number. The full number never leaves the server. */
export function aadhaarLast4(stored: string | null): string | null {
  if (!stored) return null
  const digits = decryptAadhaar(stored)?.replace(/\D/g, '')
  return digits && digits.length >= 4 ? digits.slice(-4) : null
}
