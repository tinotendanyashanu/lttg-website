interface ChartData {
    label: string;
    value: number;
}

export default function SimpleBarChart({ data, title, height = 200, color = 'bg-purple-500' }: { data: ChartData[], title: string, height?: number, color?: string }) {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
            <div className="flex items-end space-x-2" style={{ height: `${height}px` }}>
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                        <div className="relative w-full flex items-end justify-center">
                            <div 
                                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${color} opacity-80 group-hover:opacity-100`}
                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow pointer-events-none transition-opacity">
                                    {item.value}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-slate-400 mt-2 truncate w-full text-center">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
