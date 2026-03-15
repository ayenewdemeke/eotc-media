import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  const authors = await prisma.cbAuthor.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(authors)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const author = await prisma.cbAuthor.create({ data: { name: name.trim(), updatedAt: new Date() } })
  return NextResponse.json(author)
}
