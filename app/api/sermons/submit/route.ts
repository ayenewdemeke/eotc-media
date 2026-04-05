import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title.trim().replace(/\s+/g, '-').replace(/[^\w\u1200-\u137F-]/g, '').slice(0, 120) + '-' + Date.now().toString(36)
}

function parseVideoId(input: string): string {
  const s = input.trim()
  try {
    const url = new URL(s)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('?')[0]
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v') ?? s
  } catch { /* not a URL */ }
  return s
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { videoUrl, preacher, description, categoryIds, subCategoryIds, languageIds, preacherIds } = body

  if (!videoUrl?.trim()) {
    return NextResponse.json({ error: 'Video URL/ID is required' }, { status: 400 })
  }

  const vid = parseVideoId(videoUrl)

  const [pendingStatus, defaultChannel] = await Promise.all([
    prisma.smApprovalStatus.findFirst({ where: { name: 'Submitted' } }),
    prisma.smChannel.findFirst({ orderBy: { id: 'asc' } }),
  ])

  if (!pendingStatus || !defaultChannel) {
    return NextResponse.json({ error: 'System configuration incomplete' }, { status: 500 })
  }

  let title = vid
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`)
    if (oembedRes.ok) {
      const data = await oembedRes.json()
      if (data.title) title = data.title
    }
  } catch { /* use video ID as fallback */ }

  const sermon = await prisma.smSermon.create({
    data: {
      userId: parseInt(session.user.id),
      title,
      videoId: vid,
      slug: generateSlug(title),
      approvalStatusId: pendingStatus.id,
      channelId: defaultChannel.id,
      preacher: preacher?.trim() || null,
      description: description?.trim() || null,
      thumbnailDefault: `https://img.youtube.com/vi/${vid}/default.jpg`,
      thumbnailMedium: `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
      thumbnailHigh: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      thumbnailStandard: `https://img.youtube.com/vi/${vid}/sddefault.jpg`,
      thumbnailMaxres: `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`,
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
