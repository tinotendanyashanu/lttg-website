import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface EscalationGuardrailsProps {
  data: string[];
}

export default function EscalationGuardrails({ data }: EscalationGuardrailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {/* Triggers */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-center gap-3 mb-4 text-amber-800">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="font-semibold text-lg">When to Escalate</h3>
        </div>
        <ul className="space-y-3">
          {data.map((rule, index) => (
            <li key={index} className="flex items-start text-amber-900">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 mr-3 shrink-0" />
              <span className="font-medium">{rule}</span>
            </li>
          ))}
        </ul>
      </div>

        {/* Brand Protection */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4 text-blue-800">
            <ShieldCheck className="h-6 w-6" />
            <h3 className="font-semibold text-lg">Brand Guardrails</h3>
        </div>
        <ul className="space-y-3 text-blue-900">
            <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-3" />
                No promised discounts without approval
            </li>
             <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-3" />
                Never finalize pricing in first meeting
            </li>
             <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-3" />
                Always confirm scope in writing
            </li>
             <li className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-3" />
                Avoid technical jargon with C-Level
            </li>
        </ul>
      </div>
    </div>
  );
}
