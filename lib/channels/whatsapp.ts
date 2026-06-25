/**
 * WhatsApp Business Cloud API — outbound messaging service.
 *
 * All business logic that needs to send WhatsApp messages must call these
 * functions. Never call the Meta Graph API directly from business logic.
 *
 * Env vars (WHATSAPP_* preferred; META_* accepted as legacy fallback):
 *   WHATSAPP_ACCESS_TOKEN       WhatsApp app/page access token
 *   WHATSAPP_PHONE_NUMBER_ID    Phone Number ID from Meta Business Manager
 *   WHATSAPP_APP_SECRET         Used to verify inbound webhook signatures
 *   WHATSAPP_VERIFY_TOKEN       Arbitrary token set in Meta webhook config
 */

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

function accessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_GRAPH_TOKEN;
  if (!token) throw new Error('WhatsApp access token not configured (WHATSAPP_ACCESS_TOKEN)');
  return token;
}

function phoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_ID;
  if (!id) throw new Error('WhatsApp phone number ID not configured (WHATSAPP_PHONE_NUMBER_ID)');
  return id;
}

function apiUrl(): string {
  return `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId()}/messages`;
}

async function post(payload: unknown): Promise<SendResult> {
  try {
    const res = await fetch(`${apiUrl()}?access_token=${accessToken()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { success: false, error: `Graph API ${res.status}: ${detail.slice(0, 200)}` };
    }
    const data = await res.json().catch(() => ({}));
    return { success: true, messageId: data?.messages?.[0]?.id };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendTextMessage(to: string, body: string): Promise<SendResult> {
  return post({
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  });
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components?: unknown[],
): Promise<SendResult> {
  return post({
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components?.length ? { components } : {}),
    },
  });
}

export async function sendMediaMessage(
  to: string,
  type: 'image' | 'document' | 'audio' | 'video',
  link: string,
  caption?: string,
): Promise<SendResult> {
  const mediaBody: Record<string, unknown> = { link };
  if (caption && type !== 'audio') mediaBody.caption = caption;
  return post({
    messaging_product: 'whatsapp',
    to,
    type,
    [type]: mediaBody,
  });
}
