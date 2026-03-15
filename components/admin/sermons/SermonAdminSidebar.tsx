"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  Globe,
  Tag,
  Layers,
  CheckSquare,
  Home,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const BASE = "/sermons/admin"

const menuItems = [
  { title: "Dashboard", href: BASE, icon: LayoutDashboard },
  { title: "New Sermons", href: `${BASE}/sermons?status=pending`, icon: MessageSquare },
  { title: "All Sermons", href: `${BASE}/sermons`, icon: MessageSquare },
  { title: "Languages", href: `${BASE}/languages`, icon: Globe },
  { title: "Categories", href: `${BASE}/categories`, icon: Tag },
  { title: "Sub Categories", href: `${BASE}/sub-categories`, icon: Layers },
  { title: "Approval Status", href: `${BASE}/approval-statuses`, icon: CheckSquare },
]

export function SermonAdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (href: string) => {
    if (href === BASE) return pathname === BASE
    if (href === `${BASE}/sermons?status=pending`) {
      return pathname === `${BASE}/sermons` && searchParams.get("status") === "pending"
    }
    if (href === `${BASE}/sermons`) {
      return pathname === `${BASE}/sermons` && searchParams.get("status") !== "pending"
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Sermon Admin</span>
            <span className="text-xs text-muted-foreground">Management panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/sermons">
                <Home className="h-4 w-4" />
                <span>Back to Sermons</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
