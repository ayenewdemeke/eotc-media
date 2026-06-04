import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminSermonPreachersPage() {
  return (
    <LookupAdminPage
      title="Preachers"
      description="Manage the list of preachers."
      noun="preacher"
      apiBase="/api/sermons/admin/preachers"
    />
  )
}
