export type SocialPlatform = 'facebook' | 'instagram';
export type SocialPostStatus = 'draft' | 'scheduled' | 'published';

export interface SocialConversation {
  id: string;
  platform: SocialPlatform;
  conversation_id: string;
  client_id: string;
  client_name: string;
  case_id: string;
  assigned_to: string;
  last_message: string | null;
  updated_at: string | null;
  profile_image_url?: string | null;
}

export interface SocialMessage {
  id: string;
  type: 'social';
  platform: SocialPlatform;
  conversation_id: string;
  sender_type: 'client' | 'employee';
  sender_id: string | null;
  content: string;
  attachments: Array<{ filename: string; url: string; size: number; content_type: string }>;
  timestamp: string | null;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  media_urls: string[];
  status: SocialPostStatus;
  scheduled_time: string | null;
  created_by: string;
  created_at: string | null;
  published_at: string | null;
}
