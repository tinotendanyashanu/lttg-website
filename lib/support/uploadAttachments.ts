'use client';

/**
 * Client-side helper to upload support-ticket reply attachments.
 * Used by both the client portal reply form and the staff ticket panel so the
 * upload contract stays in one place. Uploads each file to the support upload
 * route and returns the persisted attachment metadata to send with the reply.
 *
 * Pure/server-safe helpers (the type + size formatter) live in `attachments.ts`.
 */

import { type TicketAttachment } from '@/lib/support/attachments';

export { formatFileSize } from '@/lib/support/attachments';
export type { TicketAttachment } from '@/lib/support/attachments';

export async function uploadTicketAttachments(
  ticketId: string,
  files: File[],
): Promise<TicketAttachment[]> {
  const uploaded: TicketAttachment[] = [];
  for (const file of files) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('ticketId', ticketId);
    const res = await fetch('/api/support/attachments/upload', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.attachment) {
      throw new Error(data?.error || `Failed to upload ${file.name}`);
    }
    uploaded.push(data.attachment as TicketAttachment);
  }
  return uploaded;
}
