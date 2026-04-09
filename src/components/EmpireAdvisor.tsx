'use client';

import React, { useMemo } from 'react';
import { 
    AlertTriangle, 
    ArrowUpRight, 
    Zap, 
    TrendingDown, 
    Clock, 
    ShieldAlert,
    Lightbulb,
    ChevronRight,
    Target
} from 'lucide-react';
import { OmniTask } from '@/lib/db-clients';

interface EmpireAdvisorProps {
    tasks: OmniTask[];
    stats: any;
}

export function EmpireAdvisor({ tasks, stats }: EmpireAdvisorProps) {
    // Logic: Identify "At Risk" tasks (e.g. active for more than 7 days)
    const atRiskTasks = useMemo(() => {
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - 7);
        
        return tasks.filter(t => 
            t.status !== 'done' && 
            new Date(t.date) < threshold
        ).slice(0, 3);
    }, [tasks]);

    // Financial Anomaly Detection (Mocked for now based on stats)
    const anomalies = [
        { id: 1, type: 'leak', title: 'Unexpected AWS Spike', impact: '-$420/mo', severity: 'medium' },
        { id: 2, type: 'delay', title: 'Payment Collection Lag', impact: '+$14k Pending', severity: 'high' }
    ];

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full group">
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-slate-900 to-red-900/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Empire Advisor</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Autonomous Risk Detection</p>
                    </div>
                </div>
                <div className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Scanning...
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
                {/* Section: Auto-Escalation */}
                <div>
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Critical Escalations
                    </h3>
                    <div className="space-y-3">
                        {atRiskTasks.length > 0 ? atRiskTasks.map(task => (
                            <div key={task.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between hover:bg-red-500/10 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-red-400" />
                                    <div>
                                        <p className="text-xs font-bold text-white truncate max-w-[150px]">{task.title}</p>
                                        <p className="text-[9px] text-red-400 font-bold uppercase">{task.appName} • Stalled 7d+</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-red-500/40" />
                            </div>
                        )) : (
                            <p className="text-xs text-slate-600 italic">No mission-critical delays detected.</p>
                        )}
                    </div>
                </div>

                {/* Section: Financial Leaks */}
                <div>
                    <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5" /> Anomaly Detection
                    </h3>
                    <div className="space-y-3">
                        {anomalies.map(anomaly => (
                            <div key={anomaly.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    <div>
                                        <p className="text-xs font-bold text-white">{anomaly.title}</p>
                                        <p className="text-[9px] text-orange-400 font-bold uppercase">Impact: {anomaly.impact}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Strategic recommendation */}
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden group/recom">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/recom:scale-125 transition-transform duration-700">
                        <Lightbulb className="w-24 h-24 text-indigo-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Jarvis Insight</span>
                        </div>
                        <p className="text-[11px] text-indigo-200/80 leading-relaxed font-medium">
                            "Sir, the Defcon pipeline is reaching capacity. I recommend a 48h 'Ghost Protocol' freeze on new shoots to clear the backlog."
                        </p>
                        <button className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                            Authorize Freeze <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-950/40 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Risk Score</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400">14% (LOW)</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[14%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
            </div>
        </div>
    );
}
