import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasQuizAdminAccess } from '@/lib/auth-helpers'
import { getQuestions } from '@/lib/api/quiz'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!hasQuizAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
  const approvalStatusId = searchParams.get('status') ? parseInt(searchParams.get('status')!) || undefined : undefined
  const search = searchParams.get('search') || undefined

  const { questions, total } = await getQuestions({ page, approvalStatusId, search })
  const totalPages = Math.ceil(total / 24)

  return NextResponse.json({ questions, total, page, totalPages })
}
