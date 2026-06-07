import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';

const MAX_BYTES = 25 * 1024 * 1024; // 25MB per file

/**
 * Upload a single attachment for a support-ticket reply.
 *
 * Reused by both the client portal and the staff (admin/employee) ticket panel.
 * Stores the file in R2 and returns its metadata so the caller can attach it to a
 * reply via the relevant server action. Clients may only attach to their own
 * tickets; staff may attach to any ticket.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (!session?.user?.id || (role !== 'client' && role !== 'admin' && role !== 'employee')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const ticketId = formData.get('ticketId') as string | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds 25MB limit' }, { status: 400 });
    }
    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId is required' }, { status: 400 });
    }

    await dbConnect();
    const { SupportTicket } = await import('@/models/SupportTicket');
    const ticket = await SupportTicket.findById(ticketId, 'clientId').lean();
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    // Clients can only attach to tickets they own.
    if (role === 'client' && String((ticket as any).clientId) !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uploadFileToR2 } = await import('@/lib/r2');
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `support/${ticketId}/${Date.now()}-${safeName}`;
    const url = await uploadFileToR2(buffer, key, file.type || 'application/octet-stream');

    return NextResponse.json({
      success: true,
      attachment: {
        url,
        name: file.name,
        size: file.size,
        mimeType: file.type || undefined,
      },
    });
  } catch (err) {
    console.error('Support attachment upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
