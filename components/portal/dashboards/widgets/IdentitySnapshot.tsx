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
    <div className="bg-white dark:bg-[#27272a] p-6 rounded-2xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 flex items-center gap-6">
      <div className="relative w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 border-2 border-brand-primary/20 overflow-hidden">
        {profileImageUrl ? (
          <Image 
            src={profileImageUrl} 
            alt={fullName} 
            fill 
            className="object-cover"
          />
        ) : (
          <span className="text-2xl font-bold text-brand-primary">
            {fullName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className={`absolute bottom-0 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#27272a] ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </div>
      
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          Welcome back, {fullName.split(' ')[0]}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="font-semibold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md">
            {displayRole}
          </span>
          {teamId && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                <span className="material-icons-outlined text-[16px]">groups</span>
                Team Member
              </span>
            </>
          )}
          {roles.includes('intern') && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-semibold">
                10% Rate
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
