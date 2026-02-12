# Image/PDF Upload Feature - Implementation Notes

## Overview

Successfully implemented image and PDF upload functionality for the Socratical chat interface. Users can now upload images or PDFs of their problems directly in the chat, in addition to the initial problem submission on the landing page.

## Architecture

### Future-Proof Design

The implementation uses a **abstraction layer** that currently uses dataURLs but is designed for easy migration to S3/Supabase Storage when you add user authentication and conversation persistence.

## What Was Implemented

### 1. File Storage Abstraction Layer (`lib/file-storage.ts`)

**Purpose**: Provides a clean interface for file handling that works with dataURLs now but can be swapped for S3 later.

**Key Functions**:
- `uploadFile(file)` - Currently converts to dataURL, future: upload to S3
- `uploadFiles(files)` - Batch upload
- `getFileUrl(reference)` - Currently returns dataURL, future: generate signed URL
- `isImageFile()`, `isPDFFile()` - File type helpers

**Migration Path**:
When you're ready to add S3/Supabase Storage:
1. Uncomment the template code at the bottom of `lib/file-storage.ts`
2. Update `uploadFile()` to upload to Supabase Storage
3. Update `getFileUrl()` to generate signed URLs
4. No changes needed to the rest of the codebase

### 2. ChatPanel Component Updates (`components/workspace/ChatPanel.tsx`)

**Changes**:
- ✅ Replaced simple `<input type="text">` with feature-rich `PromptInput` component
- ✅ Added support for drag-and-drop file uploads
- ✅ Added paste-from-clipboard support for images
- ✅ File attachments render in chat messages:
  - Images show as inline previews
  - PDFs show as file attachment cards
- ✅ Multi-file support with visual previews

**User Experience**:
- Users can click to upload files
- Drag files anywhere in the chat
- Paste images directly from clipboard
- See file previews before sending
- Remove files before sending

### 3. API Route Updates (`app/api/chat/route.ts`)

**Changes**:
- ✅ Added `fileReferences` parameter to request body
- ✅ Vercel AI SDK automatically converts files to Claude's image format
- ✅ Logging includes file count for debugging

**How it works**:
1. Client sends message with `files` array
2. Vercel AI SDK's `convertToModelMessages()` handles conversion
3. Images are sent to Claude as multimodal content
4. Claude can analyze both text and images in context

## File Flow

### Current (DataURL)
```
User selects file
  ↓
PromptInput converts to blob URL (for preview)
  ↓
On submit: converts blob URL → dataURL
  ↓
uploadFiles() passes through dataURL
  ↓
sendMessage() sends to API with files array
  ↓
API converts to Claude's format
  ↓
Claude analyzes image + provides response
```

### Future (S3/Supabase)
```
User selects file
  ↓
PromptInput converts to blob URL (for preview)
  ↓
On submit: converts blob URL → dataURL
  ↓
uploadFiles() uploads to Supabase Storage
  ↓
Returns signed URL + metadata
  ↓
sendMessage() sends URL reference to API
  ↓
API fetches image from S3
  ↓
Claude analyzes image + provides response
```

## Supported File Types

- **Images**: `image/*` (PNG, JPG, WEBP, etc.)
- **PDFs**: `application/pdf`

Configured in ChatPanel:
```tsx
<PromptInput
  accept="image/*,application/pdf"
  multiple
  onSubmit={onSubmit}
/>
```

## Technical Details

### File Handling
- Files are converted to dataURLs by `PromptInput` automatically
- `uploadFiles()` currently just wraps them in a `FileReference` structure
- All files are sent inline with the message (no separate upload step)

### Message Structure
Messages now include file parts:
```typescript
{
  id: "msg-123",
  role: "user",
  parts: [
    { type: "text", text: "Can you help me solve this?" },
    { 
      type: "file",
      url: "data:image/png;base64,...",
      mediaType: "image/png",
      filename: "problem.png"
    }
  ]
}
```

### Rendering
- **Images**: Rendered as `<img>` tags with max-width constraint
- **PDFs**: Rendered as file attachment cards with 📎 icon
- Both show filename if available

## Testing

### Manual Testing Steps
1. Start dev server: `bun run dev`
2. Navigate to workspace with a problem
3. In chat input:
   - Click the attachment area or drag a file
   - Paste an image from clipboard
   - Type a message along with the file
   - Submit and verify:
     - File appears in user message
     - AI can see and analyze the image
     - File preview renders correctly

### Debug Mode
If `DEBUG=true` in `.env.local`, AI responses are disabled but file uploads still work for UI testing.

## Performance Considerations

### Current (DataURL)
- ⚠️ Large files increase payload size (~33% overhead from base64)
- ⚠️ Multiple images in conversation history = large context
- ✅ Simple, no infrastructure needed
- ✅ Works immediately

### Future (S3)
- ✅ Small payload (just URLs)
- ✅ Scalable for large files
- ✅ Persistent storage
- ⚠️ Requires auth/permissions
- ⚠️ Additional infrastructure

## Migration Checklist (When Adding Auth + Persistence)

When you're ready to add S3/Supabase Storage:

- [ ] Set up Supabase Storage bucket (e.g., `chat-attachments`)
- [ ] Configure RLS policies for authenticated users
- [ ] Implement `uploadToS3()` in `lib/file-storage.ts`
- [ ] Update `uploadFile()` to call `uploadToS3()`
- [ ] Update `getFileUrl()` to generate signed URLs
- [ ] Add cleanup logic for old files (cron job?)
- [ ] Update `FileReference.storageType` to include `'supabase'`
- [ ] Test with real S3 uploads

**Estimated migration time**: 2-4 hours

## Known Limitations

1. **No Persistence**: Files are only in-memory (same as current chat)
2. **File Size**: Large PDFs may hit API limits (consider compression)
3. **PDF Preview**: PDFs show as attachment cards, not rendered inline
4. **No OCR**: PDFs are sent as-is, Claude extracts text

## Future Enhancements

Potential improvements when adding persistence:
- File compression before upload
- Image optimization (resize, compress)
- PDF text extraction before sending to Claude
- File preview modal (click to expand)
- Upload progress indicators
- File type validation with error messages
- Max file size enforcement (client + server)

## Code Locations

- **Abstraction Layer**: `lib/file-storage.ts`
- **Chat Component**: `components/workspace/ChatPanel.tsx`
- **API Route**: `app/api/chat/route.ts`
- **Input Component**: `components/ai-elements/prompt-input.tsx` (unchanged, already supported files)

## Environment Variables

No new environment variables needed! Works with existing setup.

## Summary

✅ **Complete**: Image/PDF upload in chat
✅ **Future-Proof**: Easy S3 migration path
✅ **Type-Safe**: Full TypeScript support
✅ **User-Friendly**: Drag-drop, paste, multi-file
✅ **AI-Ready**: Claude can analyze uploaded images

The implementation is production-ready for dataURL mode and architected for seamless S3 migration when you add authentication and persistence.
