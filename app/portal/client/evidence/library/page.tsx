import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';

const EVIDENCE_ICONS: Record<string, string> = {
  screenshot: 'image',
  document: 'description',
  video: 'video_file',
  link: 'link',
  archive: 'folder_zip',
  other: 'attach_file',
};

const TYPE_COLORS: Record<string, string> = {
  screenshot: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  document: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  video: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  link: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  archive: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  other: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

async function getEvidence(clientId: string) {
  try {
    await dbConnect();
    const { ClientEvidence } = await import('@/models/ClientEvidence');
    const evidence = await ClientEvidence.find({ clientId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(evidence));
  } catch (_) {
    return [];
  }
}

function formatBytes(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function EvidenceLibraryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const evidence = await getEvidence(session.user.id);

  const typeCounts: Record<string, number> = {};
  for (const item of evidence) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {evidence.length} items across all cases
          </p>
        </div>
        <Link
          href="/portal/client/evidence/upload"
          className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors shrink-0"
        >
          <span className="material-icons-outlined text-[14px]">upload_file</span>
          Upload Evidence
        </Link>
      </div>

      {/* Type Stats */}
      {Object.keys(typeCounts).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div
              key={type}
              className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-4 text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                  TYPE_COLORS[type] || TYPE_COLORS.other
                }`}
              >
                <span className="material-icons-outlined text-[18px]">
                  {EVIDENCE_ICONS[type] || 'attach_file'}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-400 capitalize">{type}</p>
            </div>
          ))}
        </div>
      )}

      {evidence.length === 0 ? (
        <div className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 py-20 text-center">
          <span className="material-icons-outlined text-gray-300 dark:text-gray-600 text-6xl block mb-3">
            lock
          </span>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your evidence locker is empty
          </p>
          <Link
            href="/portal/client/evidence/upload"
            className="inline-flex items-center gap-2 bg-[#2F2F2F] hover:bg-[#4a4a4a] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <span className="material-icons-outlined text-[14px]">upload_file</span>
            Upload First Item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidence.map((item: any) => (
            <div
              key={item._id}
              className="bg-white dark:bg-[#27272a] rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 p-5"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    TYPE_COLORS[item.type] || TYPE_COLORS.other
                  }`}
                >
                  <span className="material-icons-outlined">
                    {EVIDENCE_ICONS[item.type] || 'attach_file'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">
                    {item.type}
                    {item.fileSize ? ` · ${formatBytes(item.fileSize)}` : ''}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.caseId && (
                    <Link
                      href={`/portal/client/cases/${item.caseId}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1.5"
                    >
                      <span className="material-icons-outlined text-[11px]">folder_shared</span>
                      View Case
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                {(item.fileUrl || item.url) && (
                  <a
                    href={item.fileUrl || item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    View <span className="material-icons-outlined text-[12px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
