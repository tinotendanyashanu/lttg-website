import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(cells: unknown[]): string {
  return cells.map(escapeCSV).join(',');
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await dbConnect();
  const Lead = (await import('@/models/Lead')).default;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const clients = await Lead.find(query)
    .populate('accountId', 'email isActive')
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();

  const headers = [
    'Business Name', 'Contact Name',
    'Email', 'Phone',
    'Status', 'Service Interest', 'Source',
    'Has Portal Account', 'Portal Active',
    'Notes', 'Created At',
  ];

  const lines = [
    headers.join(','),
    ...clients.map((c: any) => row([
      c.businessName || '',
      c.contactName || '',
      c.clientEmail || c.accountId?.email || '',
      c.phone || c.clientPhone || '',
      c.status || 'new',
      c.serviceInterest || '',
      c.source || '',
      c.accountId ? 'Yes' : 'No',
      c.accountId?.isActive !== false ? 'Active' : 'Suspended',
      c.notes || '',
      new Date(c.createdAt).toISOString(),
    ])),
  ];

  const csv = lines.join('\n');
  const filename = `clients-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
