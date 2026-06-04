import { prisma } from '@/lib/prisma'
import { HmHymn, HmCategory, HmSubCategory, HmLanguage, HmSinger, HmComment } from '@/types/models/hymn'

const PAGE_SIZE = 24

function mapHymn(raw: {
  id: number
  slug: string
  videoId: string
  title: string
  singer: string | null
  lyrics: string | null
  lyricsSuggestion: string | null
  aiLyrics: string | null
  description: string | null
  thumbnailDefault: string
  thumbnailMedium: string
  thumbnailHigh: string
  thumbnailStandard: string | null
  thumbnailMaxres: string | null
  clicksCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  categories?: { category: { id: number; name: string } }[]
  subCategories?: { subCategory: { id: number; name: string; categoryId: number } }[]
  languages?: { language: { id: number; name: string } }[]
  singers?: { singer: { id: number; name: string } }[]
  channel?: { id: number; title: string; slug: string; handle: string; description?: string | null; thumbnailDefault?: string | null; thumbnailMedium?: string | null; thumbnailHigh?: string | null; coverImage?: string | null; publishedAt?: Date | null } | null
  approvalStatus?: { id: number; name: string } | null
}): HmHymn {
  return {
    id: raw.id,
    slug: raw.slug,
    videoId: raw.videoId,
    title: raw.title,
    singer: raw.singer,
    lyrics: raw.lyrics,
    lyricsSuggestion: raw.lyricsSuggestion,
    aiLyrics: raw.aiLyrics,
    description: raw.description,
    thumbnailDefault: raw.thumbnailDefault,
    thumbnailMedium: raw.thumbnailMedium,
    thumbnailHigh: raw.thumbnailHigh,
    thumbnailStandard: raw.thumbnailStandard,
    thumbnailMaxres: raw.thumbnailMaxres,
    clicksCount: raw.clicksCount,
    publishedAt: raw.publishedAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    categories: raw.categories?.map(c => c.category) ?? [],
    subCategories: raw.subCategories?.map(sc => sc.subCategory) ?? [],
    languages: raw.languages?.map(l => l.language) ?? [],
    singers: raw.singers?.map(s => s.singer) ?? [],
    channel: raw.channel ? {
      id: raw.channel.id,
      title: raw.channel.title,
      slug: raw.channel.slug,
      handle: raw.channel.handle,
      description: raw.channel.description,
      thumbnailDefault: raw.channel.thumbnailDefault,
      thumbnailMedium: raw.channel.thumbnailMedium,
      thumbnailHigh: raw.channel.thumbnailHigh,
      coverImage: raw.channel.coverImage,
      publishedAt: raw.channel.publishedAt,
    } : undefined,
    approvalStatus: raw.approvalStatus ?? undefined,
  }
}

export async function getHymnsFilterData(): Promise<{
  categories: HmCategory[]
  subCategories: HmSubCategory[]
  languages: HmLanguage[]
  singers: HmSinger[]
  singersByLanguage: Record<string, number[]>
}> {
  const [categories, subCategories, languages, singers, singerLangRows] = await Promise.all([
    prisma.hmCategory.findMany({ orderBy: { id: 'asc' } }),
    prisma.hmSubCategory.findMany({ orderBy: { id: 'asc' } }),
    prisma.hmLanguage.findMany({ orderBy: { id: 'asc' } }),
    prisma.hmSinger.findMany({ orderBy: { name: 'asc' } }),
    prisma.$queryRaw<{ singer_id: number; language_id: number }[]>`
      SELECT DISTINCT hs.singer_id, hl.language_id
      FROM hm_hymn_singer hs
      INNER JOIN hm_hymn_language hl ON hs.hymn_id = hl.hymn_id
    `,
  ])
  const singersByLanguage: Record<string, number[]> = {}
  for (const { singer_id, language_id } of singerLangRows) {
    const key = String(language_id)
    if (!singersByLanguage[key]) singersByLanguage[key] = []
    singersByLanguage[key].push(singer_id)
  }
  return { categories, subCategories, languages, singers, singersByLanguage }
}

