# Storage Folder Structure

This folder contains **user-uploaded content** and should NOT be in the public directory for security and scalability reasons.

## Directory Organization

### `/uploads/profiles/`
User profile images
- Naming: `{userId}-{timestamp}.{ext}`
- Served via API endpoint: `/api/storage/profiles/{filename}`

### `/uploads/books/`
Book cover images
- Naming: `{bookId}-cover.{ext}`
- Served via API endpoint: `/api/storage/books/{filename}`

### `/uploads/sermons/`
Sermon-related media (audio, video, thumbnails)
- Naming: `{sermonId}-{type}.{ext}`
- Served via API endpoint: `/api/storage/sermons/{filename}`

### `/uploads/hymns/`
Hymn-related media (audio, sheet music, thumbnails)
- Naming: `{hymnId}-{type}.{ext}`
- Served via API endpoint: `/api/storage/hymns/{filename}`

## Best Practices

1. **Security**
   - Never expose this directory directly via web server
   - Always serve through authenticated API endpoints
   - Validate file types and sizes before storage
   - Implement access control per resource

2. **File Naming**
   - Use IDs to avoid filename conflicts
   - Include timestamps for versioning
   - Sanitize user-provided filenames

3. **Scalability**
   - Consider moving to cloud storage (S3, Azure Blob, Cloudinary) in production
   - Implement CDN for serving uploaded content
   - Use image optimization/resizing pipelines

4. **Backups**
   - Regular automated backups
   - Separate from database backups
   - Version control not recommended for binary files
