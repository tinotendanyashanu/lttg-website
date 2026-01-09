'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const isLarge = project.size === 'large';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 ${
        isLarge ? 'md:col-span-2 md:row-span-2' : 'col-span-1'
      }`}
    >
      <Link href={project.link || '#'} target="_blank" className="block h-full"> 
        {/* Ambient Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10 p-8 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-white/80 backdrop-blur-sm transition-colors duration-300 shadow-sm`}>
              {/* Render Icon Component */}
              <project.icon className="w-6 h-6 text-slate-700" />
            </div>
            
            <div className="flex gap-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    project.status === 'Live' ? 'bg-green-50 text-green-700 border-green-100' :
                    project.status === 'Prototype' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                 }`}>
                    {project.status}
                 </span>
                 <div className="p-2 rounded-full bg-slate-50 group-hover:bg-[#4C8BFF] group-hover:text-white transition-colors duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow">
            <h3 className={`font-bold text-slate-900 mb-2 group-hover:text-[#4C8BFF] transition-colors ${
              isLarge ? 'text-3xl' : 'text-xl'
            }`}>
              {project.title}
            </h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">{project.category}</p>
            
            <p className={`text-slate-600 leading-relaxed mb-6 ${isLarge ? 'text-lg max-w-xl' : 'text-sm line-clamp-3'}`}>
              {project.description}
            </p>
          </div>

          {/* Footer / Tags */}
          <div className="mt-auto pt-6 border-t border-slate-100/50 group-hover:border-slate-200/50 transition-colors">
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, isLarge ? 5 : 3).map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100/80 group-hover:bg-white/80 text-slate-600 text-xs font-medium border border-slate-200/50 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
               {project.tags.length > (isLarge ? 5 : 3) && (
                  <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-400 text-xs font-medium">
                    +{project.tags.length - (isLarge ? 5 : 3)}
                  </span>
               )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectCard;