export async function getHymns({
  page = 1,
  limit = PAGE_SIZE,
  categoryId,
  subCategoryId,
  languageId,
  singerId,
  channelId,
  userId,
  search,
  view,
  sort,
  itemIds,
  collectionId,
}: {
  page?: number
  limit?: number
  categoryId?: number
  subCategoryId?: number
  languageId?: number
  singerId?: number
  channelId?: number
  userId?: number
  search?: string
  view?: string
  sort?: string
  itemIds?: number[]
  collectionId?: number
} = {}): Promise<{ hymns: HmHymn[]; total: number }> {
  const where: Record<string, unknown> = {}

  if (itemIds && itemIds.length > 0) {
    where.id = { in: itemIds }
  }

  // For collection view: resolve hymn IDs directly via the join table
  // rather than relying on a Prisma relation filter, which requires
  // the generated client to be up-to-date with the new relation.
  if (view === 'collection' && collectionId && !(itemIds && itemIds.length > 0)) {
    const entries = await prisma.hmCollectionHymn.findMany({
      where: { collectionId },
      select: { hymnId: true },
    })
    if (entries.length === 0) return { hymns: [], total: 0 }
    where.id = { in: entries.map(e => e.hymnId) }
  } else if (view === 'favorites' && userId) {
    where.favorites = { some: { userId } }
  } else if (view === 'my-hymns' && userId) {
    where.userId = userId
  }

  if (categoryId) {
    where.categories = { some: { categoryId } }
  }
  if (subCategoryId) {
    where.subCategories = { some: { subCategoryId } }
  }
  if (languageId) {
    where.languages = { some: { languageId } }
  }
  if (singerId) {
    where.singers = { some: { singerId } }
  }
  if (channelId) {
    where.channelId = channelId
  }
  if (search && search.trim().length > 0) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { singer: { contains: search, mode: 'insensitive' } },
    ]
  }

  const hymnIncludeBase = {
    categories: { include: { category: true } },
    subCategories: { include: { subCategory: true } },
    languages: { include: { language: true } },
    singers: { include: { singer: true } },
    channel: true,
    ...(view === 'my-hymns' ? { approvalStatus: true } : {}),
  } as const

  let raws: Awaited<ReturnType<typeof prisma.hmHymn.findMany>> = []
  let total = 0

  try {
    if (!sort || sort === 'trending') {
      // Compute click-velocity in memory: clicks / age-in-days
      const candidates = await prisma.hmHymn.findMany({
        where,
        select: { id: true, clicksCount: true, publishedAt: true, createdAt: true },
      })
      const now = Date.now()
      const scored = candidates
        .map(h => {
          const ref = h.publishedAt ?? h.createdAt
          const days = Math.max(1, (now - ref.getTime()) / 86_400_000)
          return { id: h.id, score: h.clicksCount / days }
        })
        .sort((a, b) => b.score - a.score)
      total = scored.length
      const pageIds = scored.slice((page - 1) * limit, page * limit).map(s => s.id)
      if (pageIds.length > 0) {
        const idOrder = new Map(pageIds.map((id, idx) => [id, idx]))
        const fetched = await prisma.hmHymn.findMany({
          where: { id: { in: pageIds } },
          include: hymnIncludeBase,
        })
        raws = fetched.sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0))
      }
    } else {
      const orderBy =
        sort === 'date-desc'  ? { publishedAt: 'desc' as const } :
        sort === 'date-asc'   ? { publishedAt: 'asc' as const } :
        sort === 'clicks-asc' ? { clicksCount: 'asc' as const } :
                                { clicksCount: 'desc' as const }
      ;[raws, total] = await Promise.all([
        prisma.hmHymn.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: hymnIncludeBase,
        }),
        prisma.hmHymn.count({ where }),
      ])
    }
  } catch {
    return { hymns: [], total: 0 }
  }

  const hymns = raws.map(mapHymn)

  if (userId && hymns.length > 0) {
    const hymnIds = hymns.map(h => h.id)
    const favorites = await prisma.hmFavorite.findMany({
      where: { userId, hymnId: { in: hymnIds } },
      select: { hymnId: true },
    })
    const favSet = new Set(favorites.map(f => f.hymnId))
    hymns.forEach(h => { h.isFavorited = favSet.has(h.id) })
  }

  return { hymns, total }
}

