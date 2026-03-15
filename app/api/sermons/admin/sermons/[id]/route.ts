import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hasSermonAdminAccess } from '@/lib/auth-helpers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const sermon = await prisma.smSermon.findUnique({
    where: { id: parseInt(id) },
    include: {
      categories: { include: { category: true } },
      subCategories: { include: { subCategory: true } },
      languages: { include: { language: true } },
      preachers: { include: { preacher: true } },
      approvalStatus: true,
      channel: true,
    },
  })
  if (!sermon) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sermon)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const sermonId = parseInt(id)
  const body = await req.json()
  const { title, preacher, description, publishedAt, approvalStatusId, channelId, categoryIds, subCategoryIds, languageIds, preacherIds } = body

  await prisma.smSermon.update({
    where: { id: sermonId },
    data: {
      title: title?.trim(),
      preacher: preacher?.trim() || null,
      description: description?.trim() || null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      approvalStatusId: approvalStatusId ? parseInt(String(approvalStatusId)) : undefined,
      channelId: channelId ? parseInt(String(channelId)) : undefined,
      updatedAt: new Date(),
    },
  })

  if (categoryIds !== undefined) {
    await prisma.smCategorySermon.deleteMany({ where: { sermonId } })
    if (categoryIds.length) await prisma.smCategorySermon.createMany({ data: categoryIds.map((cid: number) => ({ categoryId: cid, sermonId })) })
  }
  if (subCategoryIds !== undefined) {
    await prisma.smSermonSubCategory.deleteMany({ where: { sermonId } })
    if (subCategoryIds.length) await prisma.smSermonSubCategory.createMany({ data: subCategoryIds.map((sid: number) => ({ subCategoryId: sid, sermonId })) })
  }
  if (languageIds !== undefined) {
    await prisma.smLanguageSermon.deleteMany({ where: { sermonId } })
    if (languageIds.length) await prisma.smLanguageSermon.createMany({ data: languageIds.map((lid: number) => ({ languageId: lid, sermonId })) })
  }
  if (preacherIds !== undefined) {
    await prisma.smPreacherSermon.deleteMany({ where: { sermonId } })
    if (preacherIds.length) await prisma.smPreacherSermon.createMany({ data: preacherIds.map((pid: number) => ({ preacherId: pid, sermonId })) })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!hasSermonAdminAccess(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.smSermon.delete({ where: { id: parseInt(id) } })
  return NextResponse.json({ ok: true })
}
