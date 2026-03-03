import Link from 'next/link';

import KnowledgeBaseOverview from '../knowledge-base/KnowledgeBaseOverview';

export default function InternDashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Intern Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/portal/intern/my-leads" className="block group">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 transition-all h-full transform hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 group-hover:border-neutral-700">
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">My Leads</h2>
              <p className="text-neutral-400 text-sm">View and track the status of all leads you have submitted.</p>
            </div>
          </Link>
          
          <Link href="/portal/intern/submit-lead" className="block group">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/50 transition-all h-full transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group-hover:border-neutral-700">
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">Submit New Lead</h2>
              <p className="text-neutral-400 text-sm">Enter details for a new prospective client lead.</p>
            </div>
          </Link>
        </div>

        <div className="pt-8 border-t border-neutral-800">
          <h2 className="text-2xl font-bold text-white mb-6">Knowledge Base</h2>
          <div className="bg-neutral-900/30 rounded-3xl p-4 border border-neutral-800/50">
            <KnowledgeBaseOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
