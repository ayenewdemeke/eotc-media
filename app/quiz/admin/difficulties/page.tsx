import { LookupAdminPage } from "@/components/admin/shared/LookupAdminPage"

export default function AdminDifficultiesPage() {
  return (
    <LookupAdminPage
      title="Difficulties"
      description="Difficulty levels for quiz questions (e.g. Easy, Medium, Hard)."
      noun="difficulty"
      apiBase="/api/quiz/admin/difficulties"
    />
  )
}
