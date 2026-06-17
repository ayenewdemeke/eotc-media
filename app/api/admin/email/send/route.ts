import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasMainAdminAccess } from "@/lib/auth-helpers"
import { transporter, buildEmailHtml } from "@/lib/email"
import { generateUnsubscribeToken } from "@/lib/unsubscribe-token"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eotcmedia.com"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasMainAdminAccess(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { subjectAm, subjectEn, bodyAm, bodyEn, userIds } = await req.json()

  const hasText = (s: string) => s?.replace(/<[^>]*>/g, "").trim().length > 0
  if (!subjectAm?.trim() || !subjectEn?.trim() || !hasText(bodyAm) || !hasText(bodyEn)) {
    return NextResponse.json({ error: "All four fields (Amharic/English subject and body) are required." }, { status: 400 })
  }

  const subject = `${subjectAm} | ${subjectEn}`

  // If specific user IDs provided, send only to those (still excluding opt-outs)
  const where = userIds?.length
    ? { id: { in: userIds as number[] }, emailOptOut: false }
    : { emailOptOut: false }

  const recipients = await prisma.user.findMany({ where, select: { id: true, email: true, name: true } })

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No eligible recipients." }, { status: 400 })
  }

  let sent = 0
  let failed = 0
  let firstError: string | null = null

  for (const user of recipients) {
    try {
      const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${generateUnsubscribeToken(user.id)}`
      const html = buildEmailHtml({ subjectAm, subjectEn, bodyAm, bodyEn, unsubscribeUrl })
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? `EOTC Media <${process.env.SMTP_USER}>`,
        to: user.email,
        subject,
        html,
      })
      sent++
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[email] failed to send to ${user.email}:`, msg)
      if (!firstError) firstError = msg
    }
  }

  return NextResponse.json({ sent, failed, total: recipients.length, error: firstError })
}
