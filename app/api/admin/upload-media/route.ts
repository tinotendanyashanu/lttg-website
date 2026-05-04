import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_TYPES: Record<string, string[]> = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/aac', 'audio/x-m4a'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_SIZE: Record<string, number> = {
  video: 500 * 1024 * 1024,    // 500MB
  audio: 100 * 1024 * 1024,    // 100MB
  image: 10 * 1024 * 1024,     // 10MB
  document: 50 * 1024 * 1024,  // 50MB
};

function getMediaCategory(mimeType: string): string | null {
  for (const [category, types] of Object.entries(ALLOWED_TYPES)) {
    if (types.includes(mimeType)) return category;
  }
  return null;
}

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getSessionWithDevBypass();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'academy';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mimeType = file.type;
    const category = getMediaCategory(mimeType);

    if (!category) {
      return NextResponse.json({ error: `File type "${mimeType}" is not allowed` }, { status: 400 });
    }

    if (file.size > MAX_SIZE[category]) {
      const maxMb = MAX_SIZE[category] / (1024 * 1024);
      return NextResponse.json({ error: `File exceeds maximum size of ${maxMb}MB for ${category}` }, { status: 400 });
    }

    // Build unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const ext = getExtension(file.name);
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_').replace(ext, '');
    const key = `${folder}/${category}/${timestamp}-${random}-${safeName}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentLength: buffer.byteLength,
    }));

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      category,
      mimeType,
      size: file.size,
      name: file.name,
    });
  } catch (error: any) {
    console.error('[upload-media] Error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}

// Max body size for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60;
