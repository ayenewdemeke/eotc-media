"use client"

import Link from "next/link"
import { Eye, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  sermonId: number
  slug: string
}

export default function SermonAdminActions({ sermonId, slug }: Props) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sermon?")) return
    await fetch(`/api/sermons/admin/sermons/${sermonId}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Link
        href={`/sermons/${slug}`}
        target="_blank"
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
        title="View"
      >
        <Eye className="w-4 h-4" />
      </Link>
      <Link
        href={`/sermons/admin/sermons/${sermonId}/edit`}
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
