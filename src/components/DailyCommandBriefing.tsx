'use client';

import React, { useMemo } from 'react';
import { OmniTask, AppActivity, AppStats } from '@/lib/db-clients';
import { 
    Zap, Clock, DollarSign, Activity, ChevronRight, Target, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyCommandBriefingProps {
    tasks: OmniTask[];
    activities: AppActivity[];
    deployedApps: AppStats[];
    totalPending: number;
}

export function DailyCommandBriefing({ tasks, activities, deployedApps, totalPending }: DailyCommandBriefingProps) {
    const now = new Date();

    const briefingData = useMemo(() => {
        // 1. What happens TODAY? (Operations)
        const todayTasks = tasks.filter(t => {
            const tDate = new Date(t.date);
            if (isNaN(tDate.getTime())) return false;
            return isSameDay(tDate, now);
        });

        // Split into "urgent action required" vs "standard" 
        const actionPriority = todayTasks.filter(t => t.priority === 'critical' || t.priority === 'high');
        const standardToday = todayTasks.filter(t => t.priority !== 'critical' && t.priority !== 'high');

        // 2. Financial Velocity (Today's Cash)
        const todayMoneyActivity = activities.filter(a => {
            if (a.type !== 'payment_collected') return false;
            const aDate = new Date(a.date);
            return isSameDay(aDate, now);
        });
        const cashToday = todayMoneyActivity.reduce((acc, a) => acc + (a.amount || 0), 0);

        // 3. Outstanding Debt Warning (Quick glance)
        const topDebtors = [...deployedApps].sort((a,b) => (b.financials?.pending || 0) - (a.financials?.pending || 0)).slice(0, 2);

        // 4. Live Pulse
        const livePulse = [...activities].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        return { actionPriority, standardToday, cashToday, livePulse, topDebtors };
    }, [tasks, activities, deployedApps]);

    return (
        <section className="mb-8 w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Identity */}
            <div className="flex items-end justify-between border-b border-white/[0.05] pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                        Daily Briefing
                    </h1>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-2">
                        {format(now, 'EEEE d MMMM yyyy - HH:mm', { locale: fr })} • Synthesized Intelligence
                    </p>
                </div>
            </div>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Tactical Ops Command (Left - 5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="glass-panel p-6 flex-1 flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
                        
                        <h2 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                            <Target className="w-4 h-4" /> 
                            Actionable Aujourd'hui
                        </h2>

                        {briefingData.actionPriority.length === 0 && briefingData.standardToday.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                                <Clock className="w-8 h-8 mb-3" />
                                <span className="text-xs uppercase tracking-widest font-bold">Rien de planifié</span>
                            </div>
                        ) : (
                            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-2">
                                {/* Critical Items */}
                                {briefingData.actionPriority.map(t => (
                                    <div key={t.id} className="p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-xl rounded-l-sm flex flex-col gap-1 hover:bg-red-500/20 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] uppercase font-black tracking-widest text-red-400">{t.appName}</span>
                                            {t.hasSpecificTime && <span className="text-[10px] font-mono text-red-300 font-bold">{format(new Date(t.date), 'HH:mm')}</span>}
                                        </div>
                                        <p className="text-sm font-bold text-red-50">{t.title}</p>
                                    </div>
                                ))}
                                
                                {/* Standard Items */}
                                {briefingData.standardToday.map(t => (
                                    <div key={t.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-1 hover:bg-white/[0.05] transition-colors">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">{t.appName}</span>
                                            {t.hasSpecificTime && <span className="text-[10px] font-mono text-zinc-400">{format(new Date(t.date), 'HH:mm')}</span>}
                                        </div>
                                        <p className="text-sm font-semibold text-zinc-200">{t.title}</p>
                                        {(t.clientName || t.stage) && (
                                            <p className="text-[10px] font-semibold text-indigo-400 mt-1">
                                                {t.clientName} {t.stage && `• [${t.stage.toUpperCase()}]`}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Financial Velocity (Center - 4 Cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Velocity Box */}
                    <div className="glass-panel p-6 shadow-inner relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/10 border group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                        
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-2">
                            <ArrowUpRight className="w-3.5 h-3.5" /> 
                            Vélocité (24H Cash-Flow)
                        </h2>
                        
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                ${briefingData.cashToday.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 uppercase">Input</span>
                        </div>
                        {briefingData.cashToday === 0 && (
                            <p className="text-xs text-zinc-500 mt-2 italic">Aucun mouvement détecté aujourd'hui pour l'instant.</p>
                        )}
                    </div>

                    {/* Deficit Alert */}
                    {totalPending > 0 && (
                        <div className="glass-panel p-5 bg-gradient-to-tr from-amber-500/5 to-transparent border border-amber-500/10">
                            <h2 className="text-[9px] font-black uppercase tracking-widest text-amber-500/80 mb-3 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" /> Impayés Critiques
                            </h2>
                            <div className="text-xl font-bold text-amber-400 mb-3">${totalPending.toLocaleString()}</div>
                            
                            <div className="space-y-2">
                                {briefingData.topDebtors.map(app => {
                                    if (!app.financials?.pending) return null;
                                    const perc = Math.min((app.financials.pending / totalPending) * 100, 100);
                                    return (
                                        <div key={app.id} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className="text-zinc-400">{app.name}</span>
                                                <span className="text-amber-200/60">${app.financials.pending.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1 bg-black rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500/50" style={{ width: `${perc}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. The Live Pulse (Right - 3 Cols) */}
                <div className="lg:col-span-3 flex flex-col h-full">
                    <div className="glass-panel p-5 flex-1 flex flex-col border border-white/5 bg-zinc-950/40">
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" /> Live Pulse
                        </h2>

                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-1">
                            {briefingData.livePulse.map((a, i) => (
                                <div key={a.id} className="relative flex items-start gap-4 group cursor-default">
                                    {/* Timeline line */}
                                    {i !== briefingData.livePulse.length - 1 && (
                                        <div className="absolute left-[5px] top-4 bottom-[-16px] w-[1px] bg-white/5" />
                                    )}
                                    
                                    {/* Node */}
                                    <div className={`mt-1.5 w-3 h-3 rounded-full border-2 border-black shrink-0 relative z-10 transition-transform group-hover:scale-125
                                        ${a.type.includes('payment') || a.type.includes('invoice') ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                                        a.type.includes('expense') ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} 
                                    />
                                    
                                    {/* Content */}
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-zinc-200">{a.appName}</span>
                                            <span className="text-[9px] font-mono text-zinc-600">
                                                {format(new Date(a.date), 'HH:mm')}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 font-medium line-clamp-2 leading-snug">
                                            {a.title} {a.amount ? ` - $${a.amount.toLocaleString()}` : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
