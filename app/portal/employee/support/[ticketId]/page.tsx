import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
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

export default async function EmployeeTicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'admin' && role !== 'employee') redirect('/portal');

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
      backHref="/portal/employee/support"
      backLabel="Support Inbox"
      knowledgeHref="/portal/employee/knowledge-base"
      clientLinks={[
        { label: 'Client View', href: `/portal/client/tickets/${ticketId}`, external: true },
      ]}
    />
  );
}
