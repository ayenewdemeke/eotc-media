"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { DataTable } from "@/components/admin/shared/DataTable"
import { DeleteDialog } from "@/components/admin/shared/DeleteDialog"
import { SectionForm } from "@/components/admin/liturgy/forms/SectionForm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

interface Section {
  id: number
  nameGeez: string
  nameAmharic: string
  nameEnglish: string
  orderIndex: number
  createdAt: string
  updatedAt: string
  _count: {
    texts: number
  }
}

export default function SectionsPage() {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/liturgy/admin/sections?limit=100")
      const data = await response.json()

      if (response.ok) {
        setSections(data.sections)
      } else {
        toast.error(data.error || "Failed to fetch sections")
      }
    } catch (error) {
      toast.error("Failed to fetch sections")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/liturgy/admin/sections/${deleteId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Section deleted successfully")
        fetchSections()
      } else {
        toast.error(data.error || "Failed to delete section")
      }
    } catch (error) {
      toast.error("Failed to delete section")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Section>[] = [
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
      accessorKey: "nameEnglish",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name (English)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "nameAmharic",
      header: "Name (Amharic)",
    },
    {
      accessorKey: "_count.texts",
      header: "Texts",
      cell: ({ row }) => {
        const count = row.original._count.texts
        return (
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} text{count !== 1 ? "s" : ""}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const section = row.original

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
                onClick={() =>
                  router.push(`/liturgy/admin/sections/${section.id}/edit`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteId(section.id)}
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
          { label: "Liturgy admin", href: "/liturgy/admin" },
          { label: "Sections" },
        ]}
      />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sections</h1>
            <p className="text-muted-foreground">
              Manage liturgical sections
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add section
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={sections}
          searchKey="nameEnglish"
          searchPlaceholder="Search by name..."
          isLoading={isLoading}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete section"
        description="Are you sure you want to delete this section? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create section</DialogTitle>
          </DialogHeader>
          <SectionForm
            inModal
            onSuccess={() => {
              setIsCreateModalOpen(false)
              fetchSections()
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
