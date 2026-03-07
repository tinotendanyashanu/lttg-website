import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const caseId = formData.get('caseId') as string | null;
    const url = formData.get('url') as string | null;
    const file = formData.get('file') as File | null;

    if (!type || !name) {
      return NextResponse.json({ error: 'type and name are required' }, { status: 400 });
    }

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;
    let mimeType: string | undefined;

    if (type === 'link') {
      if (!url) return NextResponse.json({ error: 'URL is required for link type' }, { status: 400 });
      fileUrl = url;
    } else if (file && file.size > 0) {
      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 400 });
      }
      const { uploadFileToR2 } = await import('@/lib/r2');
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = `evidence/${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      fileUrl = await uploadFileToR2(buffer, key, file.type);
      fileName = file.name;
      fileSize = file.size;
      mimeType = file.type;
    }

    await dbConnect();
    const { ClientEvidence } = await import('@/models/ClientEvidence');
    await ClientEvidence.create({
      clientId: session.user.id,
      caseId: caseId || undefined,
      name,
      description: description || undefined,
      type,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      uploadedBy: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Evidence upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
