import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminShell, type AdminNavItem } from "@/components/admin/shared/AdminShell"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const BASE = "/liturgy/admin"
const nav: AdminNavItem[] = [
  { title: "Dashboard", href: BASE, icon: "dashboard", exact: true },
  { title: "Sections", href: `${BASE}/sections`, icon: "layers" },
  { title: "Roles", href: `${BASE}/roles`, icon: "users" },
  { title: "Texts", href: `${BASE}/texts`, icon: "fileText" },
]

export default async function LiturgyAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  if (!hasLiturgyAdminAccess(session)) {
    redirect("/")
  }

  return (
    <AdminShell
      brandTitle="Liturgy admin"
      brandSubtitle="Management panel"
      brandIcon="bookOpen"
      nav={nav}
      backHref="/"
      backLabel="Back to site"
    >
      {children}
    </AdminShell>
  )
}
