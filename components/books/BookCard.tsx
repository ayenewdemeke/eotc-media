import Link from "next/link"
import { Download, ThumbsUp } from "lucide-react"
import { CbBook } from "@/types/models/book"

interface BookCardProps {
  book: CbBook
}

export default function BookCard({ book }: BookCardProps) {
  const coverUrl = book.image ? `/uploads/books/images/${book.image}` : null

  return (
    <Link href={`/books/${book.slug}`} className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden flex-shrink-0">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={book.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <Download className="w-12 h-12 text-slate-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{book.name}</h3>
        <p className="text-xs text-slate-500 truncate">{book.author}</p>

        {book.languages && book.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {book.languages.map(l => (
              <span key={l.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded">
                {l.name}
              </span>
            ))}
          </div>
        )}

        {typeof book.likesCount === 'number' && (
          <div className="flex items-center gap-1 mt-auto pt-2 text-slate-400 text-xs">
            <ThumbsUp className="w-3 h-3" />
            <span>{book.likesCount}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
