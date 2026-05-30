import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/admin/shared/StatsCard"
import { Layers, Users, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

async function getStats() {
  const [sectionsCount, rolesCount, textsCount] = await Promise.all([
    prisma.ltSection.count(),
    prisma.ltRole.count(),
    prisma.ltLiturgicalText.count(),
  ])

  return {
    sections: sectionsCount,
    roles: rolesCount,
    texts: textsCount,
  }
}

export default async function LiturgyAdminDashboard() {
  const stats = await getStats()

  return (
    <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Liturgy admin panel. Manage sections, roles, and texts.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Sections"
            value={stats.sections}
            description="Total liturgical sections"
            icon={Layers}
          />
          <StatsCard
            title="Roles"
            value={stats.roles}
            description="Liturgical participant roles"
            icon={Users}
          />
          <StatsCard
            title="Texts"
            value={stats.texts}
            description="Total liturgical texts"
            icon={FileText}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick actions</h3>
            <div className="space-y-2">
              <a
                href="/liturgy/admin/sections/new"
                className="block p-3 rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium">Add new section</div>
                <div className="text-sm text-muted-foreground">
                  Create a new liturgical section
                </div>
              </a>
              <a
                href="/liturgy/admin/roles/new"
                className="block p-3 rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium">Add new role</div>
                <div className="text-sm text-muted-foreground">
                  Define a new liturgical role
                </div>
              </a>
              <a
                href="/liturgy/admin/texts/new"
                className="block p-3 rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium">Add new text</div>
                <div className="text-sm text-muted-foreground">
                  Add new liturgical text content
                </div>
              </a>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">About liturgy module</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The Liturgy module manages Ethiopian Orthodox liturgical content including
                the various sections (anaphoras and their parts) and their texts.
              </p>
              <p>
                <strong>Sections:</strong> Liturgical sections including anaphoras and
                their parts (e.g., Preface, Sanctus)
              </p>
              <p>
                <strong>Roles:</strong> Who recites each text (Priest, Deacon, People)
              </p>
              <p>
                <strong>Texts:</strong> The actual liturgical content in multiple
                languages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
