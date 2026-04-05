import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { fetchTranscript, formatLyricsWithGemini } from '@/lib/generate-lyrics'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // slug may be a numeric id (from LyricsPanel) or a real slug
  const hymnId = parseInt(slug)
  const hymn = isNaN(hymnId)
    ? await prisma.hmHymn.findUnique({ where: { slug }, select: { id: true, videoId: true } })
    : await prisma.hmHymn.findUnique({ where: { id: hymnId }, select: { id: true, videoId: true } })

  if (!hymn) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rawText = await fetchTranscript(hymn.videoId)
  if (!rawText) return NextResponse.json({ error: 'No subtitles found for this video' }, { status: 422 })

  const lyrics = await formatLyricsWithGemini(rawText)

  // Save to dedicated aiLyrics column for admin review
  await prisma.hmHymn.update({
    where: { id: hymn.id },
    data: { aiLyrics: lyrics },
  })

  return NextResponse.json({ lyrics })
}
