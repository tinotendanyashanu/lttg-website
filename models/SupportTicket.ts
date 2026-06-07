import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CHANNELS,
  type TicketStatus as TicketStatusConst,
  type TicketPriority as TicketPriorityConst,
  type TicketChannel as TicketChannelConst,
  type Sentiment,
} from '@/lib/support/constants';

// Re-exported for backward compatibility with existing imports.
export type TicketStatus = TicketStatusConst;
export type TicketPriority = TicketPriorityConst;
export type TicketChannel = TicketChannelConst;

/** External (non-portal) sender identity for social / voice channels. */
export interface ITicketChannelContact {
  externalId?: string; // provider-scoped sender id (e.g. WhatsApp wa_id, IGSID, PSID)
  handle?: string; // phone number / @handle the contact is reachable on
  displayName?: string;
}

/** A specialized AI agent's contribution to the orchestrated workup. */
export interface ITicketAgentStep {
  agent: string; // 'triage' | 'knowledge' | 'strategist'
  title: string;
  detail: string;
}

/** Result of the multi-agent AI orchestration for a ticket. */
export interface ITicketAgentWorkup {
  recommendation?: string;
  confidence?: number; // 0-1
  canAutoResolve?: boolean;
  draftReply?: string;
  steps?: ITicketAgentStep[];
  updatedAt?: Date;
}

export interface ITicketActivity {
  type: string; // e.g. 'created' | 'status_change' | 'assigned' | 'escalated' | 'ai_processed' | 'note' | 'reply'
  actor?: string; // display name of the actor
  actorRole?: string; // 'client' | 'admin' | 'employee' | 'system' | 'ai'
  detail?: string;
  createdAt: Date;
}

export interface ITicketAISuggestedArticle {
  articleId: mongoose.Types.ObjectId | string;
  title: string;
  slug?: string;
}

export interface ITicketMessageAttachment {
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  clientId?: mongoose.Types.ObjectId; // optional: external-channel tickets have no portal account
  channel: TicketChannel;
  channelContact?: ITicketChannelContact;
  subject: string;
  description: string;
  category?: string;
  priority: TicketPriority;
  status: TicketStatus;
  attachments: { url: string; name: string; size: number }[];
  messages: {
    senderRole: string;
    senderName: string;
    content: string;
    attachments?: ITicketMessageAttachment[];
    createdAt: Date;
  }[];
  assignedTo?: mongoose.Types.ObjectId;
  assignedTeam?: string;
  caseId?: mongoose.Types.ObjectId; // links the ticket to a project/case
  threadId?: mongoose.Types.ObjectId; // links the ticket to its MessageThread
  internalNotes?: string;

  // ── AI processing ──
  aiSummary?: string;
  aiSentiment?: Sentiment;
  aiSuggestedCategory?: string;
  aiSuggestedPriority?: TicketPriority;
  aiSuggestedTeam?: string;
  aiSuggestedArticles?: ITicketAISuggestedArticle[];
  aiProcessedAt?: Date;
  aiProcessingStatus?: 'pending' | 'done' | 'failed';
  aiAgentWorkup?: ITicketAgentWorkup;

  // ── SLA ──
  firstResponseAt?: Date;
  firstResponseDueAt?: Date;
  resolutionDueAt?: Date;
  slaFirstResponseBreached?: boolean;
  slaResolutionBreached?: boolean;

  activity?: ITicketActivity[];
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Account' },
    channel: { type: String, enum: TICKET_CHANNELS, default: 'web' },
    channelContact: {
      externalId: { type: String },
      handle: { type: String },
      displayName: { type: String },
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'general_inquiry' },
    priority: {
      type: String,
      enum: TICKET_PRIORITIES,
      default: 'medium',
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'new',
    },
    attachments: [{ url: String, name: String, size: Number }],
    messages: [
      {
        senderRole: String,
        senderName: String,
        content: String,
        attachments: [{ url: String, name: String, size: Number, mimeType: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Account' },
    assignedTeam: { type: String },
    caseId: { type: Schema.Types.ObjectId, ref: 'ClientCase' },
    threadId: { type: Schema.Types.ObjectId, ref: 'MessageThread' },
    internalNotes: { type: String },

    // AI processing
    aiSummary: { type: String },
    aiSentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
    aiSuggestedCategory: { type: String },
    aiSuggestedPriority: { type: String, enum: TICKET_PRIORITIES },
    aiSuggestedTeam: { type: String },
    aiSuggestedArticles: [
      {
        articleId: { type: Schema.Types.ObjectId, ref: 'KnowledgeArticle' },
        title: String,
        slug: String,
      },
    ],
    aiProcessedAt: { type: Date },
    aiProcessingStatus: { type: String, enum: ['pending', 'done', 'failed'] },
    aiAgentWorkup: {
      recommendation: { type: String },
      confidence: { type: Number },
      canAutoResolve: { type: Boolean },
      draftReply: { type: String },
      steps: [
        {
          agent: { type: String },
          title: { type: String },
          detail: { type: String },
        },
      ],
      updatedAt: { type: Date },
    },

    // SLA
    firstResponseAt: { type: Date },
    firstResponseDueAt: { type: Date },
    resolutionDueAt: { type: Date },
    slaFirstResponseBreached: { type: Boolean, default: false },
    slaResolutionBreached: { type: Boolean, default: false },

    activity: [
      {
        type: { type: String },
        actor: { type: String },
        actorRole: { type: String },
        detail: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ clientId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ status: 1, priority: 1, resolutionDueAt: 1 });
// Fast lookup of an open ticket for an inbound channel contact.
SupportTicketSchema.index({ channel: 1, 'channelContact.externalId': 1, status: 1 });

export const SupportTicket: Model<ISupportTicket> =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
