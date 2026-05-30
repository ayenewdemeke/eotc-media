import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TextForm } from "@/components/admin/liturgy/forms/TextForm"

export const dynamic = "force-dynamic"

interface EditTextPageProps {
  params: Promise<{ id: string }>
}

async function getText(id: number) {
  const text = await prisma.ltLiturgicalText.findUnique({
    where: { id },
  })

  return text
}

export default async function EditTextPage({ params }: EditTextPageProps) {
  const { id } = await params
  const textId = parseInt(id)

  if (isNaN(textId)) {
    notFound()
  }

  const text = await getText(textId)

  if (!text) {
    notFound()
  }

  return (
    <div className="flex-1 p-6">
      <div className="mx-auto max-w-3xl">
        <TextForm initialData={text} />
      </div>
    </div>
  )
}
