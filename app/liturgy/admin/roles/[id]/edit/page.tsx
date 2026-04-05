import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { RoleForm } from "@/components/admin/liturgy/forms/RoleForm"

export const dynamic = "force-dynamic"

interface EditRolePageProps {
  params: Promise<{ id: string }>
}

async function getRole(id: number) {
  const role = await prisma.ltRole.findUnique({
    where: { id },
  })

  return role
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params
  const roleId = parseInt(id)

  if (isNaN(roleId)) {
    notFound()
  }

  const role = await getRole(roleId)

  if (!role) {
    notFound()
  }

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy admin", href: "/liturgy/admin" },
          { label: "Roles", href: "/liturgy/admin/roles" },
          { label: `Edit: ${role.nameEnglish}` },
        ]}
      />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <RoleForm initialData={role} />
        </div>
      </div>
    </>
  )
}
