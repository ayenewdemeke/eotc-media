import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { extractVideoId, fetchYoutubeVideo, fetchYoutubeChannel } from '@/lib/youtube'

function generateSlug(title: string): string {
  const base = title.trim().replace(/\s+/g, '-').replace(/[^\wሀ-፿-]/g, '').slice(0, 120)
  return base + '-' + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { videoId: rawVideoId, singer, lyrics, description, categoryIds, subCategoryIds, languageIds } = body

  if (!rawVideoId?.trim()) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
  }
  if (!languageIds?.length || !categoryIds?.length || !subCategoryIds?.length) {
    return NextResponse.json({ error: 'Language, category, and sub-category are required' }, { status: 400 })
  }

  const vid = extractVideoId(rawVideoId.trim()) ?? rawVideoId.trim()

  const submittedStatus = await prisma.hmApprovalStatus.findFirst({ where: { name: 'Submitted' } })
  if (!submittedStatus) return NextResponse.json({ error: 'System configuration incomplete' }, { status: 500 })

  const userId = parseInt(session.user.id)

  // Fetch video metadata from YouTube Data API v3
  const video = await fetchYoutubeVideo(vid)

  // Fetch channel metadata and auto-create if not already in DB
  const ytChannel = await fetchYoutubeChannel(video.channelId)
  const channel = await prisma.hmChannel.upsert({
    where: { ytChannelId: ytChannel.ytChannelId },
    create: {
      userId,
      approvalStatusId: submittedStatus.id,
      ytChannelId: ytChannel.ytChannelId,
      title: ytChannel.title,
      slug: generateSlug(ytChannel.title),
      description: ytChannel.description,
      handle: ytChannel.handle,
      publishedAt: ytChannel.publishedAt ? new Date(ytChannel.publishedAt) : null,
      thumbnailDefault: ytChannel.thumbnailDefault,
      thumbnailMedium: ytChannel.thumbnailMedium,
      thumbnailHigh: ytChannel.thumbnailHigh,
      coverImage: ytChannel.coverImage,
      country: ytChannel.country,
      keywords: ytChannel.keywords,
    },
    update: {},
  })

  const hymn = await prisma.hmHymn.create({
    data: {
      userId,
      title: video.title,
      videoId: vid,
      slug: generateSlug(video.title),
      approvalStatusId: submittedStatus.id,
      channelId: channel.id,
      singer: singer?.trim() || null,
      lyrics: lyrics?.trim() || null,
      description: description?.trim() || null,
      publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
      thumbnailDefault: video.thumbnailDefault,
      thumbnailMedium: video.thumbnailMedium,
      thumbnailHigh: video.thumbnailHigh,
      thumbnailStandard: video.thumbnailStandard,
      thumbnailMaxres: video.thumbnailMaxres,
    },
  })

  await Promise.all([
    categoryIds?.length
      ? prisma.hmCategoryHymn.createMany({
          data: categoryIds.map((cid: number) => ({ categoryId: cid, hymnId: hymn.id })),
        })
      : Promise.resolve(),
    subCategoryIds?.length
      ? prisma.hmHymnSubCategory.createMany({
          data: subCategoryIds.map((sid: number) => ({ subCategoryId: sid, hymnId: hymn.id })),
        })
      : Promise.resolve(),
    languageIds?.length
      ? prisma.hmHymnLanguage.createMany({
          data: languageIds.map((lid: number) => ({ languageId: lid, hymnId: hymn.id })),
        })
      : Promise.resolve(),
  ])

  return NextResponse.json({ success: true, hymn }, { status: 201 })
}
