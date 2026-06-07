/**
 * Pure, server-safe attachment helpers shared across the Support Center.
 * Kept free of the 'use client' boundary so server components (e.g. the message
 * renderer) can import them directly. The client-side uploader lives in
 * `uploadAttachments.ts`.
 */

export interface TicketAttachment {
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}
