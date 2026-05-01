import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasHymnAdminAccess } from '@/lib/auth-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const hymn = await prisma.hmHymn.findUnique({
    where: { id: parseInt(id) },
    include: {
      approvalStatus: true,
      channel: true,
      categories: { include: { category: true } },
      subCategories: { include: { subCategory: true } },
      languages: { include: { language: true } },
      singers: { include: { singer: true } },
    },
  })
  if (!hymn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(hymn)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const hymnId = parseInt(id)

  const { title, videoId, slug, approvalStatusId, channelId, singer, lyrics, lyricsSuggestion, description, publishedAt,
          categoryIds, subCategoryIds, languageIds, singerIds,
          thumbnailDefault, thumbnailMedium, thumbnailHigh, thumbnailStandard, thumbnailMaxres } = body

  const hymn = await prisma.hmHymn.update({
    where: { id: hymnId },
    data: {
      ...(title && { title }),
      ...(videoId && { videoId }),
      ...(slug && { slug }),
      ...(approvalStatusId && { approvalStatusId: parseInt(approvalStatusId) }),
      ...(channelId && { channelId: parseInt(channelId) }),
      singer: singer ?? null,
      lyrics: lyrics ?? null,
      lyricsSuggestion: lyricsSuggestion ?? null,
      description: description ?? null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      ...(thumbnailDefault && { thumbnailDefault }),
      ...(thumbnailMedium && { thumbnailMedium }),
      ...(thumbnailHigh && { thumbnailHigh }),
      thumbnailStandard: thumbnailStandard ?? null,
      thumbnailMaxres: thumbnailMaxres ?? null,
    },
  })

  // Replace junction tables if provided
  if (categoryIds !== undefined) {
    await prisma.hmCategoryHymn.deleteMany({ where: { hymnId } })
    if (categoryIds.length) {
      await prisma.hmCategoryHymn.createMany({
        data: categoryIds.map((cid: number) => ({ categoryId: cid, hymnId })),
      })
    }
  }
  if (subCategoryIds !== undefined) {
    await prisma.hmHymnSubCategory.deleteMany({ where: { hymnId } })
    if (subCategoryIds.length) {
      await prisma.hmHymnSubCategory.createMany({
        data: subCategoryIds.map((sid: number) => ({ subCategoryId: sid, hymnId })),
      })
    }
  }
  if (languageIds !== undefined) {
    await prisma.hmHymnLanguage.deleteMany({ where: { hymnId } })
    if (languageIds.length) {
      await prisma.hmHymnLanguage.createMany({
        data: languageIds.map((lid: number) => ({ languageId: lid, hymnId })),
      })
    }
  }
  if (singerIds !== undefined) {
    await prisma.hmHymnSinger.deleteMany({ where: { hymnId } })
    if (singerIds.length) {
      await prisma.hmHymnSinger.createMany({
        data: singerIds.map((sid: number) => ({ singerId: sid, hymnId })),
      })
    }
  }

  return NextResponse.json(hymn)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!hasHymnAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.hmHymn.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ success: true })
}
