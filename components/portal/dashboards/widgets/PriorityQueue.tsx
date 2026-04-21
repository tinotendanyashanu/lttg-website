'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  status: string;
  urgency: string;
  score: number;
  updatedAt: string;
}

export default function PriorityQueue({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#27272a] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 text-center h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <span className="material-icons-outlined text-3xl">task_alt</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">All caught up!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No high-priority tasks in your queue right now.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#27272a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-soft overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-icons-outlined text-blue-600">bolt</span>
            Priority Queue
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Algorithm-sorted by urgency and age</p>
        </div>
        <span className="bg-blue-600/10 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
          Top {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {tasks.map((task) => (
          <Link 
            key={task.id} 
            href={`/portal/case-management/${task.id}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border-b border-gray-100 last:border-0 dark:border-gray-800 group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
              task.urgency === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
              task.status === 'needs_assistance' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
              'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            }`}>
              {task.score}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors text-sm">{task.title}</h4>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                <span className="capitalize">{task.subtitle}</span>
                <span>•</span>
                <span>Updated {formatDistanceToNow(new Date(task.updatedAt))} ago</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                task.status === 'needs_assistance' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                task.status === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="p-4 bg-gray-50/30 dark:bg-gray-800/20 text-center border-t border-gray-100 dark:border-gray-800">
        <Link href="/portal/case-management" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          View all active cases
        </Link>
      </div>
    </div>
  );
}
