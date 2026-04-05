import { prisma } from "@/lib/prisma"

export default async function BookAdminDashboard() {
  const [total, pending, approved, rejected] = await Promise.all([
    prisma.cbBook.count(),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Submitted" } } }),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Accepted" } } }),
    prisma.cbBook.count({ where: { approvalStatus: { name: "Declined" } } }),
  ])

  const stats = [
    { label: "Total books", value: total, color: "bg-blue-50 text-blue-700" },
    { label: "Pending", value: pending, color: "bg-amber-50 text-amber-700" },
    { label: "Approved", value: approved, color: "bg-green-50 text-green-700" },
    { label: "Rejected", value: rejected, color: "bg-red-50 text-red-700" },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-5 ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
