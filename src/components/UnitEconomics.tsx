"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface AppStats {
    name: string;
    financials?: {
        collected: number;
        expenses: number;
    };
}

export function UnitEconomics({ apps }: { apps: AppStats[] }) {
    // Process data for the chart
    const data = apps
        .filter(app => app.financials && app.financials.collected > 0)
        .map(app => {
            const profit = (app.financials?.collected || 0) - (app.financials?.expenses || 0);
            const margin = app.financials?.collected ? (profit / app.financials.collected) * 100 : 0;
            return {
                name: app.name,
                collected: app.financials?.collected || 0,
                expenses: app.financials?.expenses || 0,
                profit: profit,
                margin: Math.round(margin)
            };
        })
        .sort((a, b) => b.profit - a.profit);

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Unit Economics & Profit Margins
            </h3>
            
            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                    No financial data available for deployed apps.
                </div>
            ) : (
                <div className="flex flex-col gap-6 flex-1">
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="profit"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value as number)}
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e4e4e7' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-auto">
                        {data.map((app, index) => (
                            <div key={app.name} className="bg-black/40 border border-zinc-800/50 p-3 rounded-lg flex items-center justify-between group hover:border-zinc-700 transition">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <div>
                                        <span className="text-sm font-bold text-white block">{app.name}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Margin: {app.margin}%</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-emerald-400 block">
                                        +${app.profit.toLocaleString()}
                                    </span>
                                    {app.margin < 20 && (
                                        <span className="text-[10px] text-red-400 flex items-center justify-end gap-1 mt-0.5">
                                            <AlertCircle className="w-3 h-3" /> Low Margin
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
