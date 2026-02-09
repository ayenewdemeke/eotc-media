# EOTC Media Folder Structure

## Overview
This document outlines the folder structure for implementing the main features: Bible, Books, Hymns, Sermons, and Quizzes.

## Structure

```
eotc-media/
├── app/
│   ├── bible/              # Bible reading interface
│   │   ├── [language]/     # e.g., amharic, english, oromifa
│   │   │   ├── [version]/  # e.g., 1954, kjv, septuagint
│   │   │   │   ├── [book]/ # Book number or name
│   │   │   │   │   └── [chapter]/
│   │   │   │   │       └── page.tsx
│   │   └── page.tsx        # Bible landing page
│   │
│   ├── books/              # Church books library
│   │   ├── [category]/     # e.g., theology, history, spiritual
│   │   │   ├── [subcategory]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── [id]/           # Individual book view
│   │   │   ├── read/       # Reading interface
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx    # Book details
│   │   └── page.tsx        # Books landing page
│   │
│   ├── hymns/              # Hymns collection
│   │   ├── [category]/     # e.g., mezmur, zema, kidase
│   │   │   └── page.tsx
│   │   ├── [id]/           # Individual hymn
│   │   │   └── page.tsx
│   │   ├── channels/       # Hymn channels/artists
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx        # Hymns landing page
│   │
│   ├── sermons/            # Sermons/teachings
│   │   ├── [category]/     # e.g., sunday, feast-day, teaching
│   │   │   └── page.tsx
│   │   ├── [id]/           # Individual sermon
│   │   │   └── page.tsx
│   │   ├── speakers/       # Sermon speakers
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx        # Sermons landing page
│   │
│   └── quiz/               # Quiz/trivia section
│       ├── [category]/     # e.g., bible, church-history
│       │   └── page.tsx
│       ├── [id]/           # Individual quiz
│       │   ├── play/       # Quiz playing interface
│       │   │   └── page.tsx
│       │   └── page.tsx    # Quiz details
│       └── page.tsx        # Quiz landing page
│
├── components/
│   ├── bible/              # Bible-specific components
│   │   ├── BibleReader.tsx
│   │   ├── ChapterSelector.tsx
│   │   ├── VerseHighlight.tsx
│   │   └── LanguageSelector.tsx
│   │
│   ├── books/              # Books-specific components
│   │   ├── BookCard.tsx
│   │   ├── BookReader.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── BookComments.tsx
│   │
│   ├── hymns/              # Hymns-specific components
│   │   ├── HymnCard.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── HymnLyrics.tsx
│   │   └── ChannelCard.tsx
│   │
│   ├── sermons/            # Sermons-specific components
│   │   ├── SermonCard.tsx
│   │   ├── SermonPlayer.tsx
│   │   ├── SpeakerCard.tsx
│   │   └── SermonComments.tsx
│   │
│   └── quiz/               # Quiz-specific components
│       ├── QuizCard.tsx
│       ├── QuestionCard.tsx
│       ├── QuizResults.tsx
│       └── Leaderboard.tsx
│
├── lib/
│   ├── api/                # API client functions
│   │   ├── bible.ts        # Bible-related API calls
│   │   ├── books.ts        # Books-related API calls
│   │   ├── hymns.ts        # Hymns-related API calls
│   │   ├── sermons.ts      # Sermons-related API calls
│   │   └── quiz.ts         # Quiz-related API calls
│   └── prisma.ts           # Prisma client instance
│
└── types/
    └── models/             # TypeScript type definitions
        ├── bible.ts        # Bible types
        ├── book.ts         # Book types
        ├── hymn.ts         # Hymn types
        ├── sermon.ts       # Sermon types
        └── quiz.ts         # Quiz types
```

## Feature Details

### Bible
- Multiple languages (Amharic, English, Oromifa, Tigrigna, Greek, Hebrew)
- Multiple versions per language
- Chapter/verse navigation
- Highlighting and note-taking
- Cross-references

### Books
- Categories and subcategories
- PDF/online reading
- Comments and reviews
- Likes and favorites
- Copyright management
- Author profiles

### Hymns
- Audio/video playback
- Lyrics display
- Categories (Mezmur, Zema, Kidase, etc.)
- Channels/artists
- Comments and favorites
- Language support

### Sermons
- Audio/video playback
- Speaker profiles
- Categories (Sunday, Feast Days, Teaching series)
- Comments
- Transcripts (future)

### Quiz
- Multiple categories
- Question types (multiple choice, true/false)
- Score tracking
- Leaderboards
- Daily challenges
- Bible verse quizzes

## Implementation Priority

1. **Phase 1**: Bible (most referenced)
2. **Phase 2**: Books (core content)
3. **Phase 3**: Hymns (multimedia)
4. **Phase 4**: Sermons (multimedia)
5. **Phase 5**: Quiz (interactive)

## API Routes

Each feature should have corresponding API routes:
- `/api/bible/*` - Bible data endpoints
- `/api/books/*` - Books CRUD operations
- `/api/hymns/*` - Hymns CRUD operations
- `/api/sermons/*` - Sermons CRUD operations
- `/api/quiz/*` - Quiz CRUD operations
