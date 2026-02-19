import React from 'react';
import dbConnect from '@/lib/mongodb';
import CommercialPlaybookConfig, { ICommercialPlaybookConfig } from '@/models/CommercialPlaybookConfig';
import PlaybookEditor from '@/components/admin/commercial-playbook/PlaybookEditor';

export default async function AdminCommercialPlaybookPage() {
  await dbConnect();
  
  let config = await CommercialPlaybookConfig.findOne({}).lean() as unknown as ICommercialPlaybookConfig;

  // If no config, create default (should be handled by API too, but good fallback)
  if (!config) {
      // Create empty shell or just show message, but ideally we seed.
      // We rely on the API route or manual seed, but let's assume it exists or pass null and let editor handle?
      // Editor needs structure.
      // Since we seeded in the API GET, we can also ensure it here.
      // But for now, we assume the user might have hit the API once, or we just provide default structure to prop if null.
  }
  
  // Serialize
  const serializedConfig = config ? JSON.parse(JSON.stringify(config)) : null;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Commercial Playbook Editor</h1>
        <p className="text-slate-500 text-sm">
            Manage pricing tiers, service guides, and sales scripts seen by partners.
        </p>
      </div>

      {serializedConfig ? (
        <PlaybookEditor initialConfig={serializedConfig} />
      ) : (
        <div className="p-10 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
            <p className="text-slate-500">Configuration not found. Please initialize via the API or contact support.</p>
        </div>
      )}
    </div>
  );
}
