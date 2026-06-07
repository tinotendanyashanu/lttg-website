import { formatFileSize, type TicketAttachment } from '@/lib/support/attachments';

/**
 * Presentational list of attachments on a ticket message. Reused by the admin,
 * employee and client ticket views so attachment rendering stays consistent.
 */

function iconFor(mimeType?: string, name?: string): string {
  const ext = (name?.split('.').pop() || '').toLowerCase();
  if (mimeType?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  if (mimeType === 'application/pdf' || ext === 'pdf') return 'picture_as_pdf';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'folder_zip';
  if (['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return 'description';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
  return 'attach_file';
}

export default function MessageAttachments({
  attachments,
}: {
  attachments?: TicketAttachment[] | null;
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((att, i) => (
        <a
          key={i}
          href={att.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 max-w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:border-brand-primary/40 hover:text-brand-primary transition-colors"
        >
          <span className="material-icons-outlined text-[16px] text-gray-400 shrink-0">
            {iconFor(att.mimeType, att.name)}
          </span>
          <span className="truncate font-medium">{att.name}</span>
          {att.size ? (
            <span className="text-gray-400 shrink-0">{formatFileSize(att.size)}</span>
          ) : null}
        </a>
      ))}
    </div>
  );
}
