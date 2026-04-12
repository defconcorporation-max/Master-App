'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ExpenseItem } from '@/lib/types';
import { getExpenseBreakdownData } from '@/lib/server-actions';
import { PieChart, DollarSign, TrendingDown, ArrowDown, Calendar, Layers } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ExpenseRadar() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        getExpenseBreakdownData().then(data => {
            if (mounted) { setExpenses(data); setLoading(false); }
        });
        return () => { mounted = false; };
    }, []);

    // Group by category
    const categoryBreakdown = useMemo(() => {
        const map = new Map<string, { total: number; count: number; appNames: Set<string> }>();
        expenses.forEach(e => {
            const cat = e.category || 'Autre';
            const existing = map.get(cat) || { total: 0, count: 0, appNames: new Set<string>() };
            existing.total += e.amount;
            existing.count++;
            existing.appNames.add(e.appName);
            map.set(cat, existing);
        });
        return Array.from(map.entries())
            .map(([name, data]) => ({ name, ...data, apps: Array.from(data.appNames) }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);

    // Group by app
    const appBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        expenses.forEach(e => {
            map.set(e.appName, (map.get(e.appName) || 0) + e.amount);
        });
        return Array.from(map.entries())
            .map(([app, total]) => ({ app, total }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    const getAppBarColor = (app: string) => {
        if (app.includes('Auclaire')) return 'bg-blue-500/60';
        if (app.includes('Defcon')) return 'bg-emerald-500/60';
        if (app.includes('DRS')) return 'bg-red-500/60';
        if (app.includes('Viva')) return 'bg-purple-500/60';
        return 'bg-slate-500/60';
    };

    const categoryColors = [
        'border-l-red-500', 'border-l-amber-500', 'border-l-blue-500',
        'border-l-purple-500', 'border-l-emerald-500', 'border-l-pink-500',
        'border-l-cyan-500', 'border-l-orange-500'
    ];

    return (
        <div className="glass-panel overflow-hidden flex flex-col h-full relative group">
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="p-6 border-b border-white/[0.05] relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-xl bg-red-500/10">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-100 tracking-tight uppercase">Expense Radar</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Répartition des Dépenses</p>
                        </div>
                    </div>
                    <div className="glass-pill px-4 py-2 rounded-lg">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total</span>
                        <p className="text-lg font-black text-red-400">${totalExpenses.toLocaleString()}</p>
                    </div>
                </div>

                {/* App Distribution Bar */}
                {!loading && totalExpenses > 0 && (
                    <div className="space-y-2">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Répartition par Application</p>
                        <div className="flex rounded-lg overflow-hidden h-3 bg-black/30">
                            {appBreakdown.map(({ app, total }) => (
                                <div
                                    key={app}
                                    className={`${getAppBarColor(app)} transition-all`}
                                    style={{ width: `${(total / totalExpenses) * 100}%` }}
                                    title={`${app}: $${total.toLocaleString()}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {appBreakdown.map(({ app, total }) => (
                                <div key={app} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                    <div className={`w-2 h-2 rounded-sm ${getAppBarColor(app)}`} />
                                    {app}: ${total.toLocaleString()} ({Math.round((total / totalExpenses) * 100)}%)
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Breakdown */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-white/10 relative z-10">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    </div>
                ) : categoryBreakdown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                        <Layers className="w-8 h-8" />
                        <p className="text-xs font-bold">Aucune dépense détectée dans les bases.</p>
                    </div>
                ) : (
                    categoryBreakdown.map((cat, idx) => (
                        <div key={cat.name} className={`glass-pill p-3 rounded-xl border-l-[3px] ${categoryColors[idx % categoryColors.length]} flex items-center justify-between hover:bg-white/[0.03] transition-all`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-200 truncate capitalize">{cat.name}</span>
                                    <span className="text-[9px] text-slate-500 font-bold">{cat.count} entrées</span>
                                </div>
                                <div className="flex gap-1.5 mt-1">
                                    {cat.apps.map(app => (
                                        <span key={app} className="text-[8px] font-black uppercase tracking-widest text-slate-500 glass-pill px-1.5 py-0.5 rounded">
                                            {app}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                                <p className="text-sm font-black text-red-400">${cat.total.toLocaleString()}</p>
                                <p className="text-[9px] text-slate-500 font-bold">{Math.round((cat.total / totalExpenses) * 100)}%</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Recent Expenses Footer */}
            {!loading && expenses.length > 0 && (
                <div className="p-4 border-t border-white/[0.05] bg-black/20 relative z-10">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2">Dernières Dépenses</p>
                    <div className="space-y-1">
                        {expenses.slice(0, 3).map(e => (
                            <div key={e.id} className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 truncate flex-1 mr-2 font-medium">
                                    <span className="text-slate-500 font-bold">{e.appName}</span> · {e.description || e.category}
                                </span>
                                <span className="text-red-400 font-bold shrink-0">-${e.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
