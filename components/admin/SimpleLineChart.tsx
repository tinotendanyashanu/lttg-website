'use client';

interface DataPoint {
    label: string;
    value: number;
}

export default function SimpleLineChart({ data, title, height = 200, color = 'stroke-blue-500' }: { data: DataPoint[], title: string, height?: number, color?: string }) {
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // 10% padding
    
    // Generate points for SVG polyline
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxValue) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
            <div className="relative" style={{ height: `${height}px` }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="100" y2="0" className="stroke-slate-100" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="25" x2="100" y2="25" className="stroke-slate-100" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="50" x2="100" y2="50" className="stroke-slate-100" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="75" x2="100" y2="75" className="stroke-slate-100" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <line x1="0" y1="100" x2="100" y2="100" className="stroke-slate-100" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

                    {/* The Line */}
                    <polyline 
                        points={points} 
                        fill="none" 
                        strokeWidth="3" 
                        vectorEffect="non-scaling-stroke"
                        className={`${color} drop-shadow-sm`}
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    
                    {/* Area under the line (Gradient) */}
                     <defs>
                        <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" className={`${color.replace('stroke-', 'stop-')}`} stopOpacity="0.2" />
                            <stop offset="100%" className={`${color.replace('stroke-', 'stop-')}`} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                     <polygon 
                        points={`0,100 ${points} 100,100`} 
                        fill={`url(#gradient-${title.replace(/\s/g, '')})`}
                        className={color.replace('stroke-', 'fill-')}
                        opacity="0.2"
                    />

                    {/* Dots */}
                    {data.map((d, i) => {
                         const x = (i / (data.length - 1)) * 100;
                         const y = 100 - (d.value / maxValue) * 100;
                         return (
                             <circle 
                                key={i} 
                                cx={x} 
                                cy={y} 
                                r="3" 
                                className={`${color.replace('stroke-', 'fill-')} stroke-white hover:r-4 transition-all cursor-pointer`} 
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                             >
                                <title>{d.label}: {d.value}</title>
                             </circle>
                         );
                    })}
                </svg>
            </div>
             <div className="flex justify-between mt-4 text-xs text-slate-400 px-1">
                {data.map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
            </div>
        </div>
    );
}
