import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import LeadModel from '@/models/Lead';
import PartnerModel from '@/models/Partner';
import { Lead, Partner } from '@/types';
import LeadsClient from '@/components/partner/LeadsClient';

async function getLeads(
  userId: string,
  query: string,
  status: string
): Promise<Lead[]> {
  await dbConnect();
  const partner = (await PartnerModel.findById(userId).lean()) as unknown as Partner;
  if (!partner) return [];

  const filter: Record<string, unknown> = { partnerId: partner._id };

  if (status !== 'all') {
    filter.status = status;
  }

  if (query) {
    filter.$or = [
      { clientName: { $regex: query, $options: 'i' } },
      { clientEmail: { $regex: query, $options: 'i' } },
    ];
  }

  const leads = (await LeadModel.find(filter)
    .sort({ createdAt: -1 })
    .lean()) as unknown as Lead[];

  return JSON.parse(JSON.stringify(leads));
}

export default async function LeadsPage(props: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const status = searchParams.status || 'all';
  const leads = await getLeads(session.user.id, query, status);

  return <LeadsClient leads={leads} query={query} status={status} />;
}
