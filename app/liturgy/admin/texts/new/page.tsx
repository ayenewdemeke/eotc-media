import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { TextForm } from "@/components/admin/liturgy/forms/TextForm"

export default function NewTextPage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy Admin", href: "/liturgy/admin" },
          { label: "Texts", href: "/liturgy/admin/texts" },
          { label: "New text" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <TextForm />
        </div>
      </div>
    </>
  )
}
