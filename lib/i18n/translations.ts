export type Locale = "en" | "am"

export const translations = {
  en: {
    // ── Navigation ──────────────────────────────
    nav_bible:          "Bible",
    nav_liturgy:        "Liturgy",
    nav_hymns:          "Hymns",
    nav_more:           "More",
    nav_quiz:           "Quiz",
    nav_books:          "Books",
    nav_sermons:        "Sermons",

    // ── User menu ───────────────────────────────
    nav_signin:         "Sign in",
    nav_signout:        "Log out",
    nav_profile:        "Profile",
    nav_main_admin:     "Main admin",
    nav_liturgy_admin:  "Liturgy admin",
    nav_hymn_admin:     "Hymn admin",
    nav_sermon_admin:   "Sermon admin",
    nav_book_admin:     "Book admin",
    nav_quiz_admin:     "Quiz admin",

    // ── Hymns sidebar ───────────────────────────
    hymn_all:           "All Hymns",
    hymn_channels:      "Channels",
    hymn_favorites:     "Favorites",
    hymn_my_uploads:    "My Uploads",

    // ── Hymns page ──────────────────────────────
    hymn_featured:      "Featured",
    hymn_submit:        "Submit a Hymn",
    hymn_all_channels:  "All Channels",

    // ── Sermons sidebar ─────────────────────────
    sermon_all:         "All Sermons",
    sermon_channels:    "Channels",
    sermon_favorites:   "Favorites",
    sermon_my_uploads:  "My Uploads",

    // ── Search & filters ────────────────────────
    search_placeholder: "Search…",
    filter_all:         "All",
    filter_language:    "Language",
    filter_category:    "Category",
    filter_sort:        "Sort",

    // ── Common actions ──────────────────────────
    action_save:        "Save Changes",
    action_cancel:      "Cancel",
    action_accept:      "Accept",
    action_decline:     "Decline",
    action_edit:        "Edit",
    action_delete:      "Delete",
    action_submit:      "Submit",
    action_confirm:     "Confirm",
    action_loading:     "Loading…",
    action_no_results:  "No results",

    // ── Auth pages ──────────────────────────────
    auth_login_title:   "Sign in to your account",
    auth_login_btn:     "Sign in",
    auth_register_title:"Create an account",
    auth_register_btn:  "Register",
    auth_email:         "Email",
    auth_password:      "Password",
    auth_name:          "Full name",

    // ── Feedback widget ─────────────────────────
    feedback_btn:       "Feedback",
    feedback_title:     "Send Feedback",
    feedback_placeholder:"Your message…",
    feedback_send:      "Send",
    feedback_thanks:    "Thank you!",

    // ── Misc ────────────────────────────────────
    media_resources:    "Media Resources",
  },

  am: {
    // ── Navigation ──────────────────────────────
    nav_bible:          "...",
    nav_liturgy:        "...",
    nav_hymns:          "...",
    nav_more:           "...",
    nav_quiz:           "...",
    nav_books:          "...",
    nav_sermons:        "...",

    // ── User menu ───────────────────────────────
    nav_signin:         "...",
    nav_signout:        "...",
    nav_profile:        "...",
    nav_main_admin:     "...",
    nav_liturgy_admin:  "...",
    nav_hymn_admin:     "...",
    nav_sermon_admin:   "...",
    nav_book_admin:     "...",
    nav_quiz_admin:     "...",

    // ── Hymns sidebar ───────────────────────────
    hymn_all:           "ሁሉም መዝሙራት",
    hymn_channels:      "ቻናሎች",
    hymn_favorites:     "የተመረጡ መዝሙራት",
    hymn_my_uploads:    "በእርስዎ የተጫኑ መዝሙሮች",

    // ── Hymns page ──────────────────────────────
    hymn_featured:      "...",
    hymn_submit:        "...",
    hymn_all_channels:  "...",

    // ── Sermons sidebar ─────────────────────────
    sermon_all:         "...",
    sermon_channels:    "...",
    sermon_favorites:   "...",
    sermon_my_uploads:  "...",

    // ── Search & filters ────────────────────────
    search_placeholder: "...",
    filter_all:         "...",
    filter_language:    "...",
    filter_category:    "...",
    filter_sort:        "...",

    // ── Common actions ──────────────────────────
    action_save:        "...",
    action_cancel:      "...",
    action_accept:      "...",
    action_decline:     "...",
    action_edit:        "...",
    action_delete:      "...",
    action_submit:      "...",
    action_confirm:     "...",
    action_loading:     "...",
    action_no_results:  "...",

    // ── Auth pages ──────────────────────────────
    auth_login_title:   "...",
    auth_login_btn:     "...",
    auth_register_title:"...",
    auth_register_btn:  "...",
    auth_email:         "...",
    auth_password:      "...",
    auth_name:          "...",

    // ── Feedback widget ─────────────────────────
    feedback_btn:       "...",
    feedback_title:     "...",
    feedback_placeholder:"...",
    feedback_send:      "...",
    feedback_thanks:    "...",

    // ── Misc ────────────────────────────────────
    media_resources:    "...",
  },
} satisfies Record<Locale, Record<string, string>>

export type TranslationKey = keyof typeof translations.en
