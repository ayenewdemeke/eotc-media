import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token"

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  const userId = verifyUnsubscribeToken(token)
  if (!userId) return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 })
  await prisma.user.update({ where: { id: userId }, data: { emailOptOut: true } })
  return NextResponse.json({ ok: true })
}
