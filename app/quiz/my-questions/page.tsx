import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getQuestions } from "@/lib/api/quiz"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import QuizMyList from "@/components/quiz/QuizMyList"

export const metadata: Metadata = { title: "My questions — EOTC Media" }

const PAGE_SIZE = 24

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function MyQuestionsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")
  const userId = parseInt(session.user.id)

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1)

  const { questions, total } = await getQuestions({ page, limit: PAGE_SIZE, userId, view: "my-questions" })
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            <QuizMyList
              questions={questions}
              total={total}
              page={page}
              totalPages={totalPages}
              baseUrl="/quiz/my-questions"
            />
          </main>
        </div>
      </div>
    </div>
  )
}
