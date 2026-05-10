'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

async function requireEmployee() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');
  const account = await getAccountByEmail(session.user.email);
  if (!account) throw new Error('Account not found');
  const isStaff = account.roles.includes('admin') || account.roles.includes('employee') || account.roles.includes('intern');
  if (!isStaff) throw new Error('Unauthorized');
  return account;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `EMP-${year}-${rand}`;
}

export type EmployeeLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export async function getClientsForEmployee() {
  await requireEmployee();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find({ roles: 'client', isActive: true }, 'fullName email').sort({ fullName: 1 }).lean();
  return { success: true, clients: JSON.parse(JSON.stringify(clients)) };
}

export async function getMyInvoices() {
  const account = await requireEmployee();
  const { ClientInvoice } = await import('@/models/ClientInvoice');
  const { Account } = await import('@/models/Account');

  const invoices = await ClientInvoice.find({ createdByEmployeeId: account._id })
    .sort({ createdAt: -1 })
    .lean();

  const clientIds = [...new Set(invoices.map((inv: any) => String(inv.clientId)))].filter(Boolean);
  const clients = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const clientMap: Record<string, any> = {};
  for (const c of clients as any[]) clientMap[String(c._id)] = c;

  return {
    success: true,
    invoices: JSON.parse(JSON.stringify(invoices)),
    clientMap: JSON.parse(JSON.stringify(clientMap)),
  };
}

export async function createEmployeeInvoice(data: {
  clientId: string;
  caseId?: string;
  currency?: string;
  description?: string;
  lineItems: EmployeeLineItem[];
  dueAt?: string;
  notes?: string;
  submitForApproval?: boolean;
}) {
  const account = await requireEmployee();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  if (!data.clientId) return { success: false, message: 'Client is required' };
  if (!data.lineItems?.length) return { success: false, message: 'At least one line item is required' };

  const total = data.lineItems.reduce((sum, item) => sum + (item.total ?? item.quantity * item.unitPrice), 0);
  const invoiceNumber = generateInvoiceNumber();

  const status = data.submitForApproval ? 'pending_approval' : 'draft';
  const approvalStatus = data.submitForApproval ? 'pending' : 'not_required';

  const invoice = await ClientInvoice.create({
    invoiceNumber,
    clientId: data.clientId,
    caseId: data.caseId || undefined,
    currency: data.currency || 'USD',
    amount: total,
    status,
    description: data.description,
    lineItems: data.lineItems,
    dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    notes: data.notes,
    amountPaid: 0,
    remainingBalance: total,
    createdByEmployeeId: account._id,
    approvalStatus,
    submittedForApprovalAt: data.submitForApproval ? new Date() : undefined,
  });

  revalidatePath('/portal/employee/invoices');
  revalidatePath('/portal/employee/admin/invoices');

  return { success: true, invoiceId: invoice._id.toString() };
}

export async function updateEmployeeInvoice(invoiceId: string, data: {
  description?: string;
  lineItems?: EmployeeLineItem[];
  dueAt?: string;
  notes?: string;
}) {
  const account = await requireEmployee();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  const invoice = await ClientInvoice.findOne({ _id: invoiceId, createdByEmployeeId: account._id });
  if (!invoice) return { success: false, message: 'Invoice not found or access denied' };
  if (invoice.status !== 'draft') return { success: false, message: 'Only draft invoices can be edited' };

  const total = data.lineItems?.reduce((sum, item) => sum + (item.total ?? item.quantity * item.unitPrice), 0) ?? invoice.amount;

  await ClientInvoice.findByIdAndUpdate(invoiceId, {
    $set: {
      description: data.description,
      lineItems: data.lineItems,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      notes: data.notes,
      amount: total,
      remainingBalance: total - invoice.amountPaid,
    },
  });

  revalidatePath('/portal/employee/invoices');
  return { success: true };
}

export async function submitInvoiceForApproval(invoiceId: string) {
  const account = await requireEmployee();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  const invoice = await ClientInvoice.findOne({ _id: invoiceId, createdByEmployeeId: account._id });
  if (!invoice) return { success: false, message: 'Invoice not found' };
  if (invoice.status !== 'draft') return { success: false, message: 'Only draft invoices can be submitted' };

  await ClientInvoice.findByIdAndUpdate(invoiceId, {
    $set: {
      status: 'pending_approval',
      approvalStatus: 'pending',
      submittedForApprovalAt: new Date(),
    },
  });

  revalidatePath('/portal/employee/invoices');
  revalidatePath('/portal/employee/admin/invoices');
  return { success: true };
}

export async function deleteEmployeeInvoice(invoiceId: string) {
  const account = await requireEmployee();
  const { ClientInvoice } = await import('@/models/ClientInvoice');

  const invoice = await ClientInvoice.findOne({ _id: invoiceId, createdByEmployeeId: account._id });
  if (!invoice) return { success: false, message: 'Invoice not found' };
  if (!['draft', 'rejected'].includes(invoice.status)) {
    return { success: false, message: 'Only draft or rejected invoices can be deleted' };
  }

  await ClientInvoice.findByIdAndDelete(invoiceId);
  revalidatePath('/portal/employee/invoices');
  return { success: true };
}
