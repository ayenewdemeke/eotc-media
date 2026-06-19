import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminShell, type AdminNavItem } from "@/components/admin/shared/AdminShell"
import { hasSermonAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const BASE = "/sermons/admin"
const nav: AdminNavItem[] = [
  { title: "Dashboard", href: BASE, icon: "dashboard", exact: true },
  { title: "New sermons", href: `${BASE}/sermons?status=pending`, icon: "messageSquare", status: "pending" },
  { title: "All sermons", href: `${BASE}/sermons`, icon: "messageSquare", status: "none" },
  { title: "Languages", href: `${BASE}/languages`, icon: "globe" },
  { title: "Categories", href: `${BASE}/categories`, icon: "tag" },
  { title: "Sub categories", href: `${BASE}/sub-categories`, icon: "layers" },
  { title: "Approval status", href: `${BASE}/approval-statuses`, icon: "checkSquare" },
]

export default async function SermonAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")
  if (!hasSermonAdminAccess(session)) redirect("/")

  return (
    <AdminShell
      brandTitle="Sermon admin"
      brandSubtitle="Management panel"
      brandIcon="messageSquare"
      nav={nav}
      backHref="/sermons"
      backLabel="Back to Sermons"
    >
      {children}
    </AdminShell>
  )
}
