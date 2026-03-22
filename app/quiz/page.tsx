import type { Metadata } from "next"
import { auth } from "@/auth"
import { getQuestionsFilterData } from "@/lib/api/quiz"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import QuizBatchClient from "@/components/quiz/QuizBatchClient"

export const metadata: Metadata = {
  title: "Quiz — EOTC Media",
  description: "Test your knowledge of Ethiopian Orthodox Tewahedo Church faith with quiz questions.",
}

export default async function QuizPage() {
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const { categories, subCategories, languages, difficulties } = await getQuestionsFilterData()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-[1320px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-5">
              <h1 className="text-xl font-semibold text-slate-900">Quiz</h1>
              <p className="text-sm text-slate-400 mt-0.5">Filter questions and test your knowledge</p>
            </div>
            <QuizBatchClient
              categories={categories}
              subCategories={subCategories}
              languages={languages}
              difficulties={difficulties}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
