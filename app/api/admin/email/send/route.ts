import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hasMainAdminAccess } from "@/lib/auth-helpers"
import { sendCampaign, buildEmailHtml, buildEmailText, type EmailVariant } from "@/lib/email"
import { generateUnsubscribeToken } from "@/lib/unsubscribe-token"

export const maxDuration = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eotcmedia.com"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasMainAdminAccess(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { subjectAm, subjectEn, bodyAm, bodyEn, userIds, variant } = await req.json()
  const emailVariant: EmailVariant = variant === "rich" ? "rich" : "simple"

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

  // Build the bilingual HTML + plain-text once, with a Brevo placeholder for the
  // per-recipient unsubscribe link; each recipient's real link is supplied via
  // message params.
  const htmlContent = buildEmailHtml({
    subjectAm, subjectEn, bodyAm, bodyEn,
    unsubscribeUrl: "{{params.unsubscribeUrl}}",
    variant: emailVariant,
  })
  const textContent = buildEmailText({
    subjectAm, subjectEn, bodyAm, bodyEn,
    unsubscribeUrl: "{{params.unsubscribeUrl}}",
  })

  const { sent, failed, error } = await sendCampaign({
    subject,
    htmlContent,
    textContent,
    recipients: recipients.map(u => ({
      email: u.email,
      name: u.name,
      unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${generateUnsubscribeToken(u.id)}`,
    })),
  })

  return NextResponse.json({ sent, failed, total: recipients.length, error })
}
