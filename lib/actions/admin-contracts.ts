'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import { sendEmail, EmailTemplates } from '@/lib/email';
import { generateSigningToken, interpolateTemplate, type TemplateVars } from '@/lib/contract-utils';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session.user;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

// ── Get clients for contract dropdown ─────────────────────────────────────────

export async function getClientsForContract() {
  await checkAdmin();
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find({ roles: 'client', isActive: true, linkedClientAccountId: { $exists: false } }, 'fullName email').sort({ fullName: 1 }).lean();
  return JSON.parse(JSON.stringify(clients));
}

// ── Get all contracts (admin) ──────────────────────────────────────────────────

export async function getAdminContracts() {
  await checkAdmin();
  await dbConnect();
  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');

  const contracts = await ClientContract.find().sort({ createdAt: -1 }).limit(500).lean();
  const clientIds = [...new Set(contracts.map((c: any) => String(c.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  return { contracts: JSON.parse(JSON.stringify(contracts)), accountMap };
}

// ── Get single contract (admin) ────────────────────────────────────────────────

export async function getAdminContract(contractId: string) {
  await checkAdmin();
  await dbConnect();
  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');

  const contract = await ClientContract.findById(contractId).lean();
  if (!contract) return null;

  const client = await Account.findById((contract as any).clientId, 'fullName email clientProfile').lean();

  return {
    contract: JSON.parse(JSON.stringify(contract)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

// ── Create contract ────────────────────────────────────────────────────────────

export async function createAdminContract(data: {
  clientId: string;
  caseId?: string;
  title: string;
  type?: string;
  content?: string;
  isHtml?: boolean;
  templateId?: string;
  status: 'draft' | 'sent';
  startDate?: string;
  endDate?: string;
  value?: number;
  currency?: string;
  notes?: string;
}) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const client = await Account.findOne({ _id: data.clientId, roles: 'client' });
  if (!client) throw new Error('Client not found');
  const resolvedClientId = client.linkedClientAccountId
    ? client.linkedClientAccountId.toString()
    : data.clientId;

  const count = await ClientContract.countDocuments();
  const year = new Date().getFullYear();
  const contractNumber = `CON-${year}-${String(count + 1).padStart(4, '0')}`;

  // Perform final variable interpolation server-side using client data
  let finalContent = data.content?.trim() || undefined;
  if (finalContent && data.isHtml) {
    const vars: TemplateVars = {
      client_name: client.fullName || '',
      business_name: (client as any).clientProfile?.companyName || '',
      company_name: 'LeoTheTechGuy',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      start_date: data.startDate
        ? new Date(data.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
      end_date: data.endDate
        ? new Date(data.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '',
      amount: data.value ? String(data.value) : '',
      currency: data.currency || 'USD',
    };
    finalContent = interpolateTemplate(finalContent, vars);
  }

  // Generate signing token if sending immediately
  let signingToken: string | undefined;
  let signingTokenExpiresAt: Date | undefined;
  if (data.status === 'sent') {
    const tokenData = generateSigningToken();
    signingToken = tokenData.token;
    signingTokenExpiresAt = tokenData.expiresAt;
  }

  const contract = await ClientContract.create({
    contractNumber,
    clientId: resolvedClientId,
    caseId: data.caseId || undefined,
    title: data.title.trim(),
    type: data.type?.trim() || 'Service Agreement',
    content: finalContent,
    isHtml: data.isHtml || false,
    templateId: data.templateId || undefined,
    status: data.status,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    value: data.value || undefined,
    currency: data.currency || 'USD',
    notes: data.notes?.trim() || undefined,
    signingToken,
    signingTokenExpiresAt,
  });

  await AuditLog.create({
    entityType: 'contract',
    entityId: contract._id,
    action: 'contract_created',
    performedBy: admin.id,
    details: { contractNumber, clientId: resolvedClientId, status: data.status },
    metadata: { contractNumber, title: data.title, status: data.status },
  });

  const portalLink = `${getBaseUrl()}/portal/client/contracts/${contract._id}`;

  if (data.status === 'sent') {
    await ClientNotification.create({
      clientId: resolvedClientId,
      type: 'contract_alert',
      title: `New Contract Ready: ${contractNumber}`,
      message: `A new contract "${data.title}" has been sent to you for review and signature.`,
      actionUrl: `/portal/client/contracts/${contract._id}`,
    });

    try {
      await sendEmail({
        to: client.email,
        subject: `Contract Ready for Signature: ${contractNumber}`,
        html: EmailTemplates.contractSent(client.fullName, contractNumber, data.title, portalLink),
      });
    } catch (_) {
      // Email failure is non-blocking
    }
  }

  revalidatePath('/admin/contracts');
  revalidatePath('/portal/client/contracts');
  return { success: true, contractId: contract._id.toString(), contractNumber };
}

// ── Update contract status (admin) ────────────────────────────────────────────

export async function updateAdminContractStatus(
  contractId: string,
  newStatus: 'draft' | 'sent' | 'under_review' | 'signed' | 'active' | 'expired' | 'terminated',
) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const contract = await ClientContract.findById(contractId);
  if (!contract) throw new Error('Contract not found');

  // Generate fresh signing token when transitioning to 'sent'
  const updateFields: Record<string, any> = { status: newStatus };
  if (newStatus === 'sent') {
    const { token, expiresAt } = generateSigningToken();
    updateFields.signingToken = token;
    updateFields.signingTokenExpiresAt = expiresAt;
  }

  await ClientContract.findByIdAndUpdate(contractId, { $set: updateFields });

  await AuditLog.create({
    entityType: 'contract',
    entityId: contractId,
    action: `contract_status_${newStatus}`,
    performedBy: admin.id,
    details: { contractId, newStatus, previousStatus: contract.status },
    metadata: { contractNumber: contract.contractNumber, newStatus },
  });

  const client = await Account.findById(contract.clientId, 'fullName email').lean();
  const portalLink = `${getBaseUrl()}/portal/client/contracts/${contractId}`;

  if (client && newStatus === 'sent') {
    await ClientNotification.create({
      clientId: contract.clientId,
      type: 'contract_alert',
      title: `Contract Ready for Signature: ${contract.contractNumber}`,
      message: `Contract "${contract.title}" has been sent to you for review and signature.`,
      actionUrl: `/portal/client/contracts/${contractId}`,
    });

    try {
      await sendEmail({
        to: (client as any).email,
        subject: `Contract Ready for Signature: ${contract.contractNumber}`,
        html: EmailTemplates.contractSent(
          (client as any).fullName,
          contract.contractNumber,
          contract.title,
          portalLink,
        ),
      });
    } catch (_) {}
  }

  revalidatePath('/admin/contracts');
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath('/portal/client/contracts');
  return { success: true };
}

// ── Resend contract to client (admin) ─────────────────────────────────────────

export async function resendContract(contractId: string) {
  const admin = await checkAdmin();
  await dbConnect();

  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const contract = await ClientContract.findById(contractId);
  if (!contract) throw new Error('Contract not found');

  const { token, expiresAt } = generateSigningToken();

  await ClientContract.findByIdAndUpdate(contractId, {
    $set: {
      status: 'sent',
      signingToken: token,
      signingTokenExpiresAt: expiresAt,
    },
  });

  await AuditLog.create({
    entityType: 'contract',
    entityId: contractId,
    action: 'contract_resent',
    performedBy: admin.id,
    details: { contractId, contractNumber: contract.contractNumber },
    metadata: { contractNumber: contract.contractNumber },
  });

  const client = await Account.findById(contract.clientId, 'fullName email').lean();
  if (!client) throw new Error('Client not found');

  const portalLink = `${getBaseUrl()}/portal/client/contracts/${contractId}`;

  await ClientNotification.create({
    clientId: contract.clientId,
    type: 'contract_alert',
    title: `Contract Resent for Signature: ${contract.contractNumber}`,
    message: `Contract "${contract.title}" has been resent to you for review and signature.`,
    actionUrl: `/portal/client/contracts/${contractId}`,
  });

  try {
    await sendEmail({
      to: (client as any).email,
      subject: `Contract Resent for Signature: ${contract.contractNumber}`,
      html: EmailTemplates.contractResent(
        (client as any).fullName,
        contract.contractNumber,
        contract.title,
        portalLink,
      ),
    });
  } catch (_) {}

  revalidatePath('/admin/contracts');
  revalidatePath(`/admin/contracts/${contractId}`);
  revalidatePath('/portal/client/contracts');
  return { success: true };
}

// ── Client signs the contract ──────────────────────────────────────────────────

export async function signContract(contractId: string, signerName: string, signatureDataUrl?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  if (session.user.role !== 'client') throw new Error('Only clients can sign contracts');

  if (!signerName || signerName.trim().length < 2) {
    throw new Error('A valid signer name is required');
  }

  if (signatureDataUrl && !signatureDataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('Invalid signature image format');
  }

  await dbConnect();

  const { ClientContract } = await import('@/models/ClientContract');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');
  const AuditLog = (await import('@/models/AuditLog')).default;

  const contract = await ClientContract.findOne({
    _id: contractId,
    clientId: session.user.id,
  });
  if (!contract) throw new Error('Contract not found');
  if (contract.status === 'signed') throw new Error('Contract already signed');
  if (!['sent', 'under_review'].includes(contract.status)) {
    throw new Error('This contract is not available for signing');
  }

  // Check signing token expiry (only for contracts that have a token)
  if (contract.signingTokenExpiresAt && new Date(contract.signingTokenExpiresAt) < new Date()) {
    throw new Error('This signing link has expired. Please contact support to receive a new contract link.');
  }

  const client = await Account.findById(session.user.id, 'fullName email').lean();
  if (!client) throw new Error('Client not found');

  const hdrs = await headers();
  const signerIp =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    hdrs.get('x-real-ip') ||
    'unknown';

  const signedAt = new Date();

  await ClientContract.findByIdAndUpdate(contractId, {
    $set: {
      status: 'signed',
      signedAt,
      signerName: signerName.trim(),
      signerIp,
      ...(signatureDataUrl ? { signatureDataUrl } : {}),
    },
    $unset: {
      signingToken: 1,
      signingTokenExpiresAt: 1,
    },
  });

  await AuditLog.create({
    entityType: 'contract',
    entityId: contractId,
    action: 'contract_signed',
    performedBy: session.user.id,
    details: {
      contractId,
      contractNumber: contract.contractNumber,
      signerName: signerName.trim(),
      signerIp,
    },
    metadata: { contractNumber: contract.contractNumber, signerName: signerName.trim() },
  });

  const adminLink = `${getBaseUrl()}/admin/contracts/${contractId}`;
  const signedAtLabel = signedAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  try {
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'contact@leothetechguy.com',
      subject: `Contract Signed: ${contract.contractNumber}`,
      html: EmailTemplates.contractSigned(
        'Leo',
        signerName.trim(),
        contract.contractNumber,
        contract.title,
        signedAtLabel,
        adminLink,
      ),
    });
  } catch (_) {}

  await ClientNotification.create({
    clientId: session.user.id,
    type: 'contract_alert',
    title: `Contract Signed: ${contract.contractNumber}`,
    message: `You have successfully signed contract "${contract.title}".`,
    actionUrl: `/portal/client/contracts/${contractId}`,
  });

  revalidatePath('/portal/client/contracts');
  revalidatePath(`/portal/client/contracts/${contractId}`);
  revalidatePath('/admin/contracts');
  return { success: true };
}
