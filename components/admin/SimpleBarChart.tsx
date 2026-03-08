interface ChartData {
    label: string;
    value: number;
}

export default function SimpleBarChart({ data, title, height = 200, color = 'bg-purple-500' }: { data: ChartData[], title: string, height?: number, color?: string }) {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const allZero = data.every(d => d.value === 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
                <span className="text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                    {data.reduce((s, d) => s + d.value, 0).toLocaleString()} total
                </span>
            </div>
            {allZero ? (
                <div className="flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm italic" style={{ height: `${height}px` }}>
                    No data yet
                </div>
            ) : (
                <div className="flex items-end gap-1.5" style={{ height: `${height}px` }}>
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end group" style={{ height: '100%' }}>
                            <div className="relative w-full flex flex-col items-center justify-end" style={{ height: 'calc(100% - 20px)' }}>
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-500 ${color} opacity-75 group-hover:opacity-100 relative`}
                                    style={{ height: `${Math.max((item.value / maxValue) * 100, 2)}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                                        {item.value.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 truncate w-full text-center">{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

