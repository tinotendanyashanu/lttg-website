import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import {
  buildUploadKey,
  getMediaCategory,
  getR2S3Client,
  MAX_SIZE,
  resolveMimeType,
} from '@/lib/admin-upload-media';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithDevBypass();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const account = await getAccountByEmail(session.user.email);
    if (!account || !account.roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as {
      filename?: string;
      mimeType?: string;
      folder?: string;
      size?: number;
    };

    const filename = String(body.filename || '').trim();
    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    const folderRaw = String(body.folder || 'academy').replace(/^\/+|\/+$/g, '') || 'academy';
    if (folderRaw.includes('..') || folderRaw.includes('//')) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    }
    const size = Number(body.size);
    if (!Number.isFinite(size) || size < 1) {
      return NextResponse.json({ error: 'Invalid file size' }, { status: 400 });
    }

    const mimeType = resolveMimeType(filename, body.mimeType);
    if (!mimeType) {
      return NextResponse.json(
        { error: 'Could not determine a supported file type; set a correct extension or MIME type.' },
        { status: 400 },
      );
    }

    const category = getMediaCategory(mimeType);
    if (!category) {
      return NextResponse.json({ error: `File type "${mimeType}" is not allowed` }, { status: 400 });
    }

    if (size > MAX_SIZE[category]) {
      const maxMb = MAX_SIZE[category] / (1024 * 1024);
      return NextResponse.json(
        { error: `File exceeds maximum size of ${maxMb}MB for ${category}` },
        { status: 400 },
      );
    }

    const key = buildUploadKey(folderRaw, category, filename);
    const bucket = process.env.R2_BUCKET_NAME;
    const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/+$/, '');
    if (!bucket || !publicBase) {
      return NextResponse.json({ error: 'Storage is not configured' }, { status: 500 });
    }

    const client = getR2S3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    const publicUrl = `${publicBase}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
      category,
      contentType: mimeType,
      size,
      name: filename,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Presign failed';
    console.error('[upload-media/presign] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
