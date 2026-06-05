import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminShell, type AdminNavItem } from "@/components/admin/shared/AdminShell"
import { hasHymnAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const BASE = "/hymns/admin"
const nav: AdminNavItem[] = [
  { title: "Dashboard", href: BASE, icon: "dashboard", exact: true },
  { title: "New hymns", href: `${BASE}/hymns?status=pending`, icon: "mic", status: "pending" },
  { title: "Lyrics suggestions", href: `${BASE}/lyrics-suggestions`, icon: "fileText" },
  { title: "All hymns", href: `${BASE}/hymns`, icon: "music", status: "none" },
  { title: "Languages", href: `${BASE}/languages`, icon: "globe" },
  { title: "Categories", href: `${BASE}/categories`, icon: "tag" },
  { title: "Sub categories", href: `${BASE}/sub-categories`, icon: "layers" },
  { title: "Approval status", href: `${BASE}/approval-statuses`, icon: "checkSquare" },
]

export default async function HymnAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")
  if (!hasHymnAdminAccess(session)) redirect("/")

  return (
    <AdminShell
      brandTitle="Hymn admin"
      brandSubtitle="Management panel"
      brandIcon="music"
      nav={nav}
      backHref="/hymns"
      backLabel="Back to Hymns"
    >
      {children}
    </AdminShell>
  )
}
