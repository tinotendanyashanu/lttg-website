import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import AssistantClient from '@/components/portal/assistant/AssistantClient';
import { getAssistantConversations } from '@/lib/actions/employee-assistant';

export const metadata = { title: 'AI Assistant | Portal' };
export const dynamic = 'force-dynamic';

export default async function EmployeeAssistantPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== 'admin' && role !== 'employee' && role !== 'intern') redirect('/portal');

  let conversations: Awaited<ReturnType<typeof getAssistantConversations>> = [];
  try {
    conversations = await getAssistantConversations();
  } catch {
    conversations = [];
  }

  return (
    <div className="space-y-6">
      <AdminPageBanner
        icon="neurology"
        title="AI Assistant"
        description="Your internal knowledge co-pilot — SOPs, pricing, playbooks, contracts and workflows."
      />
      <AssistantClient initialConversations={conversations} />
    </div>
  );
}
