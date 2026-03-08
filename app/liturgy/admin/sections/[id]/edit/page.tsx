import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { SectionForm } from "@/components/admin/liturgy/forms/SectionForm"

export const dynamic = "force-dynamic"

interface EditSectionPageProps {
  params: Promise<{ id: string }>
}

async function getSection(id: number) {
  const section = await prisma.ltSection.findUnique({
    where: { id },
  })

  return section
}

export default async function EditSectionPage({ params }: EditSectionPageProps) {
  const { id } = await params
  const sectionId = parseInt(id)

  if (isNaN(sectionId)) {
    notFound()
  }

  const section = await getSection(sectionId)

  if (!section) {
    notFound()
  }

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy Admin", href: "/liturgy/admin" },
          { label: "Sections", href: "/liturgy/admin/sections" },
          { label: `Edit: ${section.nameEnglish}` },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <SectionForm initialData={section} />
        </div>
      </div>
    </>
  )
}