export async function getHymn(
  slug: string,
  userId?: number
): Promise<{
  hymn: HmHymn
  isFavorited: boolean
  comments: HmComment[]
} | null> {
  const safeSlug = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()
  let raw = await prisma.hmHymn.findUnique({
    where: { slug: safeSlug },
    include: {
      categories: { include: { category: true } },
      languages: { include: { language: true } },
      singers: { include: { singer: true } },
      channel: true,
    },
  })
  // fallback: try original slug if safe decode produced a different value
  if (!raw && safeSlug !== slug) {
    raw = await prisma.hmHymn.findUnique({
      where: { slug },
      include: {
        categories: { include: { category: true } },
        languages: { include: { language: true } },
        singers: { include: { singer: true } },
        channel: true,
      },
    })
  }

  if (!raw) return null

  const hymn = mapHymn(raw)

  const [isFavoritedResult, commentsRaw] = await Promise.all([
    userId
      ? prisma.hmFavorite.findFirst({ where: { userId, hymnId: raw.id } })
      : Promise.resolve(null),
    prisma.hmComment.findMany({
      where: { hymnId: raw.id },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const comments: HmComment[] = commentsRaw.map(c => ({
    id: c.id,
    userId: c.userId,
    hymnId: c.hymnId,
    comment: c.comment,
    createdAt: c.createdAt,
    user: c.user ?? undefined,
  }))

  return {
    hymn,
    isFavorited: !!isFavoritedResult,
    comments,
  }
}

function weightedSample<T>(items: { item: T; score: number }[], n: number): T[] {
  if (items.length <= n) return items.map(x => x.item)
  const pool = [...items]
  const result: T[] = []
  for (let i = 0; i < n && pool.length > 0; i++) {
    const total = pool.reduce((s, x) => s + Math.max(0, x.score) + 0.5, 0)
    let r = Math.random() * total
    let chosen = pool.length - 1
    for (let j = 0; j < pool.length; j++) {
      r -= Math.max(0, pool[j].score) + 0.5
      if (r <= 0) { chosen = j; break }
    }
    result.push(pool[chosen].item)
    pool.splice(chosen, 1)
  }
  return result
}

export async function getRelatedHymns(
  ctx: {
    hymnId: number
    categoryIds: number[]
    subCategoryIds: number[]
    languageIds: number[]
    channelId?: number
    singerIds: number[]
    userId?: number
  },
  limit = 10
): Promise<HmHymn[]> {
  const { hymnId, categoryIds, subCategoryIds, languageIds, channelId, singerIds, userId } = ctx

  const exclude = { id: { not: hymnId } }
  const hymnInclude = {
    categories: { include: { category: true } },
    subCategories: { include: { subCategory: true } },
    languages: { include: { language: true } },
    singers: { include: { singer: true } },
    channel: true,
  } as const

  const hasContentSignals = categoryIds.length > 0 || subCategoryIds.length > 0

  // Fetch candidate pools and user affinity in parallel
  const [contentPool, popularPool, userFavorites] = await Promise.all([
    // Hymns sharing a category or subcategory with the current hymn
    hasContentSignals
      ? prisma.hmHymn.findMany({
          where: {
            ...exclude,
            OR: [
              ...(categoryIds.length > 0
                ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
                : []),
              ...(subCategoryIds.length > 0
                ? [{ subCategories: { some: { subCategoryId: { in: subCategoryIds } } } }]
                : []),
            ],
          },
          take: 80,
          orderBy: { clicksCount: 'desc' },
          include: hymnInclude,
        })
      : Promise.resolve([] as Awaited<ReturnType<typeof prisma.hmHymn.findMany<{ include: typeof hymnInclude }>>>),

    // Top-clicked hymns for popularity/diversity fill
    prisma.hmHymn.findMany({
      where: exclude,
      take: 40,
      orderBy: { clicksCount: 'desc' },
      include: hymnInclude,
    }),

    // User taste from recent favorites (personalisation)
    userId
      ? prisma.hmFavorite.findMany({
          where: { userId },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            hymn: {
              select: {
                channelId: true,
                categories: { select: { categoryId: true } },
                subCategories: { select: { subCategoryId: true } },
                languages: { select: { languageId: true } },
              },
            },
          },
        })
      : Promise.resolve([] as { hymn: { channelId: number | null; categories: { categoryId: number }[]; subCategories: { subCategoryId: number }[]; languages: { languageId: number }[] } }[]),
  ])

  // Build user taste profile from their favorited hymns
  const userCatIds = new Set<number>()
  const userSubCatIds = new Set<number>()
  const userLangIds = new Set<number>()
  const userChannelIds = new Set<number>()
  for (const fav of userFavorites) {
    fav.hymn.categories.forEach(c => userCatIds.add(c.categoryId))
    fav.hymn.subCategories.forEach(sc => userSubCatIds.add(sc.subCategoryId))
    fav.hymn.languages.forEach(l => userLangIds.add(l.languageId))
    if (fav.hymn.channelId) userChannelIds.add(fav.hymn.channelId)
  }

  // Merge pools, content candidates first (they're higher relevance)
  const seen = new Set<number>()
  const pool: typeof popularPool = []
  for (const h of [...contentPool, ...popularPool]) {
    if (!seen.has(h.id)) { seen.add(h.id); pool.push(h) }
  }

  // Reference sets from the current hymn
  const curCatSet = new Set(categoryIds)
  const curSubCatSet = new Set(subCategoryIds)
  const curLangSet = new Set(languageIds)
  const curSingerSet = new Set(singerIds)

  const scored = pool.map(h => {
    let score = 0

    // Content similarity to current hymn
    score += h.categories.filter(c => curCatSet.has(c.categoryId)).length * 4
    score += h.subCategories.filter(sc => curSubCatSet.has(sc.subCategoryId)).length * 3
    score += h.languages.filter(l => curLangSet.has(l.languageId)).length * 2
    score += h.singers.filter(s => curSingerSet.has(s.singerId)).length * 2
    if (channelId !== undefined && h.channelId === channelId) score += 1

    // Popularity — log-scaled so viral hymns don't dominate
    score += Math.log(h.clicksCount + 1) * 0.5

    // Personalisation — affinity with the user's taste profile
    if (userId) {
      score += h.categories.filter(c => userCatIds.has(c.categoryId)).length * 1.5
      score += h.subCategories.filter(sc => userSubCatIds.has(sc.subCategoryId)).length * 1.5
      score += h.languages.filter(l => userLangIds.has(l.languageId)).length * 1
      if (h.channelId && userChannelIds.has(h.channelId)) score += 0.5
    }

    // Slight recency tiebreaker (max +0.3 for a brand-new hymn, fades over a year)
    const ageInDays = (Date.now() - new Date(h.createdAt).getTime()) / 86_400_000
    score += Math.max(0, 1 - ageInDays / 365) * 0.3

    return { hymn: h, score }
  })

  const sampled = weightedSample(scored.map(s => ({ item: s.hymn, score: s.score })), limit)
  return sampled.map(mapHymn)
}
