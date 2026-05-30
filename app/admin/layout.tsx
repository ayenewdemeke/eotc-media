import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MainAdminSidebar } from "@/components/admin/main/MainAdminSidebar"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { hasMainAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function MainAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")
  if (!hasMainAdminAccess(session)) redirect("/")

  return (
    <SidebarProvider>
      <MainAdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
