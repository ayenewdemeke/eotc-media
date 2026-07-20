// Ordered thumbnail candidate lists for YouTube-backed records (hymns/sermons).
// YouTube only generates maxres/standard for some videos, and any stored URL can
// 404 later — so consumers render candidates with <FallbackImage>, which steps
// to the next entry on error. The chain ends with hqdefault.jpg, which YouTube
// serves for every live video, so a working image is always reachable.

interface ThumbFields {
  videoId: string
  thumbnailDefault: string | null
  thumbnailMedium: string | null
  thumbnailHigh: string | null
  thumbnailStandard?: string | null
  thumbnailMaxres?: string | null
}

function dedupe(urls: (string | null | undefined)[]): string[] {
  return [...new Set(urls.filter((u): u is string => !!u))]
}

/** Best-quality-first chain — for detail pages / large hero players. */
export function bestThumbCandidates(t: ThumbFields): string[] {
  return dedupe([
    t.thumbnailMaxres,
    t.thumbnailStandard,
    t.thumbnailHigh,
    t.thumbnailMedium,
    t.thumbnailDefault,
    `https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`,
  ])
}

/** Card/list chain — medium first (right size for grids), stepping up/down as available. */
export function cardThumbCandidates(t: ThumbFields): string[] {
  return dedupe([
    t.thumbnailMedium,
    t.thumbnailHigh,
    t.thumbnailDefault,
    `https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg`,
  ])
}
