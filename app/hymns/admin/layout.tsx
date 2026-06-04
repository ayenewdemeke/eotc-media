import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { HymnAdminSidebar } from "@/components/admin/hymns/HymnAdminSidebar"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { hasHymnAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function HymnAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")
  if (!hasHymnAdminAccess(session)) redirect("/")

  return (
    <SidebarProvider className="admin-theme">
      <HymnAdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
