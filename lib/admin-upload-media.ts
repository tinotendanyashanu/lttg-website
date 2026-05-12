import { S3Client } from '@aws-sdk/client-s3';

export const ALLOWED_TYPES: Record<string, string[]> = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/x-m4a'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export const MAX_SIZE: Record<string, number> = {
  video: 500 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  image: 10 * 1024 * 1024,
  document: 50 * 1024 * 1024,
};

const EXT_TO_MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/x-m4a',
  '.aac': 'audio/aac',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

let r2Client: S3Client | null = null;

export function getR2S3Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

export function getMediaCategory(mimeType: string): string | null {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) return category;
  }
  return null;
}

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

export function guessMimeFromFilename(filename: string): string | null {
  const ext = getExtension(filename).toLowerCase();
  return EXT_TO_MIME[ext] ?? null;
}

export function resolveMimeType(filename: string, reportedType: string | undefined): string | null {
  const trimmed = (reportedType || '').trim();
  if (trimmed && getMediaCategory(trimmed)) return trimmed;
  const guessed = guessMimeFromFilename(filename);
  return guessed && getMediaCategory(guessed) ? guessed : null;
}

export function buildUploadKey(folder: string, category: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const ext = getExtension(filename);
  const safeName = filename.replace(/[^a-z0-9._-]/gi, '_').replace(ext, '');
  return `${folder}/${category}/${timestamp}-${random}-${safeName}${ext}`;
}
