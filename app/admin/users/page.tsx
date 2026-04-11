import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      roles: { select: { role: { select: { name: true } } } },
    },
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-neutral-500" />
        <h1 className="text-xl font-bold text-neutral-900">Users</h1>
        <span className="ml-1 text-sm text-neutral-400">({users.length})</span>
      </div>

      <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Roles</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {users.map(u => {
              const roleNames = u.roles.map(r => r.role.name)
              return (
                <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 flex-shrink-0">
                        {(u.name || u.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800 truncate">{u.name || "—"}</p>
                        <p className="text-xs text-neutral-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {roleNames.length === 0 && <span className="text-xs text-neutral-400">—</span>}
                      {roleNames.map(r => (
                        <span key={r} className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-md">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
