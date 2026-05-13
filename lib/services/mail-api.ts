import type { MailCaseDetail, MailCaseListItem, MailClient, MailMessage } from '@/lib/types/mail';

const base = () => {
  const u = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!u) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  let normalized = u.trim().replace(/^['"]|['"]$/g, '');
  if (normalized.startsWith('NEXT_PUBLIC_BACKEND_URL=')) {
    normalized = normalized.split('=', 2)[1].trim().replace(/^['"]|['"]$/g, '');
  }
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized.replace(/^\/+/, '')}`;
  }
  return normalized.replace(/\/$/, '');
};

async function authFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
}

export async function fetchMailCases(
  token: string,
  params: { status?: MailCaseListItem['status']; q?: string },
): Promise<MailCaseListItem[]> {
  const sp = new URLSearchParams();
  if (params.status) sp.set('status', params.status);
  if (params.q) sp.set('q', params.q);
  const q = sp.toString();
  const res = await authFetch(`/cases${q ? `?${q}` : ''}`, token);
  if (!res.ok) throw new Error(`cases_${res.status}`);
  return res.json();
}

export async function fetchMailCaseDetail(token: string, caseId: string): Promise<MailCaseDetail> {
  const res = await authFetch(`/cases/${encodeURIComponent(caseId)}`, token);
  if (!res.ok) throw new Error(`case_${res.status}`);
  return res.json();
}

export async function updateMailCaseStatus(
  token: string,
  caseId: string,
  status: 'open' | 'closed'
): Promise<void> {
  const res = await authFetch(`/cases/${encodeURIComponent(caseId)}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`update_case_${res.status}`);
}

export async function fetchMailMessages(
  token: string,
  caseId: string,
  params?: { skip?: number; limit?: number },
): Promise<{ items: MailMessage[]; total: number }> {
  const sp = new URLSearchParams();
  if (params?.skip != null) sp.set('skip', String(params.skip));
  if (params?.limit != null) sp.set('limit', String(params.limit));
  const q = sp.toString();
  const res = await authFetch(
    `/cases/${encodeURIComponent(caseId)}/messages${q ? `?${q}` : ''}`,
    token,
  );
  if (!res.ok) throw new Error(`messages_${res.status}`);
  return res.json();
}

export async function sendMailMessage(
  token: string,
  payload: { caseId: string; content: string; files?: File[] },
): Promise<{ message_id: string; gmail_message_id: string }> {
  const fd = new FormData();
  fd.set('case_id', payload.caseId);
  fd.set('content', payload.content);
  for (const f of payload.files ?? []) {
    fd.append('files', f);
  }
  const res = await authFetch('/messages/send', token, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`send_${res.status}`);
  return res.json();
}

export async function fetchMailClients(token: string, q?: string): Promise<MailClient[]> {
  const sp = new URLSearchParams();
  if (q) sp.set('q', q);
  const qs = sp.toString();
  const res = await authFetch(`/clients${qs ? `?${qs}` : ''}`, token);
  if (!res.ok) throw new Error(`clients_${res.status}`);
  return res.json();
}

export async function sendNewMailMessage(
  token: string,
  payload: { recipientEmail: string; recipientName?: string; subject: string; content: string; files?: File[] },
): Promise<{ case_id: string; message_id: string; gmail_message_id: string }> {
  const fd = new FormData();
  fd.set('recipient_email', payload.recipientEmail);
  fd.set('recipient_name', payload.recipientName ?? '');
  fd.set('subject', payload.subject);
  fd.set('content', payload.content);
  for (const f of payload.files ?? []) {
    fd.append('files', f);
  }
  const res = await authFetch('/messages/send-new', token, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`send_new_${res.status}`);
  return res.json();
}

export async function triggerMailSync(token: string): Promise<{
  fetched: number;
  ingested: number;
  skipped: number;
}> {
  const res = await authFetch('/emails/sync', token, { method: 'POST' });
  if (!res.ok) throw new Error(`sync_${res.status}`);
  return res.json();
}
