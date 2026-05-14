import type { SocialConversation, SocialMessage, SocialPlatform, SocialPost, SocialPostStatus } from '@/lib/types/social';

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
  return fetch(`${base()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchSocialConversations(
  token: string,
  platform?: SocialPlatform,
): Promise<SocialConversation[]> {
  const sp = new URLSearchParams();
  if (platform) sp.set('platform', platform);
  const qs = sp.toString();
  const res = await authFetch(`/social/conversations${qs ? `?${qs}` : ''}`, token);
  if (!res.ok) throw new Error(`social_conversations_${res.status}`);
  return res.json();
}

export async function fetchSocialMessages(
  token: string,
  conversationId: string,
): Promise<{ items: SocialMessage[] }> {
  const res = await authFetch(`/social/conversations/${encodeURIComponent(conversationId)}/messages`, token);
  if (!res.ok) throw new Error(`social_messages_${res.status}`);
  return res.json();
}

export async function sendSocialMessage(
  token: string,
  payload: { conversationId: string; content: string },
): Promise<{ message_id: string; meta_message_id?: string | null }> {
  const res = await authFetch('/social/send', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: payload.conversationId, content: payload.content }),
  });
  if (!res.ok) throw new Error(`social_send_${res.status}`);
  return res.json();
}

export async function createSocialPost(
  token: string,
  payload: {
    platform: SocialPlatform;
    content: string;
    status: SocialPostStatus;
    scheduledTime?: string;
    mediaUrls?: string[];
    files?: File[];
  },
): Promise<{ id: string; status: SocialPostStatus; media_urls: string[] }> {
  const fd = new FormData();
  fd.set('platform', payload.platform);
  fd.set('content', payload.content);
  fd.set('status', payload.status);
  if (payload.scheduledTime) fd.set('scheduled_time', payload.scheduledTime);
  for (const url of payload.mediaUrls ?? []) fd.append('media_urls', url);
  for (const f of payload.files ?? []) fd.append('files', f);
  const res = await authFetch('/social/post', token, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`social_post_${res.status}`);
  return res.json();
}

export async function fetchSocialPosts(token: string): Promise<SocialPost[]> {
  const res = await authFetch('/social/posts', token);
  if (!res.ok) throw new Error(`social_posts_${res.status}`);
  return res.json();
}
