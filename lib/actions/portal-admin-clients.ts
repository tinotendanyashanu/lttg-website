'use server';

import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import dbConnect from '@/lib/mongodb';
import { ActivityLog } from '@/models/ActivityLog';
import Lead from '@/models/Lead';

export async function getAdminClients() {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  // We fetch leads as proxy for clients in this system
  const clients = await Lead.find()
    .populate('accountId', 'email fullName')
    .sort({ createdAt: -1 })
    .lean();

  return { success: true, clients: JSON.parse(JSON.stringify(clients)) };
}

export async function updateAdminClient(clientId: string, data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const client = await Lead.findByIdAndUpdate(clientId, { $set: data }, { new: true });
  if (!client) throw new Error('Client not found');

  await ActivityLog.create({
    caseId: client._id, // Using caseId field for polymorphic logging conceptually
    actorAccountId: account._id,
    actionType: 'client_updated',
  });

  return { success: true };
}

export async function archiveAdminClient(clientId: string) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const client = await Lead.findByIdAndUpdate(clientId, { status: 'closed' }, { new: true });
  if (!client) throw new Error('Client not found');

  await ActivityLog.create({
    caseId: client._id,
    actorAccountId: account._id,
    actionType: 'client_archived',
  });

  return { success: true };
}

export async function createAdminClient(data: any) {
  await dbConnect();
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) throw new Error('Not authenticated');

  const account = await getAccountByEmail(session.user.email);
  if (!account || !account.roles.includes('admin')) throw new Error('Unauthorized');

  const client = await Lead.create({
    ...data,
    status: data.status || 'new',
  });

  await ActivityLog.create({
    caseId: client._id,
    actorAccountId: account._id,
    actionType: 'client_created',
    newValue: client.businessName,
  });

  return { success: true, client: JSON.parse(JSON.stringify(client)) };
}
