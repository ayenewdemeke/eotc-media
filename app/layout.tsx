import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/app/providers";
import FeedbackWidget from "@/components/FeedbackWidget";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, jsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EOTC Media — Amharic Bible, Mezmur, Sermons & Spiritual Books | መጽሐፍ ቅዱስ፣ መዝሙር፣ ስብከት",
    template: "%s | EOTC Media",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "EOTC Media — Amharic Bible, Mezmur, Sermons & Spiritual Books",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["am_ET"],
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "EOTC Media" }],
  },
  twitter: {
    card: "summary",
    title: "EOTC Media — Amharic Bible, Mezmur, Sermons & Spiritual Books",
    description: SITE_DESCRIPTION,
    images: ["/icons/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon.png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EOTC Media",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE_NAME,
              alternateName: "Ethiopian Orthodox Tewahedo Church Media | የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን ሚዲያ",
              url: SITE_URL,
              logo: `${SITE_URL}/icons/icon-512x512.png`,
              description: SITE_DESCRIPTION,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: SITE_NAME,
              alternateName: "ኢኦተቤ ሚዲያ",
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              inLanguage: ["en", "am", "om", "ti"],
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/hymns?search={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Providers>
          {children}
          <FeedbackWidget />
        </Providers>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-B0Y3CWSP7X"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B0Y3CWSP7X');
          `}
        </Script>
      </body>
    </html>
  );
}
