import Link from "next/link"
import { prisma } from "@/lib/prisma"
import BookApproveDeclineButtons from "@/components/admin/books/BookApproveDeclineButtons"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const where = {}

  const [books, total] = await Promise.all([
    prisma.cbBook.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        approvalStatus: true,
        languages: { include: { language: true } },
        categories: { include: { category: true } },
        subCategories: { include: { subCategory: true } },
        authors: { include: { author: true } },
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.cbBook.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildUrl(p: number) {
    return `/books/admin/books?page=${p}`
  }

  const linkClass = "px-3 py-1.5 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <PageHeader title="All books" description={`${total.toLocaleString()} books`} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">#</TableHead>
                <TableHead className="px-4">Language</TableHead>
                <TableHead className="px-4">Category</TableHead>
                <TableHead className="px-4">Name</TableHead>
                <TableHead className="px-4">Author</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No books</TableCell>
                </TableRow>
              )}
              {books.map((book, i) => (
                <TableRow key={book.id}>
                  <TableCell className="px-4 text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{book.languages.map(l => l.language.name).join(", ") || "—"}</TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">{book.categories.map(c => c.category.name).join(", ") || "—"}</TableCell>
                  <TableCell className="max-w-[180px] truncate px-4 font-medium">
                    <Link href={`/books/${book.slug}`} target="_blank" className="hover:text-primary">{book.name}</Link>
                  </TableCell>
                  <TableCell className="px-4 text-xs text-muted-foreground">
                    {book.authors.length > 0 ? book.authors.map(a => a.author.name).join(", ") : book.author}
                  </TableCell>
                  <TableCell className="px-4">
                    <BookApproveDeclineButtons bookId={book.id} currentStatus={book.approvalStatus?.name ?? ""} />
                  </TableCell>
                  <TableCell className="px-4">
                    <Link href={`/books/admin/books/${book.id}/edit`} className="rounded-md border border-input px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground">Edit</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 && <Link href={buildUrl(page - 1)} className={linkClass}>← Prev</Link>}
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          {page < totalPages && <Link href={buildUrl(page + 1)} className={linkClass}>Next →</Link>}
        </div>
      )}
    </div>
  )
}
