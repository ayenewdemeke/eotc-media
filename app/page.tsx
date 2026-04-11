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
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
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

      {/* Hero Section — full-bleed image with text overlay */}
      <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[500px] overflow-hidden">
        <Image
          src="/images/ui/header.jpg"
          alt="EOTC Media"
          fill
          className="object-cover object-center"
          unoptimized
          priority
        />
        {/* Multi-stop gradient: dark at bottom, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

        {/* Centered text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 sm:pb-14 px-4 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug drop-shadow mb-2">
            የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያን የሚዲያ ውጤቶች
          </h1>
          <p className="text-sm sm:text-base text-white/75 font-medium tracking-wide">
            Ethiopian Orthodox Tewahedo Church Media Resources
          </p>
        </div>
      </div>

      {/* Intro strip */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-7 text-center space-y-2">
          <p className="text-sm sm:text-[15px] text-neutral-600 leading-relaxed">
            በዚህ ድረ ገጽ <strong className="text-neutral-800">የኢትዮጵያ ኦርቶዶክስ ተዋህዶ ቤተክርስቲያንና የሌሎች ኦሬንታል አብያተ ክርስቲያናት</strong> የሚዲያ ውጤቶችን — መጽሃፍ ቅዱስ፣ መጻህፍት፣ መዝሙራት፣ ስብከቶች — ያገኛሉ።{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">አካውንት በመክፈት</Link> መንፈሳዊ ስራዎችዎን ለሌሎች ማጋራት ይችላሉ።
          </p>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Bible, books, hymns, sermons and more from the EOTC and Oriental Orthodox Churches.{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">Sign in</Link> to contribute.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
      <div className="bg-neutral-900 py-14">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Join our community
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Share your spiritual resources with others and contribute to the Ethiopian Orthodox Tewahedo Church community
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!user && (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-7 py-2.5 bg-white text-neutral-900 rounded-lg font-semibold text-sm hover:bg-neutral-100 transition-colors"
                >
                  Create account
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-7 py-2.5 bg-neutral-800 text-neutral-200 rounded-lg font-semibold text-sm hover:bg-neutral-700 transition-colors border border-neutral-700"
              >
                Contact us
              </Link>
              <a
                href="https://github.com/ayenewdemeke/eotc-media"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-7 py-2.5 bg-transparent text-neutral-400 rounded-lg font-semibold text-sm border border-neutral-700 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
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
