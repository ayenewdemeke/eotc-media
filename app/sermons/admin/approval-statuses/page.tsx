"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

interface ApprovalStatus { id: number; name: string }

export default function AdminSermonApprovalStatusesPage() {
  const [statuses, setStatuses] = useState<ApprovalStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch("/api/sermons/admin/approval-statuses")
    if (res.ok) setStatuses(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create() {
    if (!newName.trim()) return
    setSaving(true)
    await fetch("/api/sermons/admin/approval-statuses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName("")
    setSaving(false)
    load()
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    await fetch(`/api/sermons/admin/approval-statuses/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Approval statuses</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && create()}
          placeholder="New status name…"
          className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
        />
        <button
          onClick={create}
          disabled={saving || !newName.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />Add status
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statuses.map((s, i) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => remove(s.id, s.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {statuses.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-sm">
                    No approval statuses yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
