'use client';

import React, { useMemo } from 'react';
import { Brain, Zap, Target, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { AppStats, OmniTask } from '@/lib/types';

interface CyberPulseSynthesisProps {
    stats: AppStats[];
    tasks: OmniTask[];
}

export function CyberPulseSynthesis({ stats, tasks }: CyberPulseSynthesisProps) {
    const findings = useMemo(() => {
        const totalPending = stats.reduce((acc, s) => acc + (s.financials.pending || 0), 0);
        const totalCollected = stats.reduce((acc, s) => acc + (s.financials.collected || 0), 0);
        const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done');
        
        // Logical findings
        const findings = [];
        
        if (totalPending > totalCollected * 0.5) {
            findings.push({
                type: 'warning',
                text: "Encours financiers élevés. Priorité aux recouvrements dans Defcon.",
                icon: <AlertCircle className="w-4 h-4 text-amber-400" />
            });
        } else {
            findings.push({
                type: 'success',
                text: "Flux de trésorerie sain. Capacité d'investissement confirmée.",
                icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
            });
        }

        if (criticalTasks.length > 0) {
            findings.push({
                type: 'urgent',
                text: `${criticalTasks.length} missions critiques immobilisées. Goulot d'étranglement détecté.`,
                icon: <Zap className="w-4 h-4 text-red-500" />
            });
        }

        const topApp = [...stats].sort((a,b) => b.financials.collected - a.financials.collected)[0];
        if (topApp) {
            findings.push({
                type: 'info',
                text: `${topApp.name} domine la croissance ce mois-ci (+${((topApp.financials.collected/totalCollected)*100).toFixed(0)}% du total).`,
                icon: <TrendingUp className="w-4 h-4 text-blue-400" />
            });
        }

        return findings;
    }, [stats, tasks]);

    return (
        <div className="relative group overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl transition-all duration-700 group-hover:bg-blue-500/10" />
            
            <div className="relative p-5 md:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-10">
                {/* AI Core Animation */}
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <Brain className="w-10 h-10 text-blue-400 animate-bounce duration-[3000ms]" />
                    </div>
                    {/* Rotating rings */}
                    <div className="absolute inset-[-10px] border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-[-20px] border border-blue-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                </div>

                {/* Synthesis Content */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Neural Synthesis</h2>
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] font-black text-blue-400 uppercase tracking-widest">Aritificial Intelligence</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {findings.map((f, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                                <div className="mt-1">{f.icon}</div>
                                <p className="text-sm font-medium text-zinc-300 leading-snug">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategic Metric */}
                <div className="lg:w-48 p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Health</p>
                    <p className="text-4xl font-black text-white">92%</p>
                    <div className="mt-3 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[92%] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
