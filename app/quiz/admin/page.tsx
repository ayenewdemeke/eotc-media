"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HelpCircle, Clock, CheckCircle, XCircle, Globe, Tag, Award } from "lucide-react"

interface Stats {
  total: number
  pending: number
  approved: number
  declined: number
}

export default function QuizAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/quiz/admin/questions").then(r => r.json()),
      fetch("/api/quiz/admin/approval-statuses").then(r => r.json()),
    ]).then(([allQ, statuses]) => {
      const submittedId = statuses.find((s: { id: number; name: string }) =>
        s.name.toLowerCase().includes("submit"))?.id
      const approvedId = statuses.find((s: { id: number; name: string }) =>
        s.name.toLowerCase().includes("approv"))?.id
      const declinedId = statuses.find((s: { id: number; name: string }) =>
        s.name.toLowerCase().includes("declin"))?.id

      setStats({
        total: allQ.total ?? 0,
        pending: 0,
        approved: 0,
        declined: 0,
      })

      // Fetch each status count
      Promise.all([
        submittedId ? fetch(`/api/quiz/admin/questions?status=${submittedId}`).then(r => r.json()) : Promise.resolve({ total: 0 }),
        approvedId ? fetch(`/api/quiz/admin/questions?status=${approvedId}`).then(r => r.json()) : Promise.resolve({ total: 0 }),
        declinedId ? fetch(`/api/quiz/admin/questions?status=${declinedId}`).then(r => r.json()) : Promise.resolve({ total: 0 }),
      ]).then(([pend, appr, decl]) => {
        setStats({
          total: allQ.total ?? 0,
          pending: pend.total ?? 0,
          approved: appr.total ?? 0,
          declined: decl.total ?? 0,
        })
      })
    })
  }, [])

  const cards = [
    { label: "Total questions", value: stats?.total ?? "—", icon: HelpCircle, color: "text-blue-600", bg: "bg-blue-50", href: "/quiz/admin/questions" },
    { label: "Pending review", value: stats?.pending ?? "—", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", href: "/quiz/admin/questions?status=pending" },
    { label: "Approved", value: stats?.approved ?? "—", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", href: "/quiz/admin/questions" },
    { label: "Declined", value: stats?.declined ?? "—", icon: XCircle, color: "text-red-600", bg: "bg-red-50", href: "/quiz/admin/questions" },
  ]

  const quickLinks = [
    { label: "Manage languages", href: "/quiz/admin/languages", icon: Globe },
    { label: "Manage categories", href: "/quiz/admin/categories", icon: Tag },
    { label: "Manage difficulties", href: "/quiz/admin/difficulties", icon: Award },
  ]

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Quiz admin dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} href={card.href}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{String(card.value)}</div>
            <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickLinks.map(link => (
          <Link key={link.label} href={link.href}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all">
            <link.icon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
