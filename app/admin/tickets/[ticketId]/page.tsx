import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import TicketDetailView from '@/components/support/TicketDetailView';
import { getAssignableStaff } from '@/lib/actions/support-center';
import { evaluateSla } from '@/lib/services/support-sla';

export const dynamic = 'force-dynamic';

async function getTicketData(id: string) {
  await dbConnect();
  const { SupportTicket } = await import('@/models/SupportTicket');
  const { Account } = await import('@/models/Account');
  const { ClientCase } = await import('@/models/ClientCase');

  const ticket = await SupportTicket.findById(id).lean();
  if (!ticket) return null;

  const client = await Account.findById((ticket as any).clientId, 'fullName email clientProfile').lean();
  const project = (ticket as any).caseId
    ? await ClientCase.findById((ticket as any).caseId, 'caseNumber title status assignedTeam milestones').lean()
    : null;

  return {
    ticket: JSON.parse(JSON.stringify(ticket)),
    client: client ? JSON.parse(JSON.stringify(client)) : null,
    project: project ? JSON.parse(JSON.stringify(project)) : null,
  };
}

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const data = await getTicketData(ticketId);
  if (!data) notFound();

  const { ticket, client, project } = data;
  const staff = await getAssignableStaff().catch(() => []);
  const sla = evaluateSla(ticket);

  return (
    <TicketDetailView
      ticketId={ticketId}
      ticket={ticket}
      client={client}
      project={project}
      staff={staff}
      sla={sla}
      backHref="/admin/tickets"
      backLabel="All Tickets"
      knowledgeHref="/admin/knowledge"
      clientLinks={[
        { label: 'View Client Invoices', href: '/admin/invoices' },
        { label: 'Client View', href: `/portal/client/tickets/${ticketId}`, external: true },
      ]}
    />
  );
}
