'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');
  return account;
}

export async function getInvoicesPendingApproval() {
  await requireAdmin();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const invoices = await ClientInvoice.find({ approvalStatus: 'pending', status: 'pending_approval' })
    .sort({ submittedForApprovalAt: 1 })
    .lean();

  const employeeIds = [...new Set(invoices.map((inv: any) => String(inv.createdByEmployeeId)).filter(Boolean))];
  const clientIds = [...new Set(invoices.map((inv: any) => String(inv.clientId)).filter(Boolean))];
  const allIds = [...new Set([...employeeIds, ...clientIds])];

  const accounts = await Account.find({ _id: { $in: allIds } }, 'fullName email roles').lean();
  const accountMap: Record<string, any> = {};
  for (const a of accounts as any[]) accountMap[String(a._id)] = a;

  return {
    success: true,
    invoices: JSON.parse(JSON.stringify(invoices)),
    accountMap: JSON.parse(JSON.stringify(accountMap)),
  };
}

export async function getAllEmployeeInvoices(filter?: { status?: string }) {
  await requireAdmin();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const query: any = { createdByEmployeeId: { $exists: true } };
  if (filter?.status && filter.status !== 'all') query.status = filter.status;

  const invoices = await ClientInvoice.find(query).sort({ createdAt: -1 }).lean();

  const ids = [...new Set([
    ...invoices.map((inv: any) => String(inv.createdByEmployeeId)),
    ...invoices.map((inv: any) => String(inv.clientId)),
  ].filter(Boolean))];

  const accounts = await Account.find({ _id: { $in: ids } }, 'fullName email roles').lean();
  const accountMap: Record<string, any> = {};
  for (const a of accounts as any[]) accountMap[String(a._id)] = a;

  return {
    success: true,
    invoices: JSON.parse(JSON.stringify(invoices)),
    accountMap: JSON.parse(JSON.stringify(accountMap)),
  };
}

export async function approveEmployeeInvoice(invoiceId: string, notes?: string) {
  const admin = await requireAdmin();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  const invoice = await ClientInvoice.findById(invoiceId);
  if (!invoice) return { success: false, message: 'Invoice not found' };
  if (invoice.approvalStatus !== 'pending') {
    return { success: false, message: 'Invoice is not pending approval' };
  }

  await ClientInvoice.findByIdAndUpdate(invoiceId, {
    $set: {
      status: 'issued',
      approvalStatus: 'approved',
      approvedByAdminId: admin._id,
      approvalNotes: notes || '',
      approvedAt: new Date(),
      issuedAt: new Date(),
    },
  });

  revalidatePath('/portal/employee/admin/invoices');
  revalidatePath('/portal/employee/invoices');
  return { success: true };
}

export async function rejectEmployeeInvoice(invoiceId: string, reason: string) {
  const admin = await requireAdmin();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  const invoice = await ClientInvoice.findById(invoiceId);
  if (!invoice) return { success: false, message: 'Invoice not found' };
  if (invoice.approvalStatus !== 'pending') {
    return { success: false, message: 'Invoice is not pending approval' };
  }

  await ClientInvoice.findByIdAndUpdate(invoiceId, {
    $set: {
      status: 'rejected',
      approvalStatus: 'rejected',
      approvedByAdminId: admin._id,
      approvalNotes: reason,
      approvedAt: new Date(),
    },
  });

  revalidatePath('/portal/employee/admin/invoices');
  revalidatePath('/portal/employee/invoices');
  return { success: true };
}
