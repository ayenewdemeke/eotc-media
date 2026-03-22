import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const statuses = await prisma.qzApprovalStatus.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(statuses)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const status = await prisma.qzApprovalStatus.create({ data: { name: name.trim() } })
  return NextResponse.json(status, { status: 201 })
}
