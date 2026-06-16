"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import { Plus, Copy, Check, Trash2, LogIn, Users, Loader2, X } from "lucide-react"

interface Room {
  id: number
  hostUserId: number
  name: string | null
  roomCode: string
  status: string
  totalRoundsPlayed: number
  createdAt: string
  members: { id: number; userId: number; user: { id: number; name: string | null } }[]
  rounds: { id: number; status: string; roundNumber: number }[]
  host: { id: number; name: string | null }
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-semibold transition-colors cursor-pointer">
      {code}
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export default function QuizRoomsPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const router = useRouter()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createName, setCreateName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function load() {
    const res = await fetch("/api/quiz/rooms")
    if (res.ok) setRooms(await res.json())
    setLoading(false)
  }

  useEffect(() => { if (userId) load() }, [userId])

  async function createRoom() {
    setSaving(true)
    setError("")
    const res = await fetch("/api/quiz/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: createName }),
    })
    if (res.ok) {
      const room = await res.json()
      setShowCreate(false)
      setCreateName("")
      router.push(`/quiz/rooms/${room.id}`)
    } else {
      const d = await res.json()
      setError(d.error ?? "Failed to create room")
    }
    setSaving(false)
  }

  async function joinRoom() {
    setSaving(true)
    setError("")
    const res = await fetch("/api/quiz/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
    })
    if (res.ok) {
      const { roomId } = await res.json()
      setShowJoin(false)
      setJoinCode("")
      router.push(`/quiz/rooms/${roomId}`)
    } else {
      const d = await res.json()
      setError(d.error ?? "Room not found")
    }
    setSaving(false)
  }

  async function deleteRoom(id: number) {
    if (!confirm("Delete this room? This cannot be undone.")) return
    setDeletingId(id)
    await fetch(`/api/quiz/rooms/${id}`, { method: "DELETE" })
    setDeletingId(null)
    load()
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Please sign in to access Group rooms.</p>
            <button onClick={() => router.push("/auth/login")}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {showCreate && (
        <Modal title="Create room" onClose={() => { setShowCreate(false); setError(""); setCreateName("") }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Room name (optional)</label>
              <input
                autoFocus value={createName} onChange={e => setCreateName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createRoom()}
                placeholder="e.g. Friday Night Quiz"
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowCreate(false); setError(""); setCreateName("") }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={createRoom} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create room
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showJoin && (
        <Modal title="Join room" onClose={() => { setShowJoin(false); setError(""); setJoinCode("") }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Room code</label>
              <input
                autoFocus value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && joinRoom()}
                placeholder="#ABC123"
                className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-mono"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowJoin(false); setError(""); setJoinCode("") }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button onClick={joinRoom} disabled={saving || !joinCode.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Join room
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Group rooms</h1>
                <p className="text-sm text-slate-400 mt-0.5">Play quiz rounds with others in real time</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowJoin(true); setError("") }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <LogIn className="w-4 h-4" />
                  Join
                </button>
                <button onClick={() => { setShowCreate(true); setError("") }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Create room
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">No rooms yet</p>
                <p className="text-sm text-slate-400 mt-1">Create a room or join one with a code.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map(room => {
                  const isHost = room.hostUserId === userId
                  const latestRound = room.rounds[0]
                  const statusBadge = latestRound?.status === 'active'
                    ? <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">In round</span>
                    : latestRound?.status === 'waiting'
                    ? <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Waiting</span>
                    : <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">Idle</span>

                  return (
                    <div key={room.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors cursor-pointer"
                      onClick={() => router.push(`/quiz/rooms/${room.id}`)}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {room.name || "Quiz Room"}
                          </p>
                          <CopyCode code={room.roomCode} />
                        </div>
                        {statusBadge}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {room.members.length} member{room.members.length !== 1 ? "s" : ""}
                          {isHost && <span className="ml-1 text-blue-500 font-medium">· Host</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{room.totalRoundsPlayed} round{room.totalRoundsPlayed !== 1 ? "s" : ""}</span>
                          {isHost && (
                            <button
                              onClick={e => { e.stopPropagation(); deleteRoom(room.id) }}
                              disabled={deletingId === room.id}
                              className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              {deletingId === room.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
