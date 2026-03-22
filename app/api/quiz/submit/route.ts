import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = parseInt(session.user.id)

  const body = await req.json()
  const { questionText, typeId, difficultyId, languageIds, categoryIds, subCategoryIds, choices } = body

  if (!questionText?.trim()) return NextResponse.json({ error: 'Question text is required' }, { status: 400 })
  if (!typeId) return NextResponse.json({ error: 'Question type is required' }, { status: 400 })
  if (!languageIds?.length) return NextResponse.json({ error: 'At least one language is required' }, { status: 400 })
  if (!categoryIds?.length) return NextResponse.json({ error: 'At least one category is required' }, { status: 400 })
  if (!choices?.length || choices.length < 2) return NextResponse.json({ error: 'At least 2 choices are required' }, { status: 400 })
  if (!choices.some((c: { isCorrect: boolean }) => c.isCorrect)) return NextResponse.json({ error: 'At least one correct choice is required' }, { status: 400 })

  // Find the default "Submitted" approval status
  const submittedStatus = await prisma.qzApprovalStatus.findFirst({
    where: { name: { contains: 'Submitted', mode: 'insensitive' } },
  })
  if (!submittedStatus) return NextResponse.json({ error: 'Approval status not configured' }, { status: 500 })

  const question = await prisma.qzQuestion.create({
    data: {
      userId,
      approvalStatusId: submittedStatus.id,
      typeId: parseInt(String(typeId)),
      difficultyId: difficultyId ? parseInt(String(difficultyId)) : null,
      questionText: questionText.trim(),
      choices: {
        create: choices.map((c: { choiceText: string; isCorrect: boolean }) => ({
          choiceText: c.choiceText.trim(),
          isCorrect: !!c.isCorrect,
        })),
      },
      languages: {
        create: languageIds.map((id: number) => ({ languageId: id })),
      },
      categories: {
        create: categoryIds.map((id: number) => ({ categoryId: id })),
      },
      subCategories: {
        create: (subCategoryIds ?? []).map((id: number) => ({ subCategoryId: id })),
      },
    },
  })

  return NextResponse.json(question, { status: 201 })
}
