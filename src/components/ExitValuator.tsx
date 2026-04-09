"use client";

import { DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import type { AppStats } from '@/lib/db-clients';

export function ExitValuator({ apps }: { apps: AppStats[] }) {
    // Basic Valuation Algorithm: Calculate total Monthly Collected, annualize (x12), apply 4x multiple
    const totalCollected = apps.reduce((sum, app) => sum + (app.financials?.collected || 0), 0);
    const mrr = totalCollected; // Assuming collected is representing current trailing 30 days
    const arr = mrr * 12;
    const multiple = 4.5;
    const valuation = arr * multiple;

    return (
        <div className="bg-gradient-to-br from-indigo-950/80 to-black border border-indigo-900/50 rounded-2xl p-6 shadow-[0_0_30px_-5px_rgba(79,70,229,0.2)]">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Automated M&A Valuator
            </h3>
            
            <div className="flex flex-col items-center justify-center text-center py-4">
                <span className="text-zinc-500 text-xs font-semibold tracking-widest uppercase mb-2">Estimated Empire Exit Value</span>
                <div className="text-5xl font-black text-white tracking-tighter shadow-indigo-500/50 drop-shadow-xl mb-4 flex items-start justify-center">
                    <span className="text-3xl text-indigo-500 mt-1 mr-1">$</span>
                    {valuation.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-4 p-4 bg-black/40 rounded-xl border border-zinc-800/50">
                    <div className="flex flex-col items-center border-r border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Base ARR</span>
                        <span className="text-lg font-bold text-emerald-400">${arr.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">SaaS Multiple</span>
                        <span className="text-lg font-bold text-blue-400">{multiple.toFixed(1)}x</span>
                    </div>
                </div>
            </div>
            
            <p className="text-[10px] text-zinc-600 text-center mt-4">
                *Valuations are AI-generated estimates based on trailing 30-day processed volume and standard B2B SaaS multiples.
            </p>
        </div>
    );
}
