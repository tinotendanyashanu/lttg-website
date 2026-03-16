'use client';

import { useEffect, useState, useTransition } from 'react';
import { getInternalNotes, addInternalNote, deleteInternalNote, togglePinNote } from '@/lib/actions/internal-notes';
import type { NoteEntityType } from '@/models/InternalNote';

interface Note {
  _id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author?: { fullName?: string; email?: string } | null;
}

interface Props {
  entityType: NoteEntityType;
  entityId: string;
  isAdmin?: boolean;
}

export default function InternalNotesPanel({ entityType, entityId, isAdmin = false }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function loadNotes() {
    setLoading(true);
    getInternalNotes(entityType, entityId)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId]);

  function handleAdd() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await addInternalNote(entityType, entityId, text);
        setText('');
        loadNotes();
      } catch (err: any) {
        setError(err?.message || 'Failed to add note.');
      }
    });
  }

  function handleDelete(noteId: string) {
    if (!confirm('Delete this note?')) return;
    startTransition(async () => {
      try {
        await deleteInternalNote(noteId);
        loadNotes();
      } catch (err: any) {
        setError(err?.message || 'Failed to delete note.');
      }
    });
  }

  function handlePin(noteId: string) {
    startTransition(async () => {
      try {
        await togglePinNote(noteId);
        loadNotes();
      } catch (err: any) {
        setError(err?.message || 'Failed to pin note.');
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Add note */}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a private internal note…"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
          }}
        />
        <button
          onClick={handleAdd}
          disabled={isPending || !text.trim()}
          className="self-end p-2.5 rounded-xl bg-brand-primary hover:opacity-90 disabled:opacity-40 text-white transition-opacity"
          title="Add note (Ctrl+Enter)"
        >
          <span className="material-icons-outlined text-[18px]">send</span>
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="py-4 text-center text-xs text-gray-400">Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-600">
          No internal notes yet. Notes are private to staff.
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`group rounded-xl p-3 text-sm relative ${
                note.isPinned
                  ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30'
                  : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800'
              }`}
            >
              {note.isPinned && (
                <span className="material-icons-outlined text-[12px] text-amber-500 absolute top-2 right-8">push_pin</span>
              )}
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-gray-400 dark:text-gray-600">
                  {note.author?.fullName || note.author?.email || 'Staff'} ·{' '}
                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isAdmin && (
                    <button
                      onClick={() => handlePin(note._id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <span className="material-icons-outlined text-[14px]">push_pin</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete note"
                  >
                    <span className="material-icons-outlined text-[14px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
