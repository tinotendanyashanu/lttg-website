/**
 * Support Center — shared constants.
 *
 * Single source of truth for ticket statuses, priorities, categories, SLA targets,
 * team routing and customer-health levels. Reused by the SupportTicket model, the
 * AI service, the SLA service, server actions and every UI surface so the Support
 * Center stays consistent and channel-agnostic (built to absorb future WhatsApp /
 * Instagram / Messenger / voice channels without schema churn).
 */

// ── Statuses ──────────────────────────────────────────────────────────────────

export const TICKET_STATUSES = [
  'new',
  'open',
  'in_progress',
  'waiting_client',
  'escalated',
  'resolved',
  'closed',
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  new: 'New',
  open: 'Open',
  in_progress: 'In Progress',
  waiting_client: 'Waiting for Client',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
};

/** Statuses that count as "active" (i.e. still need agent attention). */
export const OPEN_STATUSES: TicketStatus[] = [
  'new',
  'open',
  'in_progress',
  'waiting_client',
  'escalated',
];

// ── Priorities ────────────────────────────────────────────────────────────────
// `urgent` is retained for backward compatibility with existing tickets and is
// treated as equivalent to `critical` for SLA purposes.

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent', 'critical'] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
  critical: 'Critical',
};

// ── Categories ────────────────────────────────────────────────────────────────
// Stored as a free-form string on the model (legacy values stay valid); this is
// the canonical list surfaced in pickers and used by the AI classifier.

export const TICKET_CATEGORIES = [
  { value: 'technical', label: 'Technical Support' },
  { value: 'website', label: 'Website Issues' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'domains', label: 'Domains' },
  { value: 'email', label: 'Email Services' },
  { value: 'billing', label: 'Billing' },
  { value: 'project', label: 'Project Support' },
  { value: 'general_inquiry', label: 'General Inquiry' },
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]['value'];

export const CATEGORY_VALUES: string[] = TICKET_CATEGORIES.map((c) => c.value);

export function categoryLabel(value?: string): string {
  if (!value) return 'General Inquiry';
  const found = TICKET_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

// ── SLA targets ───────────────────────────────────────────────────────────────
// Minutes from ticket creation. Drives first-response and resolution due dates.

export const SLA_TARGETS_MINUTES: Record<TicketPriority, number> = {
  critical: 15,
  urgent: 15,
  high: 60,
  medium: 240,
  low: 1440,
};

/** Resolution targets are scaled relative to the first-response target. */
export const SLA_RESOLUTION_MULTIPLIER = 8;

// ── Team routing ──────────────────────────────────────────────────────────────
// Maps a ticket category to a suggested team (mirrors ClientCase.assignedTeam).

export const TEAM_ROUTING: Record<string, string> = {
  technical: 'Technical Support',
  website: 'Web Development',
  hosting: 'Technical Support',
  domains: 'Technical Support',
  email: 'Technical Support',
  billing: 'Billing & Accounts',
  project: 'Project Delivery',
  general_inquiry: 'Customer Success',
};

export function suggestedTeamForCategory(category?: string): string {
  return (category && TEAM_ROUTING[category]) || 'Customer Success';
}

// ── Sentiment ─────────────────────────────────────────────────────────────────

export const SENTIMENTS = ['positive', 'neutral', 'negative'] as const;
export type Sentiment = (typeof SENTIMENTS)[number];

// ── Customer health ───────────────────────────────────────────────────────────

export const HEALTH_LEVELS = ['excellent', 'good', 'at_risk', 'critical'] as const;
export type HealthLevel = (typeof HEALTH_LEVELS)[number];

export const HEALTH_LABELS: Record<HealthLevel, string> = {
  excellent: 'Excellent',
  good: 'Good',
  at_risk: 'At Risk',
  critical: 'Critical',
};

/** Score thresholds (0-100). Higher is healthier. */
export function healthLevelFromScore(score: number): HealthLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 35) return 'at_risk';
  return 'critical';
}

// ── Channels ──────────────────────────────────────────────────────────────────
// Where a ticket originated. `web` is the default first-party portal/email path;
// the rest are inbound social/voice channels ingested via webhooks. Built so the
// model and UI stay channel-agnostic — adding a channel never changes the schema.

export const TICKET_CHANNELS = [
  'web',
  'email',
  'whatsapp',
  'instagram',
  'messenger',
  'voice',
] as const;

export type TicketChannel = (typeof TICKET_CHANNELS)[number];

export const CHANNEL_LABELS: Record<TicketChannel, string> = {
  web: 'Web Portal',
  email: 'Email',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  messenger: 'Messenger',
  voice: 'Voice',
};

/** Material icon per channel (used on inbox rows + ticket headers). */
export const CHANNEL_ICONS: Record<TicketChannel, string> = {
  web: 'language',
  email: 'mail',
  whatsapp: 'chat',
  instagram: 'photo_camera',
  messenger: 'forum',
  voice: 'call',
};

/** Channels ingested from outside the portal (no first-party Account by default). */
export const EXTERNAL_CHANNELS: TicketChannel[] = ['whatsapp', 'instagram', 'messenger', 'voice'];

export function channelLabel(value?: string): string {
  if (!value) return CHANNEL_LABELS.web;
  return CHANNEL_LABELS[value as TicketChannel] || value;
}

export function channelIcon(value?: string): string {
  if (!value) return CHANNEL_ICONS.web;
  return CHANNEL_ICONS[value as TicketChannel] || 'support_agent';
}

// ── Project milestones ──────────────────────────────────────────────────────────
// Lightweight deliverable tracking on a ClientCase, surfaced inside linked tickets.

export const MILESTONE_STATUSES = ['pending', 'in_progress', 'done'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const MILESTONE_LABELS: Record<MilestoneStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};
