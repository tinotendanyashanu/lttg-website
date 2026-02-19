'use client';
import React, { useState } from 'react';
import { ICommercialPlaybookConfig, IPricingTier, IServiceGuide, IRegionalGuideline, IScript } from '@/models/CommercialPlaybookConfig';
import { Save, Plus, Trash2, Globe, Book, DollarSign, AlertTriangle, MessageSquare } from 'lucide-react';

interface PlaybookConfigData {
  pricingMatrix: IPricingTier[];
  serviceGuides: IServiceGuide[];
  regionalGuidelines: IRegionalGuideline;
  scripts: IScript[];
  escalationRules: string[];
  updatedBy?: string;
  lastUpdated?: Date;
}

interface PlaybookEditorProps {
  initialConfig: PlaybookConfigData;
}

// Helper to render simple text input
const TextInput = ({ label, value, onChange, placeholder = '' }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder={placeholder}
    />
  </div>
);

// Helper for Text Area
const TextArea = ({ label, value, onChange, placeholder = '' }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      placeholder={placeholder}
    />
  </div>
);

export default function PlaybookEditor({ initialConfig }: PlaybookEditorProps) {
  // Use a deep copy to avoid mutating props directly if we were to re-render parent
  const [config, setConfig] = useState<PlaybookConfigData>(initialConfig);
  const [activeTab, setActiveTab] = useState('pricing');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const response = await fetch('/api/commercial-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers for Pricing Matrix ---
  const updatePricingRow = (index: number, field: keyof IPricingTier, value: string) => {
    const newMatrix = [...config.pricingMatrix];
    newMatrix[index] = { ...newMatrix[index], [field]: value };
    setConfig({ ...config, pricingMatrix: newMatrix });
  };

  // --- Handlers for Service Guides ---
  const updateServiceGuide = (index: number, field: keyof IServiceGuide, value: any) => {
    const newGuides = [...config.serviceGuides];
    newGuides[index] = { ...newGuides[index], [field]: value };
    setConfig({ ...config, serviceGuides: newGuides });
  };
  
  const updateServiceGuideArrayInfo = (index: number, field: 'includes' | 'doesNotInclude', itemIndex: number, value: string) => {
      const newGuides = [...config.serviceGuides];
      const newArray = [...newGuides[index][field]];
      newArray[itemIndex] = value;
      newGuides[index] = { ...newGuides[index], [field]: newArray };
      setConfig({ ...config, serviceGuides: newGuides });
  }

  // --- Handlers for Regional Guidelines ---
  const updateRegional = (field: keyof IRegionalGuideline, value: string) => {
    setConfig({ ...config, regionalGuidelines: { ...config.regionalGuidelines, [field]: value } });
  };

  // --- Handlers for Scripts ---
  const updateScript = (index: number, field: keyof IScript, value: string) => {
    const newScripts = [...config.scripts];
    newScripts[index] = { ...newScripts[index], [field]: value };
    setConfig({ ...config, scripts: newScripts });
  };
  
  const addScript = () => {
      setConfig({
          ...config,
          scripts: [...config.scripts, { title: 'New Script', content: '', category: 'pricing' }]
      });
  }

  const removeScript = (index: number) => {
      const newScripts = config.scripts.filter((_, i) => i !== index);
      setConfig({ ...config, scripts: newScripts });
  }

  // --- Handlers for Escalation Rules ---
  const updateEscalation = (index: number, value: string) => {
    const newRules = [...config.escalationRules];
    newRules[index] = value;
    setConfig({ ...config, escalationRules: newRules });
  };

  const addEscalation = () => setConfig({ ...config, escalationRules: [...config.escalationRules, ''] });
  const removeEscalation = (index: number) => setConfig({ ...config, escalationRules: config.escalationRules.filter((_, i) => i !== index) });


  const tabs = [
    { id: 'pricing', label: 'Pricing Matrix', icon: DollarSign },
    { id: 'service', label: 'Service Guides', icon: Book },
    { id: 'regional', label: 'Regional', icon: Globe },
    { id: 'scripts', label: 'Scripts', icon: MessageSquare },
    { id: 'escalation', label: 'Escalation', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === tab.id
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                </button>
            ))}
         </div>

         <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all ${
                isSaving ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
            }`}
         >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
         </button>
      </div>

      {saveStatus === 'success' && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-200">
              Changes saved successfully!
          </div>
      )}
       {saveStatus === 'error' && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold border border-red-200">
              Error saving changes. Check console.
          </div>
      )}

      {/* --- PRICING MATRIX TAB --- */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Service Level</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Tier 1</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Tier 2</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Tier 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {config.pricingMatrix.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                      <input 
                        className="w-full bg-transparent font-medium text-slate-900 focus:outline-none border-b border-transparent focus:border-purple-300" 
                        value={row.serviceLevel} 
                        onChange={(e) => updatePricingRow(index, 'serviceLevel', e.target.value)} 
                      />
                  </td>
                  <td className="px-4 py-3">
                      <input 
                        className="w-full bg-transparent text-slate-600 focus:outline-none border-b border-transparent focus:border-purple-300" 
                        value={row.tier1} 
                        onChange={(e) => updatePricingRow(index, 'tier1', e.target.value)} 
                      />
                  </td>
                   <td className="px-4 py-3">
                      <input 
                        className="w-full bg-transparent text-slate-600 focus:outline-none border-b border-transparent focus:border-purple-300" 
                        value={row.tier2} 
                        onChange={(e) => updatePricingRow(index, 'tier2', e.target.value)} 
                      />
                  </td>
                   <td className="px-4 py-3">
                      <input 
                        className="w-full bg-transparent text-slate-600 focus:outline-none border-b border-transparent focus:border-purple-300" 
                        value={row.tier3} 
                        onChange={(e) => updatePricingRow(index, 'tier3', e.target.value)} 
                      />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* --- SERVICE GUIDES TAB --- */}
      {activeTab === 'service' && (
        <div className="space-y-6">
            {config.serviceGuides.map((guide, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 mb-4 text-slate-800">{guide.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <TextInput label="Who is it for?" value={guide.whoIsItFor} onChange={(v: string) => updateServiceGuide(index, 'whoIsItFor', v)} />
                             <TextInput label="Problem it solves" value={guide.problemItSolves} onChange={(v: string) => updateServiceGuide(index, 'problemItSolves', v)} />
                        </div>
                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-emerald-600 mb-1">Includes (Comma separated for now)</label>
                                <textarea
                                  value={guide.includes.join(', ')} // Simple editing for now
                                  onChange={(e) => updateServiceGuide(index, 'includes', e.target.value.split(',').map(s => s.trim()))}
                                  className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  rows={2}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-red-500 mb-1">Does NOT Include</label>
                                <textarea
                                  value={guide.doesNotInclude.join(', ')} 
                                  onChange={(e) => updateServiceGuide(index, 'doesNotInclude', e.target.value.split(',').map(s => s.trim()))}
                                  className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                  rows={2}
                                />
                            </div>
                             <TextInput label="Upgrade Path" value={guide.upgradePath} onChange={(v: string) => updateServiceGuide(index, 'upgradePath', v)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* --- REGIONAL GUIDELINES TAB --- */}
      {activeTab === 'regional' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 mb-4 text-slate-800">Regional Adjustment Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <TextInput label="Tier 1 Rule" value={config.regionalGuidelines.tier1} onChange={(v: string) => updateRegional('tier1', v)} />
                <TextInput label="Tier 2 Rule" value={config.regionalGuidelines.tier2} onChange={(v: string) => updateRegional('tier2', v)} />
                <TextInput label="Tier 3 Rule" value={config.regionalGuidelines.tier3} onChange={(v: string) => updateRegional('tier3', v)} />
            </div>
            <TextArea label="Adjustment Explanation" value={config.regionalGuidelines.adjustmentExplanation} onChange={(v: string) => updateRegional('adjustmentExplanation', v)} />
          </div>
      )}

      {/* --- SCRIPTS TAB --- */}
      {activeTab === 'scripts' && (
          <div className="space-y-4">
              {config.scripts.map((script, index) => (
                <div key={index} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative group">
                    <button onClick={() => removeScript(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                         <div className="md:col-span-2">
                             <TextInput label="Script Title" value={script.title} onChange={(v: string) => updateScript(index, 'title', v)} />
                         </div>
                         <div>
                             <TextInput label="Category" value={script.category} onChange={(v: string) => updateScript(index, 'category', v)} />
                         </div>
                    </div>
                    <TextArea label="Content" value={script.content} onChange={(v: string) => updateScript(index, 'content', v)} />
                </div>
              ))}
              <button onClick={addScript} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center">
                  <Plus className="h-5 w-5 mr-2" /> Add Script
              </button>
          </div>
      )}
      
      {/* --- ESCALATION RULES TAB --- */}
      {activeTab === 'escalation' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-lg border-b border-slate-100 pb-2 mb-6 text-slate-800">Escalation Triggers</h3>
            <div className="space-y-3">
                {config.escalationRules.map((rule, index) => (
                     <div key={index} className="flex items-center gap-2">
                         <input
                            type="text"
                            value={rule}
                            onChange={(e) => updateEscalation(index, e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button onClick={() => removeEscalation(index)} className="text-slate-400 hover:text-red-500 p-2">
                            <Trash2 className="h-5 w-5" />
                        </button>
                     </div>
                ))}
            </div>
             <button onClick={addEscalation} className="mt-4 flex items-center text-sm font-medium text-purple-600 hover:text-purple-800">
                  <Plus className="h-4 w-4 mr-1" /> Add Rule
              </button>
          </div>
      )}

    </div>
  );
}
