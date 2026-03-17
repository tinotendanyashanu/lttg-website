'use client';

import { useState, useEffect, useTransition } from 'react';
import { getDocuments, addDocumentLink, deleteDocument } from '@/lib/actions/documents';
import type { DocEntityType } from '@/models/Document';

interface Doc {
  _id: string;
  name: string;
  url?: string;
  fileKey?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedBy?: { fullName?: string; email: string };
  createdAt: string;
}

const ICON_BY_TYPE: Record<string, string> = {
  pdf:   'picture_as_pdf',
  doc:   'description',
  docx:  'description',
  xls:   'table_chart',
  xlsx:  'table_chart',
  ppt:   'slideshow',
  pptx:  'slideshow',
  png:   'image',
  jpg:   'image',
  jpeg:  'image',
  gif:   'image',
  zip:   'folder_zip',
  txt:   'text_snippet',
};

function getExt(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}

function fileIcon(doc: Doc) {
  const ext = getExt(doc.name);
  return ICON_BY_TYPE[ext] || 'attach_file';
}

function formatBytes(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentsPanel({
  entityType,
  entityId,
  isAdmin,
}: {
  entityType: DocEntityType;
  entityId: string;
  isAdmin?: boolean;
}) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getDocuments(entityType, entityId)
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  function handleAdd() {
    setError('');
    if (!newName.trim() || !newUrl.trim()) {
      setError('Both name and URL are required.');
      return;
    }
    startTransition(async () => {
      try {
        const res = await addDocumentLink(entityType, entityId, newName, newUrl);
        setDocs(prev => [res.doc, ...prev]);
        setNewName('');
        setNewUrl('');
        setShowAdd(false);
      } catch (err: any) {
        setError(err.message || 'Failed to add document');
      }
    });
  }

  function handleDelete(docId: string) {
    if (!confirm('Remove this document?')) return;
    startTransition(async () => {
      try {
        await deleteDocument(docId);
        setDocs(prev => prev.filter(d => d._id !== docId));
      } catch (err: any) {
        alert(err.message || 'Failed to delete document');
      }
    });
  }

  const inputCls = 'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20';

  return (
    <div className="space-y-3">
      {/* Add button */}
      <button
        onClick={() => setShowAdd(v => !v)}
        className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
      >
        <span className="material-icons-outlined text-[15px]">{showAdd ? 'close' : 'add_link'}</span>
        {showAdd ? 'Cancel' : 'Attach link'}
      </button>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-xl border border-brand-primary/20 bg-gray-50 dark:bg-gray-800/50 p-3 space-y-2 animate-in zoom-in-95 duration-150">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Document name (e.g. NDA 2025)"
            className={inputCls}
          />
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="URL (Google Drive, Dropbox, etc.)"
            className={inputCls}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-60 text-white py-2 rounded-xl text-xs font-medium transition-all"
          >
            {isPending ? 'Attaching...' : 'Attach'}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-xs text-gray-400 dark:text-gray-600 py-2">Loading documents...</p>
      ) : docs.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600 py-2">No documents attached.</p>
      ) : (
        <div className="space-y-1.5">
          {docs.map(doc => (
            <div
              key={doc._id}
              className="flex items-center gap-2 group rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-[#27272a] p-2.5 transition-colors"
            >
              <span className="material-icons-outlined text-[20px] text-gray-400 dark:text-gray-500 shrink-0">{fileIcon(doc)}</span>
              <div className="flex-1 min-w-0">
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-brand-primary hover:underline truncate block"
                  >
                    {doc.name}
                  </a>
                ) : (
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-600">
                  {doc.uploadedBy?.fullName || doc.uploadedBy?.email || 'Unknown'}
                  {' · '}
                  {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {doc.sizeBytes ? ` · ${formatBytes(doc.sizeBytes)}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDelete(doc._id)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-30"
              >
                <span className="material-icons-outlined text-[14px]">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
