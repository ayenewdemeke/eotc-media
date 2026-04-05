import { prisma } from '@/lib/prisma'
import {
  QzQuestion, QzCategory, QzSubCategory, QzLanguage,
  QzDifficulty, QzQuestionType, QzApprovalStatus, QzChoice,
} from '@/types/models/quiz'

const PAGE_SIZE = 24

function mapQuestion(raw: {
  id: number
  userId: number
  approvalStatusId: number
  typeId: number
  difficultyId: number | null
  questionText: string
  createdAt: Date
  updatedAt: Date
  approvalStatus?: { id: number; name: string } | null
  type?: { id: number; name: string } | null
  difficulty?: { id: number; name: string } | null
  choices?: { id: number; questionId: number; choiceText: string; isCorrect: boolean }[]
  languages?: { language: { id: number; name: string } }[]
  categories?: { category: { id: number; name: string } }[]
  subCategories?: { subCategory: { id: number; name: string; categoryId: number } }[]
  user?: { id: number; name: string | null } | null
}): QzQuestion {
  return {
    id: raw.id,
    userId: raw.userId,
    approvalStatusId: raw.approvalStatusId,
    typeId: raw.typeId,
    difficultyId: raw.difficultyId,
    questionText: raw.questionText,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    approvalStatus: raw.approvalStatus ?? undefined,
    type: raw.type ?? undefined,
    difficulty: raw.difficulty ?? undefined,
    choices: raw.choices ?? [],
    languages: raw.languages?.map(l => l.language) ?? [],
    categories: raw.categories?.map(c => c.category) ?? [],
    subCategories: raw.subCategories?.map(sc => sc.subCategory) ?? [],
    user: raw.user ?? undefined,
  }
}

export async function getQuestionsFilterData(): Promise<{
  categories: QzCategory[]
  subCategories: QzSubCategory[]
  languages: QzLanguage[]
  difficulties: QzDifficulty[]
}> {
  const [categories, subCategories, languages, difficulties] = await Promise.all([
    prisma.qzCategory.findMany({ orderBy: { id: 'asc' }, select: { id: true, name: true, languageId: true } }),
    prisma.qzSubCategory.findMany({ orderBy: { id: 'asc' } }),
    prisma.qzLanguage.findMany({ orderBy: { id: 'asc' } }),
    prisma.qzDifficulty.findMany({ orderBy: { id: 'asc' } }),
  ])
  return { categories, subCategories, languages, difficulties }
}

export async function getQuestions({
  page = 1,
  limit = PAGE_SIZE,
  categoryId,
  subCategoryId,
  languageId,
  difficultyId,
  search,
  view,
  userId,
  approvalStatusId,
}: {
  page?: number
  limit?: number
  categoryId?: number
  subCategoryId?: number
  languageId?: number
  difficultyId?: number
  search?: string
  view?: string
  userId?: number
  approvalStatusId?: number
} = {}): Promise<{ questions: QzQuestion[]; total: number }> {
  const where: Record<string, unknown> = {}

  // Only show approved questions on public browse, unless viewing own or admin
  if (view === 'my-questions' && userId) {
    where.userId = userId
  } else if (!approvalStatusId) {
    // public view: only approved (status id for "Approved" — look up by name)
    const approved = await prisma.qzApprovalStatus.findFirst({ where: { name: 'Accepted' } })
    if (approved) where.approvalStatusId = approved.id
  }

  if (approvalStatusId) where.approvalStatusId = approvalStatusId

  if (categoryId) where.categories = { some: { categoryId } }
  if (subCategoryId) where.subCategories = { some: { subCategoryId } }
  if (languageId) where.languages = { some: { languageId } }
  if (difficultyId) where.difficultyId = difficultyId

  if (search && search.trim().length > 0) {
    where.questionText = { contains: search, mode: 'insensitive' }
  }

  const [raws, total] = await Promise.all([
    prisma.qzQuestion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        approvalStatus: true,
        type: true,
        difficulty: true,
        choices: { orderBy: { id: 'asc' } },
        languages: { include: { language: true } },
        categories: { include: { category: true } },
        subCategories: { include: { subCategory: true } },
      },
    }),
    prisma.qzQuestion.count({ where }),
  ])

  return { questions: raws.map(mapQuestion), total }
}

export async function getQuestion(id: number): Promise<QzQuestion | null> {
  const raw = await prisma.qzQuestion.findUnique({
    where: { id },
    include: {
      approvalStatus: true,
      type: true,
      difficulty: true,
      choices: { orderBy: { id: 'asc' } },
      languages: { include: { language: true } },
      categories: { include: { category: true } },
      subCategories: { include: { subCategory: true } },
      user: { select: { id: true, name: true } },
    },
  })
  if (!raw) return null
  return mapQuestion(raw)
}

export async function getRandomQuestions({
  categoryId,
  subCategoryId,
  languageId,
  difficultyId,
  count = 10,
}: {
  categoryId?: number
  subCategoryId?: number
  languageId?: number
  difficultyId?: number
  count?: number
} = {}): Promise<QzQuestion[]> {
  const approved = await prisma.qzApprovalStatus.findFirst({
    where: { name: 'Accepted' },
  })

  const where: Record<string, unknown> = {}
  if (approved) where.approvalStatusId = approved.id
  if (categoryId) where.categories = { some: { categoryId } }
  if (subCategoryId) where.subCategories = { some: { subCategoryId } }
  if (languageId) where.languages = { some: { languageId } }
  if (difficultyId) where.difficultyId = difficultyId

  // Get total count, then fetch random subset
  const total = await prisma.qzQuestion.count({ where })
  const skip = Math.max(0, Math.floor(Math.random() * Math.max(0, total - count)))

  const raws = await prisma.qzQuestion.findMany({
    where,
    skip,
    take: count,
    include: {
      type: true,
      difficulty: true,
      choices: { orderBy: { id: 'asc' } },
      languages: { include: { language: true } },
      categories: { include: { category: true } },
    },
  })

  // Shuffle the results
  for (let i = raws.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[raws[i], raws[j]] = [raws[j], raws[i]]
  }

  return raws.map(mapQuestion)
}

export async function getQuizMetadata(): Promise<{
  questionTypes: QzQuestionType[]
  approvalStatuses: QzApprovalStatus[]
  difficulties: QzDifficulty[]
}> {
  const [questionTypes, approvalStatuses, difficulties] = await Promise.all([
    prisma.qzQuestionType.findMany({ orderBy: { id: 'asc' } }),
    prisma.qzApprovalStatus.findMany({ orderBy: { id: 'asc' } }),
    prisma.qzDifficulty.findMany({ orderBy: { id: 'asc' } }),
  ])
  return { questionTypes, approvalStatuses, difficulties }
}
