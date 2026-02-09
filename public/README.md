# Public Folder Structure

This folder contains **static assets only** that are served directly by Next.js.

## Directory Organization

### `/icons/`
PWA icons, favicons, and app icons
- `icon.png` - Main app icon
- `icon-192x192.png` - PWA icon (192x192)
- `icon-512x512.png` - PWA icon (512x512)
- `favicon.ico` - Browser favicon (add when available)

### `/images/`
Static images used throughout the application

#### `/images/branding/`
Logos, brand assets
- Site logos (light/dark variants)
- Brand marks
- Watermarks

#### `/images/ui/`
UI elements and static interface images
- `header.jpg` - Header image
- Background images
- Decorative elements
- Static UI graphics

#### `/images/placeholders/`
Default/fallback images
- Default profile picture
- Book cover placeholder
- No image available graphics

### Root Level
- `manifest.json` - PWA manifest
- `robots.txt` - Search engine directives (add when needed)

## Important Notes

1. **User-uploaded content does NOT belong in public/**
   - User profiles → `/storage/uploads/profiles/`
   - Book covers → `/storage/uploads/books/`
   - Sermon media → `/storage/uploads/sermons/`
   - Hymn media → `/storage/uploads/hymns/`

2. **File Naming Convention**
   - Use lowercase with hyphens: `my-image.jpg`
   - Be descriptive: `header-home-page.jpg` not `img1.jpg`
   - Include size for multiple versions: `logo-small.png`, `logo-large.png`

3. **Next.js Serving**
   - Files in `/public` are served from root: `/public/icons/icon.png` → `/icons/icon.png`
   - Always reference with absolute paths starting with `/`
