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

  if (view === 'favorites' && userId) {
    where.favorites = { some: { userId } }
  } else if (view === 'my-hymns' && userId) {
    where.userId = userId
  } else if (view === 'collection' && collectionId) {
    where.collections = { some: { collectionId } }
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

  const orderBy =
    sort === 'date-desc'  ? { publishedAt: 'desc' as const } :
    sort === 'date-asc'   ? { publishedAt: 'asc' as const } :
    sort === 'clicks-asc' ? { clicksCount: 'asc' as const } :
                            { clicksCount: 'desc' as const }  // default: most clicked

  let raws: Awaited<ReturnType<typeof prisma.hmHymn.findMany>> = []
  let total = 0

  try {
    ;[raws, total] = await Promise.all([
      prisma.hmHymn.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          categories: { include: { category: true } },
          subCategories: { include: { subCategory: true } },
          languages: { include: { language: true } },
          singers: { include: { singer: true } },
          channel: true,
          ...(view === 'my-hymns' ? { approvalStatus: true } : {}),
        },
      }),
      prisma.hmHymn.count({ where }),
    ])
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

export async function getRelatedHymns(
  hymnId: number,
  categoryIds: number[],
  limit = 8
): Promise<HmHymn[]> {
  const where: Record<string, unknown> = { NOT: { id: hymnId } }
  if (categoryIds.length > 0) {
    where.categories = { some: { categoryId: { in: categoryIds } } }
  }

  const raws = await prisma.hmHymn.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      categories: { include: { category: true } },
      singers: { include: { singer: true } },
      channel: true,
    },
  })

  return raws.map(mapHymn)
}
