'use client';
import React, { useState } from 'react';
import { IServiceGuide } from '@/models/CommercialPlaybookConfig';
import { ChevronDown, ChevronUp, Check, X, ArrowRight } from 'lucide-react';

interface ServiceLevelAccordionProps {
  data: IServiceGuide[];
}

export default function ServiceLevelAccordion({ data }: ServiceLevelAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {data.map((guide, index) => (
        <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between px-6 py-4 text-left focus:outline-none bg-white"
          >
            <span className="font-semibold text-slate-900 text-lg">{guide.title}</span>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </button>

          {openIndex === index && (
            <div className="px-6 pb-6 bg-slate-50/30 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Left Column: Who For & Problem */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Who it is for</h4>
                    <p className="text-slate-600 text-sm">{guide.whoIsItFor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Problem it solves</h4>
                    <p className="text-slate-600 text-sm">{guide.problemItSolves}</p>
                  </div>
                </div>

                {/* Right Column: Includes/Excludes/Upgrade */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">What it includes</h4>
                    <ul className="space-y-1">
                      {guide.includes.map((item, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-600">
                          <Check className="h-4 w-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-2">What it does NOT include</h4>
                    <ul className="space-y-1">
                      {guide.doesNotInclude.map((item, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-600">
                          <X className="h-4 w-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2"> 
                    <div className="items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-flex">
                        <span className="mr-2 text-slate-500 uppercase text-xs font-bold">Upgrade Path:</span> 
                        {guide.upgradePath} 
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
