import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    icon: LucideIcon;
    color: string;
}

export default function KPICard({ title, value, trend, icon: Icon, color }: KPICardProps) {
    // Map the incoming background colors to text colors for the icon
    const iconColorClass = color.includes('bg-') ? color.replace('bg-', 'text-') : color;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 rounded-xl border border-slate-100 shadow-xs bg-white">
                    <Icon className={`h-5 w-5 ${iconColorClass}`} />
                </div>
                {trend && (
                    <span className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg ${trend.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'} border ${trend.positive ? 'border-emerald-100' : 'border-red-100'}`}>
                        {trend.positive ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                        )}
                        <span>{trend.value}%</span>
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                {trend && <p className="text-[11px] font-medium text-slate-400 mt-2">{trend.label}</p>}
            </div>
        </div>
    );
}
