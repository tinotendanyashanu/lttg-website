"use client";

import React from 'react';
import { AccountType, TeamType } from '@/types';

interface TeamViewProps {
  team: TeamType | null;
  teamMembers: AccountType[];
}

export default function TeamView({ team, teamMembers }: TeamViewProps) {
  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-icons-outlined text-brand-primary text-5xl">group_off</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Team Assigned</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You are not currently assigned to any team. If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Team Header */}
      <div className="bg-white dark:bg-[#27272a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <span className="material-icons-outlined text-3xl">groups</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <p className="text-brand-primary font-medium mt-1">Active Team</p>
            </div>
          </div>
          {team.description && (
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mt-4 leading-relaxed">
              {team.description}
            </p>
          )}
        </div>
      </div>

      {/* Team Members */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-icons-outlined text-brand-primary">people</span>
            Team Members
            <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm py-0.5 px-2.5 rounded-full font-semibold">
              {teamMembers.length}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div 
              key={member._id} 
              className="bg-white dark:bg-[#27272a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/20 bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shrink-0">
                {member.email?.[0]?.toUpperCase() || "U"}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {member.email.split('@')[0]}
                  </h3>
                  {member.isActive && (
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" title="Active"></span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {member.email}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {member.roles.map(role => (
                    <span 
                      key={role} 
                      className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
