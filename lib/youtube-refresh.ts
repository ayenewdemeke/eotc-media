import { fetchYoutubeVideosBatch } from './youtube'

// Shared logic for the hymn/sermon "refresh from YouTube" admin actions.
// Model-agnostic: routes pass plain records in and apply the resulting updates
// with their own Prisma model.

export interface RefreshableRecord {
  id: number
  videoId: string
  title: string
  publishedAt: Date | null
  thumbnailDefault: string
  thumbnailMedium: string
  thumbnailHigh: string
  thumbnailStandard: string | null
  thumbnailMaxres: string | null
}

export interface RefreshPlan {
  updates: { id: number; data: Record<string, unknown> }[]
  unavailable: { id: number; title: string; videoId: string }[]
}

/**
 * Fetch current YouTube data for every record and compute the minimal diff.
 * Only fields that actually changed end up in `updates` (so unchanged rows are
 * never written), and any videoId missing from YouTube goes to `unavailable`.
 */
export async function planYoutubeRefresh(records: RefreshableRecord[]): Promise<RefreshPlan> {
  const map = await fetchYoutubeVideosBatch(records.map(r => r.videoId))
  const updates: RefreshPlan['updates'] = []
  const unavailable: RefreshPlan['unavailable'] = []

  for (const r of records) {
    const v = map.get(r.videoId)
    if (!v) {
      unavailable.push({ id: r.id, title: r.title, videoId: r.videoId })
      continue
    }

    const data: Record<string, unknown> = {}
    if (v.title && v.title !== r.title) data.title = v.title
    if (v.publishedAt) {
      const np = new Date(v.publishedAt)
      if (!r.publishedAt || np.getTime() !== r.publishedAt.getTime()) data.publishedAt = np
    }
    if (v.thumbnailDefault && v.thumbnailDefault !== r.thumbnailDefault) data.thumbnailDefault = v.thumbnailDefault
    if (v.thumbnailMedium && v.thumbnailMedium !== r.thumbnailMedium) data.thumbnailMedium = v.thumbnailMedium
    if (v.thumbnailHigh && v.thumbnailHigh !== r.thumbnailHigh) data.thumbnailHigh = v.thumbnailHigh
    // Only overwrite the optional thumbs when YouTube actually returns one, so we
    // never blank out an existing image.
    if (v.thumbnailStandard && v.thumbnailStandard !== r.thumbnailStandard) data.thumbnailStandard = v.thumbnailStandard
    if (v.thumbnailMaxres && v.thumbnailMaxres !== r.thumbnailMaxres) data.thumbnailMaxres = v.thumbnailMaxres

    if (Object.keys(data).length) updates.push({ id: r.id, data })
  }

  return { updates, unavailable }
}

/**
 * Re-check the given videoIds against YouTube and return the ids that are STILL
 * missing. Used right before deletion so a video that came back (or a transient
 * API blip) is never deleted.
 */
export async function confirmStillUnavailable(
  records: { id: number; videoId: string }[]
): Promise<number[]> {
  const map = await fetchYoutubeVideosBatch(records.map(r => r.videoId))
  return records.filter(r => !map.has(r.videoId)).map(r => r.id)
}

/** Apply updates with bounded concurrency to avoid a DB connection spike. */
export async function applyUpdatesChunked(
  updates: { id: number; data: Record<string, unknown> }[],
  updateOne: (id: number, data: Record<string, unknown>) => Promise<unknown>,
  chunkSize = 10
): Promise<void> {
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize)
    await Promise.all(chunk.map(u => updateOne(u.id, u.data)))
  }
}
