import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHeader } from "@/components/admin/layout/AdminHeader"
import { TextForm } from "@/components/admin/forms/TextForm"

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
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy Admin", href: "/liturgy/admin" },
          { label: "Texts", href: "/liturgy/admin/texts" },
          { label: `Edit text #${text.id}` },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <TextForm initialData={text} />
        </div>
      </div>
    </>
  )
}
