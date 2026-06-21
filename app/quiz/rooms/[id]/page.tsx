"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import { Users, Crown, Copy, Check, Plus, Loader2, ChevronRight } from "lucide-react"

interface FilterOption { id: number; name: string }

interface Member {
  id: number
  userId: number
  user: { id: number; name: string | null }
  totalScore: number
  roundsWon: number
}

interface Round {
  id: number
  roundNumber: number
  status: string
  timerSeconds: number
  startedAt: string | null
  endedAt: string | null
}

interface Room {
  id: number
  hostUserId: number
  name: string | null
  roomCode: string
  status: string
  totalRoundsPlayed: number
  host: { id: number; name: string | null }
  members: Member[]
  rounds: Round[]
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  function copy(e: React.MouseEvent) {
    e.stopPropagation()
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

const STATUS_BADGE: Record<string, React.ReactNode> = {
  waiting: <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">Waiting</span>,
  active:  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Active</span>,
  finished: <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-medium">Finished</span>,
}

export default function RoomPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const params = useParams()
  const router = useRouter()
  const roomId = parseInt(params.id as string)

  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingRound, setStartingRound] = useState(false)
  const [error, setError] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Filter options (loaded once)
  const [categories, setCategories] = useState<FilterOption[]>([])
  const [difficulties, setDifficulties] = useState<FilterOption[]>([])
  const [languages, setLanguages] = useState<FilterOption[]>([])

  // Selected round filters (host only)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/quiz/rooms/${roomId}`)
    if (res.ok) {
      setRoom(await res.json())
    } else if (res.status === 403 || res.status === 404) {
      router.push("/quiz/rooms")
    }
    setLoading(false)
  }, [roomId, router])

  useEffect(() => {
    fetchRoom()
    intervalRef.current = setInterval(fetchRoom, 2000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchRoom])

  useEffect(() => {
    Promise.all([
      fetch("/api/quiz/admin/categories").then(r => r.json()),
      fetch("/api/quiz/admin/difficulties").then(r => r.json()),
      fetch("/api/quiz/admin/languages").then(r => r.json()),
    ]).then(([cats, diffs, langs]) => {
      setCategories(cats)
      setDifficulties(diffs)
      setLanguages(langs)
    })
  }, [])

  async function startRound() {
    setStartingRound(true)
    setError("")
    const res = await fetch(`/api/quiz/rooms/${roomId}/rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId:   selectedCategory   || null,
        difficultyId: selectedDifficulty || null,
        languageId:   selectedLanguage   || null,
      }),
    })
    if (res.ok) {
      const round = await res.json()
      router.push(`/quiz/rooms/${roomId}/rounds/${round.id}`)
    } else {
      const d = await res.json()
      setError(d.error ?? "Failed to start round")
    }
    setStartingRound(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    )
  }

  if (!room) return null

  const isHost = room.hostUserId === userId
  const activeRound = room.rounds.find(r => r.status === 'active' || r.status === 'waiting')

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">

            {/* Header */}
            <div className="flex items-start justify-between mb-4 gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {room.name || "Quiz Room"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <CopyCode code={room.roomCode} />
                  <span className="text-xs text-slate-400">Share this code to invite others</span>
                </div>
              </div>
              {activeRound && (
                <button onClick={() => router.push(`/quiz/rooms/${roomId}/rounds/${activeRound.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex-shrink-0">
                  <ChevronRight className="w-4 h-4" />
                  Go to round {activeRound.roundNumber}
                </button>
              )}
            </div>

            {/* Host round filter panel */}
            {isHost && !activeRound && (
              <div className="mb-6 bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Round filters</p>
                <div className="flex flex-wrap gap-3 items-end">
                  {[
                    { label: "Language", value: selectedLanguage, setter: setSelectedLanguage, options: languages, placeholder: "All languages" },
                    { label: "Category", value: selectedCategory, setter: setSelectedCategory, options: categories, placeholder: "All categories" },
                    { label: "Difficulty", value: selectedDifficulty, setter: setSelectedDifficulty, options: difficulties, placeholder: "All difficulties" },
                  ].map(({ label, value, setter, options, placeholder }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">{label}</label>
                      <select
                        value={value}
                        onChange={e => setter(e.target.value)}
                        className="h-9 px-3 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white cursor-pointer"
                      >
                        <option value="">{placeholder}</option>
                        {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={startRound} disabled={startingRound}
                    className="flex items-center gap-2 h-9 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
                    {startingRound ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Start round
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4">{error}</p>}

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

              {/* Members */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Members ({room.members.length})
                  </h2>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-400">Player</th>
                      <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-400">Score</th>
                      <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-400">Rounds won</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(() => {
                      const sorted = room.members.slice().sort((a, b) => b.totalScore - a.totalScore)
                      const topScore = sorted[0]?.totalScore ?? 0
                      return sorted.map(m => (
                        <tr key={m.id} className={m.userId === userId ? "bg-blue-50/50" : ""}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {topScore > 0 && m.totalScore === topScore && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                              {m.userId === room.hostUserId && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 flex-shrink-0">Host</span>
                              )}
                              <span className="font-medium text-slate-900">
                                {m.user.name || "Anonymous"}
                                {m.userId === userId && <span className="ml-1.5 text-xs text-blue-500 font-normal">(you)</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-slate-900">{m.totalScore}</td>
                          <td className="px-5 py-3 text-right text-slate-500">{m.roundsWon}</td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Rounds list */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-fit">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Rounds ({room.totalRoundsPlayed})
                  </h2>
                </div>
                {room.rounds.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-slate-400 text-center">No rounds yet</p>
                ) : (
                  <ul className="divide-y divide-slate-50">
                    {room.rounds
                      .slice()
                      .sort((a, b) => b.roundNumber - a.roundNumber)
                      .map(round => (
                        <li key={round.id}>
                          <button
                            onClick={() => router.push(`/quiz/rooms/${roomId}/rounds/${round.id}`)}
                            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left">
                            <span className="text-sm font-medium text-slate-700">Round {round.roundNumber}</span>
                            {STATUS_BADGE[round.status] ?? <span className="text-xs text-slate-400">{round.status}</span>}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  )
}
