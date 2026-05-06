import { FileText, Download, PlayCircle } from 'lucide-react';

const RESOURCES = [
  {
    category: 'Sales Assets',
    items: [
      { title: 'Leo Systems Service Deck (2025)', type: 'PDF', size: '2.4 MB', icon: FileText },
      { title: 'Enterprise Pricing Guide', type: 'PDF', size: '1.1 MB', icon: FileText },
      { title: 'Objection Handling Script', type: 'DOCX', size: '0.5 MB', icon: FileText },
    ]
  },
  {
    category: 'Case Studies',
    items: [
      { title: 'FinTech Migration Case Study', type: 'PDF', size: '3.2 MB', icon: FileText },
      { title: 'Healthcare App Scale-up', type: 'PDF', size: '1.8 MB', icon: FileText },
    ]
  },
  {
    category: 'Training',
    items: [
      { title: 'Partner Onboarding Walkthrough', type: 'Video', size: '15 min', icon: PlayCircle },
      { title: 'How to register your first deal', type: 'Video', size: '5 min', icon: PlayCircle },
    ]
  }
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Resource Library</h2>
        <p className="text-slate-500">Access sales collateral, guides, and training materials.</p>
      </div>

      <div className="grid gap-8">
        {RESOURCES.map((section) => (
          <div key={section.category}>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{section.category}</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item, i) => (
                <div key={i} className="group bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <item.icon className="h-5 w-5 text-slate-500 group-hover:text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">{item.title}</h4>
                        <p className="text-xs text-slate-500">{item.type} • {item.size}</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
