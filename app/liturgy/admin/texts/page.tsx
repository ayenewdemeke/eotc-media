"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react"
import { toast } from "sonner"

import { DataTable } from "@/components/admin/shared/DataTable"
import { DeleteDialog } from "@/components/admin/shared/DeleteDialog"
import { TextForm } from "@/components/admin/liturgy/forms/TextForm"
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

interface LiturgicalText {
  id: number
  sectionId: number
  roleId: number
  orderIndex: number
  textGeez: string
  textAmharic: string
  textEnglishTransliteration: string
  textEnglishTranslation: string
  remark: string | null
  audioGeezFilePath: string | null
  audioEzilFilePath: string | null
  audioArarayFilePath: string | null
  createdAt: string
  updatedAt: string
  section: {
    id: number
    nameEnglish: string
  }
  role: {
    id: number
    roleKey: string
    nameEnglish: string
  }
}

export default function TextsPage() {
  const router = useRouter()
  const [texts, setTexts] = useState<LiturgicalText[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchTexts = async () => {
    try {
      const response = await fetch("/api/liturgy/admin/texts?limit=100")
      const data = await response.json()

      if (response.ok) {
        setTexts(data.texts)
      } else {
        toast.error(data.error || "Failed to fetch texts")
      }
    } catch (error) {
      toast.error("Failed to fetch texts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTexts()
  }, [])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/liturgy/admin/texts/${deleteId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Text deleted successfully")
        fetchTexts()
      } else {
        toast.error(data.error || "Failed to delete text")
      }
    } catch (error) {
      toast.error("Failed to delete text")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const columns: ColumnDef<LiturgicalText>[] = [
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
      accessorKey: "section",
      header: "Section",
      cell: ({ row }) => {
        const section = row.original.section
        return (
          <div className="max-w-[200px]">
            <div className="font-medium">{section.nameEnglish}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge variant="outline">
            {role.nameEnglish}
          </Badge>
        )
      },
    },
    {
      accessorKey: "textEnglishTranslation",
      header: "Text preview",
      cell: ({ row }) => (
        <div className="max-w-[300px] text-sm text-muted-foreground">
          {truncateText(row.getValue("textEnglishTranslation"))}
        </div>
      ),
    },
    {
      id: "remark",
      header: "Remark",
      cell: ({ row }) => {
        const remark = row.original.remark
        return remark ? (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            Has remark
          </Badge>
        ) : null
      },
    },
    {
      id: "audio",
      header: "Audio",
      cell: ({ row }) => {
        const text = row.original
        const hasAudio =
          text.audioGeezFilePath || text.audioEzilFilePath || text.audioArarayFilePath
        return hasAudio ? (
          <Badge variant="default">Has audio</Badge>
        ) : (
          <Badge variant="secondary">No audio</Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const text = row.original

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
                onClick={() => router.push(`/liturgy/admin/texts/${text.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteId(text.id)}
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
    <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Liturgical texts</h1>
            <p className="text-muted-foreground">
              Manage liturgical text content with multilingual support
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add text
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={texts}
          searchKey="textEnglishTranslation"
          searchPlaceholder="Search by text content..."
          isLoading={isLoading}
        />
      </div>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete liturgical text"
        description="Are you sure you want to delete this text? This action cannot be undone."
        isLoading={isDeleting}
      />

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create liturgical text</DialogTitle>
          </DialogHeader>
          <TextForm
            inModal
            onSuccess={() => {
              setIsCreateModalOpen(false)
              fetchTexts()
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
