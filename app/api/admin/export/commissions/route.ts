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
  const Commission = (await import('@/models/Commission')).default;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const commissions = await Commission.find(query)
    .populate('accountId', 'fullName email roles')
    .populate('caseId', 'businessName contactName')
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();

  const headers = [
    'Staff Name', 'Staff Email', 'Role',
    'Amount', 'Commission Rate (%)',
    'Status', 'Case',
    'Approved At', 'Paid At', 'Created At',
  ];

  const lines = [
    headers.join(','),
    ...commissions.map((c: any) => row([
      c.accountId?.fullName || '',
      c.accountId?.email || '',
      c.role || '',
      c.amount,
      (c.commissionRate * 100).toFixed(2),
      c.status,
      c.caseId?.businessName || c.caseId?.contactName || (c.caseId ? String(c.caseId._id || c.caseId) : ''),
      c.approvedAt ? new Date(c.approvedAt).toISOString() : '',
      c.paidAt ? new Date(c.paidAt).toISOString() : '',
      new Date(c.createdAt).toISOString(),
    ])),
  ];

  const csv = lines.join('\n');
  const filename = `commissions-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
