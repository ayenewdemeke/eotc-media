import { createHmac } from "crypto"

function secret() {
  const s = process.env.UNSUBSCRIBE_SECRET
  if (!s) throw new Error("UNSUBSCRIBE_SECRET env var is not set")
  return s
}

export function generateUnsubscribeToken(userId: number): string {
  const payload = `${userId}`
  const sig = createHmac("sha256", secret()).update(payload).digest("hex")
  return Buffer.from(`${payload}.${sig}`).toString("base64url")
}

export function verifyUnsubscribeToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString()
    const dotIdx = decoded.lastIndexOf(".")
    if (dotIdx === -1) return null
    const payload = decoded.slice(0, dotIdx)
    const sig = decoded.slice(dotIdx + 1)
    const expected = createHmac("sha256", secret()).update(payload).digest("hex")
    if (sig !== expected) return null
    const userId = parseInt(payload)
    return isNaN(userId) ? null : userId
  } catch {
    return null
  }
}
