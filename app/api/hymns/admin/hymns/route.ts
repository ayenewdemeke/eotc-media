import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1') || 1)
  const PAGE_SIZE = 50
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {}
  if (status === 'pending') where.approvalStatus = { name: 'Submitted' }
  else if (status === 'approved') where.approvalStatus = { name: 'Accepted' }
  else if (status === 'rejected') where.approvalStatus = { name: 'Declined' }

  const [hymns, total] = await Promise.all([
    prisma.hmHymn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { approvalStatus: true, categories: { include: { category: true }, take: 3 } },
    }),
    prisma.hmHymn.count({ where }),
  ])

  return NextResponse.json({ hymns, total })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, videoId, slug, approvalStatusId, channelId, singer, lyrics, description, publishedAt,
          categoryIds, subCategoryIds, languageIds, singerIds,
          thumbnailDefault, thumbnailMedium, thumbnailHigh, thumbnailStandard, thumbnailMaxres } = body

  if (!title || !videoId || !slug || !approvalStatusId || !channelId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const userId = parseInt(session!.user!.id!)

  const hymn = await prisma.hmHymn.create({
    data: {
      userId,
      title,
      videoId,
      slug,
      approvalStatusId: parseInt(approvalStatusId),
      channelId: parseInt(channelId),
      singer: singer || null,
      lyrics: lyrics || null,
      description: description || null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      thumbnailDefault: thumbnailDefault || `https://img.youtube.com/vi/${videoId}/default.jpg`,
      thumbnailMedium: thumbnailMedium || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      thumbnailHigh: thumbnailHigh || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailStandard: thumbnailStandard || null,
      thumbnailMaxres: thumbnailMaxres || null,
    },
  })

  // Create junction table entries
  if (categoryIds?.length) {
    await prisma.hmCategoryHymn.createMany({
      data: categoryIds.map((cid: number) => ({ categoryId: cid, hymnId: hymn.id })),
    })
  }
  if (subCategoryIds?.length) {
    await prisma.hmHymnSubCategory.createMany({
      data: subCategoryIds.map((sid: number) => ({ subCategoryId: sid, hymnId: hymn.id })),
    })
  }
  if (languageIds?.length) {
    await prisma.hmHymnLanguage.createMany({
      data: languageIds.map((lid: number) => ({ languageId: lid, hymnId: hymn.id })),
    })
  }
  if (singerIds?.length) {
    await prisma.hmHymnSinger.createMany({
      data: singerIds.map((sid: number) => ({ singerId: sid, hymnId: hymn.id })),
    })
  }

  return NextResponse.json(hymn, { status: 201 })
}
