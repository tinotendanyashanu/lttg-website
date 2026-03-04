import { getSessionWithDevBypass } from '@/lib/auth-util';
import { getAccountByEmail } from '@/lib/data/account';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import { Resource } from '@/models/Resource';
import Link from 'next/link';
import ResourceUploadModal from '@/components/portal/resources/ResourceUploadModal';

export default async function ResourcesPage() {
  const session = await getSessionWithDevBypass();
  if (!session?.user?.email) redirect('/');

  const account = await getAccountByEmail(session.user.email);
  if (!account) redirect('/');

  await dbConnect();

  // Fetch resources available to 'all' or specific roles of the user
  const orConditions = [{ roleVisibility: 'all' }, ...account.roles.map(r => ({ roleVisibility: r }))];
  const resources = await Resource.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Access pitch decks, templates, branding material, and contracts.
          </p>
        </div>
        {account.roles.includes('admin') && (
          <ResourceUploadModal />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource: any) => (
          <div key={resource._id.toString()} className="bg-white dark:bg-[#27272a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-all hover:shadow-md hover:border-brand-primary/30 group">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined text-2xl">description</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
            {resource.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 line-clamp-2">
                {resource.description}
              </p>
            )}
            
            <div className="mt-auto">
              <Link
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-brand-primary hover:text-white text-gray-700 dark:text-gray-300 font-semibold text-sm transition-colors"
              >
                <span className="material-icons-outlined text-lg">download</span>
                Download
              </Link>
            </div>
          </div>
        ))}

        {resources.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            <span className="material-icons-outlined text-5xl mb-4 opacity-50 block">folder_off</span>
            <p>No resources available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
