import { NextRequest, NextResponse } from 'next/server'

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      // Handle /embed/ID and /shorts/ID
      const match = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/)
      if (match) return match[2]
    }
  } catch {}
  return null
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  const videoId = extractVideoId(url)
  if (!videoId) return NextResponse.json({ error: 'Could not extract video ID' }, { status: 400 })

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const res = await fetch(oembedUrl)
    if (!res.ok) return NextResponse.json({ error: 'YouTube oEmbed failed' }, { status: 400 })
    const data = await res.json()

    return NextResponse.json({
      videoId,
      title: data.title ?? '',
      thumbnailDefault: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      thumbnailMedium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      thumbnailHigh: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      thumbnailStandard: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      thumbnailMaxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch YouTube data' }, { status: 500 })
  }
}
