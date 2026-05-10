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

    // ── Hymns search filters ─────────────────────
    hymn_search_placeholder: "Search hymns…",
    hymn_select_language:    "Select language",
    hymn_select_category:    "Select category",
    hymn_select_singer:      "Select singer",
    hymn_select_subcategory: "Select sub-category",
    hymn_by_singer:          "By the singer",

    // ── Sermons sidebar ─────────────────────────
    sermon_all:         "All Sermons",
    sermon_channels:    "Channels",
    sermon_favorites:   "Favorites",
    sermon_my_uploads:  "My Uploads",

    // ── Search & filters (generic) ───────────────
    search_placeholder: "Search…",
    filter_all:         "All",
    filter_language:    "Language",
    filter_category:    "Category",
    filter_sort:        "Sort",

    // ── Books sidebar + filters ──────────────────
    book_all:                "All books",
    book_my:                 "My books",
    book_search_placeholder: "Search books…",
    book_select_language:    "Select language",
    book_select_category:    "Select category",
    book_select_subcategory: "Select sub-category",

    // ── Quiz sidebar ─────────────────────────────
    quiz_all:   "All questions",
    quiz_rooms: "Group rooms",
    quiz_my:    "My questions",

    // ── Common actions ──────────────────────────
    action_save:        "Save changes",
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
    auth_login_title:    "Sign in to your account",
    auth_login_btn:      "Sign in",
    auth_register_title: "Create an account",
    auth_register_btn:   "Register",
    auth_email:          "Email",
    auth_password:       "Password",
    auth_name:           "Full name",

    // ── Feedback widget ─────────────────────────
    feedback_btn:              "Feedback",
    feedback_title:            "Send Feedback",
    feedback_placeholder:      "Your message…",
    feedback_send:             "Send",
    feedback_thanks:           "Thank you!",
    feedback_header:           "Share your feedback",
    feedback_description:      "If there's something you want fixed or added, please share your feedback…",
    feedback_contact:          "Write your info if you want us to reach you",
    feedback_name_placeholder: "Name",
    feedback_phone_placeholder: "Phone",
    feedback_sending:          "Sending…",
    feedback_submit_btn:       "Send your feedback",
    feedback_success_msg:      "Thank you for your feedback!",

    // ── Bible ────────────────────────────────────
    bible_find_book:        "Find a book…",
    bible_no_books:         "No books found",
    bible_tab_verse:        "Verse",
    bible_tab_highlights:   "Highlights",
    bible_tab_reading:      "Reading",
    bible_copy_verse:       "Copy verse",
    bible_copy_ref:         "Copy ref",
    bible_no_verse:         "No verse selected",
    bible_click_to_select:  "Click a verse number to select it",
    bible_signin_highlights:"Sign in to save highlights",
    bible_highlights_saved: "Your highlights are saved to your account",
    bible_no_highlights:    "No highlights yet",
    bible_click_to_highlight: "Click a verse number to highlight it",
    bible_font_size:        "Font size",
    bible_tip:              "Tip: Click any verse number to highlight it.",
    bible_signin_save:      " Sign in to save highlights.",
    bible_search:           "Search",
    bible_search_placeholder: "Search verses…",
    bible_scope_whole:      "Whole Bible",
    bible_scope_ot:         "Old Testament",
    bible_scope_nt:         "New Testament",
    bible_scope_book:       "This Book",
    bible_no_text:          "No text available",
    bible_highlighted:      "highlighted",

    // ── Bible right panel ────────────────────────
    bible_my_collections:       "My collections",
    bible_view_collections:     "View my collections",
    bible_signin_collections:   "to save verses to collections.",
    bible_selected_verse:       "Selected verse",
    bible_tap_to_select:        "Tap a verse number to select it. Tap more to build a multi-verse selection.",
    bible_reading_label:        "Reading",
    bible_text_size:            "Text size",
    bible_view_mode:            "View",
    bible_by_verse:             "By verse",
    bible_paragraph_mode:       "Paragraph",
    bible_commentary_label:     "Commentary",
    bible_commentary_soon:      "Verse commentary coming soon.",
    bible_highlight_label:      "Highlight",
    bible_save_label:           "Save",
    bible_clear_selection:      "Clear selection",
    bible_of:                   "of",
    bible_verses:               "verses",
    bible_type_to_search:       "Type to search",
    bible_search_desc:          "Search for words or phrases across the Bible",

    // ── Sort options (shared) ────────────────────
    sort_newest_first:  "Newest first",
    sort_oldest_first:  "Oldest first",
    sort_most_clicked:  "Most clicked",
    sort_least_clicked: "Least clicked",

    // ── Hymns count / actions ────────────────────
    hymn_singular:   "hymn",
    hymn_plural:     "hymns",
    hymn_play_all:   "Play all",
    hymn_all_loaded: "All hymns loaded",
    hymn_none_found: "No hymns found",

    // ── Sermons count / actions ──────────────────
    sermon_singular:   "sermon",
    sermon_plural:     "sermons",
    sermon_play_all:   "Play all",
    sermon_all_loaded: "All sermons loaded",
    sermon_none_found: "No sermons found",

    // ── Channels ─────────────────────────────────
    channel_title:        "Channels",
    channel_singular:     "channel",
    channel_plural:       "channels",
    channel_none_found:   "No channels found",
    channel_all_loaded:   "All channels loaded",

    // ── Liturgy ──────────────────────────────────
    liturgy_title:          "Liturgy",
    liturgy_language_btn:   "Language",
    liturgy_select_langs:   "Select languages",
    liturgy_no_content:     "No liturgy content yet",
    liturgy_no_content_msg: "Liturgical texts will appear here once they are added by an administrator.",
    liturgy_note:           "Note:",
    liturgy_no_section:     "No texts in this section yet",

    // ── Collections ──────────────────────────────
    col_save_title:       "Save to collection",
    col_new_placeholder:  "New collection name…",
    col_create_btn:       "Create",
    col_empty_state:      "No collections yet.",
    col_empty_hint:       "Create a new collection below to get started.",
    col_collection_sg:    "collection",
    col_collection_pl:    "collections",
    col_verse_sg:         "verse",
    col_verse_pl:         "verses",
    col_new_label:        "New collection",
    col_subtitle:         "Your saved verse collections",
    col_empty_page_hint:  "Open the Bible reader, select verses, and save them to a collection.",
    col_go_bible:         "Go to Bible",
    col_open:             "Open",
    col_no_verses_yet:    "No verses in this collection yet.",

    // ── Misc ────────────────────────────────────
    media_resources:    "Media Resources",
  },

  am: {
    // ── Navigation ──────────────────────────────
    nav_bible:          "መጽሐፍ ቅዱስ",
    nav_liturgy:        "ቅዳሴ",
    nav_hymns:          "መዝሙራት",
    nav_more:           "ተጨማሪ",
    nav_quiz:           "ጥያቄዎች",
    nav_books:          "መጻሕፍት",
    nav_sermons:        "ስብከቶች",

    // ── User menu ───────────────────────────────
    nav_signin:         "ይግቡ",
    nav_signout:        "ይውጡ",
    nav_profile:        "ገጽ መለያ",
    nav_main_admin:     "ዋና አድሚን",
    nav_liturgy_admin:  "ቅዳሴ አድሚን",
    nav_hymn_admin:     "መዝሙር አድሚን",
    nav_sermon_admin:   "ስብከት አድሚን",
    nav_book_admin:     "መጻሕፍት አድሚን",
    nav_quiz_admin:     "ጥያቄዎች አድሚን",

    // ── Hymns sidebar ───────────────────────────
    hymn_all:           "ሁሉም መዝሙራት",
    hymn_channels:      "ቻናሎች",
    hymn_favorites:     "የተመረጡ መዝሙራት",
    hymn_my_uploads:    "በእርስዎ የተጫኑ መዝሙሮች",

    // ── Hymns page ──────────────────────────────
    hymn_featured:      "ተለይተው የቀረቡ",
    hymn_submit:        "መዝሙር ያስገቡ",
    hymn_all_channels:  "ሁሉም ቻናሎች",

    // ── Hymns search filters ─────────────────────
    hymn_search_placeholder: "መዝሙር ፈልግ...",
    hymn_select_language:    "ቋንቋ ይምረጡ",
    hymn_select_category:    "የምድብ አይነት ይምረጡ",
    hymn_select_singer:      "ዘማሪ ይምረጡ",
    hymn_select_subcategory: "ምድብ ይምረጡ",
    hymn_by_singer:          "በዘማሪው",

    // ── Sermons sidebar ─────────────────────────
    sermon_all:         "ሁሉም ስብከቶች",
    sermon_channels:    "ቻናሎች",
    sermon_favorites:   "የተመረጡ ስብከቶች",
    sermon_my_uploads:  "በእርስዎ የተጫኑ ስብከቶች",

    // ── Search & filters (generic) ───────────────
    search_placeholder: "ፈልግ…",
    filter_all:         "ሁሉም",
    filter_language:    "ቋንቋ",
    filter_category:    "ምድብ",
    filter_sort:        "ደርድር",

    // ── Books sidebar + filters ──────────────────
    book_all:                "ሁሉም መጻሕፍት",
    book_my:                 "የእርስዎ መጻሕፍት",
    book_search_placeholder: "መጽሐፍ ፈልግ...",
    book_select_language:    "ቋንቋ ይምረጡ",
    book_select_category:    "የምድብ አይነት ይምረጡ",
    book_select_subcategory: "ምድብ ይምረጡ",

    // ── Quiz sidebar ─────────────────────────────
    quiz_all:   "ሁሉም ጥያቄዎች",
    quiz_rooms: "የቡድን ክፍሎች",
    quiz_my:    "የእርስዎ ጥያቄዎች",

    // ── Common actions ──────────────────────────
    action_save:        "ለውጦችን አስቀምጥ",
    action_cancel:      "ሰርዝ",
    action_accept:      "ተቀበል",
    action_decline:     "አትቀበል",
    action_edit:        "አርም",
    action_delete:      "ሰርዝ",
    action_submit:      "አስገባ",
    action_confirm:     "አረጋግጥ",
    action_loading:     "በመጫን ላይ…",
    action_no_results:  "ምንም ውጤት አልተገኘም",

    // ── Auth pages ──────────────────────────────
    auth_login_title:    "ወደ መለያዎ ይግቡ",
    auth_login_btn:      "ይግቡ",
    auth_register_title: "መለያ ይፍጠሩ",
    auth_register_btn:   "ይመዝገቡ",
    auth_email:          "ኢሜይል",
    auth_password:       "የይለፍ ቃል",
    auth_name:           "ሙሉ ስም",

    // ── Feedback widget ─────────────────────────
    feedback_btn:              "አስተያየት",
    feedback_title:            "አስተያየት ይላኩ",
    feedback_placeholder:      "የእርስዎ መልእክት…",
    feedback_send:             "ላክ",
    feedback_thanks:           "አመሰግናለን!",
    feedback_header:           "ሃሳብዎን ያካፍሉን",
    feedback_description:      "እንዲስተካከል ወይም እንዲጨመር የሚፈልጉት ነገር ካለ ሃሳብዎን ያካፍሉን...",
    feedback_contact:          "እንድናገኝዎ ከፈለጉ መረጃዎን ይጻፉልን",
    feedback_name_placeholder: "ስም",
    feedback_phone_placeholder: "ስልክ",
    feedback_sending:          "በመላክ ላይ...",
    feedback_submit_btn:       "አስተያየትዎን ይላኩ",
    feedback_success_msg:      "ስለአስተያየትዎ እናመሰግናለን!",

    // ── Bible ────────────────────────────────────
    bible_find_book:        "መጽሐፍ ፈልግ...",
    bible_no_books:         "ምንም መጽሐፍ አልተገኘም",
    bible_tab_verse:        "ጥቅስ",
    bible_tab_highlights:   "ምልክቶች",
    bible_tab_reading:      "ማንበቢያ",
    bible_copy_verse:       "ጥቅስ ቅዳ",
    bible_copy_ref:         "ዋቢ ቅዳ",
    bible_no_verse:         "ምንም ጥቅስ አልተመረጠም",
    bible_click_to_select:  "ጥቅስ ቁጥር ይጫኑ ለመምረጥ",
    bible_signin_highlights:"ምልክቶች ለማስቀመጥ ይግቡ",
    bible_highlights_saved: "ምልክቶችዎ በመለያዎ ይቀመጣሉ",
    bible_no_highlights:    "ምንም ምልክት የለም",
    bible_click_to_highlight: "ጥቅስ ቁጥር ይጫኑ ለምልክት",
    bible_font_size:        "የፊደል መጠን",
    bible_tip:              "ጠቃሚ ፍንጭ፡ ጥቅስ ቁጥር ይጫኑ ለምልክት።",
    bible_signin_save:      " ምልክቶች ለማስቀመጥ ይግቡ።",
    bible_search:           "ፈልግ",
    bible_search_placeholder: "ጥቅሶች ፈልግ...",
    bible_scope_whole:      "ሙሉ መጽሐፍ ቅዱስ",
    bible_scope_ot:         "ብሉይ ኪዳን",
    bible_scope_nt:         "አዲስ ኪዳን",
    bible_scope_book:       "ይህ መጽሐፍ",
    bible_no_text:          "ምንም ጽሑፍ የለም",
    bible_highlighted:      "ምልክት የተደረገ",

    // ── Bible right panel ────────────────────────
    bible_my_collections:       "የእኔ ስብስቦች",
    bible_view_collections:     "ስብስቦቼን ይመልከቱ",
    bible_signin_collections:   "ጥቅሶችን ለማስቀመጥ ይግቡ።",
    bible_selected_verse:       "የተመረጠ ጥቅስ",
    bible_tap_to_select:        "ጥቅስ ለመምረጥ ቁጥሩን ይጫኑ። ብዙ ጥቅሶችን ለመምረጥ ተጨማሪ ቁጥሮችን ይጫኑ።",
    bible_reading_label:        "ማንበቢያ",
    bible_text_size:            "የፊደል መጠን",
    bible_view_mode:            "አሳይ",
    bible_by_verse:             "በጥቅስ",
    bible_paragraph_mode:       "አንቀጽ",
    bible_commentary_label:     "ትርጓሜ",
    bible_commentary_soon:      "የጥቅስ ትርጓሜ በቅርብ ይመጣል።",
    bible_highlight_label:      "ምልክት",
    bible_save_label:           "አስቀምጥ",
    bible_clear_selection:      "ምርጫ ሰርዝ",
    bible_of:                   "ከ",
    bible_verses:               "ጥቅሶች",
    bible_type_to_search:       "ፈልጉ",
    bible_search_desc:          "በቅዱስ መጽሐፍ ቃላት ወይም ሐረጎችን ፈልጉ",

    // ── Sort options (shared) ────────────────────
    sort_newest_first:  "አዲሱ ቀደም",
    sort_oldest_first:  "ያረጀው ቀደም",
    sort_most_clicked:  "በጣም የተጫወቱ",
    sort_least_clicked: "ያነሰ የተጫወቱ",

    // ── Hymns count / actions ────────────────────
    hymn_singular:   "መዝሙር",
    hymn_plural:     "መዝሙሮች",
    hymn_play_all:   "ሁሉንም አጫውት",
    hymn_all_loaded: "ሁሉም መዝሙሮች ተጭነዋል",
    hymn_none_found: "ምንም መዝሙር አልተገኘም",

    // ── Sermons count / actions ──────────────────
    sermon_singular:   "ስብከት",
    sermon_plural:     "ስብከቶች",
    sermon_play_all:   "ሁሉንም አጫውት",
    sermon_all_loaded: "ሁሉም ስብከቶች ተጭነዋል",
    sermon_none_found: "ምንም ስብከት አልተገኘም",

    // ── Channels ─────────────────────────────────
    channel_title:        "ቻናሎች",
    channel_singular:     "ቻናል",
    channel_plural:       "ቻናሎች",
    channel_none_found:   "ምንም ቻናል አልተገኘም",
    channel_all_loaded:   "ሁሉም ቻናሎች ተጭነዋል",

    // ── Liturgy ──────────────────────────────────
    liturgy_title:          "ቅዳሴ",
    liturgy_language_btn:   "ቋንቋ",
    liturgy_select_langs:   "ቋንቋዎች ይምረጡ",
    liturgy_no_content:     "ምንም የቅዳሴ ይዘት የለም",
    liturgy_no_content_msg: "የቅዳሴ ጽሑፎች ሲጨመሩ እዚህ ይታያሉ።",
    liturgy_note:           "ማሳሰቢያ፡",
    liturgy_no_section:     "በዚህ ክፍል ምንም ጽሑፍ የለም",

    // ── Collections ──────────────────────────────
    col_save_title:       "ወደ ስብስብ አስቀምጥ",
    col_new_placeholder:  "አዲስ ስብስብ ስም…",
    col_create_btn:       "ፍጠር",
    col_empty_state:      "ምንም ስብስብ የለም።",
    col_empty_hint:       "ለመጀመር ከታች አዲስ ስብስብ ይፍጠሩ።",
    col_collection_sg:    "ስብስብ",
    col_collection_pl:    "ስብስቦች",
    col_verse_sg:         "ጥቅስ",
    col_verse_pl:         "ጥቅሶች",
    col_new_label:        "አዲስ ስብስብ",
    col_subtitle:         "የተቀመጡ ጥቅሶችዎ",
    col_empty_page_hint:  "ቅዱስ መጽሐፍን ክፈቱ፣ ጥቅሶችን ይምረጡ፣ ወደ ስብስብ ያስቀምጡ።",
    col_go_bible:         "ወደ መጽሐፍ ቅዱስ",
    col_open:             "ክፈት",
    col_no_verses_yet:    "በዚህ ስብስብ ምንም ጥቅስ የለም።",

    // ── Misc ────────────────────────────────────
    media_resources:    "የሚዲያ ውጤቶች",
  },
} satisfies Record<Locale, Record<string, string>>

export type TranslationKey = keyof typeof translations.en
