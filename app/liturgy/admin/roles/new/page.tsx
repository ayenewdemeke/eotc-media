import { AdminHeader } from "@/components/admin/layout/AdminHeader"
import { RoleForm } from "@/components/admin/forms/RoleForm"

export default function NewRolePage() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy Admin", href: "/liturgy/admin" },
          { label: "Roles", href: "/liturgy/admin/roles" },
          { label: "New role" },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <RoleForm />
        </div>
      </div>
    </>
  )
}
