import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminApprovalStatusesPage() {
  return (
    <LookupAdminPage
      title="Approval statuses"
      description="Statuses a quiz question can move through (e.g. Submitted, Approved, Declined)."
      noun="approval status"
      apiBase="/api/quiz/admin/approval-statuses"
    />
  )
}
