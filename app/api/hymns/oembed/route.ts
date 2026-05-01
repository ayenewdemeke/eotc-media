import { NextRequest, NextResponse } from 'next/server'
import { extractVideoId, fetchYoutubeVideo, fetchYoutubeChannel } from '@/lib/youtube'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  const videoId = extractVideoId(url)
  if (!videoId) return NextResponse.json({ error: 'Could not extract video ID' }, { status: 400 })

  try {
    const video = await fetchYoutubeVideo(videoId)
    const channel = await fetchYoutubeChannel(video.channelId)

    return NextResponse.json({
      videoId,
      title: video.title,
      publishedAt: video.publishedAt,
      channelId: video.channelId,
      channelTitle: channel.title,
      channelHandle: channel.handle,
      channelDescription: channel.description,
      channelThumbnailDefault: channel.thumbnailDefault,
      channelThumbnailMedium: channel.thumbnailMedium,
      channelThumbnailHigh: channel.thumbnailHigh,
      channelCoverImage: channel.coverImage,
      channelCountry: channel.country,
      channelKeywords: channel.keywords,
      channelPublishedAt: channel.publishedAt,
      thumbnailDefault: video.thumbnailDefault,
      thumbnailMedium: video.thumbnailMedium,
      thumbnailHigh: video.thumbnailHigh,
      thumbnailStandard: video.thumbnailStandard,
      thumbnailMaxres: video.thumbnailMaxres,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch YouTube data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
