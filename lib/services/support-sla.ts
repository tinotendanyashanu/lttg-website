/**
 * Support Center — SLA service.
 *
 * Pure, side-effect-free helpers for computing and evaluating ticket SLAs.
 * Used at ticket creation (to stamp due dates), by the SLA Monitor page, the
 * ticket-detail SLA badge and Support Analytics. No AI / DB access here.
 */

import {
  SLA_TARGETS_MINUTES,
  SLA_RESOLUTION_MULTIPLIER,
  OPEN_STATUSES,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/support/constants';

const MINUTE_MS = 60 * 1000;

function firstResponseMinutes(priority: TicketPriority): number {
  return SLA_TARGETS_MINUTES[priority] ?? SLA_TARGETS_MINUTES.medium;
}

export interface SlaDueDates {
  firstResponseDueAt: Date;
  resolutionDueAt: Date;
}

/** Compute first-response and resolution due dates from priority + creation time. */
export function computeSlaDueDates(
  priority: TicketPriority,
  createdAt: Date = new Date()
): SlaDueDates {
  const frMinutes = firstResponseMinutes(priority);
  const base = createdAt.getTime();
  return {
    firstResponseDueAt: new Date(base + frMinutes * MINUTE_MS),
    resolutionDueAt: new Date(base + frMinutes * SLA_RESOLUTION_MULTIPLIER * MINUTE_MS),
  };
}

export type SlaState = 'ok' | 'due_soon' | 'breached' | 'met';

export interface SlaEvaluation {
  firstResponseBreached: boolean;
  resolutionBreached: boolean;
  firstResponseState: SlaState;
  resolutionState: SlaState;
  /** ms until first-response due (negative if overdue); null if already responded. */
  firstResponseDueInMs: number | null;
  /** ms until resolution due (negative if overdue); null if already resolved. */
  resolutionDueInMs: number | null;
  /** Worst of the two states — handy for sorting/coloring a single badge. */
  overall: SlaState;
}

interface SlaTicketLike {
  status: TicketStatus | string;
  firstResponseAt?: Date | string | null;
  firstResponseDueAt?: Date | string | null;
  resolutionDueAt?: Date | string | null;
  resolvedAt?: Date | string | null;
}

function toTime(v?: Date | string | null): number | null {
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Within this window (ms) of a deadline, surface a "due soon" warning. */
const DUE_SOON_WINDOW_MS = 15 * MINUTE_MS;

function stateFor(dueIn: number | null, met: boolean): SlaState {
  if (met) return 'met';
  if (dueIn === null) return 'ok';
  if (dueIn < 0) return 'breached';
  if (dueIn <= DUE_SOON_WINDOW_MS) return 'due_soon';
  return 'ok';
}

const SEVERITY: Record<SlaState, number> = { breached: 3, due_soon: 2, ok: 1, met: 0 };

/** Evaluate a ticket's live SLA position. `now` is injectable for testing. */
export function evaluateSla(ticket: SlaTicketLike, now: number = Date.now()): SlaEvaluation {
  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';

  const frDue = toTime(ticket.firstResponseDueAt);
  const frAt = toTime(ticket.firstResponseAt);
  const resDue = toTime(ticket.resolutionDueAt);
  const resAt = toTime(ticket.resolvedAt);

  // First response
  const frMet = frAt !== null;
  const firstResponseDueInMs = frMet || frDue === null ? null : frDue - now;
  const firstResponseBreached = frMet
    ? frDue !== null && frAt! > frDue
    : frDue !== null && now > frDue;
  const firstResponseState: SlaState = frMet
    ? firstResponseBreached
      ? 'breached'
      : 'met'
    : stateFor(firstResponseDueInMs, false);

  // Resolution
  const resMet = resAt !== null && isClosed;
  const resolutionDueInMs = resMet || resDue === null ? null : resDue - now;
  const resolutionBreached = resMet
    ? resDue !== null && resAt! > resDue
    : resDue !== null && !isClosed && now > resDue;
  const resolutionState: SlaState = resMet
    ? resolutionBreached
      ? 'breached'
      : 'met'
    : stateFor(resolutionDueInMs, false);

  const overall =
    SEVERITY[firstResponseState] >= SEVERITY[resolutionState]
      ? firstResponseState
      : resolutionState;

  return {
    firstResponseBreached,
    resolutionBreached,
    firstResponseState,
    resolutionState,
    firstResponseDueInMs,
    resolutionDueInMs,
    overall,
  };
}

/** True while the ticket is still in an active (non-resolved/closed) state. */
export function isActiveStatus(status: string): boolean {
  return OPEN_STATUSES.includes(status as TicketStatus);
}

/** Human-friendly "in 2h 5m" / "3h 20m overdue" formatter for due times. */
export function formatDueIn(ms: number | null): string {
  if (ms === null) return '—';
  const overdue = ms < 0;
  let mins = Math.round(Math.abs(ms) / MINUTE_MS);
  const days = Math.floor(mins / (60 * 24));
  mins -= days * 60 * 24;
  const hours = Math.floor(mins / 60);
  mins -= hours * 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins || parts.length === 0) parts.push(`${mins}m`);
  const body = parts.join(' ');
  return overdue ? `${body} overdue` : `in ${body}`;
}
