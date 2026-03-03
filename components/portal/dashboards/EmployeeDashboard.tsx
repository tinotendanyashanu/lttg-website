import KnowledgeBaseOverview from '../knowledge-base/KnowledgeBaseOverview';

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Employee Dashboard</h1>
        
        <div className="pt-4">
          <h2 className="text-2xl font-bold text-white mb-6">Knowledge Base</h2>
          <div className="bg-neutral-900/30 rounded-3xl p-4 border border-neutral-800/50">
            <KnowledgeBaseOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
