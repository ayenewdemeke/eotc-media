import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

function generateSlug(title: string): string {
  return title.trim().replace(/\s+/g, '-').replace(/[^\w\u1200-\u137F-]/g, '').slice(0, 120) + '-' + Date.now().toString(36)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { videoId, singer, lyrics, description, categoryIds, subCategoryIds, languageIds } = body

  if (!videoId?.trim()) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
  }

  const vid = videoId.trim()

  const [pendingStatus, defaultChannel] = await Promise.all([
    prisma.hmApprovalStatus.findFirst({ where: { name: { contains: 'Pending', mode: 'insensitive' } } }),
    prisma.hmChannel.findFirst({ orderBy: { id: 'asc' } }),
  ])

  if (!pendingStatus || !defaultChannel) {
    return NextResponse.json({ error: 'System configuration incomplete' }, { status: 500 })
  }

  // Try to fetch title from YouTube oEmbed (best effort)
  let title = vid
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`)
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json()
      if (oembedData.title) title = oembedData.title
    }
  } catch { /* use video ID as fallback title */ }

  const hymn = await prisma.hmHymn.create({
    data: {
      userId: parseInt(session.user.id),
      title,
      videoId: vid,
      slug: generateSlug(title),
      approvalStatusId: pendingStatus.id,
      channelId: defaultChannel.id,
      singer: singer?.trim() || null,
      lyrics: lyrics?.trim() || null,
      description: description?.trim() || null,
      thumbnailDefault: `https://img.youtube.com/vi/${vid}/default.jpg`,
      thumbnailMedium: `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
      thumbnailHigh: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
      thumbnailStandard: `https://img.youtube.com/vi/${vid}/sddefault.jpg`,
      thumbnailMaxres: `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`,
    },
  })

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

  return NextResponse.json({ success: true, hymn }, { status: 201 })
}
