'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const EVIDENCE_TYPES = [
  { value: 'screenshot', label: 'Screenshot', icon: 'image' },
  { value: 'document', label: 'Document', icon: 'description' },
  { value: 'video', label: 'Video', icon: 'video_file' },
  { value: 'link', label: 'Link / URL', icon: 'link' },
  { value: 'archive', label: 'Archive', icon: 'folder_zip' },
  { value: 'other', label: 'Other', icon: 'attach_file' },
];

function EvidenceUploadForm() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') || '';
  const [selectedType, setSelectedType] = useState('screenshot');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLink = selectedType === 'link';

  const handleFile = (f: File) => {
    setFile(f);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    if (file) formData.set('file', file);
    try {
      const res = await fetch('/api/client/evidence/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-12 text-center">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-outlined text-green-600 dark:text-green-400 text-3xl">
            check_circle
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Evidence Uploaded
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your evidence has been securely stored.
        </p>
        <div className="flex items-center justify-center gap-3">
          {caseId && (
            <Link
              href={`/portal/client/cases/${caseId}/evidence`}
              className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
            >
              View Case Evidence
            </Link>
          )}
          <Link
            href="/portal/client/evidence/library"
            className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Evidence Library
          </Link>
          <button
            onClick={() => {
              setSuccess(false);
              setFile(null);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type selector */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Evidence Type
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {EVIDENCE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                selectedType === t.value
                  ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                  : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
              }`}
            >
              <span className="material-icons-outlined text-[20px] text-gray-600 dark:text-gray-400">
                {t.icon}
              </span>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                {t.label}
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={selectedType} />
        {caseId && <input type="hidden" name="caseId" value={caseId} />}
      </div>

      {/* Details */}
      <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Details</p>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Name / Title <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            required
            type="text"
            placeholder="e.g. Screenshot of fraudulent transaction"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Provide context about this evidence..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow resize-none"
          />
        </div>

        {isLink ? (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              name="url"
              required={isLink}
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-shadow"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              File
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="material-icons-outlined text-green-600 dark:text-green-400">
                    check_circle
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    <span className="material-icons-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-4xl block mb-2">
                    cloud_upload
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag & drop or <span className="text-blue-600 dark:text-blue-400">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Max 50MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm">
          <span className="material-icons-outlined text-[16px]">error_outline</span>
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-colors"
        >
          {uploading ? (
            <>
              <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
              Uploading...
            </>
          ) : (
            <>
              <span className="material-icons-outlined text-[16px]">upload_file</span>
              Upload Evidence
            </>
          )}
        </button>
        <Link
          href={caseId ? `/portal/client/cases/${caseId}/evidence` : '/portal/client/evidence/library'}
          className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function EvidenceUploadPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Suspense fallback={<div className="h-8" />}>
        <EvidenceUploadForm />
      </Suspense>
    </div>
  );
}
