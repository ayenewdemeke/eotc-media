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
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
        title="View"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/hymns/admin/hymns/${hymnId}/edit`}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
        title="Edit"
      >
        <Edit className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDelete}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
