import dbConnect from '@/lib/mongodb';
import AdminPageBanner from '@/components/admin/AdminPageBanner';
import CreateQuotationModal from '@/components/admin/CreateQuotationModal';
import QuotationsTable from '@/components/admin/QuotationsTable';

export const metadata = { title: 'Quotations | Admin' };
export const dynamic = 'force-dynamic';

async function getQuotations() {
  await dbConnect();
  const { Quotation } = await import('@/models/Quotation');
  const { Account } = await import('@/models/Account');

  const quotations = await Quotation.find().sort({ createdAt: -1 }).limit(200).lean();

  const clientIds = [...new Set(quotations.filter((q: any) => q.clientId).map((q: any) => String(q.clientId)))];
  const accounts = await Account.find({ _id: { $in: clientIds } }, 'fullName email').lean();
  const accountMap: Record<string, { fullName?: string; email: string }> = {};
  for (const acc of accounts as any[]) {
    accountMap[String(acc._id)] = { fullName: (acc as any).fullName, email: (acc as any).email };
  }

  const sentCount = quotations.filter((q: any) => q.status === 'sent').length;
  const acceptedCount = quotations.filter((q: any) => q.status === 'accepted').length;
  const rejectedCount = quotations.filter((q: any) => q.status === 'rejected').length;
  const draftCount = quotations.filter((q: any) => q.status === 'draft').length;

  return {
    quotations: quotations.map((q: any) => ({
      _id: String(q._id),
      quotationNumber: q.quotationNumber,
      amount: q.amount,
      currency: q.currency,
      status: q.status,
      clientId: q.clientId ? String(q.clientId) : undefined,
      prospectName: q.prospectName,
      prospectEmail: q.prospectEmail,
      prospectPhone: q.prospectPhone,
      validUntil: q.validUntil?.toISOString?.() ?? undefined,
      sentAt: q.sentAt?.toISOString?.() ?? undefined,
      acceptedAt: q.acceptedAt?.toISOString?.() ?? undefined,
      rejectedAt: q.rejectedAt?.toISOString?.() ?? undefined,
      createdAt: q.createdAt?.toISOString?.() ?? undefined,
    })),
    accountMap,
    sentCount,
    acceptedCount,
    rejectedCount,
    draftCount,
  };
}

async function getClients() {
  await dbConnect();
  const { Account } = await import('@/models/Account');
  const clients = await Account.find(
    { roles: 'client', isActive: true, linkedClientAccountId: { $exists: false } },
    'fullName email',
  )
    .sort({ fullName: 1 })
    .lean();
  return clients.map((c: any) => ({ _id: String(c._id), fullName: c.fullName, email: c.email }));
}

export default async function AdminQuotationsPage() {
  const [{ quotations, accountMap, sentCount, acceptedCount, rejectedCount, draftCount }, clients] =
    await Promise.all([getQuotations(), getClients()]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <AdminPageBanner
        icon="request_quote"
        title="Quotations"
        description="Send quotations to clients. When a client accepts, an invoice is automatically created."
        action={<CreateQuotationModal clients={clients} />}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">
            Pending
          </p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{sentCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">
            Accepted
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{acceptedCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">
            Rejected
          </p>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{rejectedCount}</p>
        </div>
        <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft p-5">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">
            Drafts
          </p>
          <p className="text-2xl font-extrabold text-gray-500 dark:text-gray-400">{draftCount}</p>
        </div>
      </div>

      <QuotationsTable quotations={quotations} accountMap={accountMap} />
    </div>
  );
}
