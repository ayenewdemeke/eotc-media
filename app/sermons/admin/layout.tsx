import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SermonAdminSidebar } from "@/components/admin/sermons/SermonAdminSidebar"
import { hasSermonAdminAccess } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"

export default async function SermonAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/auth/login")
  if (!hasSermonAdminAccess(session)) redirect("/")

  return (
    <SidebarProvider>
      <SermonAdminSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
