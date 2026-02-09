import { AdminHeader } from "@/components/admin/layout/AdminHeader"
import { SectionForm } from "@/components/admin/forms/SectionForm"

export default function NewSectionPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy Admin", href: "/liturgy/admin" },
          { label: "Sections", href: "/liturgy/admin/sections" },
          { label: "New section" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <SectionForm />
        </div>
      </div>
    </>
  )
}
