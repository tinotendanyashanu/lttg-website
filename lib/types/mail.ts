export type MailCaseStatus = 'open' | 'closed';

export interface MailCaseListItem {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  assigned_to: string;
  status: MailCaseStatus;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_sender_type: 'employee' | 'client' | null;
  has_unread_client: boolean;
}

export interface MailThreadSummary {
  id: string;
  gmail_thread_id: string;
  message_count: number;
}

export interface MailCaseDetail {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  assigned_to: string;
  status: MailCaseStatus;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  threads: MailThreadSummary[];
}

export interface MailMessage {
  id: string;
  thread_id: string;
  sender_type: 'employee' | 'client';
  sender_id: string | null;
  content: string;
  attachments: Array<{ filename: string; url: string; size: number; content_type: string }>;
  timestamp: string;
  gmail_message_id: string | null;
}

export interface MailClient {
  id: string;
  name: string;
  email: string;
}
