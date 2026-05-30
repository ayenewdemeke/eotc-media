import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { LiturgyAdminSidebar } from "@/components/admin/liturgy/LiturgyAdminSidebar"
import { AdminHeader } from "@/components/admin/shared/AdminHeader"
import { hasLiturgyAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

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
    <SidebarProvider>
      <LiturgyAdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
