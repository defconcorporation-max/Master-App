'use client';

import React, { useMemo } from 'react';
import { AppStats, AppActivity } from '@/lib/db-clients';
import { 
    Clock, 
    CreditCard, 
    Briefcase, 
    AlertCircle, 
    TrendingUp, 
    CheckCircle2, 
    UserPlus,
    Flame
} from 'lucide-react';

interface GlobalActivityStreamProps {
    allStats: {
        auclaire: AppStats;
        defcon: AppStats;
        antigravity: AppStats;
        drs: AppStats;
    };
}

export function GlobalActivityStream({ allStats }: GlobalActivityStreamProps) {
    // Combine all activity feeds from all apps
    const unifiedActivities = useMemo(() => {
        const combined: AppActivity[] = [];
        Object.values(allStats).forEach(app => {
            if (app.activityFeed) {
                combined.push(...app.activityFeed);
            }
        });
        
        // Sort by date descending
        return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);
    }, [allStats]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'invoice_created': return <CreditCard className="w-4 h-4 text-blue-400" />;
            case 'payment_collected': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
            case 'project_created': return <Briefcase className="w-4 h-4 text-purple-400" />;
            case 'commission_paid': return <Flame className="w-4 h-4 text-orange-400" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const getAppColor = (appName: string) => {
        if (appName.includes('Auclaire')) return 'border-blue-500/30 bg-blue-500/5';
        if (appName.includes('Defcon')) return 'border-emerald-500/30 bg-emerald-500/5';
        if (appName.includes('Viva')) return 'border-purple-500/30 bg-purple-500/5';
        if (appName.includes('DRS')) return 'border-slate-500/30 bg-slate-500/5';
        return 'border-slate-700 bg-slate-800/50';
    };

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-900/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Flame className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Empire Newsroom</h2>
                        <p className="text-xs text-slate-400">Live operational activity stream</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    Real-time
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {unifiedActivities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <Clock className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Waiting for incoming transmission...</p>
                    </div>
                ) : (
                    unifiedActivities.map((activity, idx) => (
                        <div 
                            key={activity.id} 
                            className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getAppColor(activity.appName)}`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <div className="p-2 bg-slate-900/80 rounded-lg border border-white/10 group-hover:border-white/20">
                                    {getIcon(activity.type)}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {activity.appName}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono" suppressHydrationWarning>
                                        {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                    {activity.title}
                                </h3>
                                
                                {activity.clientName && (
                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-200 bg-blue-500/10 w-fit px-2 py-0.5 rounded border border-blue-500/20">
                                        <Briefcase className="w-3 h-3" />
                                        <span className="font-medium">{activity.clientName}</span>
                                    </div>
                                )}

                                <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                    {activity.description}
                                </p>
                                
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    {activity.amount && (
                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">
                                            + ${activity.amount.toLocaleString()}
                                        </span>
                                    )}
                                    {activity.metadata && (
                                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium border border-white/5 uppercase">
                                            {activity.metadata}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Timeline dot */}
                            <div className="absolute -left-[9px] top-8 w-4 h-4 bg-slate-900 rounded-full border-2 border-slate-700 z-10 hidden" />
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 bg-slate-950/40 border-t border-white/5 text-center">
                <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest transition-colors">
                    View Full Command Log
                </button>
            </div>
        </div>
    );
}
