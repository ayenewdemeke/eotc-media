import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AdminShell, type AdminNavItem } from "@/components/admin/shared/AdminShell"
import { hasQuizAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

const BASE = "/quiz/admin"
const nav: AdminNavItem[] = [
  { title: "Dashboard", href: BASE, icon: "dashboard", exact: true },
  { title: "New questions", href: `${BASE}/questions?status=pending`, icon: "helpCircle", status: "pending" },
  { title: "All questions", href: `${BASE}/questions`, icon: "helpCircle", status: "none" },
  { title: "Languages", href: `${BASE}/languages`, icon: "globe" },
  { title: "Categories", href: `${BASE}/categories`, icon: "tag" },
  { title: "Sub categories", href: `${BASE}/sub-categories`, icon: "layers" },
  { title: "Difficulties", href: `${BASE}/difficulties`, icon: "award" },
  { title: "Question types", href: `${BASE}/question-types`, icon: "bookType" },
  { title: "Approval statuses", href: `${BASE}/approval-statuses`, icon: "checkSquare" },
]

export default async function QuizAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")
  if (!hasQuizAdminAccess(session)) redirect("/")

  return (
    <AdminShell
      brandTitle="Quiz admin"
      brandSubtitle="Management panel"
      brandIcon="helpCircle"
      nav={nav}
      backHref="/quiz"
      backLabel="Back to Quiz"
    >
      {children}
    </AdminShell>
  )
}
