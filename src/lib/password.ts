import crypto from 'node:crypto'

// scrypt-based password hashing without external deps
// Format: scrypt$<N>$<r>$<p>$<saltBase64>$<hashBase64>

const N = 16384, r = 8, p = 1, keylen = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const derivedKey = await scryptAsync(password, salt, keylen, { N, r, p })
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${derivedKey.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false
  try {
    const parts = stored.split('$')
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false
    const [, Ns, rs, ps, saltB64, hashB64] = parts
    const NN = parseInt(Ns, 10), rr = parseInt(rs, 10), pp = parseInt(ps, 10)
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(hashB64, 'base64')
    const derived = await scryptAsync(password, salt, expected.length, { N: NN, r: rr, p: pp })
    return crypto.timingSafeEqual(expected, derived)
  } catch {
    return false
  }
}

function scryptAsync(password: string, salt: Buffer, keylen: number, opts: { N: number, r: number, p: number }) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, opts as any, (err, derivedKey) => {
      if (err || !derivedKey) return reject(err)
      resolve(derivedKey as Buffer)
    })
  })
}

