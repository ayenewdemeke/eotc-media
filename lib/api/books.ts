import { prisma } from '@/lib/prisma'
import { CbBook } from '@/types/models/book'
import { sortLanguages } from '@/lib/language-order'

function mapBook(b: Record<string, unknown>): CbBook {
  return {
    id: b.id as number,
    slug: b.slug as string,
    name: b.name as string,
    author: b.author as string,
    description: b.description as string | null,
    image: b.image as string | null,
    file: b.file as string,
    userId: b.userId as number,
    approvalStatusId: b.approvalStatusId as number,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt as string,
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt as string,
    approvalStatus: (b.approvalStatus as { id: number; name: string } | undefined),
    languages: (b.languages as Array<{ language: { id: number; name: string } }> | undefined)?.map(l => l.language),
    categories: (b.categories as Array<{ category: { id: number; name: string } }> | undefined)?.map(c => c.category),
    subCategories: (b.subCategories as Array<{ subCategory: { id: number; name: string; categoryId: number } }> | undefined)?.map(s => s.subCategory),
    authors: (b.authors as Array<{ author: { id: number; name: string } }> | undefined)?.map(a => a.author),
    likesCount: (b.likes as unknown[])?.length ?? (b.likesCount as number | undefined),
    commentsCount: (b.comments as unknown[])?.length ?? (b.commentsCount as number | undefined),
  }
}

export async function getBooksFilterData() {
  const [languagesRaw, categories, subCategories] = await Promise.all([
    prisma.cbLanguage.findMany(),
    prisma.cbCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.cbSubCategory.findMany({ orderBy: { name: 'asc' } }),
  ])

  const languages = sortLanguages(languagesRaw)

  // Build categoriesByLanguage from a union of (a) existing book associations
  // and (b) the structural language assigned to a category. (a) keeps the
  // public filter working for categories that already have books; (b) surfaces
  // newly created categories the admin has assigned to a language even before
  // any book uses them.
  const rows = await prisma.$queryRaw<Array<{ category_id: number; language_id: number }>>`
    SELECT DISTINCT bc.category_id, bl.language_id
    FROM cb_book_category bc
    INNER JOIN cb_book_language bl ON bc.book_id = bl.book_id
  `
  const categoriesByLanguage: Record<string, number[]> = {}
  const add = (languageId: number, categoryId: number) => {
    const key = String(languageId)
    if (!categoriesByLanguage[key]) categoriesByLanguage[key] = []
    if (!categoriesByLanguage[key].includes(categoryId)) categoriesByLanguage[key].push(categoryId)
  }
  for (const row of rows) add(row.language_id, row.category_id)
  for (const cat of categories) if (cat.languageId) add(cat.languageId, cat.id)

  return { languages, categories, subCategories, categoriesByLanguage }
}

interface GetBooksParams {
  page?: number
  limit?: number
  languageId?: number
  categoryId?: number
  subCategoryId?: number
  sort?: string
  userId?: number
  view?: 'my-books' | 'all'
  approvalStatusName?: string
  search?: string
}

export async function getBooks(params: GetBooksParams = {}) {
  const {
    page = 1,
    limit = 24,
    languageId,
    categoryId,
    subCategoryId,
    sort,
    userId,
    view,
    approvalStatusName,
    search,
  } = params

  const skip = (page - 1) * limit

  // Approval status filter
  let approvalStatusId: number | undefined
  if (approvalStatusName) {
    const status = await prisma.cbApprovalStatus.findFirst({ where: { name: { contains: approvalStatusName, mode: 'insensitive' } } })
    approvalStatusId = status?.id
  }

  const where: Record<string, unknown> = {}
  if (approvalStatusId) {
    where.approvalStatusId = approvalStatusId
  } else if (view !== 'my-books') {
    where.approvalStatus = { name: 'Accepted' }
  }
  if (view === 'my-books' && userId) where.userId = userId
  if (languageId) where.languages = { some: { languageId } }
  if (categoryId) where.categories = { some: { categoryId } }
  if (subCategoryId) where.subCategories = { some: { subCategoryId } }
  if (search) where.name = { contains: search, mode: 'insensitive' }

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' as const }
    : sort === 'title' ? { name: 'asc' as const }
    : sort === 'popular' ? { likes: { _count: 'desc' as const } }
    : { createdAt: 'desc' as const }

  const [books, total] = await Promise.all([
    prisma.cbBook.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        approvalStatus: true,
        languages: { include: { language: true } },
        categories: { include: { category: true } },
        subCategories: { include: { subCategory: true } },
        authors: { include: { author: true } },
        likes: true,
        comments: true,
      },
    }),
    prisma.cbBook.count({ where }),
  ])

  return { books: books.map(b => mapBook(b as unknown as Record<string, unknown>)), total }
}

export async function getBook(slug: string, userId?: number) {
  const book = await prisma.cbBook.findUnique({
    where: { slug },
    include: {
      approvalStatus: true,
      languages: { include: { language: true } },
      categories: { include: { category: true } },
      subCategories: { include: { subCategory: true } },
      authors: { include: { author: true } },
      likes: true,
      comments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!book) return null

  const mapped = mapBook(book as unknown as Record<string, unknown>)
  const hasLiked = userId ? book.likes.some(l => l.userId === userId) : false
  return {
    ...mapped,
    hasLiked,
    likesCount: book.likes.length,
    commentsCount: book.comments.length,
    comments: book.comments.map(c => ({
      id: c.id,
      bookId: c.bookId,
      userId: c.userId,
      comment: c.comment,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
    })),
  }
}

// Books that share a category (or failing that, an author) with the given book.
// Used for the "Related books" section on a book's detail page.
export async function getRelatedBooks(book: CbBook, limit = 6): Promise<CbBook[]> {
  const categoryIds = book.categories?.map(c => c.id) ?? []
  const authorIds = book.authors?.map(a => a.id) ?? []

  const approved = await prisma.cbApprovalStatus.findFirst({ where: { name: 'Accepted' } })

  const orClauses: Record<string, unknown>[] = []
  if (categoryIds.length) orClauses.push({ categories: { some: { categoryId: { in: categoryIds } } } })
  if (authorIds.length) orClauses.push({ authors: { some: { authorId: { in: authorIds } } } })
  if (orClauses.length === 0) return []

  const related = await prisma.cbBook.findMany({
    where: {
      id: { not: book.id },
      ...(approved ? { approvalStatusId: approved.id } : {}),
      OR: orClauses,
    },
    take: limit,
    orderBy: { likes: { _count: 'desc' } },
    include: {
      languages: { include: { language: true } },
      likes: true,
    },
  })

  return related.map(b => mapBook(b as unknown as Record<string, unknown>))
}
