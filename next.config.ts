import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async redirects() {
    return [
      // ── Hymns ──────────────────────────────────────────────────────────────
      // Individual hymn page (most SEO-critical)
      {
        source: '/hymn/hymns/watch/:slug',
        destination: '/hymns/:slug',
        permanent: true,
      },
      // Hymns section root
      {
        source: '/hymn',
        destination: '/hymns',
        permanent: true,
      },
      // Filtered listing: /hymn/hymns/lan/x/cat/y/subcat/z
      {
        source: '/hymn/hymns/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/hymns',
        permanent: true,
      },
      // Play-all (generic)
      {
        source: '/hymn/hymns/play-all/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/hymns/play-all',
        permanent: true,
      },
      // Play-all by singer
      {
        source: '/hymn/hymns/play-all/singer/:singer/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/hymns/play-all',
        permanent: true,
      },
      // Singer-filtered listing
      {
        source: '/hymn/hymns/singers/:singer/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/hymns',
        permanent: true,
      },
      // Channels
      {
        source: '/hymn/channels',
        destination: '/hymns/channels',
        permanent: true,
      },
      {
        source: '/hymn/channels/:id',
        destination: '/hymns/channels/:id',
        permanent: true,
      },

      // ── Sermons ────────────────────────────────────────────────────────────
      // Individual sermon page (most SEO-critical)
      {
        source: '/sermon/sermons/watch/:slug',
        destination: '/sermons/:slug',
        permanent: true,
      },
      // Sermons section root
      {
        source: '/sermon',
        destination: '/sermons',
        permanent: true,
      },
      // Filtered listing
      {
        source: '/sermon/sermons/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/sermons',
        permanent: true,
      },
      // Play-all (generic)
      {
        source: '/sermon/sermons/play-all/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/sermons/play-all',
        permanent: true,
      },
      // Play-all by preacher
      {
        source: '/sermon/sermons/play-all/preacher/:preacher/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/sermons/play-all',
        permanent: true,
      },
      // Preacher-filtered listing
      {
        source: '/sermon/sermons/preachers/:preacher/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/sermons',
        permanent: true,
      },
      // Channels
      {
        source: '/sermon/channels',
        destination: '/sermons/channels',
        permanent: true,
      },
      {
        source: '/sermon/channels/:id',
        destination: '/sermons/channels/:id',
        permanent: true,
      },

      // ── Books ──────────────────────────────────────────────────────────────
      // Individual book page (most SEO-critical)
      {
        source: '/book/books/show/:slug',
        destination: '/books/:slug',
        permanent: true,
      },
      // Books section root
      {
        source: '/book',
        destination: '/books',
        permanent: true,
      },
      // Filtered listing
      {
        source: '/book/books/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/books',
        permanent: true,
      },
      // Author-filtered listing
      {
        source: '/book/books/authors/:author',
        destination: '/books',
        permanent: true,
      },

      // ── Bible ──────────────────────────────────────────────────────────────
      // Chapter URL: old path had literal "book" and "chapter" segments
      // Old: /bible/:lang/:version/book/:book/chapter/:chapter
      // New: /bible/:lang/:version/:book/:chapter
      {
        source: '/bible/:language/:version/book/:book/chapter/:chapter',
        destination: '/bible/:language/:version/:book/:chapter',
        permanent: true,
      },
      // Selected verses (old URL had a typo "seleted")
      {
        source: '/bible/seleted-verses/:language/:version',
        destination: '/bible',
        permanent: true,
      },

      // ── Quiz ───────────────────────────────────────────────────────────────
      // Filtered questions listing
      {
        source: '/quiz/questions/lan/:language/cat/:category/subcat/:subCategory',
        destination: '/quiz',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
