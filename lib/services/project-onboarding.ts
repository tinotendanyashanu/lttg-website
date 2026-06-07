/**
 * Payment → Project automation (Phase C, spec §8).
 *
 * When an invoice is FULLY paid, spin up the client's project automatically:
 *   - a ClientCase (the project entity) with seeded milestones + a timeline event
 *   - onboarding Tasks for the team
 *   - a MessageThread workspace for client ↔ team communication
 *   - a welcome email + in-app notification to the client
 *
 * Guardrails:
 *  - Fire-and-forget from the webhook path: never throws, never blocks payment.
 *  - Idempotent: a deterministic project caseNumber (PRJ-<invoiceNumber>) plus the
 *    unique index means re-delivery / retries won't create duplicates. Invoices
 *    already linked to a case (existing project) are skipped.
 *  - Reuses existing models (ClientCase, Task, MessageThread, ClientNotification)
 *    and the existing email infrastructure.
 */

const ONBOARDING_MILESTONES = [
  { title: 'Discovery & Kickoff', description: 'Align on goals, scope and success criteria.' },
  { title: 'Design & Planning', description: 'Produce the plan, designs and technical approach.' },
  { title: 'Build', description: 'Implementation of the agreed scope.' },
  { title: 'Review & QA', description: 'Quality assurance, client review and revisions.' },
  { title: 'Launch & Handover', description: 'Go-live, handover and wrap-up.' },
];

const ONBOARDING_TASKS = [
  { title: 'Schedule project kickoff call', offsetDays: 2 },
  { title: 'Collect project assets, access and credentials', offsetDays: 4 },
  { title: 'Confirm final scope, deliverables and timeline', offsetDays: 5 },
];

interface OnboardingResult {
  created: boolean;
  caseId?: string;
  reason?: string;
}

/**
 * Run project onboarding for a fully-paid invoice. Safe to call fire-and-forget.
 */
export async function runProjectOnboarding(invoiceId: string): Promise<OnboardingResult> {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    await dbConnect();

    const { ClientInvoice } = await import('@/models/ClientInvoice');
    const { ClientCase } = await import('@/models/ClientCase');

    const invoice = await ClientInvoice.findById(invoiceId);
    if (!invoice) return { created: false, reason: 'invoice_not_found' };

    // Only onboard on full payment.
    if (invoice.status !== 'paid') return { created: false, reason: 'not_fully_paid' };

    // Existing project? This invoice belongs to a case already — nothing to seed.
    if (invoice.caseId) return { created: false, reason: 'already_linked_to_case' };

    if (!invoice.clientId) return { created: false, reason: 'no_client' };

    // Deterministic, idempotent project number.
    const caseNumber = `PRJ-${invoice.invoiceNumber}`;
    const existing = await ClientCase.findOne({ caseNumber }).select('_id').lean();
    if (existing) {
      // Backfill the link if missing, then skip.
      if (!invoice.caseId) {
        invoice.caseId = (existing as any)._id;
        await invoice.save().catch(() => {});
      }
      return { created: false, caseId: String((existing as any)._id), reason: 'already_onboarded' };
    }

    const now = new Date();
    const title = invoice.description?.trim()
      ? `Project — ${invoice.description.trim().slice(0, 100)}`
      : `Project — ${invoice.invoiceNumber}`;

    let clientCase;
    try {
      clientCase = await ClientCase.create({
        caseNumber,
        clientId: invoice.clientId,
        caseType: 'project',
        title,
        description: `Project automatically created on full payment of invoice ${invoice.invoiceNumber}.`,
        status: 'in_progress',
        priority: 'medium',
        milestones: ONBOARDING_MILESTONES.map((m, i) => ({
          title: m.title,
          description: m.description,
          status: i === 0 ? 'in_progress' : 'pending',
          order: i,
          createdAt: now,
        })),
        timeline: [
          {
            event: 'project_created',
            description: `Project kicked off automatically after payment of invoice ${invoice.invoiceNumber}.`,
            createdAt: now,
          },
        ],
      });
    } catch (err: any) {
      // Unique caseNumber race — another delivery won; treat as already onboarded.
      if (err?.code === 11000) {
        const dup = await ClientCase.findOne({ caseNumber }).select('_id').lean();
        return { created: false, caseId: dup ? String((dup as any)._id) : undefined, reason: 'race_skipped' };
      }
      throw err;
    }

    const caseId = clientCase._id;

    // Link the invoice to the new project so future payments/retries skip cleanly.
    invoice.caseId = caseId;
    await invoice.save().catch(() => {});

    // Onboarding tasks (best-effort).
    try {
      const { Task } = await import('@/models/Task');
      await Task.insertMany(
        ONBOARDING_TASKS.map((t) => ({
          title: t.title,
          description: `Onboarding for ${caseNumber}: ${title}`,
          relatedCaseId: caseId,
          status: 'pending',
          dueDate: new Date(now.getTime() + t.offsetDays * 24 * 60 * 60 * 1000),
        })),
      );
    } catch {
      /* non-blocking */
    }

    // Project workspace thread (best-effort).
    try {
      const { MessageThread } = await import('@/models/MessageThread');
      await MessageThread.create({
        clientId: invoice.clientId,
        subject: `Project workspace — ${caseNumber}`,
        participants: [invoice.clientId],
        caseId,
        lastMessageAt: now,
        lastMessagePreview: 'Welcome! Your project workspace is ready.',
        unreadByClient: 1,
      });
    } catch {
      /* non-blocking */
    }

    // Client notification + welcome email (best-effort).
    try {
      const { ClientNotification } = await import('@/models/ClientNotification');
      await ClientNotification.create({
        clientId: invoice.clientId,
        type: 'system',
        title: 'Your project has started',
        message: `Payment received — we've set up your project workspace (${caseNumber}). Your team will be in touch to schedule the kickoff.`,
        actionUrl: `/portal/client/cases`,
      });
    } catch {
      /* non-blocking */
    }

    try {
      const { Account } = await import('@/models/Account');
      const { sendEmail, EmailTemplates } = await import('@/lib/email');
      const account = await Account.findById(invoice.clientId, 'fullName email').lean();
      if ((account as any)?.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || 'https://leothetechguy.com';
        await sendEmail({
          to: (account as any).email,
          subject: `Your project is underway — ${caseNumber}`,
          html: EmailTemplates.projectKickoff(
            (account as any).fullName || 'Valued Client',
            caseNumber,
            `${appUrl}/portal/client/cases`,
          ),
        });
      }
    } catch {
      /* non-blocking */
    }

    // Audit (best-effort).
    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        entityType: 'case',
        entityId: caseId,
        action: 'project_onboarded_from_payment',
        performedBy: 'system',
        details: { caseNumber, invoiceNumber: invoice.invoiceNumber },
        metadata: { caseNumber },
      });
    } catch {
      /* non-blocking */
    }

    return { created: true, caseId: String(caseId) };
  } catch {
    return { created: false, reason: 'error' };
  }
}
