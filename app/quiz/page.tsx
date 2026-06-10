import type { Metadata } from "next"
import { auth } from "@/auth"
import { getQuestionsFilterData } from "@/lib/api/quiz"
import Navbar from "@/components/Navbar"
import QuizSidebar from "@/components/quiz/QuizSidebar"
import QuizBatchClient from "@/components/quiz/QuizBatchClient"

export const metadata: Metadata = {
  title: "Amharic Bible Quiz — Test Your Knowledge | የመጽሐፍ ቅዱስ ጥያቄዎች",
  description:
    "Test your knowledge of the Bible and the Ethiopian Orthodox Tewahedo faith with Amharic quiz questions — " +
    "practice alone or compete in quiz rooms. " +
    "የመጽሐፍ ቅዱስ እና የኦርቶዶክስ ተዋሕዶ እምነት ጥያቄዎች በአማርኛ — ብቻዎን ይለማመዱ ወይም በውድድር ይሳተፉ።",
  keywords: [
    "Amharic Bible quiz", "Ethiopian Orthodox quiz", "Bible trivia Amharic", "EOTC quiz",
    "የመጽሐፍ ቅዱስ ጥያቄዎች", "የመጽሐፍ ቅዱስ ጥያቄና መልስ", "መንፈሳዊ ጥያቄዎች",
  ],
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "Amharic Bible Quiz — Test Your Knowledge | የመጽሐፍ ቅዱስ ጥያቄዎች",
    description: "Bible and EOTC faith quiz questions in Amharic. የመጽሐፍ ቅዱስ ጥያቄዎች በአማርኛ።",
    url: "/quiz",
  },
}

export default async function QuizPage() {
  const session = await auth()
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined

  const { categories, subCategories, languages, difficulties } = await getQuestionsFilterData()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-full mx-auto lg:grid lg:grid-cols-[220px_1fr]">
          <QuizSidebar userId={userId} />
          <main className="min-w-0 px-4 sm:px-6 lg:px-8 py-6">
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
