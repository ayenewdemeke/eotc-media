import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminBookApprovalStatusesPage() {
  return (
    <LookupAdminPage
      title="Approval statuses"
      description="Statuses a book can move through during review."
      noun="approval status"
      apiBase="/api/books/admin/approval-statuses"
      editable={false}
    />
  )
}
