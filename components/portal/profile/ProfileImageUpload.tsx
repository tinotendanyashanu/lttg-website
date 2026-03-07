'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { uploadProfileImage } from '@/lib/actions/profile';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  fullName?: string;
}

export default function ProfileImageUpload({ currentImageUrl, fullName }: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = preview || currentImageUrl;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Please select an image file (JPG, PNG, etc.)' });
      return;
    }

    // Validate size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Image must be under 5 MB' });
      return;
    }

    setStatus({ type: 'idle' });
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file first' });
      return;
    }

    const formData = new FormData();
    formData.append('imageFile', file);

    startTransition(async () => {
      const res = await uploadProfileImage(formData);
      if (res.success) {
        setStatus({ type: 'success', message: 'Profile picture updated!' });
        setPreview(null); // let the server-revalidated image take over
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setStatus({ type: 'error', message: res.message || 'Upload failed' });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Image preview */}
      <div
        className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden flex items-center justify-center cursor-pointer relative group transition-all hover:border-brand-primary"
        onClick={() => fileInputRef.current?.click()}
        title="Click to select a new photo"
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={fullName || 'Profile'}
            width={96}
            height={96}
            className="object-cover w-full h-full"
            unoptimized={!!preview} /* skip Next optimization for local blob/data URLs */
          />
        ) : (
          <span className="material-icons-outlined text-4xl text-gray-300 dark:text-gray-600">person</span>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="material-icons-outlined text-white text-xl">photo_camera</span>
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          name="imageFile"
          id="imageFile"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 transition-colors cursor-pointer outline-none"
        />

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-primary hover:bg-brand-secondary disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="material-icons-outlined animate-spin text-base">autorenew</span>
              Uploading…
            </>
          ) : (
            <>
              <span className="material-icons-outlined text-base">cloud_upload</span>
              Upload Photo
            </>
          )}
        </button>
      </form>

      {/* Status feedback */}
      {status.type !== 'idle' && (
        <p
          className={`text-xs font-medium flex items-center gap-1 ${
            status.type === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          <span className="material-icons-outlined text-sm">
            {status.type === 'success' ? 'check_circle' : 'error_outline'}
          </span>
          {status.message}
        </p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">JPG or PNG · max 5 MB</p>
    </div>
  );
}
