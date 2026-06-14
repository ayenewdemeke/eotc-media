import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminQuestionTypesPage() {
  return (
    <LookupAdminPage
      title="Question types"
      description="Types of quiz questions (e.g. Multiple Choice, True/False)."
      noun="question type"
      apiBase="/api/quiz/admin/question-types"
    />
  )
}
