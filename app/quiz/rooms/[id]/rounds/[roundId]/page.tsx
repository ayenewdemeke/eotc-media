"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import { Crown, CheckCircle, XCircle, Clock, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react"

interface Choice {
  id: number
  choiceText: string
  isCorrect: boolean
}

interface Question {
  id: number
  questionText: string
  difficulty: { id: number; name: string } | null
  categories: { id: number; name: string }[]
  choices: Choice[]
}

interface RoundQuestion {
  id: number
  questionId: number
  question: Question
  myAnswer: { choiceId: number } | null
}

interface MemberRound {
  id: number
  roomMemberId: number
  isReady: boolean
  roomMember: {
    userId: number
    user: { id: number; name: string | null }
  }
}

interface Result {
  id: number
  userId: number
  score: number
  rank: number
  user: { id: number; name: string | null }
}

interface Round {
  id: number
  roomId: number
  roundNumber: number
  status: string
  timerSeconds: number
  startedAt: string | null
  endedAt: string | null
  questions: RoundQuestion[]
  memberRounds: MemberRound[]
  results: Result[]
}

export default function RoundPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined
  const params = useParams()
  const router = useRouter()
  const roomId = parseInt(params.id as string)
  const roundId = parseInt(params.roundId as string)

  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQ, setCurrentQ] = useState(0)
  const [pendingAnswers, setPendingAnswers] = useState<Record<number, number>>({}) // roundQuestionId → choiceId
  const [submitting, setSubmitting] = useState<number | null>(null) // roundQuestionId being submitted
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [markingReady, setMarkingReady] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchRound = useCallback(async () => {
    const res = await fetch(`/api/quiz/rooms/${roomId}/rounds/${roundId}`)
    if (res.ok) {
      const data: Round = await res.json()
      setRound(data)

      // Update isReady for current user
      const myMemberRound = data.memberRounds.find(mr => mr.roomMember.userId === userId)
      if (myMemberRound) setIsReady(myMemberRound.isReady)

      // Sync pending answers from server (already answered questions)
      const serverAnswers: Record<number, number> = {}
      data.questions.forEach(rq => {
        if (rq.myAnswer) serverAnswers[rq.id] = rq.myAnswer.choiceId
      })
      setPendingAnswers(prev => ({ ...serverAnswers, ...prev }))

      // Start timer if active
      if (data.status === 'active' && data.startedAt) {
        const elapsed = (Date.now() - new Date(data.startedAt).getTime()) / 1000
        const remaining = Math.max(0, data.timerSeconds - elapsed)
        setTimeLeft(Math.floor(remaining))
      }
    } else if (res.status === 403 || res.status === 404) {
      router.push(`/quiz/rooms/${roomId}`)
    }
    setLoading(false)
  }, [roomId, roundId, userId, router])

  useEffect(() => {
    fetchRound()
    intervalRef.current = setInterval(fetchRound, 2000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchRound])

  // Countdown timer
  useEffect(() => {
    if (round?.status === 'active' && round.startedAt) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        if (round.startedAt) {
          const elapsed = (Date.now() - new Date(round.startedAt).getTime()) / 1000
          const remaining = Math.max(0, round.timerSeconds - elapsed)
          setTimeLeft(Math.floor(remaining))
        }
      }, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [round?.status, round?.startedAt, round?.timerSeconds])

  async function markReady() {
    setMarkingReady(true)
    await fetch(`/api/quiz/rooms/${roomId}/rounds/${roundId}/ready`, { method: "POST" })
    setIsReady(true)
    setMarkingReady(false)
    fetchRound()
  }

  async function submitAnswer(roundQuestionId: number, choiceId: number) {
    setSubmitting(roundQuestionId)
    const res = await fetch(`/api/quiz/rooms/${roomId}/rounds/${roundId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundQuestionId, choiceId }),
    })
    setSubmitting(null)
    if (res.ok) {
      fetchRound()
      // Auto-advance to next unanswered question
      if (round) {
        const nextIdx = round.questions.findIndex((rq, i) => i > currentQ && !pendingAnswers[rq.id])
        if (nextIdx !== -1) setCurrentQ(nextIdx)
      }
    }
  }

  function selectChoice(rq: RoundQuestion, choiceId: number) {
    // Only set pending if not already answered on server
    if (rq.myAnswer) return
    setPendingAnswers(prev => ({ ...prev, [rq.id]: choiceId }))
    // Auto-submit
    submitAnswer(rq.id, choiceId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
      </div>
    )
  }
  if (!round) return null

  const totalQ = round.questions.length
  const answeredCount = round.questions.filter(rq => rq.myAnswer || pendingAnswers[rq.id]).length

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">

            {/* Back + round header */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => router.push(`/quiz/rooms/${roomId}`)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Round {round.roundNumber}</h1>
                <p className="text-sm text-slate-400 capitalize">{round.status}</p>
              </div>
            </div>

            {/* WAITING STATE */}
            {round.status === 'waiting' && (
              <div className="max-w-lg mx-auto text-center py-12">
                <div className="bg-white border border-slate-200 rounded-2xl p-8">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Waiting for players to ready up</h2>
                  <p className="text-sm text-slate-400 mb-6">The round starts when all players are ready</p>

                  <div className="space-y-2 mb-8">
                    {round.memberRounds.map(mr => (
                      <div key={mr.id} className="flex items-center justify-between px-4 py-2 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">
                          {mr.roomMember.user.name || "Anonymous"}
                          {mr.roomMember.userId === userId && <span className="ml-1.5 text-xs text-blue-500">(you)</span>}
                        </span>
                        {mr.isReady
                          ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><Check className="w-3.5 h-3.5" /> Ready</span>
                          : <span className="text-xs text-slate-400">Waiting…</span>
                        }
                      </div>
                    ))}
                  </div>

                  {!isReady && (
                    <button onClick={markReady} disabled={markingReady}
                      className="flex items-center gap-2 mx-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer">
                      {markingReady && <Loader2 className="w-4 h-4 animate-spin" />}
                      I&apos;m Ready
                    </button>
                  )}
                  {isReady && (
                    <p className="text-sm text-green-600 font-medium flex items-center gap-1.5 justify-center">
                      <Check className="w-4 h-4" /> You&apos;re ready — waiting for others…
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ACTIVE STATE */}
            {round.status === 'active' && totalQ > 0 && (
              <div>
                {/* Progress bar + timer */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(answeredCount / totalQ) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 flex-shrink-0">{answeredCount}/{totalQ} answered</span>
                  {timeLeft !== null && (
                    <span className={`text-sm font-mono font-semibold flex-shrink-0 ${timeLeft < 30 ? 'text-red-600' : 'text-slate-700'}`}>
                      <Clock className="w-3.5 h-3.5 inline mr-1" />{formatTime(timeLeft)}
                    </span>
                  )}
                </div>

                {/* Question navigation */}
                <div className="flex gap-1.5 flex-wrap mb-6">
                  {round.questions.map((rq, i) => {
                    const answered = !!(rq.myAnswer || pendingAnswers[rq.id])
                    return (
                      <button key={rq.id} onClick={() => setCurrentQ(i)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          i === currentQ
                            ? 'bg-blue-600 text-white'
                            : answered
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                        {i + 1}
                      </button>
                    )
                  })}
                </div>

                {/* Current question */}
                {(() => {
                  const rq = round.questions[currentQ]
                  if (!rq) return null
                  const myChoiceId = rq.myAnswer?.choiceId ?? pendingAnswers[rq.id]
                  const isAnswered = !!myChoiceId

                  return (
                    <div className="max-w-2xl">
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {currentQ + 1}
                            </span>
                            <div className="text-sm font-medium text-slate-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: rq.question.questionText }} />
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          {rq.question.choices.map((choice) => {
                            const isSelected = myChoiceId === choice.id
                            return (
                              <button key={choice.id} onClick={() => !isAnswered && selectChoice(rq, choice.id)}
                                disabled={isAnswered || submitting === rq.id}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                                  isAnswered
                                    ? isSelected
                                      ? 'border-blue-400 bg-blue-50 cursor-default'
                                      : 'border-slate-200 text-slate-400 cursor-default'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                                }`}>
                                {submitting === rq.id && !isAnswered && (
                                  <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
                                )}
                                <span className="text-sm">{choice.choiceText}</span>
                                {isSelected && <Check className="w-4 h-4 text-blue-600 ml-auto flex-shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Prev / Next */}
                      <div className="flex justify-between mt-4">
                        <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer">
                          <ChevronLeft className="w-4 h-4" />Previous
                        </button>
                        <button onClick={() => setCurrentQ(q => Math.min(totalQ - 1, q + 1))} disabled={currentQ === totalQ - 1}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer">
                          Next<ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* FINISHED STATE */}
            {round.status === 'finished' && (
              <div className="max-w-2xl">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-semibold text-slate-900">Results — Round {round.roundNumber}</h2>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {round.results.map(r => (
                      <div key={r.id} className={`flex items-center gap-4 px-6 py-4 ${r.userId === userId ? 'bg-blue-50/50' : ''}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                          r.rank === 1 ? 'bg-amber-100 text-amber-700' :
                          r.rank === 2 ? 'bg-slate-100 text-slate-600' :
                          r.rank === 3 ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-50 text-slate-400'
                        }`}>
                          {r.rank === 1 ? <Crown className="w-4 h-4" /> : `#${r.rank}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {r.user?.name || "Anonymous"}
                            {r.userId === userId && <span className="ml-1.5 text-xs text-blue-500 font-normal">(you)</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{r.score}</p>
                          <p className="text-xs text-slate-400">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question review */}
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">Question review</h2>
                <div className="space-y-3">
                  {round.questions.map((rq, idx) => {
                    const myChoiceId = rq.myAnswer?.choiceId
                    const myChoice = rq.question.choices.find(c => c.id === myChoiceId)
                    const correct = rq.question.choices.find(c => c.isCorrect)
                    const wasCorrect = myChoice?.isCorrect

                    return (
                      <div key={rq.id} className={`bg-white border rounded-xl overflow-hidden ${
                        wasCorrect ? 'border-green-200' : myChoiceId ? 'border-red-200' : 'border-slate-200'
                      }`}>
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                          <div className="text-sm font-medium text-slate-900 flex-1" dangerouslySetInnerHTML={{ __html: rq.question.questionText }} />
                          {wasCorrect
                            ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            : myChoiceId
                            ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            : <span className="text-xs text-slate-400 flex-shrink-0">No answer</span>
                          }
                        </div>
                        <div className="px-4 py-3 space-y-1.5">
                          {rq.question.choices.map((c) => (
                            <div key={c.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${
                              c.isCorrect ? 'bg-green-50 text-green-800' :
                              c.id === myChoiceId && !c.isCorrect ? 'bg-red-50 text-red-700' :
                              'text-slate-500'
                            }`}>
                              <span className="flex-1">{c.choiceText}</span>
                              {c.isCorrect && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                              {c.id === myChoiceId && !c.isCorrect && <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6">
                  <button onClick={() => router.push(`/quiz/rooms/${roomId}`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Room
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
