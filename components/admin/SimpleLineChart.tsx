'use client';

import { useState, useMemo } from 'react';

interface DataPoint {
    label: string;
    value: number;
}

// Helper: Generate a smooth cubic bezier path (catmull-rom to bezier)
function smoothPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    if (points.length === 2) {
        return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    }

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const tension = 0.3;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
}

export default function SimpleLineChart({ 
    data, 
    title, 
    height = 240, 
    color = 'stroke-blue-500' 
}: { 
    data: DataPoint[], 
    title: string, 
    height?: number, 
    color?: string 
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Chart dimensions (SVG viewBox coordinates)
    const chartWidth = 500;
    const chartHeight = 200;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 25;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1) * 1.15, [data]);
    const totalValue = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

    // Compute nice Y-axis ticks
    const yTicks = useMemo(() => {
        const tickCount = 4;
        const step = Math.ceil(maxValue / tickCount);
        return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
    }, [maxValue]);

    // Compute chart points
    const chartPoints = useMemo(() => {
        return data.map((d, i) => ({
            x: paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth,
            y: paddingTop + plotHeight - (d.value / maxValue) * plotHeight,
        }));
    }, [data, maxValue, plotWidth, plotHeight, paddingLeft, paddingTop]);

    const linePath = useMemo(() => smoothPath(chartPoints), [chartPoints]);

    // Area path (closes the smooth line down to the X axis)
    const areaPath = useMemo(() => {
        if (!linePath) return '';
        const baseY = paddingTop + plotHeight;
        return `${linePath} L ${chartPoints[chartPoints.length - 1].x},${baseY} L ${chartPoints[0].x},${baseY} Z`;
    }, [linePath, chartPoints, paddingTop, plotHeight]);

    // Derive stroke color class for inline use
    const strokeHex = color.includes('blue') ? '#3B82F6' : color.includes('indigo') ? '#6366F1' : color.includes('emerald') ? '#10B981' : '#3B82F6';

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: strokeHex }}></div>
                        <span className="text-xs font-medium text-slate-500">Visitors</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                        {totalValue.toLocaleString()} total
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height: `${height}px` }}>
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="none"
                    className="w-full h-full"
                >
                    <defs>
                        {/* Gradient fill under the line */}
                        <linearGradient id={`area-grad-${title.replace(/\s/g, '')}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={strokeHex} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={strokeHex} stopOpacity="0.0" />
                        </linearGradient>
                        {/* Glow filter for the line */}
                        <filter id={`glow-${title.replace(/\s/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Horizontal grid lines */}
                    {yTicks.map((tick, i) => {
                        const y = paddingTop + plotHeight - (tick / maxValue) * plotHeight;
                        return (
                            <g key={`grid-${i}`}>
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={chartWidth - paddingRight}
                                    y2={y}
                                    stroke="#E2E8F0"
                                    strokeWidth="0.5"
                                    strokeDasharray={i === 0 ? 'none' : '3 3'}
                                />
                                <text
                                    x={paddingLeft - 8}
                                    y={y + 1}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                    fill="#94A3B8"
                                    fontSize="8"
                                    fontWeight="500"
                                >
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    {/* Gradient area fill */}
                    <path
                        d={areaPath}
                        fill={`url(#area-grad-${title.replace(/\s/g, '')})`}
                        className="transition-opacity duration-500"
                    />

                    {/* Main smooth line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke={strokeHex}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#glow-${title.replace(/\s/g, '')})`}
                        className="transition-all duration-500"
                    />

                    {/* Hover vertical line */}
                    {hoveredIndex !== null && chartPoints[hoveredIndex] && (
                        <line
                            x1={chartPoints[hoveredIndex].x}
                            y1={paddingTop}
                            x2={chartPoints[hoveredIndex].x}
                            y2={paddingTop + plotHeight}
                            stroke={strokeHex}
                            strokeWidth="0.75"
                            strokeDasharray="4 3"
                            opacity="0.5"
                        />
                    )}

                    {/* Data Dots */}
                    {chartPoints.map((point, i) => (
                        <g key={`dot-${i}`}>
                            {/* Invisible larger hitbox for hover */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="12"
                                fill="transparent"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer"
                            />
                            {/* Outer pulse ring on hover */}
                            {hoveredIndex === i && (
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="7"
                                    fill={strokeHex}
                                    opacity="0.15"
                                    className="animate-ping"
                                />
                            )}
                            {/* Visible dot */}
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r={hoveredIndex === i ? '4.5' : '3'}
                                fill={hoveredIndex === i ? strokeHex : 'white'}
                                stroke={strokeHex}
                                strokeWidth="2"
                                className="transition-all duration-200 cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {data.map((d, i) => {
                        const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
                        return (
                            <text
                                key={`label-${i}`}
                                x={x}
                                y={chartHeight - 4}
                                textAnchor="middle"
                                fill={hoveredIndex === i ? '#1E293B' : '#94A3B8'}
                                fontSize="9"
                                fontWeight={hoveredIndex === i ? '700' : '500'}
                                className="transition-all duration-200"
                            >
                                {d.label}
                            </text>
                        );
                    })}
                </svg>

                {/* Floating Tooltip */}
                {hoveredIndex !== null && data[hoveredIndex] && (
                    <div
                        className="absolute pointer-events-none z-10 transition-all duration-150"
                        style={{
                            left: `${(chartPoints[hoveredIndex].x / chartWidth) * 100}%`,
                            top: `${((chartPoints[hoveredIndex].y - 15) / chartHeight) * 100}%`,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg text-center min-w-[60px]">
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{data[hoveredIndex].label}</p>
                            <p className="text-sm font-extrabold tracking-tight">{data[hoveredIndex].value.toLocaleString()}</p>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="flex justify-center -mt-0.5">
                            <div className="w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
