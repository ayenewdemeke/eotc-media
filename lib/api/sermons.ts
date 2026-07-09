import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { SmSermon, SmCategory, SmSubCategory, SmLanguage, SmPreacher } from '@/types/models/sermon'

const PAGE_SIZE = 24

function mapSermon(raw: {
  id: number
  slug: string
  videoId: string
  title: string
  preacher: string | null
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
  preachers?: { preacher: { id: number; name: string } }[]
  channel?: { id: number; name: string; slug: string | null; handle: string; description?: string | null; thumbnailDefault?: string | null; thumbnailMedium?: string | null; thumbnailHigh?: string | null; coverImage?: string | null; publishedAt?: Date | null } | null
  approvalStatus?: { id: number; name: string } | null
}): SmSermon {
  return {
    id: raw.id,
    slug: raw.slug,
    videoId: raw.videoId,
    title: raw.title,
    preacher: raw.preacher,
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
    preachers: raw.preachers?.map(p => p.preacher) ?? [],
    channel: raw.channel ? {
      id: raw.channel.id,
      name: raw.channel.name,
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

// Filter data is identical for every user and changes only via admin edits, so
// cache it across requests to avoid re-querying on every sermons page load.
export const getSermonsFilterData = unstable_cache(
  async (): Promise<{
  categories: SmCategory[]
  subCategories: SmSubCategory[]
  languages: SmLanguage[]
  preachers: SmPreacher[]
  categoriesByLanguage: Record<string, number[]>
}> => {
  const [categories, subCategories, languages, preachers, catLangRows] = await Promise.all([
    prisma.smCategory.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true } }),
    prisma.smSubCategory.findMany({ orderBy: { id: 'asc' } }),
    prisma.smLanguage.findMany({ orderBy: { id: 'asc' } }),
    prisma.smPreacher.findMany({ orderBy: { name: 'asc' } }),
    prisma.$queryRaw<{ category_id: number; language_id: number }[]>`
      SELECT DISTINCT sc.category_id, ls.language_id
      FROM sm_category_sermon sc
      INNER JOIN sm_language_sermon ls ON sc.sermon_id = ls.sermon_id
    `,
  ])
  const categoriesByLanguage: Record<string, number[]> = {}
  for (const { category_id, language_id } of catLangRows) {
    const key = String(language_id)
    if (!categoriesByLanguage[key]) categoriesByLanguage[key] = []
    if (!categoriesByLanguage[key].includes(category_id)) categoriesByLanguage[key].push(category_id)
  }
  return { categories, subCategories, languages, preachers, categoriesByLanguage }
  },
  ["sermons-filter-data"],
  { revalidate: 1800 }
)

export async function getSermons({
  page = 1,
  limit = PAGE_SIZE,
  categoryId,
  subCategoryId,
  languageId,
  preacherId,
  channelId,
  userId,
  search,
  view,
  sort,
  itemIds,
}: {
  page?: number
  limit?: number
  categoryId?: number
  subCategoryId?: number
  languageId?: number
  preacherId?: number
  channelId?: number
  userId?: number
  search?: string
  view?: string
  sort?: string
  itemIds?: number[]
} = {}): Promise<{ sermons: SmSermon[]; total: number }> {
  const where: Record<string, unknown> = {}

  if (itemIds && itemIds.length > 0) {
    where.id = { in: itemIds }
  }

  if (view === 'favorites' && userId) {
    where.favorites = { some: { userId } }
    where.approvalStatus = { name: 'Accepted' }
  } else if (view === 'my-sermons' && userId) {
    where.userId = userId
  } else {
    where.approvalStatus = { name: 'Accepted' }
  }

  if (categoryId) where.categories = { some: { categoryId } }
  if (subCategoryId) where.subCategories = { some: { subCategoryId } }
  if (languageId) where.languages = { some: { languageId } }
  if (preacherId) where.preachers = { some: { preacherId } }
  if (channelId) where.channelId = channelId
  if (search && search.trim().length > 0) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { preacher: { contains: search, mode: 'insensitive' } },
    ]
  }

  const orderBy =
    sort === 'date-desc'  ? { publishedAt: 'desc' as const } :
    sort === 'date-asc'   ? { publishedAt: 'asc' as const } :
    sort === 'clicks-asc' ? { clicksCount: 'asc' as const } :
                            { clicksCount: 'desc' as const }

  const [raws, total] = await Promise.all([
    prisma.smSermon.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        categories: { include: { category: true } },
        subCategories: { include: { subCategory: true } },
        languages: { include: { language: true } },
        preachers: { include: { preacher: true } },
        channel: true,
        ...(view === 'my-sermons' ? { approvalStatus: true } : {}),
      },
    }),
    prisma.smSermon.count({ where }),
  ])

  const sermons = raws.map(mapSermon)

  if (userId && sermons.length > 0) {
    const sermonIds = sermons.map(s => s.id)
    const favorites = await prisma.smFavorite.findMany({
      where: { userId, sermonId: { in: sermonIds } },
      select: { sermonId: true },
    })
    const favSet = new Set(favorites.map(f => f.sermonId))
    sermons.forEach(s => { s.isFavorited = favSet.has(s.id) })
  }

  return { sermons, total }
}

export async function getSermon(
  slug: string,
  userId?: number
): Promise<{ sermon: SmSermon; isFavorited: boolean } | null> {
  const safeSlug = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()
  let raw = await prisma.smSermon.findUnique({
    where: { slug: safeSlug },
    include: {
      categories: { include: { category: true } },
      languages: { include: { language: true } },
      preachers: { include: { preacher: true } },
      channel: true,
    },
  })
  if (!raw && safeSlug !== slug) {
    raw = await prisma.smSermon.findUnique({
      where: { slug },
      include: {
        categories: { include: { category: true } },
        languages: { include: { language: true } },
        preachers: { include: { preacher: true } },
        channel: true,
      },
    })
  }
  if (!raw) return null

  const sermon = mapSermon(raw)
  const isFavoritedResult = userId
    ? await prisma.smFavorite.findFirst({ where: { userId, sermonId: raw.id } })
    : null

  return { sermon, isFavorited: !!isFavoritedResult }
}

export async function getRelatedSermons(
  sermonId: number,
  categoryIds: number[],
  limit = 8
): Promise<SmSermon[]> {
  const where: Record<string, unknown> = {
    NOT: { id: sermonId },
    approvalStatus: { name: 'Accepted' },
  }
  if (categoryIds.length > 0) {
    where.categories = { some: { categoryId: { in: categoryIds } } }
  }
  const raws = await prisma.smSermon.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      categories: { include: { category: true } },
      preachers: { include: { preacher: true } },
      channel: true,
    },
  })
  return raws.map(mapSermon)
}
