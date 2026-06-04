"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { QzQuestion } from "@/types/models/quiz"
import { CheckCircle, XCircle, Loader2, Search, Trash2, Eye } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DeleteDialog } from "@/components/admin/shared/DeleteDialog"

const statusVariant: Record<string, "success" | "warning" | "destructive"> = {
  Approved: "success",
  Submitted: "warning",
  Declined: "destructive",
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function AdminQuestionsPage() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get("status")

  const [questions, setQuestions] = useState<QzQuestion[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [approving, setApproving] = useState<number | null>(null)
  const [declining, setDeclining] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load(q?: string) {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusParam) params.set("status", statusParam)
    if (q) params.set("search", q)
    const res = await fetch(`/api/quiz/admin/questions?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setQuestions(data.questions ?? [])
      setTotal(data.total ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [statusParam])

  let debounce: ReturnType<typeof setTimeout>
  function handleSearch(v: string) {
    setSearch(v)
    clearTimeout(debounce)
    debounce = setTimeout(() => load(v), 400)
  }

  async function approve(id: number) {
    setApproving(id)
    await fetch(`/api/quiz/admin/questions/${id}/approve`, { method: "POST" })
    setApproving(null)
    load(search)
  }

  async function decline(id: number) {
    setDeclining(id)
    await fetch(`/api/quiz/admin/questions/${id}/decline`, { method: "POST" })
    setDeclining(null)
    load(search)
  }

  async function confirmDelete() {
    if (deleteId == null) return
    setDeleting(true)
    await fetch(`/api/quiz/admin/questions/${deleteId}/delete`, { method: "DELETE" })
    setDeleting(false)
    setDeleteId(null)
    load(search)
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader
        title={statusParam ? "Pending questions" : "All questions"}
        description={loading ? undefined : `${total.toLocaleString()} questions`}
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-64 pl-9"
            />
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : questions.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="font-medium">No questions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const statusName = q.approvalStatus?.name ?? "Submitted"
            const text = stripHtml(q.questionText)
            const truncated = text.length > 180 ? text.slice(0, 180) + "…" : text
            const isApproving = approving === q.id
            const isDeclining = declining === q.id

            return (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariant[statusName] ?? "warning"}>{statusName}</Badge>
                        {q.difficulty && (
                          <span className="text-[10px] text-muted-foreground">{q.difficulty.name}</span>
                        )}
                        {q.categories?.map(c => (
                          <span key={c.id} className="text-[10px] text-muted-foreground">{c.name}</span>
                        ))}
                        {q.languages?.map(l => (
                          <span key={l.id} className="text-[10px] text-muted-foreground">{l.name}</span>
                        ))}
                        <span className="text-[10px] text-muted-foreground">{q.choices?.length ?? 0} choices</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{truncated}</p>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-1">
                      <Button asChild size="icon-sm" variant="ghost" title="View">
                        <Link href={`/quiz/${q.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => approve(q.id)} disabled={isApproving || isDeclining} title="Approve"
                        className="hover:text-success">
                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => decline(q.id)} disabled={isApproving || isDeclining} title="Decline"
                        className="hover:text-destructive">
                        {isDeclining ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setDeleteId(q.id)} title="Delete"
                        className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Delete question"
        description="Are you sure you want to delete this question? This action cannot be undone."
      />
    </div>
  )
}
