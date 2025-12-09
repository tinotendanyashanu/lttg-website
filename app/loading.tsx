import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#0071e3] animate-spin" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">Loading experience...</p>
      </div>
    </div>
  );
}
