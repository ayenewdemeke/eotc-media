import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { extractVideoId, fetchYoutubeVideo, fetchYoutubeChannel } from '@/lib/youtube'

function generateSlug(title: string): string {
  return title.trim().replace(/\s+/g, '-').replace(/[^\wሀ-፿-]/g, '').slice(0, 120) + '-' + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { videoUrl, preacher, description, categoryIds, subCategoryIds, languageIds, preacherIds } = body

  if (!videoUrl?.trim()) {
    return NextResponse.json({ error: 'Video URL/ID is required' }, { status: 400 })
  }

  const vid = extractVideoId(videoUrl.trim()) ?? videoUrl.trim()

  const submittedStatus = await prisma.smApprovalStatus.findFirst({ where: { name: 'Submitted' } })
  if (!submittedStatus) {
    return NextResponse.json({ error: 'System configuration incomplete' }, { status: 500 })
  }

  // Fetch video + channel metadata from YouTube Data API
  let video: Awaited<ReturnType<typeof fetchYoutubeVideo>>
  try {
    video = await fetchYoutubeVideo(vid)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'YouTube API error'
    return NextResponse.json({ error: `Could not fetch video info: ${msg}` }, { status: 422 })
  }

  let ytChannel: Awaited<ReturnType<typeof fetchYoutubeChannel>>
  try {
    ytChannel = await fetchYoutubeChannel(video.channelId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'YouTube API error'
    return NextResponse.json({ error: `Could not fetch channel info: ${msg}` }, { status: 422 })
  }

  // Upsert the channel so it's created automatically if not yet in DB
  const channel = await prisma.smChannel.upsert({
    where: { ytChannelId: ytChannel.ytChannelId },
    create: {
      ytChannelId: ytChannel.ytChannelId,
      name: ytChannel.title,
      slug: generateSlug(ytChannel.title),
      description: ytChannel.description,
      handle: ytChannel.handle,
      publishedAt: ytChannel.publishedAt ? new Date(ytChannel.publishedAt) : null,
      thumbnailDefault: ytChannel.thumbnailDefault,
      thumbnailMedium: ytChannel.thumbnailMedium,
      thumbnailHigh: ytChannel.thumbnailHigh,
      coverImage: ytChannel.coverImage,
      country: ytChannel.country,
    },
    update: {},
  })

  const sermon = await prisma.smSermon.create({
    data: {
      userId: parseInt(session.user.id),
      title: video.title,
      videoId: vid,
      slug: generateSlug(video.title),
      approvalStatusId: submittedStatus.id,
      channelId: channel.id,
      publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
      preacher: preacher?.trim() || null,
      description: description?.trim() || null,
      thumbnailDefault: video.thumbnailDefault,
      thumbnailMedium: video.thumbnailMedium,
      thumbnailHigh: video.thumbnailHigh,
      thumbnailStandard: video.thumbnailStandard,
      thumbnailMaxres: video.thumbnailMaxres,
      updatedAt: new Date(),
    },
  })

  if (categoryIds?.length) {
    await prisma.smCategorySermon.createMany({
      data: categoryIds.map((cid: number) => ({ categoryId: cid, sermonId: sermon.id })),
    })
  }
  if (subCategoryIds?.length) {
    await prisma.smSermonSubCategory.createMany({
      data: subCategoryIds.map((sid: number) => ({ subCategoryId: sid, sermonId: sermon.id })),
    })
  }
  if (languageIds?.length) {
    await prisma.smLanguageSermon.createMany({
      data: languageIds.map((lid: number) => ({ languageId: lid, sermonId: sermon.id })),
    })
  }
  if (preacherIds?.length) {
    await prisma.smPreacherSermon.createMany({
      data: preacherIds.map((pid: number) => ({ preacherId: pid, sermonId: sermon.id })),
    })
  }

  return NextResponse.json({ success: true, sermon }, { status: 201 })
}
