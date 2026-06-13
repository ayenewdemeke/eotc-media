import { prisma } from "@/lib/prisma"
import { PageHeader } from "@/components/admin/shared/PageHeader"
import { StatsCard } from "@/components/admin/shared/StatsCard"
import { BookOpen, Clock, CheckCircle2, XCircle } from "lucide-react"

export default async function BookAdminDashboard() {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.cbBook.count(),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Submitted" } } }),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Accepted" } } }),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Declined" } } }),
  ])

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader title="Dashboard" description="Overview of book submissions." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard title="Total books" value={total} icon={BookOpen} />
        <StatsCard title="Pending" value={pending} icon={Clock} />
        <StatsCard title="Approved" value={approved} icon={CheckCircle2} />
        <StatsCard title="Rejected" value={rejected} icon={XCircle} />
      </div>
    </div>
  )
}
