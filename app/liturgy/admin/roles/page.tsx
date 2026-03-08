"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { DataTable } from "@/components/admin/shared/DataTable"
import { DeleteDialog } from "@/components/admin/shared/DeleteDialog"
import { RoleForm } from "@/components/admin/liturgy/forms/RoleForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Role {
  id: number
  roleKey: string
  nameAmharic: string
  nameEnglish: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export default function RolesPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/liturgy/admin/roles?limit=100")
      const data = await response.json()

      if (response.ok) {
        setRoles(data.roles)
      } else {
        toast.error(data.error || "Failed to fetch roles")
      }
    } catch (error) {
      toast.error("Failed to fetch roles")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/liturgy/admin/roles/${deleteId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Role deleted successfully")
        fetchRoles()
      } else {
        toast.error(data.error || "Failed to delete role")
      }
    } catch (error) {
      toast.error("Failed to delete role")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "orderIndex",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("orderIndex")}</div>
      ),
    },
    {
      accessorKey: "roleKey",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role key
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {row.getValue("roleKey")}
        </code>
      ),
    },
    {
      accessorKey: "nameAmharic",
      header: "Name (Amharic)",
    },
    {
      accessorKey: "nameEnglish",
      header: "Name (English)",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/liturgy/admin/roles/${role.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteId(role.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: "Liturgy Admin", href: "/liturgy/admin" },
          { label: "Roles" },
        ]}
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
            <p className="text-muted-foreground">
              Manage liturgical participant roles (Priest, Deacon, People, etc.)
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add role
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={roles}
          searchKey="roleKey"
          searchPlaceholder="Search by role key..."
          isLoading={isLoading}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
          </DialogHeader>
          <RoleForm
            inModal
            onSuccess={() => {
              setIsCreateModalOpen(false)
              fetchRoles()
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
