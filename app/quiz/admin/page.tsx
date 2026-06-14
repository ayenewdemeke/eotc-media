"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HelpCircle, Clock, CheckCircle, XCircle, Globe, Tag, Award } from "lucide-react"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { StatsCard } from "@/components/admin/shared/StatsCard"
import { Card, CardContent } from "@/components/ui/card"

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
    { label: "Total questions", value: stats?.total ?? "—", icon: HelpCircle, href: "/quiz/admin/questions" },
    { label: "Pending review", value: stats?.pending ?? "—", icon: Clock, href: "/quiz/admin/questions?status=pending" },
    { label: "Approved", value: stats?.approved ?? "—", icon: CheckCircle, href: "/quiz/admin/questions" },
    { label: "Declined", value: stats?.declined ?? "—", icon: XCircle, href: "/quiz/admin/questions" },
  ]

  const quickLinks = [
    { label: "Manage languages", href: "/quiz/admin/languages", icon: Globe },
    { label: "Manage categories", href: "/quiz/admin/categories", icon: Tag },
    { label: "Manage difficulties", href: "/quiz/admin/difficulties", icon: Award },
  ]

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Quiz admin dashboard" description="Overview of quiz questions and quick links." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map(card => (
          <Link key={card.label} href={card.href} className="transition-transform hover:-translate-y-0.5">
            <StatsCard title={card.label} value={card.value} icon={card.icon} />
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-label">Quick links</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map(link => (
            <Link key={link.label} href={link.href}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{link.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
