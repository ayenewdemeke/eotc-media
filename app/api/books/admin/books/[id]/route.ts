import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasBookAdminAccess } from '@/lib/auth-helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const book = await prisma.cbBook.findUnique({
    where: { id: parseInt(id) },
    include: {
      approvalStatus: true,
      languages: { include: { language: true } },
      categories: { include: { category: true } },
      subCategories: { include: { subCategory: true } },
      authors: { include: { author: true } },
    },
  })
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(book)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const bookId = parseInt(id)
  const body = await req.json()
  const { name, author, description, approvalStatusId, languageIds, categoryIds, subCategoryIds, authorIds } = body

  await prisma.cbBook.update({
    where: { id: bookId },
    data: {
      name: name?.trim(),
      author: author?.trim(),
      description: description?.trim() || null,
      approvalStatusId: approvalStatusId ? parseInt(String(approvalStatusId)) : undefined,
      updatedAt: new Date(),
    },
  })

  if (languageIds !== undefined) {
    await prisma.cbBookLanguage.deleteMany({ where: { bookId } })
    if (languageIds.length) await prisma.cbBookLanguage.createMany({ data: languageIds.map((lid: number) => ({ bookId, languageId: lid, updatedAt: new Date() })) })
  }
  if (categoryIds !== undefined) {
    await prisma.cbBookCategory.deleteMany({ where: { bookId } })
    if (categoryIds.length) await prisma.cbBookCategory.createMany({ data: categoryIds.map((cid: number) => ({ bookId, categoryId: cid, updatedAt: new Date() })) })
  }
  if (subCategoryIds !== undefined) {
    await prisma.cbBookSubCategory.deleteMany({ where: { bookId } })
    if (subCategoryIds.length) await prisma.cbBookSubCategory.createMany({ data: subCategoryIds.map((sid: number) => ({ bookId, subCategoryId: sid, updatedAt: new Date() })) })
  }
  if (authorIds !== undefined) {
    await prisma.cbAuthorBook.deleteMany({ where: { bookId } })
    if (authorIds.length) await prisma.cbAuthorBook.createMany({ data: authorIds.map((aid: number) => ({ bookId, authorId: aid, updatedAt: new Date() })) })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasBookAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.cbBook.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
