"use client";

import { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { format, parseISO, startOfWeek, startOfMonth, formatISO, isValid } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';

type ChartDataPoint = {
    date: string; // YYYY-MM-DD
    revenue: number;
    expenses?: number;
};

interface GlobalChartProps {
    data: ChartDataPoint[]; // Pre-aggregated global data
}

type Timeframe = 'daily' | 'weekly' | 'monthly';

export function GlobalChart({ data }: GlobalChartProps) {
    const [timeframe, setTimeframe] = useState<Timeframe>('monthly');

    const aggregatedData = useMemo(() => {
        const map = new Map<string, { dateStr: string, timestamp: number, revenue: number, profit: number, expenses: number }>();
        
        data.forEach(point => {
            if (!point.date) return;
            const parsed = parseISO(point.date);
            if (!isValid(parsed)) return;

            let key = point.date;
            let displayDate = format(parsed, 'MMM dd, yyyy');
            let stamp = parsed.getTime();

            if (timeframe === 'weekly') {
                const start = startOfWeek(parsed, { weekStartsOn: 1 });
                key = formatISO(start, { representation: 'date' });
                displayDate = `Week of ${format(start, 'MMM dd')}`;
                stamp = start.getTime();
            } else if (timeframe === 'monthly') {
                const start = startOfMonth(parsed);
                key = formatISO(start, { representation: 'date' });
                displayDate = format(start, 'MMMM yyyy');
                stamp = start.getTime();
            }

            const existing = map.get(key) || { dateStr: displayDate, timestamp: stamp, revenue: 0, profit: 0, expenses: 0 };
            
            const exp = point.expenses || 0;
            const rev = point.revenue || 0;
            
            existing.revenue += rev;
            existing.expenses += exp;
            existing.profit += (rev - exp);

            map.set(key, existing);
        });

        // Sort chronologically
        return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [data, timeframe]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/90 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <p className="font-semibold text-white mb-3 text-sm">{payload[0].payload.dateStr}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-6 mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm text-zinc-300 capitalize">{entry.name}</span>
                            </div>
                            <span className="text-sm font-bold" style={{ color: entry.color }}>
                                ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (aggregatedData.length === 0) {
        return (
            <div className="h-80 w-full flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
                <p className="text-zinc-500 font-medium">No financial data available for the selected period.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel p-6 shadow-xl overflow-hidden relative group">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none transition-all group-hover:bg-indigo-500/10" />

            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-indigo-500/10">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-100 tracking-tight uppercase">Financial Timeline</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Historical Revenue & Profit</p>
                    </div>
                </div>

                <div className="flex items-center glass-pill rounded-lg p-1">
                    <button 
                        onClick={() => setTimeframe('daily')}
                        className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-md transition-all ${timeframe === 'daily' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Daily
                    </button>
                    <button 
                        onClick={() => setTimeframe('weekly')}
                        className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-md transition-all ${timeframe === 'weekly' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Weekly
                    </button>
                    <button 
                        onClick={() => setTimeframe('monthly')}
                        className={`px-3 py-1.5 text-xs font-black tracking-widest uppercase rounded-md transition-all ${timeframe === 'monthly' ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aggregatedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                            dataKey="dateStr" 
                            stroke="#52525b" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                // Shorten long dates on X axis
                                if (timeframe === 'weekly') return value.replace('Week of ', '');
                                if (timeframe === 'monthly') return value.split(' ')[0];
                                return value;
                            }}
                        />
                        <YAxis 
                            stroke="#52525b" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                            width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            name="Gross Revenue" 
                            stroke="#34d399" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="profit" 
                            name="Net Profit" 
                            stroke="#818cf8" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorProfit)" 
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
