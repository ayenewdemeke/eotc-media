"use client"

import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "./PageHeader"
import { DeleteDialog } from "./DeleteDialog"
import { cn } from "@/lib/utils"

export interface LookupRelation {
  /** Body key sent to the API, e.g. "languageId" or "categoryId". */
  key: string
  /** Column header / select label, e.g. "Language". */
  label: string
  /** Endpoint returning [{ id, name }] options. */
  optionsUrl: string
  /** Whether the field is required when creating. */
  required?: boolean
  /** Whether to render a filter dropdown for this relation above the table. */
  filterable?: boolean
}

interface LookupItem {
  id: number
  name: string
  [key: string]: unknown
}

interface LookupAdminPageProps {
  title: string
  description?: string
  /** Singular noun, e.g. "language". Used in placeholders and empty states. */
  noun: string
  /** API base, e.g. "/api/sermons/admin/languages". */
  apiBase: string
  /** Allow inline editing of existing rows (default true). */
  editable?: boolean
  /** Optional related select fields / columns. */
  relations?: LookupRelation[]
}

type Option = { id: number; name: string }

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

export function LookupAdminPage({
  title,
  description,
  noun,
  apiBase,
  editable = true,
  relations = [],
}: LookupAdminPageProps) {
  const [items, setItems] = useState<LookupItem[]>([])
  const [options, setOptions] = useState<Record<string, Option[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Create form
  const [newName, setNewName] = useState("")
  const [newRelations, setNewRelations] = useState<Record<string, string>>({})

  // Inline edit
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editRelations, setEditRelations] = useState<Record<string, string>>({})

  // Filter
  const [filter, setFilter] = useState<Record<string, string>>({})

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<LookupItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filterRelation = relations.find((r) => r.filterable)

  async function load() {
    const [itemsRes, ...optionResults] = await Promise.all([
      fetch(apiBase),
      ...relations.map((r) => fetch(r.optionsUrl)),
    ])
    if (itemsRes.ok) setItems(await itemsRes.json())
    const opts: Record<string, Option[]> = {}
    for (let i = 0; i < relations.length; i++) {
      const res = optionResults[i]
      opts[relations[i].key] = res.ok ? await res.json() : []
    }
    setOptions(opts)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildBody(name: string, rels: Record<string, string>) {
    const body: Record<string, unknown> = { name: name.trim() }
    for (const r of relations) {
      const val = rels[r.key]
      body[r.key] = val ? parseInt(val) : null
    }
    return body
  }

  const canCreate =
    !!newName.trim() &&
    relations.every((r) => !r.required || !!newRelations[r.key])

  async function create() {
    if (!canCreate) return
    setSaving(true)
    await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBody(newName, newRelations)),
    })
    setNewName("")
    setNewRelations({})
    setSaving(false)
    load()
  }

  function startEdit(item: LookupItem) {
    setEditId(item.id)
    setEditName(item.name)
    const rels: Record<string, string> = {}
    for (const r of relations) {
      const v = item[r.key]
      rels[r.key] = v == null ? "" : String(v)
    }
    setEditRelations(rels)
  }

  async function update(id: number) {
    if (!editName.trim()) return
    setSaving(true)
    await fetch(`${apiBase}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBody(editName, editRelations)),
    })
    setEditId(null)
    setSaving(false)
    load()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`${apiBase}/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false)
    setDeleteTarget(null)
    load()
  }

  function relationName(key: string, value: unknown) {
    if (value == null) return "—"
    return options[key]?.find((o) => o.id === Number(value))?.name ?? "—"
  }

  const visibleItems = filterRelation && filter[filterRelation.key]
    ? items.filter(
        (it) => String(it[filterRelation.key]) === filter[filterRelation.key]
      )
    : items

  const colCount = 1 + relations.length + 1

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title={title} description={description} />

      {/* Create */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-4">
          {relations.map((r) => (
            <select
              key={r.key}
              value={newRelations[r.key] ?? ""}
              onChange={(e) =>
                setNewRelations((s) => ({ ...s, [r.key]: e.target.value }))
              }
              suppressHydrationWarning
              className={selectClass}
            >
              <option value="">
                {r.required ? `Select ${r.label.toLowerCase()}…` : `${r.label}…`}
              </option>
              {(options[r.key] ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          ))}
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder={`New ${noun} name…`}
            className="h-9 min-w-[180px] flex-1"
          />
          <Button onClick={create} disabled={saving || !canCreate}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      {/* Filter */}
      {filterRelation && (
        <select
          value={filter[filterRelation.key] ?? ""}
          onChange={(e) =>
            setFilter({ [filterRelation.key]: e.target.value })
          }
          suppressHydrationWarning
          className={selectClass}
        >
          <option value="">All {filterRelation.label.toLowerCase()}s</option>
          {(options[filterRelation.key] ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Name</TableHead>
                {relations.map((r) => (
                  <TableHead key={r.key} className="px-4">
                    {r.label}
                  </TableHead>
                ))}
                <TableHead className="w-[100px] px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-4">
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    {relations.map((r) => (
                      <TableCell key={r.key} className="px-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                    <TableCell className="px-4">
                      <Skeleton className="ml-auto h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : visibleItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colCount}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No {noun}s yet.
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((item) => {
                  const isEditing = editId === item.id
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="px-4 font-medium">
                        {isEditing ? (
                          <Input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") update(item.id)
                              if (e.key === "Escape") setEditId(null)
                            }}
                            className="h-8"
                          />
                        ) : (
                          item.name
                        )}
                      </TableCell>
                      {relations.map((r) => (
                        <TableCell key={r.key} className="px-4 text-muted-foreground">
                          {isEditing ? (
                            <select
                              value={editRelations[r.key] ?? ""}
                              onChange={(e) =>
                                setEditRelations((s) => ({
                                  ...s,
                                  [r.key]: e.target.value,
                                }))
                              }
                              suppressHydrationWarning
                              className={cn(selectClass, "h-8")}
                            >
                              <option value="">—</option>
                              {(options[r.key] ?? []).map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            relationName(r.key, item[r.key])
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="px-4 text-right">
                        <div className="flex justify-end gap-1">
                          {isEditing ? (
                            <>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => update(item.id)}
                                disabled={saving}
                                title="Save"
                              >
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setEditId(null)}
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              {editable && (
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  onClick={() => startEdit(item)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title={`Delete ${noun}`}
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}
