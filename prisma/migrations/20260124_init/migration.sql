-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "access_token" TEXT,
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_user" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_us" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_canons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_canons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_canon_books" (
    "id" SERIAL NOT NULL,
    "canon_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bl_canon_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_books" (
    "id" SERIAL NOT NULL,
    "osisCode" TEXT NOT NULL,
    "english_name" TEXT NOT NULL,
    "geez_name" TEXT,
    "amharic_name" TEXT,
    "oromifa_name" TEXT,
    "tigrigna_name" TEXT,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_translations" (
    "id" SERIAL NOT NULL,
    "canon_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_verses" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_verse_texts" (
    "id" SERIAL NOT NULL,
    "verse_id" INTEGER NOT NULL,
    "translation_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_verse_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_highlights" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "verse_id" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_collections" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bl_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bl_collection_verses" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "verse_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bl_collection_verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lt_sections" (
    "id" SERIAL NOT NULL,
    "name_geez" TEXT NOT NULL,
    "name_amharic" TEXT NOT NULL,
    "name_english" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lt_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lt_roles" (
    "id" SERIAL NOT NULL,
    "role_key" TEXT NOT NULL,
    "name_amharic" TEXT NOT NULL,
    "name_english" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lt_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lt_liturgical_texts" (
    "id" SERIAL NOT NULL,
    "section_id" INTEGER NOT NULL,
    "order_index" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "text_geez" TEXT NOT NULL,
    "text_amharic" TEXT NOT NULL,
    "text_english_transliteration" TEXT NOT NULL,
    "text_english_translation" TEXT NOT NULL,
    "remark" TEXT,
    "audio_geez_file_path" TEXT,
    "audio_ezil_file_path" TEXT,
    "audio_araray_file_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lt_liturgical_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_sub_categories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_approval_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_approval_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_authors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_books" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approval_status_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "file" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_book_language" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_book_language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_book_category" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_book_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_book_sub_category" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_book_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_author_book" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_author_book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_book_comments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_book_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cb_copyright_reports" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "book_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cb_copyright_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_languages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_categories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "language_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_sub_categories" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_approval_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_approval_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_singers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_singers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_channels" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yt_channel_id" TEXT,
    "handle" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "thumbnail_default" TEXT,
    "thumbnail_medium" TEXT,
    "thumbnail_high" TEXT,
    "cover_image" TEXT,
    "country" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_hymns" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approval_status_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "published_at" DATE,
    "singer" TEXT,
    "title" TEXT NOT NULL,
    "lyrics" TEXT,
    "lyrics_suggestion" TEXT,
    "ai_lyrics" TEXT,
    "description" TEXT,
    "thumbnail_default" TEXT NOT NULL,
    "thumbnail_medium" TEXT NOT NULL,
    "thumbnail_high" TEXT NOT NULL,
    "thumbnail_standard" TEXT,
    "thumbnail_maxres" TEXT,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_hymns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_hymn_language" (
    "id" SERIAL NOT NULL,
    "hymn_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_hymn_language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_category_hymn" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "hymn_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_category_hymn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_hymn_sub_category" (
    "id" SERIAL NOT NULL,
    "hymn_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_hymn_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_hymn_singer" (
    "id" SERIAL NOT NULL,
    "hymn_id" INTEGER NOT NULL,
    "singer_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_hymn_singer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "hymn_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hm_comments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "hymn_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hm_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_sub_categories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_approval_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_approval_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_preachers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_preachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_channels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "yt_channel_id" TEXT,
    "handle" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "thumbnail_default" TEXT,
    "thumbnail_medium" TEXT,
    "thumbnail_high" TEXT,
    "cover_image" TEXT,
    "country" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_sermons" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approval_status_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "published_at" DATE,
    "preacher" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "description_suggestion" TEXT,
    "thumbnail_default" TEXT NOT NULL,
    "thumbnail_medium" TEXT NOT NULL,
    "thumbnail_high" TEXT NOT NULL,
    "thumbnail_standard" TEXT,
    "thumbnail_maxres" TEXT,
    "clicks_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_sermons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_language_sermon" (
    "id" SERIAL NOT NULL,
    "language_id" INTEGER NOT NULL,
    "sermon_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_language_sermon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_category_sermon" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "sermon_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_category_sermon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_sermon_sub_category" (
    "id" SERIAL NOT NULL,
    "sermon_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_sermon_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_preacher_sermon" (
    "id" SERIAL NOT NULL,
    "preacher_id" INTEGER NOT NULL,
    "sermon_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_preacher_sermon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sm_favorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sermon_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sm_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_sub_categories" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_approval_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_approval_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_question_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_question_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_difficulties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_questions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "approval_status_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "qz_difficulty_id" INTEGER,
    "question_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_choices" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "choice_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_language_question" (
    "id" SERIAL NOT NULL,
    "language_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_language_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_category_question" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_category_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_question_sub_category" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_question_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_rooms" (
    "id" SERIAL NOT NULL,
    "host_user_id" INTEGER NOT NULL,
    "name" TEXT,
    "room_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "total_rounds_played" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_room_members" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_room_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_room_member_round" (
    "id" SERIAL NOT NULL,
    "room_member_id" INTEGER NOT NULL,
    "round_id" INTEGER NOT NULL,
    "is_ready" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_room_member_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_rounds" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "timer_seconds" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_round_questions" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_round_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_round_answers" (
    "id" SERIAL NOT NULL,
    "round_question_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "choice_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_round_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qz_round_results" (
    "id" SERIAL NOT NULL,
    "round_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qz_round_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "featured_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "module_type" TEXT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "order_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bl_canons_name_key" ON "bl_canons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bl_canon_books_canon_id_book_id_key" ON "bl_canon_books"("canon_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "bl_books_osisCode_key" ON "bl_books"("osisCode");

-- CreateIndex
CREATE UNIQUE INDEX "bl_books_slug_key" ON "bl_books"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "bl_translations_code_key" ON "bl_translations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bl_verses_book_id_chapter_verse_key" ON "bl_verses"("book_id", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "bl_verse_texts_verse_id_translation_id_key" ON "bl_verse_texts"("verse_id", "translation_id");

-- CreateIndex
CREATE UNIQUE INDEX "bl_collection_verses_collection_id_verse_id_key" ON "bl_collection_verses"("collection_id", "verse_id");

-- CreateIndex
CREATE UNIQUE INDEX "lt_roles_role_key_key" ON "lt_roles"("role_key");

-- CreateIndex
CREATE UNIQUE INDEX "cb_books_slug_key" ON "cb_books"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cb_likes_user_id_book_id_key" ON "cb_likes"("user_id", "book_id");

-- CreateIndex
CREATE UNIQUE INDEX "hm_languages_slug_key" ON "hm_languages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hm_categories_slug_key" ON "hm_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hm_sub_categories_slug_key" ON "hm_sub_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hm_channels_slug_key" ON "hm_channels"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hm_channels_yt_channel_id_key" ON "hm_channels"("yt_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "hm_hymns_slug_key" ON "hm_hymns"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "hm_favorites_user_id_hymn_id_key" ON "hm_favorites"("user_id", "hymn_id");

-- CreateIndex
CREATE UNIQUE INDEX "sm_channels_slug_key" ON "sm_channels"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sm_channels_yt_channel_id_key" ON "sm_channels"("yt_channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "sm_sermons_slug_key" ON "sm_sermons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sm_favorites_user_id_sermon_id_key" ON "sm_favorites"("user_id", "sermon_id");

-- CreateIndex
CREATE UNIQUE INDEX "qz_rooms_room_code_key" ON "qz_rooms"("room_code");

-- CreateIndex
CREATE UNIQUE INDEX "qz_room_members_room_id_user_id_key" ON "qz_room_members"("room_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "qz_room_member_round_room_member_id_round_id_key" ON "qz_room_member_round"("room_member_id", "round_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_user" ADD CONSTRAINT "role_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_user" ADD CONSTRAINT "role_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_canon_books" ADD CONSTRAINT "bl_canon_books_canon_id_fkey" FOREIGN KEY ("canon_id") REFERENCES "bl_canons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_canon_books" ADD CONSTRAINT "bl_canon_books_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "bl_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_translations" ADD CONSTRAINT "bl_translations_canon_id_fkey" FOREIGN KEY ("canon_id") REFERENCES "bl_canons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_verses" ADD CONSTRAINT "bl_verses_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "bl_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_verse_texts" ADD CONSTRAINT "bl_verse_texts_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "bl_verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_verse_texts" ADD CONSTRAINT "bl_verse_texts_translation_id_fkey" FOREIGN KEY ("translation_id") REFERENCES "bl_translations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_highlights" ADD CONSTRAINT "bl_highlights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_highlights" ADD CONSTRAINT "bl_highlights_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "bl_verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_collections" ADD CONSTRAINT "bl_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_collection_verses" ADD CONSTRAINT "bl_collection_verses_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "bl_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bl_collection_verses" ADD CONSTRAINT "bl_collection_verses_verse_id_fkey" FOREIGN KEY ("verse_id") REFERENCES "bl_verses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lt_liturgical_texts" ADD CONSTRAINT "lt_liturgical_texts_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "lt_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lt_liturgical_texts" ADD CONSTRAINT "lt_liturgical_texts_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "lt_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_sub_categories" ADD CONSTRAINT "cb_sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "cb_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_books" ADD CONSTRAINT "cb_books_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_books" ADD CONSTRAINT "cb_books_approval_status_id_fkey" FOREIGN KEY ("approval_status_id") REFERENCES "cb_approval_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_language" ADD CONSTRAINT "cb_book_language_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_language" ADD CONSTRAINT "cb_book_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "cb_languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_category" ADD CONSTRAINT "cb_book_category_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_category" ADD CONSTRAINT "cb_book_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "cb_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_sub_category" ADD CONSTRAINT "cb_book_sub_category_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_sub_category" ADD CONSTRAINT "cb_book_sub_category_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "cb_sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_author_book" ADD CONSTRAINT "cb_author_book_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "cb_authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_author_book" ADD CONSTRAINT "cb_author_book_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_likes" ADD CONSTRAINT "cb_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_likes" ADD CONSTRAINT "cb_likes_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_comments" ADD CONSTRAINT "cb_book_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_book_comments" ADD CONSTRAINT "cb_book_comments_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_copyright_reports" ADD CONSTRAINT "cb_copyright_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cb_copyright_reports" ADD CONSTRAINT "cb_copyright_reports_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "cb_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_categories" ADD CONSTRAINT "hm_categories_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "hm_languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_sub_categories" ADD CONSTRAINT "hm_sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hm_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymns" ADD CONSTRAINT "hm_hymns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymns" ADD CONSTRAINT "hm_hymns_approval_status_id_fkey" FOREIGN KEY ("approval_status_id") REFERENCES "hm_approval_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymns" ADD CONSTRAINT "hm_hymns_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "hm_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymn_language" ADD CONSTRAINT "hm_hymn_language_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "hm_hymns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymn_language" ADD CONSTRAINT "hm_hymn_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "hm_languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_category_hymn" ADD CONSTRAINT "hm_category_hymn_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hm_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_category_hymn" ADD CONSTRAINT "hm_category_hymn_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "hm_hymns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymn_sub_category" ADD CONSTRAINT "hm_hymn_sub_category_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "hm_hymns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymn_sub_category" ADD CONSTRAINT "hm_hymn_sub_category_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "hm_sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymn_singer" ADD CONSTRAINT "hm_hymn_singer_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "hm_hymns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_hymn_singer" ADD CONSTRAINT "hm_hymn_singer_singer_id_fkey" FOREIGN KEY ("singer_id") REFERENCES "hm_singers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_favorites" ADD CONSTRAINT "hm_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_favorites" ADD CONSTRAINT "hm_favorites_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "hm_hymns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_comments" ADD CONSTRAINT "hm_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hm_comments" ADD CONSTRAINT "hm_comments_hymn_id_fkey" FOREIGN KEY ("hymn_id") REFERENCES "hm_hymns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_sub_categories" ADD CONSTRAINT "sm_sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "sm_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_sermons" ADD CONSTRAINT "sm_sermons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_sermons" ADD CONSTRAINT "sm_sermons_approval_status_id_fkey" FOREIGN KEY ("approval_status_id") REFERENCES "sm_approval_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_sermons" ADD CONSTRAINT "sm_sermons_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "sm_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_language_sermon" ADD CONSTRAINT "sm_language_sermon_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "sm_languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_language_sermon" ADD CONSTRAINT "sm_language_sermon_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sm_sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_category_sermon" ADD CONSTRAINT "sm_category_sermon_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "sm_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_category_sermon" ADD CONSTRAINT "sm_category_sermon_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sm_sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_sermon_sub_category" ADD CONSTRAINT "sm_sermon_sub_category_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sm_sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_sermon_sub_category" ADD CONSTRAINT "sm_sermon_sub_category_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sm_sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_preacher_sermon" ADD CONSTRAINT "sm_preacher_sermon_preacher_id_fkey" FOREIGN KEY ("preacher_id") REFERENCES "sm_preachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_preacher_sermon" ADD CONSTRAINT "sm_preacher_sermon_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sm_sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_favorites" ADD CONSTRAINT "sm_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sm_favorites" ADD CONSTRAINT "sm_favorites_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sm_sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_sub_categories" ADD CONSTRAINT "qz_sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "qz_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_questions" ADD CONSTRAINT "qz_questions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_questions" ADD CONSTRAINT "qz_questions_approval_status_id_fkey" FOREIGN KEY ("approval_status_id") REFERENCES "qz_approval_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_questions" ADD CONSTRAINT "qz_questions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "qz_question_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_questions" ADD CONSTRAINT "qz_questions_qz_difficulty_id_fkey" FOREIGN KEY ("qz_difficulty_id") REFERENCES "qz_difficulties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_choices" ADD CONSTRAINT "qz_choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_language_question" ADD CONSTRAINT "qz_language_question_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "qz_languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_language_question" ADD CONSTRAINT "qz_language_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_category_question" ADD CONSTRAINT "qz_category_question_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "qz_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_category_question" ADD CONSTRAINT "qz_category_question_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_question_sub_category" ADD CONSTRAINT "qz_question_sub_category_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_question_sub_category" ADD CONSTRAINT "qz_question_sub_category_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "qz_sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_rooms" ADD CONSTRAINT "qz_rooms_host_user_id_fkey" FOREIGN KEY ("host_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_room_members" ADD CONSTRAINT "qz_room_members_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "qz_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_room_members" ADD CONSTRAINT "qz_room_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_room_member_round" ADD CONSTRAINT "qz_room_member_round_room_member_id_fkey" FOREIGN KEY ("room_member_id") REFERENCES "qz_room_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_room_member_round" ADD CONSTRAINT "qz_room_member_round_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "qz_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_rounds" ADD CONSTRAINT "qz_rounds_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "qz_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_round_questions" ADD CONSTRAINT "qz_round_questions_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "qz_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_round_questions" ADD CONSTRAINT "qz_round_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "qz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_round_answers" ADD CONSTRAINT "qz_round_answers_round_question_id_fkey" FOREIGN KEY ("round_question_id") REFERENCES "qz_round_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_round_answers" ADD CONSTRAINT "qz_round_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qz_round_results" ADD CONSTRAINT "qz_round_results_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "qz_rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AlterTable: add language_id to qz_categories
ALTER TABLE "qz_categories" ADD COLUMN "language_id" INTEGER;

-- AddForeignKey
ALTER TABLE "qz_categories" ADD CONSTRAINT "qz_categories_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "qz_languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
