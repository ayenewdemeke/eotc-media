import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminSermonApprovalStatusesPage() {
  return (
    <LookupAdminPage
      title="Approval statuses"
      description="Statuses a sermon can move through during review."
      noun="approval status"
      apiBase="/api/sermons/admin/approval-statuses"
      editable={false}
    />
  )
}
