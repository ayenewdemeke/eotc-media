import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Heart, BookOpen, ChevronLeft, Bookmark } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function FavoritesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <>
      <Navbar />
      <div className="pt-14 min-h-screen">
        <div className="max-w-lg mx-auto px-4 py-10">
          {/* Back link */}
          <Link
            href="/liturgy"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Back to Liturgy
          </Link>

          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="h-6 w-6 text-gray-400" />
            </div>

            <h1 className="text-xl font-semibold mb-2">Favorites</h1>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              This feature is coming soon. You will be able to save and quickly access your most referenced liturgical texts.
            </p>

            <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto text-xs text-left mb-8">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500">
                <Heart className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                Save favorites
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500">
                <BookOpen className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                Quick access
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500">
                <Bookmark className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                Collections
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500">
                <Heart className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                Organize
              </div>
            </div>

            <Link
              href="/liturgy"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <BookOpen className="h-4 w-4" />
              Browse Liturgy
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
