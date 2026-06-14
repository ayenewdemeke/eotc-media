"use client"

import Link from "next/link"
import { Eye, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  hymnId: number
  slug: string
}

export default function HymnAdminActions({ hymnId, slug }: Props) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this hymn?")) return
    await fetch(`/api/hymns/admin/hymns/${hymnId}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Link
        href={`/hymns/${slug}`}
        target="_blank"
        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="View"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/hymns/admin/hymns/${hymnId}/edit`}
        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
