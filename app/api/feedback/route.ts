import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { message, name, email, phone } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  await prisma.contactUs.create({
    data: {
      message: message.trim(),
      name: name?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
    },
  })

  return NextResponse.json({ ok: true })
}
