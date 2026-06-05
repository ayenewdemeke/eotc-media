import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminShell, type AdminNavItem } from "@/components/admin/shared/AdminShell"
import { hasBookAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const BASE = "/books/admin"
const nav: AdminNavItem[] = [
  { title: "Dashboard", href: BASE, icon: "dashboard", exact: true },
  { title: "New books", href: `${BASE}/books?status=pending`, icon: "bookOpen", status: "pending" },
  { title: "All books", href: `${BASE}/books`, icon: "bookMarked", status: "none" },
  { title: "Languages", href: `${BASE}/languages`, icon: "globe" },
  { title: "Categories", href: `${BASE}/categories`, icon: "tag" },
  { title: "Sub categories", href: `${BASE}/sub-categories`, icon: "layers" },
  { title: "Authors", href: `${BASE}/authors`, icon: "user" },
  { title: "Approval status", href: `${BASE}/approval-statuses`, icon: "checkSquare" },
]

export default async function BookAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (!hasBookAdminAccess(session)) redirect("/")

  return (
    <AdminShell
      brandTitle="Book admin"
      brandSubtitle="Management panel"
      brandIcon="bookMarked"
      nav={nav}
      backHref="/books"
      backLabel="Back to Books"
    >
      {children}
    </AdminShell>
  )
}
