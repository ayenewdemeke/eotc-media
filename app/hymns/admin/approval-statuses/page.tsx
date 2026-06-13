import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminApprovalStatusesPage() {
  return (
    <LookupAdminPage
      title="Approval statuses"
      description="Statuses a hymn can move through during review."
      noun="approval status"
      apiBase="/api/hymns/admin/approval-statuses"
      editable={false}
    />
  )
}
