import { redirect } from 'next/navigation';

export default async function CaseMessagesPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  redirect(`/portal/client/messages?caseId=${caseId}`);
}
