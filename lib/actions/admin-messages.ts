'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import { sendEmail, EmailTemplates } from '@/lib/email';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error('Unauthorized');
  return session.user;
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
}

// ── Get all message threads (admin) ───────────────────────────────────────────

export async function getAdminMessageThreads() {
  await checkAdmin();
  await dbConnect();

  const { MessageThread } = await import('@/models/MessageThread');
  const { Account } = await import('@/models/Account');

  const threads = await MessageThread.find().sort({ lastMessageAt: -1 }).limit(200).lean();
  const clientIds = [...new Set(threads.map((t: any) => String(t.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  return {
    threads: JSON.parse(JSON.stringify(threads)),
    accountMap,
    unreadCount: threads.filter((t: any) => (t.unreadByTeam || 0) > 0).length,
  };
}

// ── Get thread with messages (admin) ──────────────────────────────────────────

export async function getAdminThread(threadId: string) {
  await checkAdmin();
  await dbConnect();

  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientMessage } = await import('@/models/ClientMessage');
  const { Account } = await import('@/models/Account');

  const thread = await MessageThread.findById(threadId).lean();
  if (!thread) return null;

  const messages = await ClientMessage.find({ threadId }).sort({ createdAt: 1 }).lean();
  const client = await Account.findById((thread as any).clientId, 'fullName email clientProfile').lean();

  // Mark unread by team = 0
  await MessageThread.findByIdAndUpdate(threadId, { $set: { unreadByTeam: 0 } });

  return {
    thread: JSON.parse(JSON.stringify(thread)),
    messages: JSON.parse(JSON.stringify(messages)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
  };
}

// ── Send message from admin ────────────────────────────────────────────────────

export async function adminSendMessage(threadId: string, content: string, notifyByEmail = true) {
  const admin = await checkAdmin();
  await dbConnect();

  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientMessage } = await import('@/models/ClientMessage');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');

  const thread = await MessageThread.findById(threadId);
  if (!thread) throw new Error('Thread not found');

  await ClientMessage.create({
    threadId,
    senderId: admin.id as string,
    senderName: 'LeoTheTechGuy Team',
    senderRole: 'admin',
    content: content.trim(),
    readBy: [admin.id as string],
  });

  await MessageThread.findByIdAndUpdate(threadId, {
    $set: {
      lastMessageAt: new Date(),
      lastMessagePreview: content.substring(0, 80),
      unreadByTeam: 0,
    },
    $inc: { unreadByClient: 1 },
  });

  // Notify client
  const client = await Account.findById(thread.clientId, 'fullName email').lean();
  if (client) {
    await ClientNotification.create({
      clientId: thread.clientId,
      type: 'new_message',
      title: 'New message from the team',
      message: content.substring(0, 100),
      actionUrl: `/portal/client/messages/${threadId}`,
    });

    if (notifyByEmail) {
      const portalLink = `${getBaseUrl()}/portal/client/messages/${threadId}`;
      try {
        await sendEmail({
          to: (client as any).email,
          subject: `New message: ${thread.subject}`,
          html: EmailTemplates.newMessageNotification(
            (client as any).fullName,
            'LeoTheTechGuy Team',
            content.substring(0, 100),
            portalLink,
          ),
        });
      } catch (_) {}
    }
  }

  revalidatePath(`/admin/messages/${threadId}`);
  revalidatePath('/admin/messages');
  revalidatePath(`/portal/client/messages/${threadId}`);
  return { success: true };
}

// ── Create new thread and send first message ───────────────────────────────────

export async function adminCreateThread(
  clientId: string,
  subject: string,
  firstMessage: string,
  notifyByEmail = true,
) {
  const admin = await checkAdmin();
  await dbConnect();

  const { MessageThread } = await import('@/models/MessageThread');
  const { ClientMessage } = await import('@/models/ClientMessage');
  const { Account } = await import('@/models/Account');
  const { ClientNotification } = await import('@/models/ClientNotification');

  const client = await Account.findOne({ _id: clientId, roles: 'client' });
  if (!client) throw new Error('Client not found');
  const resolvedClientId = client.linkedClientAccountId
    ? client.linkedClientAccountId.toString()
    : clientId;

  const thread = await MessageThread.create({
    clientId: resolvedClientId,
    subject: subject.trim(),
    participants: [admin.id as string, resolvedClientId],
    lastMessageAt: new Date(),
    lastMessagePreview: firstMessage.substring(0, 80),
    unreadByClient: 1,
    unreadByTeam: 0,
  });

  const threadId = (thread as any)._id.toString();

  await ClientMessage.create({
    threadId: (thread as any)._id,
    senderId: admin.id as string,
    senderName: 'LeoTheTechGuy Team',
    senderRole: 'admin',
    content: firstMessage.trim(),
    readBy: [admin.id as string],
  });

  await ClientNotification.create({
    clientId: resolvedClientId,
    type: 'new_message',
    title: subject,
    message: firstMessage.substring(0, 100),
    actionUrl: `/portal/client/messages/${threadId}`,
  });

  if (notifyByEmail) {
    const portalLink = `${getBaseUrl()}/portal/client/messages/${threadId}`;
    try {
      await sendEmail({
        to: client.email,
        subject: `New message: ${subject}`,
        html: EmailTemplates.newMessageNotification(
          client.fullName,
          'LeoTheTechGuy Team',
          firstMessage.substring(0, 100),
          portalLink,
        ),
      });
    } catch (_) {}
  }

  revalidatePath('/admin/messages');
  revalidatePath('/portal/client/messages');
  return { success: true, threadId };
}
