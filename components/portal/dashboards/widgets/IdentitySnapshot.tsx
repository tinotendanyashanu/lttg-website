import React from 'react';
import Image from 'next/image';

interface IdentitySnapshotProps {
  fullName: string;
  roles: string[];
  teamId: string | null;
  profileImageUrl?: string;
  isActive: boolean;
}

export default function IdentitySnapshot({
  fullName,
  roles,
  teamId,
  profileImageUrl,
  isActive
}: IdentitySnapshotProps) {
  const displayRole = roles.length > 0 
    ? roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ') 
    : 'User';

  return (
    <div className="bg-white/80 dark:bg-[#27272a]/80 backdrop-blur-md p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-4 w-full h-full text-center">
      <div className="relative w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 border-4 border-white dark:border-[#27272a] shadow-sm overflow-hidden">
        {profileImageUrl ? (
          <Image 
            src={profileImageUrl} 
            alt={fullName} 
            fill 
            className="object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-brand-primary">
            {fullName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#27272a] ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
      </div>
      
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
          {fullName}
        </h2>
        <div className="mt-2 flex flex-wrap justify-center items-center gap-2 text-xs">
          <span className="font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-wide">
            {displayRole}
          </span>
          {teamId && (
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
              <span className="material-icons-outlined text-[14px]">groups</span>
              Team
            </span>
          )}
          {roles.includes('intern') && (
            <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-lg font-bold">
              10% Rate
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
