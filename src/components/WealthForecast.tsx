'use client';

import React, { useMemo } from 'react';
import { OmniTask, AppStats } from '@/lib/types';
import { DollarSign, ArrowRight, Zap, TrendingUp, Briefcase } from 'lucide-react';

interface WealthForecastProps {
    stats: AppStats[];
    tasks: OmniTask[];
    isGhostMode?: boolean;
}

export function WealthForecast({ stats, tasks, isGhostMode = false }: WealthForecastProps) {
    const metrics = useMemo(() => {
        const collected = stats.reduce((acc, s) => acc + (s.financials.collected || 0), 0);
        const pending = stats.reduce((acc, s) => acc + (s.financials.pending || 0), 0);
        const backlogValue = tasks
            .filter(t => t.status === 'backlog' || t.status === 'todo')
            .reduce((acc, t) => acc + (t.budget || 0), 0);
        
        const totalValue = collected + pending + backlogValue;
        
        return { collected, pending, backlogValue, totalValue };
    }, [stats, tasks]);

    const getPerc = (val: number) => (val / metrics.totalValue) * 100;

    return (
        <div className="glass-panel p-5 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Projected Empire Wealth
                    </h3>
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-black text-white tracking-tighter">
                            {isGhostMode ? '$ *****' : `$${metrics.totalValue.toLocaleString()}`}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Valuation</span>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                        <p className="text-[9px] font-black text-emerald-500 uppercase">Growth Pot.</p>
                        <p className="text-lg font-black text-white">{isGhostMode ? '***%' : `+${((metrics.backlogValue / (metrics.collected + metrics.pending)) * 100).toFixed(0)}%`}</p>
                    </div>
                </div>
            </div>

            {/* Multi-layered Wealth Bar */}
            <div className="space-y-6">
                <div className="relative h-12 w-full bg-zinc-900 rounded-2xl overflow-hidden flex shadow-inner border border-white/5">
                    {/* Collected */}
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative group/seg transition-all duration-1000"
                        style={{ width: `${getPerc(metrics.collected)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/seg:opacity-100 transition-opacity" />
                    </div>
                    {/* Pending */}
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative group/seg border-l border-black/20 transition-all duration-1000"
                        style={{ width: `${getPerc(metrics.pending)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/seg:opacity-100 transition-opacity" />
                    </div>
                    {/* Backlog */}
                    <div 
                        className="h-full bg-gradient-to-r from-zinc-700 to-zinc-500 relative group/seg border-l border-black/20 transition-all duration-1000"
                        style={{ width: `${getPerc(metrics.backlogValue)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/seg:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Réalisé (Cash)</p>
                            <p className="text-sm font-bold text-white">{isGhostMode ? '$ *****' : `$${metrics.collected.toLocaleString()}`}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">En cours (Pending)</p>
                            <p className="text-sm font-bold text-white">{isGhostMode ? '$ *****' : `$${metrics.pending.toLocaleString()}`}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-zinc-600 shadow-[0_0_10px_rgba(82,82,91,0.5)]" />
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Potentiel (Backlog)</p>
                            <p className="text-sm font-bold text-white">{isGhostMode ? '$ *****' : `$${metrics.backlogValue.toLocaleString()}`}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Insight */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs text-zinc-500 font-medium italic">
                        "La conversion totale du pipeline porterait le CA à un niveau historique."
                    </p>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 transition-colors tracking-widest">
                    Simuler Accélération <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
