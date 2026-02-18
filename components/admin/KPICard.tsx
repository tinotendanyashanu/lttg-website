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
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend.positive ? '+' : ''}{trend.value}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {trend && <p className="text-xs text-slate-400 mt-1">{trend.label}</p>}
            </div>
        </div>
    );
}
