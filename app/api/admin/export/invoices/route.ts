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
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const invoices = await ClientInvoice.find(query).sort({ createdAt: -1 }).limit(5000).lean();
  const clientIds = [...new Set(invoices.map((inv: any) => String(inv.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: acc.fullName, email: acc.email };
  }

  const headers = [
    'Invoice Number', 'Client Name', 'Client Email',
    'Amount', 'Currency', 'USD Amount',
    'Amount Paid', 'Remaining Balance',
    'Status', 'Description',
    'Issued At', 'Due At', 'Paid At',
    'Created At',
  ];

  const lines = [
    headers.join(','),
    ...invoices.map((inv: any) => {
      const client = accountMap[String(inv.clientId)] || {};
      return row([
        inv.invoiceNumber,
        client.fullName || '',
        client.email || '',
        inv.amount,
        inv.currency || 'USD',
        inv.usdAmount ?? '',
        inv.amountPaid ?? 0,
        inv.remainingBalance ?? inv.amount,
        inv.status,
        inv.description || '',
        inv.issuedAt ? new Date(inv.issuedAt).toISOString() : '',
        inv.dueAt ? new Date(inv.dueAt).toISOString() : '',
        inv.paidAt ? new Date(inv.paidAt).toISOString() : '',
        new Date(inv.createdAt).toISOString(),
      ]);
    }),
  ];

  const csv = lines.join('\n');
  const filename = `invoices-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
