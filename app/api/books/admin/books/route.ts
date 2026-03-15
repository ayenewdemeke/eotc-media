import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') ?? '1') || 1
  const limit = 20
  const status = searchParams.get('status') // 'pending' | null

  let approvalStatusId: number | undefined
  if (status === 'pending') {
    const s = await prisma.cbApprovalStatus.findFirst({ where: { name: { contains: 'Pending', mode: 'insensitive' } } })
    approvalStatusId = s?.id
  }

  const where = approvalStatusId ? { approvalStatusId } : {}

  const [books, total] = await Promise.all([
    prisma.cbBook.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        approvalStatus: true,
        languages: { include: { language: true } },
        categories: { include: { category: true } },
        subCategories: { include: { subCategory: true } },
        authors: { include: { author: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.cbBook.count({ where }),
  ])

  return NextResponse.json({ books, total, totalPages: Math.ceil(total / limit) })
}
