import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { auth } from "@/auth";
import { BookOpen, BookMarked, Music, MessageSquare, Mic, ArrowRight } from "lucide-react";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();
  const user = session?.user ? {
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image || null,
    roles: session.user.roles || []
  } : null;

  const features = [
    {
      icon: BookOpen,
      title: "መጽሃፍ ቅዱስ",
      titleEn: "Bible",
      description: "መጽሃፍ ቅዱስ በተለያዩ ቋንቋዎች: አማርኛ፣ እንግሊዝኛ፣ ኦሮምኛ፣ ትግርኛ፣ እና ሌሎችም",
      descriptionEn: "The Bible in different languages: Amharic, English, Afaan Oromo, Tigrigna, and more",
      href: "/bible/amharic/1954/1/1",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Mic,
      title: "ቅዳሴ",
      titleEn: "Liturgy",
      description: "የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን የቅዳሴ ስርዓቶች",
      descriptionEn: "Ethiopian Orthodox Tewahedo Church liturgical services",
      href: "/liturgy",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: BookMarked,
      title: "መጻህፍት",
      titleEn: "Books",
      description: "በቀደሙ የቤተክርስትያን አባቶችና በአሁኑ ዘመን የተጻፉ የቤተ ክርስቲያን መጻህፍት",
      descriptionEn: "Books by early church fathers and contemporary church teachers",
      href: "/books",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Music,
      title: "መዝሙራት",
      titleEn: "Hymns",
      description: "የሚፈልጉትን መዝሙር በቀላሉ ለማግኘት በሚያስችል መንገድ የቀረቡ መንፈሳዊ መዝሙራት",
      descriptionEn: "Spiritual hymns organized for easy access",
      href: "/hymns",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    {
      icon: MessageSquare,
      title: "ስብከቶች",
      titleEn: "Sermons",
      description: "የቀረቡ መንፈሳዊ ስብከቶችን በቀላሉ ለማግኘት የተዘጋጀ የስብከቶች ማውጫ",
      descriptionEn: "Spiritual sermons organized for easy access",
      href: "/sermons",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600"
    },
  ];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50 pt-20 pb-12">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Image */}
          <div className="relative mb-8 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/ui/header.jpg"
              alt="EOTC Media"
              width={1200}
              height={300}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '280px' }}
              unoptimized
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን
              <br />
              <span className="text-gray-700">የሚዲያ ውጤቶች</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Ethiopian Orthodox Tewahedo Church Media Resources
            </p>

            <div className="max-w-[1320px] mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  በዚህ ድረ ገጽ <strong>የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያንና የሌሎች ኦሬንታል አብያተ ክርስቲያናት</strong> የሚዲያ ውጤቶችን መጽሃፍ ቅዱስን ጨምሮ የተለያዩ መጻህፍትን፣ መዝሙራት፣ ስብከቶች እና
                  ሌሎችንም ያገኛሉ። በተጨማሪም{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium underline">አካውንት በመክፈት</Link> እርስዎ ያለዎትን መንፈሳዊ ስራዎች ለሌሎች ማጋራት ይችላሉ።
                </p>
                <p className="text-gray-700 leading-relaxed">
                  On this website, media resources of the <strong>Ethiopian Orthodox Tewahedo (EOTC) and other Oriental Orthodox Churches</strong> are provided, including the Bible, various books, hymns, sermons, and more. You can also{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium underline">open an account</Link> and share your spiritual resources with others.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative p-6 sm:p-8">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  {feature.titleEn}
                </p>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">
                  {feature.descriptionEn}
                </p>

                {/* Arrow */}
                <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-2 transition-transform duration-300">
                  <span>Explore</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Join our community
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Share your spiritual resources with others and contribute to the Ethiopian Orthodox Tewahedo Church community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Create account
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors"
              >
                Contact us
              </Link>
              <a
                href="https://github.com/eotc-media/eotc-media"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contribute on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
