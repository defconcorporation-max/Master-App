"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { AppStats } from '@/lib/db-clients';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#60A5FA', '#34D399', '#A78BFA', '#FBBF24', '#F87171']; // Blue, Emerald, Purple, Amber, Red

export function ComparativeAnalytics({ apps }: { apps: AppStats[] }) {
    
    // Prepare Data for Revenue Donut
    const revenueData = apps
        .map(app => ({
            name: app.name,
            value: app.financials?.billed || 0
        }))
        .filter(data => data.value > 0);

    // Prepare Data for Expenses Donut
    const expenseData = apps
        .map(app => ({
            name: app.name,
            value: app.financials?.expenses || 0
        }))
        .filter(data => data.value > 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-white mb-1">{payload[0].name}</p>
                    <p className="text-zinc-300">
                        ${Number(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-lg h-full flex flex-col">
            <h3 className="text-sm font-bold tracking-wide uppercase text-white mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-400" />
                Portfolio Breakdown
            </h3>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center min-h-[250px]">
                
                {/* Revenue Donut */}
                {revenueData.length > 0 ? (
                    <div className="flex flex-col items-center h-full w-full">
                        <span className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Revenue Distribution</span>
                        <div className="w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs">No Revenue Data</div>
                )}

                {/* Expense Donut */}
                {expenseData.length > 0 ? (
                    <div className="flex flex-col items-center h-full w-full">
                        <span className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-widest">Expense Distribution</span>
                        <div className="w-full h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs">No Expense Data</div>
                )}

            </div>
        </div>
    );
}
