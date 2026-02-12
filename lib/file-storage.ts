/**
 * File Storage Abstraction Layer
 *
 * This module provides an abstraction over file storage mechanisms.
 * Currently uses dataURLs for immediate upload, but designed to easily
 * swap in S3/Supabase Storage when user auth and persistence are added.
 *
 * Usage:
 * - uploadFile(): Uploads a file and returns a reference
 * - getFileUrl(): Gets the URL to access the file
 *
 * Future Migration:
 * When adding S3/Supabase Storage, update the implementation of these
 * functions to use signed URLs instead of dataURLs.
 */

import { type FileUIPart } from "ai";

export type FileReference = {
  id: string;
  url: string; // dataURL now, will be S3/Supabase URL later
  mediaType: string;
  filename?: string;
  storageType: "dataurl" | "s3"; // Future: add 'supabase' | 's3'
};

/**
 * Uploads a file and returns a reference.
 *
 * Current: Converts to dataURL
 * Future: Upload to S3/Supabase Storage and return signed URL
 */
export async function uploadFile(file: FileUIPart): Promise<FileReference> {
  // For now, use dataURL (already converted by PromptInput)
  return {
    id: crypto.randomUUID(),
    url: file.url, // This is already a dataURL from PromptInput
    mediaType: file.mediaType || "application/octet-stream",
    filename: file.filename,
    storageType: "dataurl",
  };
}

/**
 * Uploads multiple files in parallel.
 */
export async function uploadFiles(
  files: FileUIPart[]
): Promise<FileReference[]> {
  return Promise.all(files.map(uploadFile));
}

/**
 * Gets the URL to access a file.
 *
 * Current: Returns the dataURL directly
 * Future: Generate signed URL for S3/Supabase object
 */
export function getFileUrl(reference: FileReference): string {
  if (reference.storageType === "dataurl") {
    return reference.url;
  }

  // Future: Handle S3/Supabase URL generation
  // if (reference.storageType === 's3') {
  //   return generateSignedUrl(reference.url);
  // }

  return reference.url;
}

/**
 * Checks if a file is an image based on media type.
 */
export function isImageFile(reference: FileReference): boolean {
  return reference.mediaType.startsWith("image/");
}

/**
 * Checks if a file is a PDF based on media type.
 */
export function isPDFFile(reference: FileReference): boolean {
  return reference.mediaType === "application/pdf";
}

/**
 * Gets a human-readable file type label.
 */
export function getFileTypeLabel(reference: FileReference): string {
  if (isImageFile(reference)) {
    return "Image";
  }
  if (isPDFFile(reference)) {
    return "PDF";
  }
  return reference.filename?.split(".").pop()?.toUpperCase() || "File";
}

// ============================================================================
// Future S3/Supabase Implementation Template
// ============================================================================

/**
 * FUTURE: When adding S3/Supabase Storage, implement these functions:
 *
 * async function uploadToS3(file: FileUIPart): Promise<FileReference> {
 *   // 1. Convert dataURL back to Blob
 *   const blob = await dataURLToBlob(file.url);
 *
 *   // 2. Generate unique file path
 *   const filePath = `uploads/${userId}/${Date.now()}-${file.filename}`;
 *
 *   // 3. Upload to Supabase Storage
 *   const { data, error } = await supabase.storage
 *     .from('chat-attachments')
 *     .upload(filePath, blob, {
 *       contentType: file.mediaType,
 *       cacheControl: '3600',
 *       upsert: false,
 *     });
 *
 *   if (error) throw error;
 *
 *   // 4. Get public URL or signed URL
 *   const { data: { publicUrl } } = supabase.storage
 *     .from('chat-attachments')
 *     .getPublicUrl(filePath);
 *
 *   return {
 *     id: crypto.randomUUID(),
 *     url: publicUrl,
 *     mediaType: file.mediaType,
 *     filename: file.filename,
 *     storageType: 's3',
 *   };
 * }
 *
 * async function dataURLToBlob(dataURL: string): Promise<Blob> {
 *   const response = await fetch(dataURL);
 *   return response.blob();
 * }
 */
