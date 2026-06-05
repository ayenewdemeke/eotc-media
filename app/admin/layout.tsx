import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminShell, type AdminNavItem } from "@/components/admin/shared/AdminShell"
import { hasMainAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const BASE = "/admin"
const nav: AdminNavItem[] = [
  { title: "Dashboard", href: `${BASE}/dashboard`, icon: "dashboard" },
  { title: "Users", href: `${BASE}/users`, icon: "users" },
  { title: "Feedbacks", href: `${BASE}/feedbacks`, icon: "messageSquare" },
  { title: "Featured Items", href: `${BASE}/featured`, icon: "star" },
  { title: "Verse Corrections", href: `${BASE}/verse-corrections`, icon: "bookOpen" },
]

export default async function MainAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (!hasMainAdminAccess(session)) redirect("/")

  return (
    <AdminShell
      brandTitle="Main admin"
      brandSubtitle="Site management"
      brandIcon="dashboard"
      nav={nav}
      backHref="/"
      backLabel="Back to Home"
    >
      {children}
    </AdminShell>
  )
}
